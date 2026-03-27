"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getStripeServer } from "@/lib/stripe";
import { DonationSource, GuardianTier } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import MonthlyGivingReceiptEmail from "@/lib/email/templates/monthly-giving-receipt";
import CharityPayoutNotificationEmail from "@/lib/email/templates/charity-payout-notification";
import type {
  GivingPageStats,
  CharityProfile,
  OwnerGivingData,
  GivingTier,
  CommunityGiverCard,
  TickerItem,
  CreateQuickDonationInput,
  CreateQuickGuardianSubscriptionInput,
} from "@/lib/utils/giving-helpers";
import { TINIES_GUARDIAN_CHECKOUT_TYPE } from "./guardian-stripe";
import { PLATFORM_COMMISSION_TO_RESCUE_RATE } from "./giving-ledger-shared";
import type {
  CharityDonationLedgerSummary,
  GivingMonthlyTransparencyRow,
  GivingRescuePartnerCard,
  GivingStats,
  UserGivingHistoryRow,
} from "./giving-ledger-shared";

const GUARDIAN_PRODUCT_ID = process.env.STRIPE_GUARDIAN_PRODUCT_ID;

/** Get or create Stripe customer for user. Returns customer id. */
async function getOrCreateStripeCustomer(userId: string, email: string, name: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });
  if (user?.stripeCustomerId) return user.stripeCustomerId;
  const stripe = getStripeServer();
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: { userId },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
}

/** List verified charities + "Tinies Giving Fund" for dropdowns. */
export async function getCharitiesForGuardian(): Promise<
  { id: string | null; name: string }[]
> {
  const charities = await prisma.charity.findMany({
    where: { verified: true, active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return [
    { id: null, name: "Tinies Giving Fund (distributed to all)" },
    ...charities.map((c) => ({ id: c.id, name: c.name })),
  ];
}

const DEFAULT_GIVING_PAGE_STATS: GivingPageStats = {
  totalDonatedCents: 0,
  charitiesFundedCount: 0,
  activeGuardiansCount: 0,
  supporterCount: 0,
  monthlyBreakdown: [],
  featuredCharities: [],
  allCharities: [],
};

/** Data for public giving page. */
export async function getGivingPageData(): Promise<GivingPageStats> {
  try {
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [donationsSum, donationsByMonth, charitiesWithDonations, supporterDistinct, activeGuardians, featuredCharities, allCharities] = await Promise.all([
    prisma.donation.aggregate({ _sum: { amount: true } }),
    prisma.donation.findMany({
      where: { createdAt: { gte: twelveMonthsAgo } },
      select: { amount: true, source: true, createdAt: true },
    }),
    prisma.donation.findMany({
      where: { charityId: { not: null } },
      select: { charityId: true },
      distinct: ["charityId"],
    }),
    prisma.donation.findMany({
      where: { userId: { not: null } },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.guardianSubscription.count({ where: { status: "active" } }),
    prisma.charity.findMany({
      where: { featured: true, active: true },
      orderBy: { featuredSince: "asc" },
      select: { id: true, name: true, mission: true, logoUrl: true, slug: true },
    }),
    prisma.charity.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, mission: true, logoUrl: true, slug: true },
    }),
  ]);

  const totalDonatedCents = donationsSum._sum.amount ?? 0;
  const charitiesFundedCount = charitiesWithDonations.length;
  const supporterCount = supporterDistinct.length;

  const byMonthSource = new Map<string, number>();
  for (const d of donationsByMonth) {
    const y = d.createdAt.getFullYear();
    const m = d.createdAt.getMonth() + 1;
    const key = `${y}-${m}-${d.source}`;
    byMonthSource.set(key, (byMonthSource.get(key) ?? 0) + d.amount);
  }
  const monthlyBreakdown: GivingPageStats["monthlyBreakdown"] = [];
  byMonthSource.forEach((totalCents, key) => {
    const [y, m, source] = key.split("-");
    monthlyBreakdown.push({ year: parseInt(y, 10), month: parseInt(m, 10), source, totalCents });
  });
  monthlyBreakdown.sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));

  return {
    totalDonatedCents,
    charitiesFundedCount,
    activeGuardiansCount: activeGuardians,
    supporterCount,
    monthlyBreakdown,
    featuredCharities,
    allCharities,
  };
  } catch (e) {
    console.error("getGivingPageData", e);
    return DEFAULT_GIVING_PAGE_STATS;
  }
}

