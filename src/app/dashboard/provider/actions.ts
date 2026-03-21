"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  createConnectExpressAccount,
  createConnectAccountLink,
  getStripeServer,
} from "@/lib/stripe";
import { sendEmail } from "@/lib/email";
import BookingAcceptedEmail from "@/lib/email/templates/booking-accepted";
import PaymentReceiptEmail from "@/lib/email/templates/payment-receipt";
import BookingDeclinedEmail from "@/lib/email/templates/booking-declined";
import BookingExpiredEmail from "@/lib/email/templates/booking-expired";
import { sendSMS, buildBookingAcceptedSMS } from "@/lib/sms";
import slugify from "slugify";
import type {
  CreateStripeConnectOnboardingResult,
  ProviderStripeStatus,
  ProviderBookingCard,
  ProviderEarnings,
  ProviderReviewForDashboard,
  SubmitServiceReportInput,
  ProviderWizardProfile,
  ProviderCompletenessResult,
  ServiceOfferInput,
  ProviderHomeDetails,
  UpdateProviderHomeDetailsInput,
} from "@/lib/utils/provider-helpers";
import { HOLIDAY_OPTIONS } from "@/lib/utils/provider-helpers";
import { recordPlatformCommissionDonation } from "@/lib/giving/actions";

const PENDING_RESPONSE_HOURS = 4;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const DASHBOARD_RETURN = `${APP_URL}/dashboard/provider`;
const DASHBOARD_REFRESH = `${APP_URL}/dashboard/provider?refresh=stripe`;

/** Get current user's provider profile and Stripe Connect status. */
export async function getProviderStripeStatus(): Promise<ProviderStripeStatus> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { hasProfile: false, hasStripeConnect: false };

  const profile = await prisma.providerProfile.findUnique({
    where: { userId: user.id },
    select: { stripeConnectAccountId: true },
  });
  if (!profile)
    return { hasProfile: false, hasStripeConnect: false };
  return {
    hasProfile: true,
    hasStripeConnect: Boolean(profile.stripeConnectAccountId),
  };
}

/** Create or reuse Stripe Connect account and return onboarding link. Redirect user to returned url. */
export async function createStripeConnectOnboardingLink(): Promise<CreateStripeConnectOnboardingResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { error: "You must be signed in to set up payouts." };

  const profile = await prisma.providerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, stripeConnectAccountId: true },
  });
  if (!profile)
    return { error: "Complete your provider profile first, then set up payouts." };

  if (profile.stripeConnectAccountId) {
    const link = await createConnectAccountLink({
      accountId: profile.stripeConnectAccountId,
      returnUrl: DASHBOARD_RETURN,
      refreshUrl: DASHBOARD_REFRESH,
      type: "account_update",
    });
    return { url: link.url };
  }

  try {
    const { accountId } = await createConnectExpressAccount({
      email: user.email ?? undefined,
      country: "CY",
    });
    await prisma.providerProfile.update({
      where: { id: profile.id },
      data: { stripeConnectAccountId: accountId },
    });
    const { url } = await createConnectAccountLink({
      accountId,
      returnUrl: DASHBOARD_RETURN,
      refreshUrl: DASHBOARD_REFRESH,
    });
    return { url };
  } catch (e) {
    console.error("Stripe Connect onboarding error", e);
    const message =
      e instanceof Error ? e.message : "Failed to create payout account.";
    return { error: message };
  }
}

// ---------------------------------------------------------------------------
// Provider booking management (Phase 1.4)
// ---------------------------------------------------------------------------

