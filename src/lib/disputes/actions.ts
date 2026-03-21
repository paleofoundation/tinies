"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getStripeServer } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";
import DisputeReportedEmail from "@/lib/email/templates/dispute-reported";
import ClaimReportedEmail from "@/lib/email/templates/claim-reported";
import CaseResolvedEmail from "@/lib/email/templates/case-resolved";
import type { DisputeType, DisputeRuling } from "@prisma/client";
import type { ClaimType } from "@prisma/client";

/** Create a bucket named "evidence" in Supabase Storage for dispute/claim photos. */
const EVIDENCE_BUCKET = "evidence";
const MIN_DESCRIPTION_LENGTH = 100;
const MAX_PHOTOS = 5;
const RESPONSE_WINDOW_HOURS = 48;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

function formatDisputeRulingSummary(ruling: DisputeRuling, notes: string | null): string {
  const base: Record<DisputeRuling, string> = {
    no_action: "No further action taken.",
    warning: "A warning has been recorded.",
    partial_refund: "A partial refund has been issued.",
    full_refund: "A full refund has been issued.",
    provider_suspended: "The provider account has been suspended.",
    owner_restricted: "The pet owner account has been restricted.",
  };
  const head = base[ruling];
  const n = notes?.trim();
  return n ? `${head} ${n}` : head;
}

function formatClaimRulingSummary(
  ruling: "approved_full" | "approved_partial" | "denied",
  notes: string | null
): string {
  const head =
    ruling === "approved_full"
      ? "Claim approved — full payout as recorded."
      : ruling === "approved_partial"
        ? "Claim approved — partial payout as recorded."
        : "Claim denied.";
  const n = notes?.trim();
  return n ? `${head} ${n}` : head;
}

function getPhotoFiles(formData: FormData, fieldPrefix = "photos"): File[] {
  const files: File[] = [];
  for (const [key, value] of formData.entries()) {
    if (
      (value instanceof File && value.size > 0 && value.type.startsWith("image/")) &&
      (key === fieldPrefix || key.startsWith(`${fieldPrefix}[`))
    ) {
      files.push(value);
    }
  }
  return files.slice(0, MAX_PHOTOS);
}

