"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type {
  AdminInviteCharityInput,
  DonationRow,
  PayoutRow,
  UpdateCharityProfileInput,
} from "@/lib/charity/charity-action-types";
import { sendEmail } from "@/lib/email";
import CharityInviteEmail from "@/lib/email/templates/charity-invite";
import type { DonationSource } from "@prisma/client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

const SOURCE_LABELS: Record<DonationSource, string> = {
  roundup: "Round-up",
  signup: "Signup",
  one_time: "One-time",
  guardian: "Guardian subscription",
  platform_commission: "Platform commission (90% to rescue)",
  campaign: "Rescue campaign",
};

/** Get the charity linked to the current user, if any. Used for nav and dashboard access. */
export async function getLinkedCharity(): Promise<{ slug: string; name: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const charity = await prisma.charity.findUnique({
    where: { userId: user.id },
    select: { slug: true, name: true },
  });
  return charity;
}

/** Get charity by invite token (for invite page). Returns null if invalid or already used. */
export async function getCharityByInviteToken(
  token: string
): Promise<{ id: string; name: string; slug: string; mission: string | null } | null> {
  if (!token?.trim()) return null;
  const charity = await prisma.charity.findFirst({
    where: { inviteToken: token.trim(), active: true },
    select: { id: true, name: true, slug: true, mission: true },
  });
  return charity;
}

/** Link the current user to a charity by invite token. Clears token after use. */
export async function acceptCharityInvite(token: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const charity = await prisma.charity.findFirst({
    where: { inviteToken: token.trim(), active: true },
  });
  if (!charity) return { error: "Invalid or expired invite link." };
  const name = (user.user_metadata?.name as string) ?? user.email ?? "User";
  await prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email ?? "",
      name,
      passwordHash: "supabase-auth-placeholder",
      role: "owner",
    },
    update: {},
  });
  await prisma.charity.update({
    where: { id: charity.id },
    data: { userId: user.id, inviteToken: null },
  });
  revalidatePath("/dashboard/charity");
  return {};
}

/** Get full charity for dashboard (must be linked to current user). */
export async function getCharityForDashboard(): Promise<{
  charity: {
    id: string;
    name: string;
    slug: string;
    mission: string | null;
    logoUrl: string | null;
    photos: string[];
    howFundsUsed: string | null;
    annualUpdateText: string | null;
    website: string | null;
  } | null;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { charity: null, error: "Not signed in." };
  const c = await prisma.charity.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
      slug: true,
      mission: true,
      logoUrl: true,
      photos: true,
      howFundsUsed: true,
      annualUpdateText: true,
      website: true,
    },
  });
  return { charity: c };
}

