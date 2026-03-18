"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getStripeServer } from "@/lib/stripe";
import { DonationSource, GuardianTier } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import MonthlyGivingReceiptEmail from "@/lib/email/templates/monthly-giving-receipt";
import CharityPayoutNotificationEmail from "@/lib/email/templates/charity-payout-notification";

const GUARDIAN_PRODUCT_ID = process.env.STRIPE_GUARDIAN_PRODUCT_ID;

/** Get one featured charity for welcome/signup donation (rotate by createdAt). */
export async function getFeaturedCharityForSignup(): Promise<{
  id: string;
  name: string;
  mission: string | null;
  logoUrl: string | null;
  slug: string;
} | null> {
  const charities = await prisma.charity.findMany({
    where: { featured: true, active: true },
    orderBy: { createdAt: "asc" },
    take: 1,
    select: { id: true, name: true, mission: true, logoUrl: true, slug: true },
  });
  return charities[0] ?? null;
}

/** Create PaymentIntent for signup one-time donation. Returns clientSecret for Stripe Elements. */
export async function createSignupDonationPaymentIntent(params: {
  charityId: string | null;
  amountCents: number;
  showOnLeaderboard?: boolean;
}): Promise<{ clientSecret: string | null; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { clientSecret: null, error: "You must be signed in." };
  if (params.amountCents < 100) return { clientSecret: null, error: "Minimum donation is €1." };
  try {
    const stripe = getStripeServer();
    const pi = await stripe.paymentIntents.create({
      amount: params.amountCents,
      currency: "eur",
      metadata: {
        type: "signup_donation",
        userId: user.id,
        charityId: params.charityId ?? "",
        amountCents: String(params.amountCents),
        showOnLeaderboard: params.showOnLeaderboard ? "1" : "0",
      },
      automatic_payment_methods: { enabled: true },
    });
    return { clientSecret: pi.client_secret ?? null };
  } catch (e) {
    console.error("createSignupDonationPaymentIntent", e);
    return {
      clientSecret: null,
      error: e instanceof Error ? e.message : "Failed to create payment.",
    };
  }
}

/** Record signup donation after PaymentIntent succeeds (called from webhook or after confirm). */
export async function recordSignupDonation(params: {
  stripePaymentIntentId: string;
  userId: string;
  charityId: string | null;
  amountCents: number;
}): Promise<void> {
  await prisma.donation.create({
    data: {
      userId: params.userId,
      charityId: params.charityId || null,
      source: DonationSource.signup,
      amount: params.amountCents,
      stripePaymentIntentId: params.stripePaymentIntentId,
    },
  });
  revalidatePath("/giving");
  revalidatePath("/dashboard/owner/giving");
}

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

/** Create Guardian subscription. Returns clientSecret for first invoice payment (Stripe PaymentIntent). */
export async function createGuardianSubscription(params: {
  amountCents: number;
  tier: GuardianTier;
  charityId: string | null;
  showOnLeaderboard?: boolean;
}): Promise<{ clientSecret: string | null; subscriptionId: string | null; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { clientSecret: null, subscriptionId: null, error: "You must be signed in." };
  if (params.amountCents < 100) return { clientSecret: null, subscriptionId: null, error: "Minimum €1/month." };
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true, name: true },
    });
    if (!dbUser?.email) return { clientSecret: null, subscriptionId: null, error: "User email not found." };

    const stripe = getStripeServer();
    const customerId = await getOrCreateStripeCustomer(user.id, dbUser.email, dbUser.name);

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
        userId: user.id,
        charityId: params.charityId ?? "",
        tier: params.tier,
      },
    });

    const invoice = subscription.latest_invoice as { payment_intent?: { client_secret: string } } | null;
    const clientSecret = invoice?.payment_intent?.client_secret ?? null;

    const guardianSub = await prisma.guardianSubscription.create({
      data: {
        userId: user.id,
        charityId: params.charityId || null,
        stripeSubscriptionId: subscription.id,
        amountMonthly: params.amountCents,
        tier: params.tier,
        status: "active",
        startedAt: new Date(),
      },
    });

    await prisma.userGivingPreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
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
    revalidatePath("/giving/become-a-guardian");
    revalidatePath("/dashboard/owner/giving");
    return { clientSecret, subscriptionId: subscription.id };
  } catch (e) {
    console.error("createGuardianSubscription", e);
    return {
      clientSecret: null,
      subscriptionId: null,
      error: e instanceof Error ? e.message : "Failed to create subscription.",
    };
  }
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
    { id: null, name: "Tinies Giving Fund" },
    ...charities.map((c) => ({ id: c.id, name: c.name })),
  ];
}