async function uploadEvidence(
  supabase: Awaited<ReturnType<typeof createClient>>,
  folder: string,
  formData: FormData,
  fieldPrefix = "photos"
): Promise<string[]> {
  const files = getPhotoFiles(formData, fieldPrefix);
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 80);
    const path = `${folder}/${Date.now()}-${i}-${safeName}`;
    const { error } = await supabase.storage.from(EVIDENCE_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    const { data } = supabase.storage.from(EVIDENCE_BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

export async function reportProblem(
  formData: FormData
): Promise<{ disputeId?: string; claimId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to report a problem." };

  const bookingId = (formData.get("bookingId") as string)?.trim();
  const issueType = formData.get("issueType") as "dispute" | "claim" | null;
  const disputeType = (formData.get("disputeType") as DisputeType) || undefined;
  const claimType = (formData.get("claimType") as ClaimType) || undefined;
  const description = (formData.get("description") as string)?.trim() ?? "";

  if (!bookingId) return { error: "Missing booking." };
  if (!issueType || (issueType !== "dispute" && issueType !== "claim"))
    return { error: "Please select issue type (Dispute or Guarantee Claim)." };
  if (description.length < MIN_DESCRIPTION_LENGTH)
    return { error: `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters.` };

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      status: "completed",
      OR: [{ ownerId: user.id }, { providerId: user.id }],
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      provider: { select: { id: true, name: true, email: true } },
    },
  });
  if (!booking) return { error: "Booking not found or not completed." };

  const isOwner = booking.ownerId === user.id;
  const respondent = isOwner ? booking.provider : booking.owner;
  const respondentId = respondent.id;

  if (issueType === "dispute") {
    if (booking.hasDispute) return { error: "A dispute already exists for this booking." };
    if (!disputeType) return { error: "Please select a dispute type." };
    const existing = await prisma.dispute.findFirst({
      where: { bookingId },
    });
    if (existing) return { error: "A dispute already exists for this booking." };

    const photos = await uploadEvidence(supabase, `disputes/${bookingId}`, formData);
    const dispute = await prisma.dispute.create({
      data: {
        bookingId,
        openedBy: user.id,
        disputeType,
        description,
        evidencePhotos: photos,
        respondentId,
        status: "awaiting_response",
      },
    });
    await prisma.booking.update({
      where: { id: bookingId },
      data: { hasDispute: true },
    });

    const reporterName = (user.user_metadata?.name as string) ?? user.email ?? "A user";
    const deadline = new Date(Date.now() + RESPONSE_WINDOW_HOURS * 60 * 60 * 1000);
    const dashboardUrl = `${APP_URL}/dashboard/${isOwner ? "provider" : "owner"}`;
    if (respondent.email) {
      await sendEmail({
        to: respondent.email,
        subject: `Dispute reported – response needed within 48 hours`,
        react: DisputeReportedEmail({
          reporterName,
          bookingId,
          disputeType,
          description: description.slice(0, 200),
          responseDeadline: deadline.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
          dashboardUrl,
        }),
      });
    }
    revalidatePath("/dashboard/owner");
    revalidatePath("/dashboard/provider");
    return { disputeId: dispute.id };
  } else {
    if (booking.hasGuaranteeClaim) return { error: "A guarantee claim already exists for this booking." };
    if (!claimType) return { error: "Please select a claim type." };
    const existing = await prisma.guaranteeClaim.findFirst({
      where: { bookingId },
    });
    if (existing) return { error: "A guarantee claim already exists for this booking." };

    const photos = await uploadEvidence(supabase, `claims/${bookingId}`, formData);
    const claim = await prisma.guaranteeClaim.create({
      data: {
        bookingId,
        reporterId: user.id,
        claimType,
        description,
        photos,
        status: "awaiting_response",
      },
    });
    await prisma.booking.update({
      where: { id: bookingId },
      data: { hasGuaranteeClaim: true },
    });

    const reporterName = (user.user_metadata?.name as string) ?? user.email ?? "A user";
    const deadline = new Date(Date.now() + RESPONSE_WINDOW_HOURS * 60 * 60 * 1000);
    const dashboardUrl = `${APP_URL}/dashboard/${isOwner ? "provider" : "owner"}`;
    if (respondent.email) {
      await sendEmail({
        to: respondent.email,
        subject: `Guarantee claim filed – response needed within 48 hours`,
        react: ClaimReportedEmail({
          reporterName,
          bookingId,
          claimType,
          description: description.slice(0, 200),
          responseDeadline: deadline.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
          dashboardUrl,
        }),
      });
    }
    revalidatePath("/dashboard/owner");
    revalidatePath("/dashboard/provider");
    return { claimId: claim.id };
  }
}

export async function respondToDispute(
  disputeId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const dispute = await prisma.dispute.findFirst({
    where: { id: disputeId, respondentId: user.id, status: "awaiting_response" },
  });
  if (!dispute) return { error: "Dispute not found or already responded." };

  const responseText = (formData.get("response") as string)?.trim();
  if (!responseText || responseText.length < 20)
    return { error: "Please provide a response (at least 20 characters)." };

  const photos = await uploadEvidence(supabase, `disputes/${dispute.id}/response`, formData, "responsePhotos");
  await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      respondentResponse: responseText,
      respondentPhotos: photos,
      status: "under_review",
    },
  });
  revalidatePath("/dashboard/owner");
  revalidatePath("/dashboard/provider");
  return {};
}