/** Get charity by slug for public profile page. */
export async function getCharityBySlug(slug: string): Promise<CharityProfile | null> {
  const charity = await prisma.charity.findUnique({
    where: { slug, active: true },
    select: {
      id: true,
      name: true,
      mission: true,
      logoUrl: true,
      photos: true,
      website: true,
      howFundsUsed: true,
      slug: true,
      totalReceived: true,
      supporterCount: true,
      annualUpdateText: true,
      annualUpdateDate: true,
    },
  });
  if (!charity) return null;
  const [donationsSum] = await Promise.all([
    prisma.donation.aggregate({
      where: { charityId: charity.id },
      _sum: { amount: true },
    }),
  ]);
  const totalReceivedCents = donationsSum._sum.amount ?? 0;
  const supporterCount = charity.supporterCount ?? 0;
  return {
    ...charity,
    totalReceivedCents,
    supporterCount,
    annualUpdateText: charity.annualUpdateText,
    annualUpdateDate: charity.annualUpdateDate,
  };
}

/** Create PaymentIntent for one-time donation on charity profile. */
export async function createOneTimeDonationPaymentIntent(params: {
  charityId: string;
  amountCents: number;
  showOnLeaderboard?: boolean;
}): Promise<{ clientSecret: string | null; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (params.amountCents < 100) return { clientSecret: null, error: "Minimum donation is €1." };
  try {
    const stripe = getStripeServer();
    const pi = await stripe.paymentIntents.create({
      amount: params.amountCents,
      currency: "eur",
      metadata: {
        type: "one_time_donation",
        userId: user?.id ?? "",
        charityId: params.charityId,
        amountCents: String(params.amountCents),
        showOnLeaderboard: params.showOnLeaderboard ? "1" : "0",
      },
      automatic_payment_methods: { enabled: true },
    });
    return { clientSecret: pi.client_secret ?? null };
  } catch (e) {
    console.error("createOneTimeDonationPaymentIntent", e);
    return { clientSecret: null, error: e instanceof Error ? e.message : "Failed to create payment." };
  }
}

/** Set current user's preferred charity (for round-up etc.). */
export async function setPreferredCharity(charityId: string | null): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  try {
    await prisma.userGivingPreference.upsert({
      where: { userId: user.id },
      create: { userId: user.id, preferredCharityId: charityId },
      update: { preferredCharityId: charityId },
    });
    revalidatePath("/dashboard/owner/giving");
    revalidatePath("/giving");
    return {};
  } catch (e) {
    console.error("setPreferredCharity", e);
    return { error: e instanceof Error ? e.message : "Failed to update." };
  }
}