export type GivingPageStats = {
  totalDonatedCents: number;
  charitiesFundedCount: number;
  activeGuardiansCount: number;
  supporterCount: number;
  monthlyBreakdown: { year: number; month: number; source: string; totalCents: number }[];
  featuredCharities: { id: string; name: string; mission: string | null; logoUrl: string | null; slug: string }[];
  allCharities: { id: string; name: string; mission: string | null; logoUrl: string | null; slug: string }[];
};

/** Data for public giving page. */
export async function getGivingPageData(): Promise<GivingPageStats> {
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
}

export type CharityProfile = {
  id: string;
  name: string;
  mission: string | null;
  logoUrl: string | null;
  photos: string[];
  website: string | null;
  howFundsUsed: string | null;
  slug: string;
  totalReceivedCents: number;
  supporterCount: number;
  annualUpdateText: string | null;
  annualUpdateDate: Date | null;
};

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

export type OwnerGivingData = {
  preferredCharityId: string | null;
  roundupEnabled: boolean;
  guardianSubscription: {
    id: string;
    amountMonthly: number;
    tier: string;
    status: string;
    charityId: string | null;
    charityName: string | null;
    stripeSubscriptionId: string | null;
  } | null;
  charitiesForDropdown: { id: string; name: string }[];
  totalDonatedCents: number;
  donationsByMonth: { year: number; month: number; totalCents: number }[];
  donationsByCharity: { charityId: string | null; charityName: string | null; totalCents: number }[];
};