export async function getProviderBookings(): Promise<{
  bookings: ProviderBookingCard[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { bookings: [], error: "Not signed in." };
  try {
    const rows = await prisma.booking.findMany({
      where: { providerId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { name: true } },
      },
    });
    const allPetIds = rows.flatMap((r) => r.petIds);
    const uniquePetIds = [...new Set(allPetIds)];
    const pets =
      uniquePetIds.length > 0
        ? await prisma.pet.findMany({
            where: { id: { in: uniquePetIds } },
            select: { id: true, name: true },
          })
        : [];
    const petNameById = new Map(pets.map((p) => [p.id, p.name]));
    const bookings: ProviderBookingCard[] = rows.map((b) => {
      const route = b.walkRoute as { lat: number; lng: number; timestamp: number }[] | null;
      const activities = b.walkActivities as { type: string; lat: number; lng: number; timestamp: number }[] | null;
      return {
        id: b.id,
        ownerName: b.owner.name,
        petNames: b.petIds.map((id) => petNameById.get(id) ?? "Pet"),
        serviceType: b.serviceType,
        startDatetime: b.startDatetime,
        endDatetime: b.endDatetime,
        totalPriceCents: b.totalPrice,
        specialInstructions: b.specialInstructions,
        status: b.status,
        createdAt: b.createdAt,
        stripePaymentIntentId: b.stripePaymentIntentId,
        walkStartedAt: b.walkStartedAt,
        walkEndedAt: b.walkEndedAt,
        walkRoute: route,
        walkDistanceKm: b.walkDistanceKm,
        walkDurationMinutes: b.walkDurationMinutes,
        walkSummaryMapUrl: b.walkSummaryMapUrl,
        walkActivities: activities,
        serviceReport: b.serviceReport as ProviderBookingCard["serviceReport"],
        hasDispute: b.hasDispute,
        hasGuaranteeClaim: b.hasGuaranteeClaim,
      };
    });
    return { bookings };
  } catch (e) {
    console.error("getProviderBookings", e);
    return { bookings: [], error: "Failed to load bookings." };
  }
}

export async function getProviderEarnings(): Promise<{ earnings: ProviderEarnings | null; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { earnings: null, error: "Not signed in." };
  try {
    const completed = await prisma.booking.findMany({
      where: { providerId: user.id, status: "completed" },
      select: { totalPrice: true, commissionAmount: true, tipAmount: true },
    });
    const totalEarnedCents = completed.reduce((sum, b) => sum + (b.totalPrice - b.commissionAmount) + (b.tipAmount ?? 0), 0);
    const tipsTotalCents = completed.reduce((sum, b) => sum + (b.tipAmount ?? 0), 0);
    return {
      earnings: {
        totalEarnedCents,
        tipsTotalCents,
        completedBookingsCount: completed.length,
      },
    };
  } catch (e) {
    console.error("getProviderEarnings", e);
    return { earnings: null, error: "Failed to load earnings." };
  }
}

export async function acceptBooking(bookingId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, providerId: user.id, status: "pending" },
    select: { id: true, stripePaymentIntentId: true, commissionAmount: true },
  });
  if (!booking) return { error: "Booking not found or not pending." };
  if (!booking.stripePaymentIntentId) return { error: "No payment intent for this booking." };
  try {
    const stripe = getStripeServer();
    await stripe.paymentIntents.capture(booking.stripePaymentIntentId);
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "accepted" },
    });
    try {
      const full = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          owner: { select: { email: true, phone: true, phoneVerified: true } },
          provider: { select: { name: true } },
        },
      });
      const petIds = full?.petIds ?? [];
      const pets =
        petIds.length > 0
          ? await prisma.pet.findMany({
              where: { id: { in: petIds } },
              select: { name: true },
            })
          : [];
      const petName = pets.map((p) => p.name).join(", ") || "your pet";
      const dateStr = full?.startDatetime
        ? new Date(full.startDatetime).toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "";
      if (full?.owner?.email) {
        await sendEmail({
          to: full.owner.email,
          subject: `Booking confirmed with ${full.provider.name}`,
          react: BookingAcceptedEmail({
            providerName: full.provider.name,
            petName,
            date: dateStr,
          }),
        });
        const serviceLabel =
          full.serviceType === "walking"
            ? "Dog walking"
            : full.serviceType === "sitting"
              ? "Pet sitting"
              : full.serviceType === "boarding"
                ? "Overnight boarding"
                : full.serviceType === "drop_in"
                  ? "Drop-in visit"
                  : full.serviceType === "daycare"
                    ? "Daycare"
                    : full.serviceType;
        const amountEur = (full.totalPrice / 100).toFixed(2);
        try {
          await sendEmail({
            to: full.owner.email,
            subject: `Payment receipt: EUR ${amountEur}`,
            react: PaymentReceiptEmail({
              amountEur,
              serviceType: serviceLabel,
              providerName: full.provider.name,
              transactionId: full.stripePaymentIntentId ?? "",
            }),
          });
        } catch (receiptErr) {
          console.error("acceptBooking: payment receipt email failed", receiptErr);
        }
      }
      if (full?.owner?.phoneVerified && full?.owner?.phone) {
        await sendSMS({
          to: full.owner.phone,
          body: buildBookingAcceptedSMS({
            providerName: full.provider.name,
            date: dateStr,
          }),
        });
      }
    } catch (notifyErr) {
      console.error("acceptBooking: notify (email/SMS) failed", notifyErr);
    }
    revalidatePath("/dashboard/provider");
    return {};
  } catch (e) {
    console.error("acceptBooking", e);
    return {
      error: e instanceof Error ? e.message : "Failed to accept booking.",
    };
  }
}