/** Get current user's giving preferences and history. */
export async function getOwnerGivingData(): Promise<OwnerGivingData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const prefs = await prisma.userGivingPreference.findUnique({
    where: { userId: user.id },
    include: {
      charity: { select: { id: true, name: true } },
    },
  });
  const guardianSubscriptionRow = await prisma.guardianSubscription.findUnique({
    where: { userId: user.id },
    include: { charity: { select: { name: true } } },
  });
  const charities = await prisma.charity.findMany({
    where: { verified: true, active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  const donations = await prisma.donation.findMany({
    where: { userId: user.id },
    select: { amount: true, charityId: true, charity: { select: { name: true } }, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  const totalDonatedCents = donations.reduce((s, d) => s + d.amount, 0);
  const byMonth = new Map<string, number>();
  const byCharity = new Map<string, { name: string | null; cents: number }>();
  for (const d of donations) {
    const y = d.createdAt.getFullYear();
    const m = d.createdAt.getMonth() + 1;
    byMonth.set(`${y}-${m}`, (byMonth.get(`${y}-${m}`) ?? 0) + d.amount);
    const cid = d.charityId ?? "_fund";
    const cur = byCharity.get(cid);
    byCharity.set(cid, {
      name: d.charity?.name ?? null,
      cents: (cur?.cents ?? 0) + d.amount,
    });
  }
  const donationsByMonth = Array.from(byMonth.entries())
    .map(([k, totalCents]) => {
      const [y, m] = k.split("-").map(Number);
      return { year: y, month: m, totalCents };
    })
    .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));
  const donationsByCharity = Array.from(byCharity.entries()).map(([charityId, v]) => ({
    charityId: charityId === "_fund" ? null : charityId,
    charityName: v.name,
    totalCents: v.cents,
  }));

  return {
    preferredCharityId: prefs?.preferredCharityId ?? null,
    roundupEnabled: prefs?.roundupEnabled ?? true,
    guardianSubscription: guardianSubscriptionRow
      ? {
          id: guardianSubscriptionRow.id,
          amountMonthly: guardianSubscriptionRow.amountMonthly,
          tier: guardianSubscriptionRow.tier,
          status: guardianSubscriptionRow.status,
          charityId: guardianSubscriptionRow.charityId,
          charityName: guardianSubscriptionRow.charity?.name ?? null,
          stripeSubscriptionId: guardianSubscriptionRow.stripeSubscriptionId,
        }
      : null,
    charitiesForDropdown: charities,
    totalDonatedCents,
    donationsByMonth,
    donationsByCharity,
  };
}

/** Update round-up enabled. */
export async function updateRoundupEnabled(enabled: boolean): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  try {
    await prisma.userGivingPreference.upsert({
      where: { userId: user.id },
      create: { userId: user.id, roundupEnabled: enabled },
      update: { roundupEnabled: enabled },
    });
    revalidatePath("/dashboard/owner/giving");
    return {};
  } catch (e) {
    console.error("updateRoundupEnabled", e);
    return { error: e instanceof Error ? e.message : "Failed to update." };
  }
}

// ---------------------------------------------------------------------------
// Community of Givers (5.1b)
// ---------------------------------------------------------------------------

/** Compute giving tier from donations + guardian subscriptions. */
export async function computeGivingTier(userId: string): Promise<GivingTier> {
  const [donations, subs] = await Promise.all([
    prisma.donation.findMany({
      where: { userId },
      select: { amount: true },
    }),
    prisma.guardianSubscription.findMany({
      where: { userId, status: "active" },
      select: { amountMonthly: true, tier: true },
    }),
  ]);
  const donationCount = donations.length;
  const lifetimeCents = donations.reduce((s, d) => s + d.amount, 0);
  const lifetimeEur = lifetimeCents / 100;
  const activeSub = subs[0];
  const subEur = activeSub ? activeSub.amountMonthly / 100 : 0;
  const subTier = activeSub?.tier;

  if (lifetimeEur >= 500) return "hero";
  if (lifetimeEur >= 100 || donationCount >= 10 || (subTier === "champion" && subEur >= 10) || (subTier === "custom" && subEur >= 10)) return "champion";
  if (donationCount >= 4 || (subTier === "guardian" && subEur >= 5) || (subTier === "custom" && subEur >= 5 && subEur < 10)) return "guardian";
  if (donationCount >= 1 || (subTier === "friend" && subEur >= 3) || (subTier === "custom" && subEur >= 1 && subEur < 5)) return "friend";
  return null;
}

/** Get givers who opted in to leaderboard (showOnLeaderboard = true). */
export async function getCommunityOfGivers(): Promise<CommunityGiverCard[]> {
  try {
  const prefs = await prisma.userGivingPreference.findMany({
    where: { showOnLeaderboard: true },
    include: {
      user: { select: { id: true, name: true, country: true } },
      charity: { select: { name: true } },
      guardianSubscription: {
        include: { charity: { select: { name: true } } },
      },
    },
  });
  const cards: CommunityGiverCard[] = [];
  const tierCache = new Map<string, GivingTier>();
  for (const p of prefs) {
    const tier = tierCache.get(p.userId) ?? (await computeGivingTier(p.userId));
    tierCache.set(p.userId, tier);
    if (tier === null) continue;
    const charityName =
      p.guardianSubscription?.charity?.name ??
      p.charity?.name ??
      "Tinies Giving Fund";
    const parts = p.user.name.trim().split(/\s+/);
    const firstName = parts[0] ?? "Supporter";
    const lastInitial = parts.length > 1 ? `${parts[parts.length - 1].charAt(0).toUpperCase()}.` : "";
    const displayName = `${firstName} ${lastInitial}`.trim();
    cards.push({
      displayName,
      country: p.user.country,
      countryFlag: countryToFlag(p.user.country),
      tier,
      charityName,
      isAnonymous: false,
    });
  }
  return cards;
  } catch (e) {
    console.error("getCommunityOfGivers", e);
    return [];
  }
}

/** Recent activity for ticker: donations + new Guardian subscriptions. */
export async function getRecentDonationsForTicker(limit = 20): Promise<TickerItem[]> {
  try {
  const [donations, newSubs] = await Promise.all([
    prisma.donation.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { name: true } },
        charity: { select: { name: true } },
      },
    }),
    prisma.guardianSubscription.findMany({
      where: { status: "active" },
      orderBy: { startedAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true } },
        charity: { select: { name: true } },
      },
    }),
  ]);
  const items: TickerItem[] = [];
  for (const d of donations) {
    if (!d.userId) continue;
    const prefs = d.userId
      ? await prisma.userGivingPreference.findUnique({
          where: { userId: d.userId },
          select: { showOnLeaderboard: true },
        })
      : null;
    const showName = prefs?.showOnLeaderboard ?? false;
    const parts = d.user?.name?.trim().split(/\s+/) ?? [];
    const firstName = parts[0] ?? "";
    const lastInitial = parts.length > 1 ? `${parts[parts.length - 1].charAt(0).toUpperCase()}.` : "";
    items.push({
      id: d.id,
      type: "donation",
      displayName: showName ? `${firstName} ${lastInitial}`.trim() || "Supporter" : "A generous supporter",
      isAnonymous: !showName,
      amountEur: d.amount / 100,
      charityName: d.charity?.name ?? "Tinies Giving Fund",
      createdAt: d.createdAt,
    });
  }
  for (const s of newSubs) {
    const prefs = await prisma.userGivingPreference.findUnique({
      where: { userId: s.userId },
      select: { showOnLeaderboard: true },
    });
    const showName = prefs?.showOnLeaderboard ?? false;
    const parts = s.user.name.trim().split(/\s+/);
    const firstName = parts[0] ?? "";
    const lastInitial = parts.length > 1 ? `${parts[parts.length - 1].charAt(0).toUpperCase()}.` : "";
    items.push({
      id: `sub-${s.id}`,
      type: "guardian_started",
      displayName: showName ? `${firstName} ${lastInitial}`.trim() || "Supporter" : "A generous supporter",
      isAnonymous: !showName,
      charityName: s.charity?.name ?? "Tinies Giving Fund",
      createdAt: s.startedAt ?? s.createdAt,
    });
  }
  items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return items.slice(0, limit);
  } catch (e) {
    console.error("getRecentDonationsForTicker", e);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Donations ledger — platform commission (90% to rescue), aggregates
// ---------------------------------------------------------------------------

/**
 * When a booking completes, record 90% of the platform commission as a platform_commission
 * donation to the Tinies Giving Fund (charityId null). Idempotent per booking.
 */
export async function recordPlatformCommissionDonation(
  bookingId: string,
  commissionAmountCents: number
): Promise<{ recordedCents: number; skipped: boolean }> {
  const rescueShareCents = Math.round(commissionAmountCents * PLATFORM_COMMISSION_TO_RESCUE_RATE);
  if (rescueShareCents <= 0) {
    return { recordedCents: 0, skipped: true };
  }
  try {
    const existing = await prisma.donation.findFirst({
      where: { bookingId, source: DonationSource.platform_commission },
      select: { id: true },
    });
    if (existing) {
      return { recordedCents: 0, skipped: true };
    }
    await prisma.donation.create({
      data: {
        userId: null,
        charityId: null,
        source: DonationSource.platform_commission,
        amount: rescueShareCents,
        bookingId,
      },
    });
    revalidatePath("/giving");
    revalidatePath("/dashboard/owner/giving");
    return { recordedCents: rescueShareCents, skipped: false };
  } catch (e) {
    console.error("recordPlatformCommissionDonation", e);
    return { recordedCents: 0, skipped: true };
  }
}

/**
 * Record a booking round-up. If `charityId` is omitted, uses the user’s preferred charity
 * from UserGivingPreference; explicit `null` forces Tinies Giving Fund.
 */
/** Persist round-up opt-in for checkout (next booking defaults). */
export async function updateOwnerRoundupEnabled(enabled: boolean): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  try {
    await prisma.userGivingPreference.upsert({
      where: { userId: user.id },
      create: { userId: user.id, roundupEnabled: enabled },
      update: { roundupEnabled: enabled },
    });
    return {};
  } catch (e) {
    console.error("updateOwnerRoundupEnabled", e);
    return { error: "Could not save preference." };
  }
}