export async function respondToClaim(
  claimId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const claim = await prisma.guaranteeClaim.findFirst({
    where: { id: claimId, booking: { OR: [{ ownerId: user.id }, { providerId: user.id }] } },
    include: { booking: true },
  });
  if (!claim) return { error: "Claim not found." };
  const isRespondent = claim.booking.ownerId === user.id || claim.booking.providerId === user.id;
  const isReporter = claim.reporterId === user.id;
  if (isReporter || !isRespondent) return { error: "You are not the other party to this claim." };
  if (claim.status !== "awaiting_response") return { error: "Response already submitted." };

  const responseText = (formData.get("response") as string)?.trim();
  if (!responseText || responseText.length < 20)
    return { error: "Please provide a response (at least 20 characters)." };

  const photos = await uploadEvidence(supabase, `claims/${claim.id}/response`, formData, "responsePhotos");
  await prisma.guaranteeClaim.update({
    where: { id: claimId },
    data: {
      otherPartyResponse: responseText,
      otherPartyPhotos: photos,
      status: "under_review",
    },
  });
  revalidatePath("/dashboard/owner");
  revalidatePath("/dashboard/provider");
  return {};
}

export type DisputeCard = {
  id: string;
  bookingId: string;
  disputeType: string;
  description: string;
  evidencePhotos: string[];
  status: string;
  respondentResponse: string | null;
  respondentPhotos: string[];
  createdAt: Date;
  openedByName: string;
  respondentName: string;
  isReporter: boolean;
  bookingSummary: string;
};

export type ClaimCard = {
  id: string;
  bookingId: string;
  claimType: string;
  description: string;
  photos: string[];
  status: string;
  otherPartyResponse: string | null;
  otherPartyPhotos: string[];
  createdAt: Date;
  reporterName: string;
  isReporter: boolean;
  bookingSummary: string;
};