export async function declineBooking(bookingId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, providerId: user.id, status: "pending" },
    select: { id: true, stripePaymentIntentId: true },
  });
  if (!booking) return { error: "Booking not found or not pending." };
  try {
    if (booking.stripePaymentIntentId) {
      try {
        const stripe = getStripeServer();
        await stripe.paymentIntents.cancel(booking.stripePaymentIntentId);
      } catch (stripeErr) {
        console.warn("declineBooking: Stripe cancel failed (may already be canceled)", stripeErr);
      }
    }
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "declined" },
    });
    try {
      const full = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          owner: { select: { email: true } },
          provider: { select: { name: true } },
        },
      });
      if (full?.owner?.email) {
        await sendEmail({
          to: full.owner.email,
          subject: `Booking update from ${full.provider.name}`,
          react: BookingDeclinedEmail({ providerName: full.provider.name }),
        });
      }
    } catch (emailErr) {
      console.error("declineBooking: email send failed", emailErr);
    }
    revalidatePath("/dashboard/provider");
    return {};
  } catch (e) {
    console.error("declineBooking", e);
    return {
      error: e instanceof Error ? e.message : "Failed to decline booking.",
    };
  }
}

/** Find pending bookings older than 4 hours, cancel their PaymentIntents, set status to cancelled and cancelledBy to "system". Call on dashboard load. */
export async function expireStaleBookings(): Promise<{ expired: number; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { expired: 0 };
  const cutoff = new Date(Date.now() - PENDING_RESPONSE_HOURS * 60 * 60 * 1000);
  const stale = await prisma.booking.findMany({
    where: {
      providerId: user.id,
      status: "pending",
      createdAt: { lt: cutoff },
    },
    select: {
      id: true,
      stripePaymentIntentId: true,
      owner: { select: { email: true } },
      provider: { select: { name: true } },
    },
  });
  const stripe = getStripeServer();
  let expired = 0;
  for (const b of stale) {
    try {
      if (b.stripePaymentIntentId) {
        try {
          await stripe.paymentIntents.cancel(b.stripePaymentIntentId);
        } catch (stripeErr) {
          console.warn("expireStaleBookings: Stripe cancel failed for", b.id, stripeErr);
        }
      }
      await prisma.booking.update({
        where: { id: b.id },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
          cancelledBy: "system",
        },
      });
      try {
        if (b.owner?.email) {
          await sendEmail({
            to: b.owner.email,
            subject: "Your booking request expired",
            react: BookingExpiredEmail({ providerName: b.provider.name }),
          });
        }
      } catch (emailErr) {
        console.error("expireStaleBookings: email send failed for", b.id, emailErr);
      }
      expired++;
    } catch (e) {
      console.error("expireStaleBookings booking", b.id, e);
    }
  }
  if (expired > 0) revalidatePath("/dashboard/provider");
  return { expired };
}

// ---------------------------------------------------------------------------
// Review responses (Phase 2.2)
// ---------------------------------------------------------------------------