/** Public /giving aggregates: all-time, this month, donors, charities with any attributed donation. */
export async function getGivingStats(): Promise<GivingStats> {
  const empty: GivingStats = {
    totalDonatedAllTimeCents: 0,
    totalDonatedThisMonthCents: 0,
    activeDonorsCount: 0,
    charitiesSupportedCount: 0,
    totalAllTime: 0,
    charitiesSupported: 0,
    activeGuardiansCount: 0,
  };
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [allSum, monthSum, donorRows, charityRows, activeGuardiansCount] = await Promise.all([
      prisma.donation.aggregate({ _sum: { amount: true } }),
      prisma.donation.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.donation.findMany({
        where: { userId: { not: null } },
        distinct: ["userId"],
        select: { userId: true },
      }),
      prisma.donation.findMany({
        where: { charityId: { not: null } },
        distinct: ["charityId"],
        select: { charityId: true },
      }),
      prisma.guardianSubscription.count({ where: { status: "active" } }),
    ]);
    const totalDonatedAllTimeCents = allSum._sum.amount ?? 0;
    const charitiesSupportedCount = charityRows.length;
    return {
      totalDonatedAllTimeCents,
      totalDonatedThisMonthCents: monthSum._sum.amount ?? 0,
      activeDonorsCount: donorRows.length,
      charitiesSupportedCount,
      totalAllTime: totalDonatedAllTimeCents,
      charitiesSupported: charitiesSupportedCount,
      activeGuardiansCount,
    };
  } catch (e) {
    console.error("getGivingStats", e);
    return empty;
  }
}

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Last 12 rolling months; only rows where totalCents > 0. */
export async function getGivingMonthlyTransparencyRows(): Promise<GivingMonthlyTransparencyRow[]> {
  try {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
    const donations = await prisma.donation.findMany({
      where: { createdAt: { gte: start } },
      select: { amount: true, source: true, createdAt: true },
    });
    const bucket = new Map<
      string,
      { year: number; month: number; total: number; platform: number; roundup: number; guardian: number; oneTime: number }
    >();
    for (let i = 0; i < 12; i++) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11 + i, 1));
      const y = d.getUTCFullYear();
      const m = d.getUTCMonth() + 1;
      bucket.set(`${y}-${m}`, { year: y, month: m, total: 0, platform: 0, roundup: 0, guardian: 0, oneTime: 0 });
    }
    for (const row of donations) {
      const dt = row.createdAt;
      const key = `${dt.getUTCFullYear()}-${dt.getUTCMonth() + 1}`;
      const cell = bucket.get(key);
      if (!cell) continue;
      cell.total += row.amount;
      switch (row.source) {
        case DonationSource.platform_commission:
          cell.platform += row.amount;
          break;
        case DonationSource.roundup:
          cell.roundup += row.amount;
          break;
        case DonationSource.guardian:
          cell.guardian += row.amount;
          break;
        case DonationSource.one_time:
        case DonationSource.signup:
          cell.oneTime += row.amount;
          break;
        default:
          break;
      }
    }
    const out: GivingMonthlyTransparencyRow[] = [];
    for (const cell of bucket.values()) {
      if (cell.total <= 0) continue;
      out.push({
        year: cell.year,
        month: cell.month,
        label: `${MONTH_SHORT[cell.month - 1]} ${cell.year}`,
        totalCents: cell.total,
        platformCents: cell.platform,
        roundupCents: cell.roundup,
        guardianCents: cell.guardian,
        oneTimeCents: cell.oneTime,
      });
    }
    out.sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));
    return out;
  } catch (e) {
    console.error("getGivingMonthlyTransparencyRows", e);
    return [];
  }
}