export async function getDisputesForUser(): Promise<{ disputes: DisputeCard[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { disputes: [], error: "Not signed in." };

  const rows = await prisma.dispute.findMany({
    where: { OR: [{ openedBy: user.id }, { respondentId: user.id }] },
    orderBy: { createdAt: "desc" },
    include: {
      booking: { include: { owner: { select: { name: true } }, provider: { select: { name: true } } } },
      openedByUser: { select: { name: true } },
      respondent: { select: { name: true } },
    },
  });
  const disputes: DisputeCard[] = rows.map((d) => ({
    id: d.id,
    bookingId: d.bookingId,
    disputeType: d.disputeType,
    description: d.description,
    evidencePhotos: d.evidencePhotos,
    status: d.status,
    respondentResponse: d.respondentResponse,
    respondentPhotos: d.respondentPhotos,
    createdAt: d.createdAt,
    openedByName: d.openedByUser.name,
    respondentName: d.respondent.name,
    isReporter: d.openedBy === user.id,
    bookingSummary: `${d.booking.owner.name} · ${d.booking.provider.name} · ${new Date(d.booking.startDatetime).toLocaleDateString("en-GB")}`,
  }));
  return { disputes };
}

export async function getClaimsForUser(): Promise<{ claims: ClaimCard[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { claims: [], error: "Not signed in." };

  const rows = await prisma.guaranteeClaim.findMany({
    where: {
      OR: [
        { reporterId: user.id },
        { booking: { ownerId: user.id } },
        { booking: { providerId: user.id } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      booking: { include: { owner: { select: { name: true } }, provider: { select: { name: true } } } },
      reporter: { select: { name: true } },
    },
  });
  const claims: ClaimCard[] = rows.map((c) => ({
    id: c.id,
    bookingId: c.bookingId,
    claimType: c.claimType,
    description: c.description,
    photos: c.photos,
    status: c.status,
    otherPartyResponse: c.otherPartyResponse,
    otherPartyPhotos: c.otherPartyPhotos,
    createdAt: c.createdAt,
    reporterName: c.reporter.name,
    isReporter: c.reporterId === user.id,
    bookingSummary: `${c.booking.owner.name} · ${c.booking.provider.name} · ${new Date(c.booking.startDatetime).toLocaleDateString("en-GB")}`,
  }));
  return { claims };
}

export type AdminDisputeRow = {
  id: string;
  bookingId: string;
  disputeType: string;
  description: string;
  evidencePhotos: string[];
  respondentResponse: string | null;
  respondentPhotos: string[];
  status: string;
  ruling: DisputeRuling | null;
  refundAmount: number | null;
  openedByName: string;
  respondentName: string;
  bookingTotalCents: number;
  stripePaymentIntentId: string | null;
  createdAt: Date;
};

export type AdminClaimRow = {
  id: string;
  bookingId: string;
  claimType: string;
  description: string;
  photos: string[];
  otherPartyResponse: string | null;
  otherPartyPhotos: string[];
  status: string;
  ruling: string | null;
  payoutAmount: number | null;
  payoutRecipientName: string | null;
  reporterName: string;
  createdAt: Date;
  ownerId: string;
  ownerName: string;
  providerId: string;
  providerName: string;
};

export async function getOpenDisputesForAdmin(): Promise<{ disputes: AdminDisputeRow[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { disputes: [], error: "Not signed in." };
  const rows = await prisma.dispute.findMany({
    where: { status: { notIn: ["resolved"] } },
    orderBy: { createdAt: "desc" },
    include: {
      booking: { select: { totalPrice: true, stripePaymentIntentId: true } },
      openedByUser: { select: { name: true } },
      respondent: { select: { name: true } },
    },
  });
  const disputes: AdminDisputeRow[] = rows.map((d) => ({
    id: d.id,
    bookingId: d.bookingId,
    disputeType: d.disputeType,
    description: d.description,
    evidencePhotos: d.evidencePhotos,
    respondentResponse: d.respondentResponse,
    respondentPhotos: d.respondentPhotos,
    status: d.status,
    ruling: d.ruling,
    refundAmount: d.refundAmount,
    openedByName: d.openedByUser.name,
    respondentName: d.respondent.name,
    bookingTotalCents: d.booking.totalPrice,
    stripePaymentIntentId: d.booking.stripePaymentIntentId,
    createdAt: d.createdAt,
  }));
  return { disputes };
}

export async function getOpenClaimsForAdmin(): Promise<{ claims: AdminClaimRow[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { claims: [], error: "Not signed in." };
  const rows = await prisma.guaranteeClaim.findMany({
    where: { status: { notIn: ["resolved", "appeal_resolved"] } },
    orderBy: { createdAt: "desc" },
    include: {
      booking: { include: { owner: { select: { id: true, name: true } }, provider: { select: { id: true, name: true } } } },
      reporter: { select: { name: true } },
      payoutRecipient: { select: { name: true } },
    },
  });
  const claims: AdminClaimRow[] = rows.map((c) => ({
    id: c.id,
    bookingId: c.bookingId,
    claimType: c.claimType,
    description: c.description,
    photos: c.photos,
    otherPartyResponse: c.otherPartyResponse,
    otherPartyPhotos: c.otherPartyPhotos,
    status: c.status,
    ruling: c.ruling,
    payoutAmount: c.payoutAmount,
    payoutRecipientName: c.payoutRecipient?.name ?? null,
    reporterName: c.reporter.name,
    createdAt: c.createdAt,
    ownerId: c.booking.owner.id,
    ownerName: c.booking.owner.name,
    providerId: c.booking.provider.id,
    providerName: c.booking.provider.name,
  }));
  return { claims };
}

export type AdminResolveDisputeInput = {
  ruling: DisputeRuling;
  refundAmountCents?: number | null;
  rulingNotes?: string | null;
};

export async function adminResolveDispute(
  disputeId: string,
  input: AdminResolveDisputeInput
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const u = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (u?.role !== "admin") return { error: "Admin only." };

  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      booking: {
        include: {
          owner: { select: { email: true } },
          provider: { select: { email: true } },
        },
      },
    },
  });
  if (!dispute) return { error: "Dispute not found." };
  if (dispute.status === "resolved") return { error: "Dispute already resolved." };

  const needsRefund =
    input.ruling === "partial_refund" || input.ruling === "full_refund";
  let refundAmount: number | null = null;
  if (needsRefund && dispute.booking.stripePaymentIntentId) {
    refundAmount =
      input.refundAmountCents ??
      (input.ruling === "full_refund" ? dispute.booking.totalPrice : null);
    if (refundAmount == null || refundAmount <= 0)
      return { error: "Enter refund amount (cents) for this ruling." };
    const stripe = getStripeServer();
    const refund = await stripe.refunds.create({
      payment_intent: dispute.booking.stripePaymentIntentId,
      amount: refundAmount,
    });
    await prisma.booking.update({
      where: { id: dispute.bookingId },
      data: {
        refundAmount: refundAmount,
        refundStripeId: refund.id,
        refundStatus: refund.status,
      },
    });
  }

  await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: "resolved",
      adminId: user.id,
      ruling: input.ruling,
      rulingNotes: input.rulingNotes?.trim() || null,
      refundAmount: refundAmount ?? undefined,
      resolvedAt: new Date(),
    },
  });
  try {
    const summary = formatDisputeRulingSummary(
      input.ruling,
      input.rulingNotes ?? null
    );
    const ownerEmail = dispute.booking.owner.email;
    const providerEmail = dispute.booking.provider.email;
    if (ownerEmail) {
      await sendEmail({
        to: ownerEmail,
        subject: "Your dispute has been resolved",
        react: CaseResolvedEmail({
          caseLabel: "dispute",
          summary,
          dashboardUrl: `${APP_URL}/dashboard/owner`,
        }),
      });
    }
    if (providerEmail) {
      await sendEmail({
        to: providerEmail,
        subject: "Your dispute has been resolved",
        react: CaseResolvedEmail({
          caseLabel: "dispute",
          summary,
          dashboardUrl: `${APP_URL}/dashboard/provider`,
        }),
      });
    }
  } catch (e) {
    console.error("adminResolveDispute: resolution email failed", e);
  }
  revalidatePath("/dashboard/admin");
  return {};
}