/** Get current provider's reviews (for dashboard). */
export async function getProviderReviews(): Promise<{
  reviews: ProviderReviewForDashboard[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { reviews: [], error: "Not signed in." };
  try {
    const rows = await prisma.review.findMany({
      where: { providerId: user.id },
      orderBy: { createdAt: "desc" },
      include: { reviewer: { select: { name: true } } },
    });
    return {
      reviews: rows.map((r) => ({
        id: r.id,
        reviewerName: r.reviewer.name,
        rating: r.rating,
        text: r.text,
        createdAt: r.createdAt,
        providerResponse: r.providerResponse,
        responseAt: r.responseAt,
      })),
    };
  } catch (e) {
    console.error("getProviderReviews", e);
    return { reviews: [], error: "Failed to load reviews." };
  }
}

export async function respondToReview({
  reviewId,
  response,
}: {
  reviewId: string;
  response: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to respond." };
  const text = response?.trim() ?? "";
  if (!text) return { error: "Response text is required." };

  const review = await prisma.review.findFirst({
    where: { id: reviewId, providerId: user.id },
    select: { id: true, providerResponse: true },
  });
  if (!review) return { error: "Review not found or you are not the provider." };
  if (review.providerResponse != null) return { error: "You have already responded to this review." };

  try {
    await prisma.review.update({
      where: { id: reviewId },
      data: { providerResponse: text, responseAt: new Date() },
    });
    revalidatePath("/dashboard/provider");
    revalidatePath("/services/provider");
    return {};
  } catch (e) {
    console.error("respondToReview", e);
    return { error: e instanceof Error ? e.message : "Failed to save response." };
  }
}

// ---------------------------------------------------------------------------
// GPS Walk tracking (Phase 5.2)
// ---------------------------------------------------------------------------

export async function startWalk(bookingId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      providerId: user.id,
      status: "accepted",
      serviceType: "walking",
    },
    select: { id: true },
  });
  if (!booking) return { error: "Booking not found or not a walking booking." };
  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "active",
        walkStartedAt: new Date(),
        walkRoute: [],
        walkActivities: [],
      },
    });
    revalidatePath("/dashboard/provider");
    return {};
  } catch (e) {
    console.error("startWalk", e);
    return { error: e instanceof Error ? e.message : "Failed to start walk." };
  }
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function buildStaticMapUrl(
  points: { lat: number; lng: number }[],
  apiKey: string
): string {
  if (points.length === 0) return "";
  const maxPoints = 80;
  const step = Math.max(1, Math.floor(points.length / maxPoints));
  const sampled = points.filter((_, i) => i % step === 0 || i === points.length - 1);
  const pathSegment = sampled.map((p) => `${p.lat},${p.lng}`).join("|");
  const encoded = encodeURIComponent(`color:0x2D6A4F|weight:5|${pathSegment}`);
  return `https://maps.googleapis.com/maps/api/staticmap?size=600x400&path=${encoded}&key=${apiKey}`;
}

export async function endWalk(bookingId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      providerId: user.id,
      status: "active",
      serviceType: "walking",
      walkStartedAt: { not: null },
    },
    select: {
      id: true,
      commissionAmount: true,
      walkStartedAt: true,
      walkRoute: true,
      walkActivities: true,
    },
  });
  if (!booking || !booking.walkStartedAt)
    return { error: "Walk not found or not in progress." };

  const route = (booking.walkRoute ?? []) as { lat: number; lng: number; timestamp: number }[];
  const now = new Date();
  const durationMs = now.getTime() - new Date(booking.walkStartedAt).getTime();
  const durationMinutes = Math.round(durationMs / (60 * 1000));

  let distanceKm = 0;
  for (let i = 1; i < route.length; i++) {
    distanceKm += haversineKm(
      route[i - 1].lat,
      route[i - 1].lng,
      route[i].lat,
      route[i].lng
    );
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const points = route.map((p) => ({ lat: p.lat, lng: p.lng }));
  const walkSummaryMapUrl = apiKey && points.length > 0 ? buildStaticMapUrl(points, apiKey) : null;

  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "completed",
        walkEndedAt: now,
        walkDistanceKm: Math.round(distanceKm * 1000) / 1000,
        walkDurationMinutes: durationMinutes,
        walkSummaryMapUrl,
        walkActivities: booking.walkActivities ?? undefined,
      },
    });
    await recordPlatformCommissionDonation(booking.id, booking.commissionAmount);
    await updateProviderRepeatClientCount(user.id);
    revalidatePath("/dashboard/provider");
    revalidatePath("/dashboard/owner");
    return {};
  } catch (e) {
    console.error("endWalk", e);
    return { error: e instanceof Error ? e.message : "Failed to end walk." };
  }
}