function excerptMission(text: string | null, maxLen: number): string {
  if (!text?.trim()) return "";
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}

/** Verified rescue orgs for /giving partner grid with optional linked charity donation totals. */
export async function getGivingRescuePartnerCards(): Promise<GivingRescuePartnerCard[]> {
  try {
    const orgs = await prisma.rescueOrg.findMany({
      where: { verified: true },
      orderBy: { name: "asc" },
      select: { slug: true, name: true, mission: true, logoUrl: true, userId: true },
    });
    const cards: GivingRescuePartnerCard[] = [];
    for (const org of orgs) {
      const charity = await prisma.charity.findFirst({
        where: {
          active: true,
          OR: [{ slug: org.slug }, { userId: org.userId }],
        },
        select: { id: true },
      });
      let receivedThroughTiniesCents: number | null = null;
      if (charity) {
        const agg = await prisma.donation.aggregate({
          where: { charityId: charity.id },
          _sum: { amount: true },
        });
        receivedThroughTiniesCents = agg._sum.amount ?? 0;
      }
      cards.push({
        slug: org.slug,
        name: org.name,
        missionExcerpt: excerptMission(org.mission, 140),
        logoUrl: org.logoUrl,
        receivedThroughTiniesCents,
      });
    }
    return cards;
  } catch (e) {
    console.error("getGivingRescuePartnerCards", e);
    return [];
  }
}

/** Animals currently listed as available for adoption (public impact number). */
export async function getAnimalsSupportedCount(): Promise<number> {
  try {
    return await prisma.adoptionListing.count({
      where: { active: true, status: "available" },
    });
  } catch (e) {
    console.error("getAnimalsSupportedCount", e);
    return 0;
  }
}