/** Get current user's giving preferences and history. */
export async function getOwnerGivingData(): Promise<OwnerGivingData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const prefs = await prisma.userGivingPreference.findUnique({
    where: { userId: user.id },
    include: {
      charity: { select: { id: true, name: true } },
      guardianSubscription: {
        include: { charity: { select: { name: true } } },
      },
    },
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
    guardianSubscription: prefs?.guardianSubscription
      ? {
          id: prefs.guardianSubscription.id,
          amountMonthly: prefs.guardianSubscription.amountMonthly,
          tier: prefs.guardianSubscription.tier,
          status: prefs.guardianSubscription.status,
          charityId: prefs.guardianSubscription.charityId,
          charityName: prefs.guardianSubscription.charity?.name ?? null,
          stripeSubscriptionId: prefs.guardianSubscription.stripeSubscriptionId,
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

/** Pause Guardian subscription (Stripe + DB). */
export async function pauseGuardianSubscription(subscriptionId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  const sub = await prisma.guardianSubscription.findFirst({
    where: { id: subscriptionId, userId: user.id },
    select: { stripeSubscriptionId: true },
  });
  if (!sub?.stripeSubscriptionId) return { error: "Subscription not found." };
  try {
    const stripe = getStripeServer();
    await stripe.subscriptions.update(sub.stripeSubscriptionId, { pause_collection: { behavior: "void" } });
    await prisma.guardianSubscription.update({
      where: { id: subscriptionId },
      data: { status: "paused", pausedAt: new Date() },
    });
    revalidatePath("/dashboard/owner/giving");
    return {};
  } catch (e) {
    console.error("pauseGuardianSubscription", e);
    return { error: e instanceof Error ? e.message : "Failed to pause." };
  }
}

/** Cancel Guardian subscription (Stripe + DB). */
export async function cancelGuardianSubscription(subscriptionId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  const sub = await prisma.guardianSubscription.findFirst({
    where: { id: subscriptionId, userId: user.id },
    select: { stripeSubscriptionId: true },
  });
  if (!sub?.stripeSubscriptionId) return { error: "Subscription not found." };
  try {
    const stripe = getStripeServer();
    await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
    await prisma.guardianSubscription.update({
      where: { id: subscriptionId },
      data: { status: "cancelled", cancelledAt: new Date() },
    });
    await prisma.userGivingPreference.update({
      where: { userId: user.id },
      data: { guardianSubscriptionId: null },
    });
    revalidatePath("/dashboard/owner/giving");
    return {};
  } catch (e) {
    console.error("cancelGuardianSubscription", e);
    return { error: e instanceof Error ? e.message : "Failed to cancel." };
  }
}

// ---------------------------------------------------------------------------
// Community of Givers (5.1b)
// ---------------------------------------------------------------------------

export type GivingTier = "friend" | "guardian" | "champion" | "hero" | null;

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

export type CommunityGiverCard = {
  displayName: string;
  country: string | null;
  countryFlag: string;
  tier: GivingTier;
  charityName: string;
  isAnonymous: boolean;
};

/** Get givers who opted in to leaderboard (showOnLeaderboard = true). */
export async function getCommunityOfGivers(): Promise<CommunityGiverCard[]> {
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
}

/** Recent activity for ticker: donations + new Guardian subscriptions. */
export type TickerItem = {
  id: string;
  type: "donation" | "guardian_started";
  displayName: string;
  isAnonymous: boolean;
  amountEur?: number;
  charityName: string;
  createdAt: Date;
};

export async function getRecentDonationsForTicker(limit = 20): Promise<TickerItem[]> {
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
// Quick Donate (5.6) — public /give page, no login required
// ---------------------------------------------------------------------------

export type CreateQuickDonationInput = {
  amountCents: number;
  charityId: string | null;
  donorName?: string | null;
  donorEmail?: string | null;
  showOnLeaderboard?: boolean;
};

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
    },
  });
  return id;
}

export type CreateQuickGuardianSubscriptionInput = {
  amountCents: number;
  tier: GuardianTier;
  charityId: string | null;
  donorEmail: string;
  donorName?: string | null;
  showOnLeaderboard?: boolean;
};

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
      },
    });
    const invoice = subscription.latest_invoice as { payment_intent?: { client_secret: string } } | null;
    const clientSecret = invoice?.payment_intent?.client_secret ?? null;
    const guardianSub = await prisma.guardianSubscription.create({
      data: {
        userId,
        charityId: params.charityId || null,
        stripeSubscriptionId: subscription.id,
        amountMonthly: params.amountCents,
        tier: params.tier,
        status: "active",
        startedAt: new Date(),
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
    revalidatePath("/give");
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
  const list = await prisma.charity.findMany({
    where: { featured: true, active: true },
    orderBy: { featuredSince: "asc" },
    select: { id: true, name: true, slug: true, logoUrl: true },
  });
  return [fund, ...list.map((c) => ({ id: c.id, name: c.name, slug: c.slug, logoUrl: c.logoUrl }))];
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
  month: string;
  amountEur: string;
  donorCount: number;
}): Promise<void> {
  try {
    await sendEmail({
      to: params.to,
      subject: `Your Tinies Giving payout for ${params.month}`,
      react: CharityPayoutNotificationEmail({
        month: params.month,
        amountEur: params.amountEur,
        donorCount: params.donorCount,
      }),
    });
  } catch (e) {
    console.error("sendCharityPayoutNotificationEmail failed", e);
  }
}