/** Count unique owners with 2+ completed bookings for this provider; set repeatClientCount on ProviderProfile. */
export async function updateProviderRepeatClientCount(providerId: string): Promise<void> {
  const completed = await prisma.booking.findMany({
    where: { providerId, status: "completed" },
    select: { ownerId: true },
  });
  const ownerCounts = new Map<string, number>();
  for (const b of completed) {
    ownerCounts.set(b.ownerId, (ownerCounts.get(b.ownerId) ?? 0) + 1);
  }
  const repeatCount = [...ownerCounts.values()].filter((c) => c >= 2).length;
  const profile = await prisma.providerProfile.findUnique({
    where: { userId: providerId },
    select: { id: true },
  });
  if (profile) {
    await prisma.providerProfile.update({
      where: { id: profile.id },
      data: { repeatClientCount: repeatCount },
    });
  }
}

// ---------------------------------------------------------------------------
// Service Report (6.6b)
// ---------------------------------------------------------------------------

const SERVICE_REPORTS_PREFIX = "service-reports";

export async function uploadServiceReportPhoto(
  bookingId: string,
  file: File
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, providerId: user.id, status: "completed" },
    select: { id: true },
  });
  if (!booking) return { error: "Booking not found or not completed." };
  const ext = file.name.split(".").pop() ?? "jpg";
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 60);
  const path = `${SERVICE_REPORTS_PREFIX}/${bookingId}/${Date.now()}-${safeName}.${ext}`;
  try {
    const { error } = await supabase.storage.from("providers").upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) return { error: error.message };
    const { data } = supabase.storage.from("providers").getPublicUrl(path);
    return { url: data.publicUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed." };
  }
}

export async function submitServiceReport(bookingId: string, input: SubmitServiceReportInput): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, providerId: user.id, status: "completed" },
    select: { id: true },
  });
  if (!booking) return { error: "Booking not found or not completed." };
  const report = {
    arrivalTime: input.arrivalTime ?? undefined,
    departureTime: input.departureTime ?? undefined,
    notes: input.notes ?? undefined,
    photos: input.photos ?? [],
    activities: input.activities ?? [],
    submittedAt: new Date().toISOString(),
  };
  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { serviceReport: report },
    });
    revalidatePath("/dashboard/provider");
    revalidatePath("/dashboard/owner");
    return {};
  } catch (e) {
    console.error("submitServiceReport", e);
    return { error: e instanceof Error ? e.message : "Failed to save report." };
  }
}

// ---------------------------------------------------------------------------
// Provider Onboarding Wizard (Phase 6.1)
// ---------------------------------------------------------------------------

const PROVIDERS_BUCKET = "providers";
const WIZARD_WEIGHTS = {
  profilePhoto: 12.5,
  bio: 12.5,
  services: 12.5,
  photos: 12.5,
  availability: 12.5,
  petPrefs: 12.5,
  idVerification: 12.5,
  cancellationPolicy: 12.5,
} as const;
const COMPLETENESS_THRESHOLD = 80;

/** Ensure Prisma User exists for current Supabase user (e.g. first dashboard visit). */
async function ensureProviderUser(userId: string, email: string, name: string): Promise<void> {
  await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email: email || `${userId}@provider.placeholder`,
      name: name || "Provider",
      passwordHash: "supabase-auth-placeholder",
      role: "provider",
    },
    update: {},
  });
}