/** All donations for a user (ledger rows) with charity names. */
export async function getUserGivingHistory(userId: string): Promise<UserGivingHistoryRow[]> {
  const rows = await prisma.donation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { charity: { select: { name: true } } },
  });
  return rows.map((d) => ({
    id: d.id,
    createdAt: d.createdAt,
    amountCents: d.amount,
    source: d.source,
    charityId: d.charityId,
    charityName: d.charity?.name ?? null,
    bookingId: d.bookingId,
  }));
}

/** Per-charity totals from the donations table, broken down by source (for rescue dashboards). */
export async function getCharityDonationSummary(
  charityId: string
): Promise<CharityDonationLedgerSummary | null> {
  const charity = await prisma.charity.findUnique({
    where: { id: charityId },
    select: { id: true },
  });
  if (!charity) return null;
  const donations = await prisma.donation.findMany({
    where: { charityId },
    select: { amount: true, source: true, userId: true },
  });
  const totalReceivedCents = donations.reduce((s, d) => s + d.amount, 0);
  const bySource: Record<string, number> = {};
  for (const d of donations) {
    bySource[d.source] = (bySource[d.source] ?? 0) + d.amount;
  }
  const donorIds = new Set(
    donations.map((d) => d.userId).filter((id): id is string => id != null)
  );
  return {
    totalReceivedCents,
    bySource,
    donorCount: donorIds.size,
  };
}

/**
 * Tinies Giving Fund balance: platform commission earmarked for rescue (null charity) minus
 * amounts in distributions already marked completed.
 */
export async function getGivingFundBalance(): Promise<{
  /** Platform commission to the central fund minus completed distributions only (historical “paid out”). */
  unallocatedCents: number;
  platformCommissionToFundCents: number;
  distributedCompletedCents: number;
  /** Totals still locked in approved-but-not-paid distributions. */
  pendingOrProcessingLockedCents: number;
  /** Amount available to approve in a new distribution: unallocated minus pending/processing locks. */
  availableForDistributionCents: number;
}> {
  try {
    const [inAgg, completedAgg, pendingAgg] = await Promise.all([
      prisma.donation.aggregate({
        where: {
          source: DonationSource.platform_commission,
          charityId: null,
        },
        _sum: { amount: true },
      }),
      prisma.givingFundDistribution.aggregate({
        where: { payoutStatus: "completed" },
        _sum: { totalFundAmount: true },
      }),
      prisma.givingFundDistribution.aggregate({
        where: { payoutStatus: { in: ["pending", "processing"] } },
        _sum: { totalFundAmount: true },
      }),
    ]);
    const platformCommissionToFundCents = inAgg._sum.amount ?? 0;
    const distributedCompletedCents = completedAgg._sum.totalFundAmount ?? 0;
    const pendingOrProcessingLockedCents = pendingAgg._sum.totalFundAmount ?? 0;
    const unallocatedCents = Math.max(0, platformCommissionToFundCents - distributedCompletedCents);
    const availableForDistributionCents = Math.max(0, unallocatedCents - pendingOrProcessingLockedCents);
    return {
      unallocatedCents,
      platformCommissionToFundCents,
      distributedCompletedCents,
      pendingOrProcessingLockedCents,
      availableForDistributionCents,
    };
  } catch (e) {
    console.error("getGivingFundBalance", e);
    return {
      unallocatedCents: 0,
      platformCommissionToFundCents: 0,
      distributedCompletedCents: 0,
      pendingOrProcessingLockedCents: 0,
      availableForDistributionCents: 0,
    };
  }
}

function countryToFlag(country: string | null): string {
  if (!country || !country.trim()) return "🌍";
  const c = country.trim().toLowerCase();
  const map: Record<string, string> = {
    cyprus: "🇨🇾",
    uk: "🇬🇧",
    "united kingdom": "🇬🇧",
    germany: "🇩🇪",
    netherlands: "🇳🇱",
    greece: "🇬🇷",
    france: "🇫🇷",
    spain: "🇪🇸",
    italy: "🇮🇹",
    usa: "🇺🇸",
    "united states": "🇺🇸",
  };
  return map[c] ?? "🌍";
}

// ---------------------------------------------------------------------------
// Quick Donate (5.6) — public `/giving/donate` (legacy `/give` redirects), no login required
// ---------------------------------------------------------------------------