export type AdminResolveClaimInput = {
  ruling: "approved_full" | "approved_partial" | "denied";
  payoutAmountCents?: number | null;
  payoutRecipientId?: string | null;
  rulingNotes?: string | null;
};

export async function adminResolveClaim(
  claimId: string,
  input: AdminResolveClaimInput
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const u = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (u?.role !== "admin") return { error: "Admin only." };

  const claim = await prisma.guaranteeClaim.findUnique({
    where: { id: claimId },
    include: {
      booking: {
        include: {
          owner: { select: { email: true } },
          provider: { select: { email: true } },
        },
      },
    },
  });
  if (!claim) return { error: "Claim not found." };
  if (claim.status === "resolved") return { error: "Claim already resolved." };

  const needsPayout =
    input.ruling === "approved_full" || input.ruling === "approved_partial";
  let payoutAmount: number | null = null;
  let payoutRecipientId: string | null = null;
  if (needsPayout) {
    payoutAmount = input.payoutAmountCents ?? null;
    payoutRecipientId = input.payoutRecipientId ?? null;
    if (!payoutAmount || payoutAmount <= 0)
      return { error: "Enter payout amount (cents)." };
    if (!payoutRecipientId)
      return { error: "Select payout recipient." };
  }

  await prisma.guaranteeClaim.update({
    where: { id: claimId },
    data: {
      status: "resolved",
      adminId: user.id,
      ruling: input.ruling,
      rulingNotes: input.rulingNotes?.trim() || null,
      payoutAmount: payoutAmount ?? undefined,
      payoutRecipientId: payoutRecipientId ?? undefined,
    },
  });
  try {
    const summary = formatClaimRulingSummary(
      input.ruling,
      input.rulingNotes ?? null
    );
    const ownerEmail = claim.booking.owner.email;
    const providerEmail = claim.booking.provider.email;
    if (ownerEmail) {
      await sendEmail({
        to: ownerEmail,
        subject: "Your guarantee claim has been resolved",
        react: CaseResolvedEmail({
          caseLabel: "guarantee claim",
          summary,
          dashboardUrl: `${APP_URL}/dashboard/owner`,
        }),
      });
    }
    if (providerEmail) {
      await sendEmail({
        to: providerEmail,
        subject: "Your guarantee claim has been resolved",
        react: CaseResolvedEmail({
          caseLabel: "guarantee claim",
          summary,
          dashboardUrl: `${APP_URL}/dashboard/provider`,
        }),
      });
    }
  } catch (e) {
    console.error("adminResolveClaim: resolution email failed", e);
  }
  revalidatePath("/dashboard/admin");
  return {};
}