/** Overview stats: total all time, this month, supporter count, next payout. */
export async function getCharityOverviewStats(): Promise<{
  totalReceivedCents: number;
  totalThisMonthCents: number;
  activeSupportersCount: number;
  nextPayoutCents: number | null;
  nextPayoutMonth: string | null;
  monthlyTrend: { month: string; cents: number }[];
  error?: string;
}> {
  const { charity } = await getCharityForDashboard();
  if (!charity) return { totalReceivedCents: 0, totalThisMonthCents: 0, activeSupportersCount: 0, nextPayoutCents: null, nextPayoutMonth: null, monthlyTrend: [], error: "Charity not found." };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const oneYearAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [donationsAll, donationsThisMonth, donationsLast12Months, guardianCount, distributions] = await Promise.all([
    prisma.donation.aggregate({
      where: { charityId: charity.id },
      _sum: { amount: true },
    }),
    prisma.donation.aggregate({
      where: { charityId: charity.id, createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.donation.findMany({
      where: { charityId: charity.id, createdAt: { gte: oneYearAgo } },
      select: { amount: true, createdAt: true },
    }),
    prisma.guardianSubscription.count({
      where: { charityId: charity.id, status: "active" },
    }),
    prisma.givingFundDistribution.findMany({
      where: { payoutStatus: { in: ["pending", "processing"] } },
      orderBy: { month: "asc" },
      select: { month: true, perCharityAmounts: true },
    }),
  ]);

  const totalReceivedCents = donationsAll._sum.amount ?? 0;
  const totalThisMonthCents = donationsThisMonth._sum.amount ?? 0;

  const uniqueDonors = await prisma.donation.findMany({
    where: { charityId: charity.id },
    select: { userId: true },
    distinct: ["userId"],
  });
  const uniqueDonorIds = new Set(uniqueDonors.map((d) => d.userId).filter(Boolean));
  const activeSupportersCount = uniqueDonorIds.size + guardianCount;

  let nextPayoutCents: number | null = null;
  let nextPayoutMonth: string | null = null;
  for (const d of distributions) {
    const amounts = d.perCharityAmounts as
      | { charity_id?: string; charityId?: string; amount: number }[]
      | null;
    const entry = amounts?.find((a) => (a.charityId ?? a.charity_id) === charity.id);
    if (entry && entry.amount > 0) {
      nextPayoutCents = entry.amount;
      nextPayoutMonth = new Date(d.month).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
      break;
    }
  }

  const monthBuckets: Record<string, number> = {};
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    monthBuckets[d.toISOString().slice(0, 7)] = 0;
  }
  for (const row of donationsLast12Months) {
    const key = new Date(row.createdAt).toISOString().slice(0, 7);
    if (monthBuckets[key] !== undefined) monthBuckets[key] += row.amount;
  }
  const monthlyTrend = Object.entries(monthBuckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, cents]) => ({ month: new Date(month + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" }), cents }));

  return {
    totalReceivedCents,
    totalThisMonthCents,
    activeSupportersCount,
    nextPayoutCents,
    nextPayoutMonth,
    monthlyTrend,
  };
}

/** Donation activity with optional filters. */
export async function getCharityDonations(filters?: {
  source?: DonationSource;
  fromDate?: string;
  toDate?: string;
}): Promise<{ donations: DonationRow[]; error?: string }> {
  const { charity } = await getCharityForDashboard();
  if (!charity) return { donations: [], error: "Charity not found." };

  const where: { charityId: string; source?: DonationSource; createdAt?: { gte?: Date; lte?: Date } } = {
    charityId: charity.id,
  };
  if (filters?.source) where.source = filters.source;
  if (filters?.fromDate || filters?.toDate) {
    where.createdAt = {};
    if (filters.fromDate) where.createdAt.gte = new Date(filters.fromDate);
    if (filters.toDate) where.createdAt.lte = new Date(filters.toDate);
  }

  const rows = await prisma.donation.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  const donations: DonationRow[] = rows.map((d) => {
    let firstName: string | null = null;
    if (d.user?.name) {
      const parts = d.user.name.trim().split(/\s+/);
      firstName = parts[0] ?? null;
    }
    return {
      id: d.id,
      date: d.createdAt,
      amountCents: d.amount,
      source: SOURCE_LABELS[d.source] ?? d.source,
      donorFirstName: firstName,
    };
  });

  return { donations };
}

/** Supporters: counts only (round-up donors, one-time donors, Guardian subscribers). */
export async function getCharitySupportersCounts(): Promise<{
  roundUpDonors: number;
  oneTimeDonors: number;
  guardianSubscribers: number;
  error?: string;
}> {
  const { charity } = await getCharityForDashboard();
  if (!charity) return { roundUpDonors: 0, oneTimeDonors: 0, guardianSubscribers: 0, error: "Charity not found." };

  const [roundUp, oneTime, guardian] = await Promise.all([
    prisma.donation.findMany({
      where: { charityId: charity.id, source: "roundup" },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.donation.findMany({
      where: { charityId: charity.id, source: "one_time" },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.guardianSubscription.count({
      where: { charityId: charity.id, status: "active" },
    }),
  ]);

  return {
    roundUpDonors: roundUp.length,
    oneTimeDonors: oneTime.length,
    guardianSubscribers: guardian,
  };
}

/** Payout history for this charity (from GivingFundDistribution where charity is in perCharityAmounts). */
export async function getCharityPayouts(): Promise<{ payouts: PayoutRow[]; error?: string }> {
  const { charity } = await getCharityForDashboard();
  if (!charity) return { payouts: [], error: "Charity not found." };

  const distributions = await prisma.givingFundDistribution.findMany({
    orderBy: { month: "desc" },
    take: 24,
    select: { id: true, month: true, perCharityAmounts: true, payoutStatus: true, approvedAt: true },
  });

  const payouts: PayoutRow[] = [];
  for (const d of distributions) {
    const amounts = d.perCharityAmounts as
      | { charity_id?: string; charityId?: string; amount: number }[]
      | null;
    const entry = amounts?.find((a) => (a.charityId ?? a.charity_id) === charity.id);
    if (!entry || entry.amount <= 0) continue;
    const expectedBy =
      d.payoutStatus === "pending" || d.payoutStatus === "processing"
        ? new Date(d.month.getFullYear(), d.month.getMonth() + 1, 15).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })
        : null;
    payouts.push({
      id: d.id,
      month: new Date(d.month).toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
      amountCents: entry.amount,
      breakdown: [{ source: "Giving Fund", amountCents: entry.amount }],
      status: d.payoutStatus,
      expectedBy,
    });
  }

  return { payouts };
}

export async function updateCharityProfile(input: UpdateCharityProfileInput): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const charity = await prisma.charity.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!charity) return { error: "Charity not found." };

  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.mission !== undefined) data.mission = input.mission;
  if (input.logoUrl !== undefined) data.logoUrl = input.logoUrl;
  if (input.photos !== undefined) data.photos = input.photos;
  if (input.howFundsUsed !== undefined) data.howFundsUsed = input.howFundsUsed;
  if (input.annualUpdateText !== undefined) data.annualUpdateText = input.annualUpdateText;
  if (input.website !== undefined) data.website = input.website;

  await prisma.charity.update({
    where: { id: charity.id },
    data,
  });
  revalidatePath("/dashboard/charity");
  revalidatePath("/giving/[slug]");
  return {};
}

// ---------------------------------------------------------------------------
// Admin: Invite Charity
// ---------------------------------------------------------------------------

export async function adminInviteCharity(input: AdminInviteCharityInput): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const u = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, name: true },
  });
  if (u?.role !== "admin") return { error: "Admin only." };

  const name = input.name?.trim();
  const contactName = input.contactName?.trim();
  const contactEmail = input.contactEmail?.trim();
  if (!name) return { error: "Charity name is required." };
  if (!contactEmail) return { error: "Contact email is required." };

  const slug =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "charity";
  const existingSlug = await prisma.charity.findUnique({ where: { slug } });
  const finalSlug = existingSlug ? `${slug}-${Date.now().toString(36)}` : slug;

  const inviteToken = crypto.randomUUID();

  const charity = await prisma.charity.create({
    data: {
      name,
      mission: input.mission?.trim() || null,
      slug: finalSlug,
      primaryContactName: contactName || null,
      primaryContactEmail: contactEmail,
      logoUrl: input.logoUrl?.trim() || null,
      photos: [],
      inviteToken,
      active: true,
    },
  });

  const inviteUrl = `${APP_URL}/invite/charity/${inviteToken}`;
  await sendEmail({
    to: contactEmail,
    subject: `${name} is set up on Tinies — finish your account`,
    react: CharityInviteEmail({
      contactName: contactName || "there",
      charityName: name,
      adminName: u?.name ?? "The Tinies team",
      inviteUrl,
    }),
  });

  revalidatePath("/dashboard/admin");
  return {};
}