/** Create PaymentIntent for one-time quick donate. No login required. Webhook records Donation. */
export async function createQuickDonation(params: CreateQuickDonationInput): Promise<{ clientSecret: string | null; error?: string }> {
  if (params.amountCents < 100) return { clientSecret: null, error: "Minimum donation is €1." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? "";
  try {
    const stripe = getStripeServer();
    const piParams: Parameters<ReturnType<typeof getStripeServer>["paymentIntents"]["create"]>[0] = {
      amount: params.amountCents,
      currency: "eur",
      metadata: {
        type: "quick_donation",
        userId,
        charityId: params.charityId ?? "",
        amountCents: String(params.amountCents),
        showOnLeaderboard: params.showOnLeaderboard ? "1" : "0",
      },
      automatic_payment_methods: { enabled: true },
    };
    if (params.donorEmail?.trim()) piParams.receipt_email = params.donorEmail.trim();
    const pi = await stripe.paymentIntents.create(piParams);
    return { clientSecret: pi.client_secret ?? null };
  } catch (e) {
    console.error("createQuickDonation", e);
    return { clientSecret: null, error: e instanceof Error ? e.message : "Failed to create payment." };
  }
}

/** Get or create a Prisma User for guest (no Supabase auth). Used for monthly quick donate. */
async function getOrCreateGuestUser(email: string, name: string): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true },
  });
  if (existing) return existing.id;
  const id = crypto.randomUUID();
  await prisma.user.create({
    data: {
      id,
      email: email.trim().toLowerCase(),
      name: (name || email).trim().slice(0, 200),
      passwordHash: "guest-no-login",
      role: "owner",
      welcomeFlowCompletedAt: new Date(),
    },
  });
  return id;
}

/** Create Guardian subscription for quick donate (guest or logged-in). Returns clientSecret for Payment Element. */
export async function createQuickGuardianSubscription(params: CreateQuickGuardianSubscriptionInput): Promise<{
  clientSecret: string | null;
  subscriptionId: string | null;
  error?: string;
}> {
  if (params.amountCents < 100) return { clientSecret: null, subscriptionId: null, error: "Minimum €1/month." };
  const email = params.donorEmail?.trim();
  if (!email) return { clientSecret: null, subscriptionId: null, error: "Email is required for monthly giving." };
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  let userId: string;
  let userEmail: string;
  let userName: string;
  if (authUser) {
    userId = authUser.id;
    userEmail = authUser.email ?? email;
    userName = (authUser.user_metadata?.name as string) ?? params.donorName ?? email;
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!dbUser) {
      await prisma.user.upsert({
        where: { id: userId },
        create: {
          id: userId,
          email: userEmail,
          name: userName,
          passwordHash: "supabase-auth-placeholder",
          role: "owner",
        },
        update: {},
      });
    }
  } else {
    userId = await getOrCreateGuestUser(email, params.donorName ?? email);
    userEmail = email;
    userName = params.donorName?.trim() ?? email;
  }
  try {
    const existingGuardian = await prisma.guardianSubscription.findUnique({
      where: { userId },
      select: { status: true },
    });
    if (
      existingGuardian &&
      (existingGuardian.status === "active" || existingGuardian.status === "paused")
    ) {
      return {
        clientSecret: null,
        subscriptionId: null,
        error: "You already have a Guardian subscription on this account.",
      };
    }

    const stripe = getStripeServer();
    const customerId = await getOrCreateStripeCustomer(userId, userEmail, userName);
    let productId = GUARDIAN_PRODUCT_ID;
    if (!productId) {
      const products = await stripe.products.list({ active: true });
      const guardian = products.data.find((p) => p.name === "Tinies Guardian");
      if (guardian) productId = guardian.id;
      else {
        const product = await stripe.products.create({
          name: "Tinies Guardian",
          description: "Monthly giving to animal rescue",
        });
        productId = product.id;
      }
    }
    const price = await stripe.prices.create({
      unit_amount: params.amountCents,
      currency: "eur",
      recurring: { interval: "month" },
      product: productId,
    });
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: price.id }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        userId,
        charityId: params.charityId ?? "",
        tier: params.tier,
        checkout_type: TINIES_GUARDIAN_CHECKOUT_TYPE,
        amountMonthlyCents: String(params.amountCents),
      },
    });
    const invoice = subscription.latest_invoice as { payment_intent?: { client_secret: string } } | null;
    const clientSecret = invoice?.payment_intent?.client_secret ?? null;
    const guardianSub = await prisma.guardianSubscription.upsert({
      where: { userId },
      create: {
        userId,
        charityId: params.charityId || null,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        amountMonthly: params.amountCents,
        tier: params.tier,
        status: "active",
        startedAt: new Date(),
      },
      update: {
        charityId: params.charityId || null,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        amountMonthly: params.amountCents,
        tier: params.tier,
        status: "active",
        startedAt: new Date(),
        pausedAt: null,
        cancelledAt: null,
      },
    });
    await prisma.userGivingPreference.upsert({
      where: { userId },
      create: {
        userId,
        preferredCharityId: params.charityId,
        guardianSubscriptionId: guardianSub.id,
        showOnLeaderboard: params.showOnLeaderboard ?? false,
      },
      update: {
        preferredCharityId: params.charityId,
        guardianSubscriptionId: guardianSub.id,
        showOnLeaderboard: params.showOnLeaderboard ?? false,
      },
    });
    revalidatePath("/giving");
    revalidatePath("/giving/donate");
    return { clientSecret, subscriptionId: subscription.id };
  } catch (e) {
    console.error("createQuickGuardianSubscription", e);
    return {
      clientSecret: null,
      subscriptionId: null,
      error: e instanceof Error ? e.message : "Failed to create subscription.",
    };
  }
}