/** Get or create provider profile; then compute completeness. */
export async function getProviderProfileCompleteness(): Promise<ProviderCompletenessResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { percentage: 0, showWizard: true, profile: null, incompleteSteps: [], error: "Not signed in." };

  await ensureProviderUser(
    user.id,
    user.email ?? "",
    (user.user_metadata?.name as string) ?? user.email ?? "Provider"
  );

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, avatarUrl: true, district: true },
  });
  if (!dbUser) return { percentage: 0, showWizard: true, profile: null, incompleteSteps: [], error: "User not found." };

  let profile = await prisma.providerProfile.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      userId: true,
      slug: true,
      bio: true,
      servicesOffered: true,
      photos: true,
      availability: true,
      petTypesAccepted: true,
      maxPets: true,
      idDocumentUrl: true,
      stripeVerificationSessionId: true,
      cancellationPolicy: true,
    },
  });

  if (!profile) {
    const baseSlug = slugify(dbUser.name || "provider", { lower: true, strict: true }) || "provider";
    const existing = await prisma.providerProfile.findMany({ where: { slug: { startsWith: baseSlug } }, select: { slug: true } });
    const used = new Set(existing.map((r) => r.slug));
    let slug = baseSlug;
    let n = 0;
    while (used.has(slug)) slug = `${baseSlug}-${++n}`;
    profile = await prisma.providerProfile.create({
      data: {
        userId: user.id,
        slug,
        servicesOffered: [],
        availability: defaultAvailability(),
      },
      select: {
        id: true,
        userId: true,
        slug: true,
        bio: true,
        servicesOffered: true,
        photos: true,
        availability: true,
        petTypesAccepted: true,
        maxPets: true,
        idDocumentUrl: true,
        stripeVerificationSessionId: true,
        cancellationPolicy: true,
      },
    });
  }

  const services = (profile.servicesOffered as { type?: string; base_price?: number }[] | null) ?? [];
  const hasServices = services.length > 0 && services.some((s) => s.base_price != null && s.base_price > 0);
  const availability = profile.availability as Record<string, boolean> | null;
  const hasAvailability = availability && Object.values(availability).some(Boolean);
  const hasBio = (profile.bio?.trim().length ?? 0) >= 200;
  const hasProfilePhoto = Boolean(dbUser.avatarUrl?.trim());
  const hasPhotos = (profile.photos?.length ?? 0) >= 3;
  const hasPetPrefs = (profile.petTypesAccepted?.trim().length ?? 0) > 0 && (profile.maxPets ?? 0) > 0;
  const hasIdDoc = Boolean(profile.idDocumentUrl?.trim() || profile.stripeVerificationSessionId?.trim());
  const hasCancellation = Boolean(profile.cancellationPolicy);

  const incompleteSteps: ProviderCompletenessResult["incompleteSteps"] = [];
  if (!hasProfilePhoto) incompleteSteps.push("profilePhoto");
  if (!hasBio) incompleteSteps.push("bio");
  if (!hasServices) incompleteSteps.push("services");
  if (!hasPhotos) incompleteSteps.push("photos");
  if (!hasAvailability) incompleteSteps.push("availability");
  if (!hasPetPrefs) incompleteSteps.push("petPrefs");
  if (!hasIdDoc) incompleteSteps.push("idVerification");
  if (!hasCancellation) incompleteSteps.push("cancellationPolicy");

  let percentage = 0;
  if (hasProfilePhoto) percentage += WIZARD_WEIGHTS.profilePhoto;
  if (hasBio) percentage += WIZARD_WEIGHTS.bio;
  if (hasServices) percentage += WIZARD_WEIGHTS.services;
  if (hasPhotos) percentage += WIZARD_WEIGHTS.photos;
  if (hasAvailability) percentage += WIZARD_WEIGHTS.availability;
  if (hasPetPrefs) percentage += WIZARD_WEIGHTS.petPrefs;
  if (hasIdDoc) percentage += WIZARD_WEIGHTS.idVerification;
  if (hasCancellation) percentage += WIZARD_WEIGHTS.cancellationPolicy;
  percentage = Math.round(percentage);

  const wizardProfile: ProviderWizardProfile = {
    profileId: profile.id,
    userId: profile.userId,
    slug: profile.slug,
    district: dbUser.district ?? null,
    avatarUrl: dbUser.avatarUrl,
    bio: profile.bio,
    servicesOffered: services as ProviderWizardProfile["servicesOffered"],
    photos: profile.photos ?? [],
    availability: availability ?? null,
    petTypesAccepted: profile.petTypesAccepted,
    maxPets: profile.maxPets,
    idDocumentUrl: profile.idDocumentUrl,
    cancellationPolicy: profile.cancellationPolicy,
  };

  return {
    percentage,
    showWizard: percentage < COMPLETENESS_THRESHOLD,
    profile: wizardProfile,
    incompleteSteps,
  };
}

function defaultAvailability(): Record<string, boolean> {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const slots = ["Morning", "Afternoon", "Evening"];
  const out: Record<string, boolean> = {};
  days.forEach((d) => slots.forEach((s) => { out[`${d}-${s}`] = d !== "Sat" && d !== "Sun" && (s === "Morning" || s === "Afternoon"); }));
  return out;
}