/** Featured charities + Giving Fund for quick donate selector. */
export async function getFeaturedCharitiesForQuickDonate(): Promise<
  { id: string | null; name: string; slug: string | null; logoUrl: string | null }[]
> {
  const fund = { id: null as string | null, name: "Tinies Giving Fund", slug: null as string | null, logoUrl: null as string | null };
  try {
    const list = await prisma.charity.findMany({
      where: { featured: true, active: true },
      orderBy: { featuredSince: "asc" },
      select: { id: true, name: true, slug: true, logoUrl: true },
    });
    return [fund, ...list.map((c) => ({ id: c.id, name: c.name, slug: c.slug, logoUrl: c.logoUrl }))];
  } catch (e) {
    console.error("getFeaturedCharitiesForQuickDonate", e);
    return [fund];
  }
}

/** Update showOnLeaderboard for current user. */
export async function updateShowOnLeaderboard(show: boolean): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  try {
    await prisma.userGivingPreference.upsert({
      where: { userId: user.id },
      create: { userId: user.id, showOnLeaderboard: show },
      update: { showOnLeaderboard: show },
    });
    revalidatePath("/giving");
    revalidatePath("/dashboard/owner/giving");
    return {};
  } catch (e) {
    console.error("updateShowOnLeaderboard", e);
    return { error: e instanceof Error ? e.message : "Failed to update." };
  }
}

/** Send monthly giving receipt to a donor. Call from cron or admin for each donor who had activity that month. Does not throw. */
export async function sendMonthlyGivingReceiptEmail(params: {
  to: string;
  month: string;
  roundUpsEur: string;
  guardianEur: string;
  totalEur: string;
  charityNames: string[];
}): Promise<void> {
  try {
    await sendEmail({
      to: params.to,
      subject: `Your Tinies Giving summary for ${params.month}`,
      react: MonthlyGivingReceiptEmail({
        month: params.month,
        roundUpsEur: params.roundUpsEur,
        guardianEur: params.guardianEur,
        totalEur: params.totalEur,
        charityNames: params.charityNames,
      }),
    });
  } catch (e) {
    console.error("sendMonthlyGivingReceiptEmail failed", e);
  }
}

/** Send charity payout notification to charity contact. Call when a payout is recorded. Does not throw. */
export async function sendCharityPayoutNotificationEmail(params: {
  to: string;
  charityName: string;
  month: string;
  amountEur: string;
  donorCount: number;
}): Promise<void> {
  try {
    await sendEmail({
      to: params.to,
      subject: `${params.charityName}: Tinies Giving payout for ${params.month}`,
      react: CharityPayoutNotificationEmail({
        charityName: params.charityName,
        month: params.month,
        amountEur: params.amountEur,
        donorCount: params.donorCount,
      }),
    });
  } catch (e) {
    console.error("sendCharityPayoutNotificationEmail failed", e);
  }
}

/** When a fund payout to a charity is recorded, notify the charity contact. Safe to call from admin/cron. */
export async function sendCharityPayoutNotificationToContact(params: {
  charityId: string;
  month: string;
  amountEur: string;
  donorCount: number;
}): Promise<void> {
  try {
    const charity = await prisma.charity.findUnique({
      where: { id: params.charityId },
      select: { name: true, primaryContactEmail: true },
    });
    if (!charity?.primaryContactEmail) return;
    await sendCharityPayoutNotificationEmail({
      to: charity.primaryContactEmail,
      charityName: charity.name,
      month: params.month,
      amountEur: params.amountEur,
      donorCount: params.donorCount,
    });
  } catch (e) {
    console.error("sendCharityPayoutNotificationToContact failed", e);
  }
}