/** Area price guidance: min/max base_price by service type in same district or all. */
export async function getProviderAreaPriceGuidance(district?: string | null): Promise<Record<string, { min: number; max: number }>> {
  const profiles = await prisma.providerProfile.findMany({
    where: { verified: true },
    include: { user: { select: { district: true } } },
  });
  const byDistrict = district ? profiles.filter((p) => p.user.district === district) : profiles;
  const services = byDistrict.flatMap((p) => {
    const raw = p.servicesOffered as { type?: string; base_price?: number }[] | null;
    return Array.isArray(raw) ? raw.filter((s) => s.type && s.base_price != null) : [];
  });
  const byType: Record<string, number[]> = {};
  services.forEach((s) => {
    const t = String(s.type ?? "");
    if (!byType[t]) byType[t] = [];
    byType[t].push(Number(s.base_price));
  });
  const result: Record<string, { min: number; max: number }> = {};
  Object.entries(byType).forEach(([type, prices]) => {
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    result[type] = { min, max };
  });
  return result;
}

/** Upload provider wizard file (avatar, gallery, or ID). Returns public URL. */
export async function uploadProviderWizardFile(formData: FormData): Promise<{ url: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { url: "", error: "Not signed in." };
  const type = formData.get("type") as string | null;
  const file = formData.get("file") as File | null;
  if (!type || !file?.size) return { url: "", error: "Missing file or type." };
  const allowed = ["avatar", "gallery", "id"];
  if (!allowed.includes(type)) return { url: "", error: "Invalid type." };
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 60);
  const path = type === "avatar" ? `${user.id}/avatar.${ext}` : type === "id" ? `${user.id}/id.${ext}` : `${user.id}/gallery/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from(PROVIDERS_BUCKET).upload(path, file, { cacheControl: "3600", upsert: true });
  if (error) return { url: "", error: error.message };
  const { data } = supabase.storage.from(PROVIDERS_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function updateProviderWizardPhoto(avatarUrl: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  try {
    await prisma.user.update({ where: { id: user.id }, data: { avatarUrl } });
    revalidatePath("/dashboard/provider");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to save." };
  }
}

export async function updateProviderWizardBio(bio: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  if ((bio?.trim().length ?? 0) < 200) return { error: "Bio must be at least 200 characters." };
  if ((bio?.trim().length ?? 0) > 1000) return { error: "Bio must be at most 1000 characters." };
  try {
    await prisma.providerProfile.update({
      where: { userId: user.id },
      data: { bio: bio.trim() },
    });
    revalidatePath("/dashboard/provider");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to save." };
  }
}

export async function updateProviderWizardServices(servicesOffered: ServiceOfferInput[]): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  if (!servicesOffered?.length) return { error: "Select at least one service with a base price." };
  try {
    await prisma.providerProfile.update({
      where: { userId: user.id },
      data: { servicesOffered: servicesOffered as unknown as object[] },
    });
    revalidatePath("/dashboard/provider");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to save." };
  }
}

export async function updateProviderWizardPhotos(photos: string[]): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  if ((photos?.length ?? 0) < 3) return { error: "Upload at least 3 photos." };
  try {
    await prisma.providerProfile.update({
      where: { userId: user.id },
      data: { photos: photos.slice(0, 15) },
    });
    revalidatePath("/dashboard/provider");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to save." };
  }
}

export async function updateProviderWizardAvailability(availability: Record<string, boolean>): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  try {
    await prisma.providerProfile.update({
      where: { userId: user.id },
      data: { availability: availability as unknown as object },
    });
    revalidatePath("/dashboard/provider");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to save." };
  }
}

export async function updateProviderWizardPetPrefs(petTypesAccepted: string, maxPets: number): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  if (!petTypesAccepted?.trim()) return { error: "Select at least one pet type." };
  if (maxPets < 1) return { error: "Max pets must be at least 1." };
  try {
    await prisma.providerProfile.update({
      where: { userId: user.id },
      data: { petTypesAccepted: petTypesAccepted.trim(), maxPets },
    });
    revalidatePath("/dashboard/provider");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to save." };
  }
}

export async function updateProviderWizardIdDocument(idDocumentUrl: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  try {
    await prisma.providerProfile.update({
      where: { userId: user.id },
      data: { idDocumentUrl },
    });
    revalidatePath("/dashboard/provider");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to save." };
  }
}

export async function updateProviderWizardCancellationPolicy(policy: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const valid = ["flexible", "moderate", "strict"].includes(policy);
  if (!valid) return { error: "Invalid policy." };
  try {
    await prisma.providerProfile.update({
      where: { userId: user.id },
      data: { cancellationPolicy: policy as "flexible" | "moderate" | "strict" },
    });
    revalidatePath("/dashboard/provider");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to save." };
  }
}

// ---------------------------------------------------------------------------
// Home details (Phase 6.3)
// ---------------------------------------------------------------------------

export async function getProviderHomeDetailsForEdit(): Promise<ProviderHomeDetails | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const profile = await prisma.providerProfile.findUnique({
    where: { userId: user.id },
    select: {
      homeType: true,
      hasYard: true,
      yardFenced: true,
      smokingHome: true,
      petsInHome: true,
      childrenInHome: true,
      dogsOnFurniture: true,
      pottyBreakFrequency: true,
      typicalDay: true,
      infoWantedAboutPet: true,
    },
  });
  return profile;
}

export async function updateProviderHomeDetails(input: UpdateProviderHomeDetailsInput): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  try {
    await prisma.providerProfile.update({
      where: { userId: user.id },
      data: {
        homeType: input.homeType ?? undefined,
        hasYard: input.hasYard ?? undefined,
        yardFenced: input.yardFenced ?? undefined,
        smokingHome: input.smokingHome ?? undefined,
        petsInHome: input.petsInHome ?? undefined,
        childrenInHome: input.childrenInHome ?? undefined,
        dogsOnFurniture: input.dogsOnFurniture ?? undefined,
        pottyBreakFrequency: input.pottyBreakFrequency ?? undefined,
        typicalDay: input.typicalDay ?? undefined,
        infoWantedAboutPet: input.infoWantedAboutPet ?? undefined,
      },
    });
    revalidatePath("/dashboard/provider");
    revalidatePath("/dashboard/provider/edit-profile");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to save." };
  }
}

// ---------------------------------------------------------------------------
// Holiday availability (6.6e)
// ---------------------------------------------------------------------------

export async function getProviderHolidaysForEdit(): Promise<{ confirmedHolidays: string[] } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const profile = await prisma.providerProfile.findUnique({
    where: { userId: user.id },
    select: { confirmedHolidays: true },
  });
  return profile ? { confirmedHolidays: profile.confirmedHolidays } : null;
}

export async function updateProviderHolidays(confirmedHolidays: string[]): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const valid = HOLIDAY_OPTIONS.map((o) => o.id);
  const filtered = confirmedHolidays.filter((id) => valid.includes(id));
  try {
    await prisma.providerProfile.update({
      where: { userId: user.id },
      data: { confirmedHolidays: filtered },
    });
    revalidatePath("/dashboard/provider");
    revalidatePath("/dashboard/provider/edit-profile");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to save." };
  }
}

// ---------------------------------------------------------------------------
// Stripe Identity verification (Phase 6.2)
// ---------------------------------------------------------------------------

/** Create a Stripe Identity VerificationSession (document + selfie). Returns client_secret for Stripe.js verifyIdentity(). */
export async function createVerificationSession(): Promise<{ clientSecret: string | null; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { clientSecret: null, error: "Not signed in." };

  const profile = await prisma.providerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) return { clientSecret: null, error: "Provider profile not found." };

  try {
    const stripe = getStripeServer();
    const identity = (stripe as unknown as { identity: { verificationSessions: { create: (opts: {
      type: string;
      metadata?: Record<string, string>;
      options?: { document?: { require_matching_selfie?: boolean } };
    }) => Promise<{ id: string; client_secret: string | null }> } } }).identity;
    if (!identity?.verificationSessions?.create) {
      return { clientSecret: null, error: "Stripe Identity not available." };
    }

    const session = await identity.verificationSessions.create({
      type: "document",
      metadata: { provider_profile_id: profile.id },
      options: { document: { require_matching_selfie: true } },
    });

    await prisma.providerProfile.update({
      where: { id: profile.id },
      data: { stripeVerificationSessionId: session.id },
    });

    revalidatePath("/dashboard/provider");
    return { clientSecret: session.client_secret };
  } catch (e) {
    console.error("createVerificationSession", e);
    return {
      clientSecret: null,
      error: e instanceof Error ? e.message : "Failed to create verification session.",
    };
  }
}
