"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getStripeServer } from "@/lib/stripe";
import { DonationSource, GuardianTier, GuardianStatus } from "@prisma/client";
import {
  notifyGuardianPaused,
  notifyGuardianCancelled,
  getUserGuardianTotalDonatedEur,
} from "@/lib/notifications/guardian-notifications";

const GUARDIAN_PRODUCT_ID = process.env.STRIPE_GUARDIAN_PRODUCT_ID;
/** Metadata marker on Checkout Session + Stripe Subscription for Tinies Guardian. */
export const TINIES_GUARDIAN_CHECKOUT_TYPE = "tinies_guardian";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/** Tier from monthly amount (EUR cents): 3 / 5 / 10 / custom. */
export function guardianTierFromAmountCents(amountCents: number): GuardianTier {
  if (amountCents === 300) return "friend";
  if (amountCents === 500) return "guardian";
  if (amountCents === 1000) return "champion";
  return "custom";
}

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

async function getTiniesGuardianProductId(stripe: ReturnType<typeof getStripeServer>): Promise<string> {
  let productId = GUARDIAN_PRODUCT_ID;
  if (!productId) {
    const products = await stripe.products.list({ active: true, limit: 100 });
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
  return productId;
}

export type CreateGuardianCheckoutInput = {
  amountMonthlyCents: number;
  tier: GuardianTier;
  charityId: string | null;
  showOnLeaderboard?: boolean;
};

/**
 * Stripe Checkout (subscription mode). Creates no DB row until checkout.session.completed.
 */
export async function createGuardianSubscription(
  input: CreateGuardianCheckoutInput
): Promise<{ checkoutUrl: string | null; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { checkoutUrl: null, error: "You must be signed in." };
  if (input.amountMonthlyCents < 100) {
    return { checkoutUrl: null, error: "Minimum €1/month." };
  }

  const existingActive = await prisma.guardianSubscription.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true },
  });
  if (existingActive && (existingActive.status === "active" || existingActive.status === "paused")) {
    return {
      checkoutUrl: null,
      error: "You already have a Guardian subscription. Manage it in Giving settings.",
    };
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true, name: true },
    });
    if (!dbUser?.email) return { checkoutUrl: null, error: "User email not found." };

    const stripe = getStripeServer();
    const customerId = await getOrCreateStripeCustomer(user.id, dbUser.email, dbUser.name);
    const productId = await getTiniesGuardianProductId(stripe);

    const charityIdStr = input.charityId ?? "";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      success_url: `${APP_URL}/dashboard/owner/giving?guardian=success`,
      cancel_url: `${APP_URL}/giving/become-a-guardian?cancelled=1`,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product: productId,
            unit_amount: input.amountMonthlyCents,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      metadata: {
        checkout_type: TINIES_GUARDIAN_CHECKOUT_TYPE,
        userId: user.id,
        charityId: charityIdStr,
        tier: input.tier,
        amountMonthlyCents: String(input.amountMonthlyCents),
        showOnLeaderboard: input.showOnLeaderboard ? "1" : "0",
      },
      subscription_data: {
        metadata: {
          checkout_type: TINIES_GUARDIAN_CHECKOUT_TYPE,
          userId: user.id,
          charityId: charityIdStr,
          tier: input.tier,
          amountMonthlyCents: String(input.amountMonthlyCents),
        },
      },
      allow_promotion_codes: false,
    });

    if (!session.url) {
      return { checkoutUrl: null, error: "Could not start checkout." };
    }

    revalidatePath("/giving/become-a-guardian");
    return { checkoutUrl: session.url };
  } catch (e) {
    console.error("createGuardianSubscription checkout", e);
    return {
      checkoutUrl: null,
      error: e instanceof Error ? e.message : "Failed to start subscription checkout.",
    };
  }
}

async function getGuardianSubForCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null as null, sub: null };
  const sub = await prisma.guardianSubscription.findUnique({
    where: { userId: user.id },
    select: { id: true, stripeSubscriptionId: true, status: true },
  });
  return { user, sub };
}

export async function pauseGuardianSubscription(): Promise<{ error?: string }> {
  const { user, sub } = await getGuardianSubForCurrentUser();
  if (!user) return { error: "You must be signed in." };
  if (!sub?.stripeSubscriptionId) return { error: "Subscription not found." };
  try {
    const stripe = getStripeServer();
    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      pause_collection: { behavior: "void" },
    });
    await prisma.guardianSubscription.update({
      where: { id: sub.id },
      data: { status: "paused", pausedAt: new Date() },
    });
    revalidatePath("/dashboard/owner/giving");
    revalidatePath("/giving");
    return {};
  } catch (e) {
    console.error("pauseGuardianSubscription", e);
    return { error: e instanceof Error ? e.message : "Failed to pause." };
  }
}

export async function resumeGuardianSubscription(): Promise<{ error?: string }> {
  const { user, sub } = await getGuardianSubForCurrentUser();
  if (!user) return { error: "You must be signed in." };
  if (!sub?.stripeSubscriptionId) return { error: "Subscription not found." };
  try {
    const stripe = getStripeServer();
    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      pause_collection: null,
    });
    await prisma.guardianSubscription.update({
      where: { id: sub.id },
      data: { status: "active", pausedAt: null },
    });
    revalidatePath("/dashboard/owner/giving");
    revalidatePath("/giving");
    return {};
  } catch (e) {
    console.error("resumeGuardianSubscription", e);
    return { error: e instanceof Error ? e.message : "Failed to resume." };
  }
}

export async function cancelGuardianSubscription(): Promise<{ error?: string }> {
  const { user, sub } = await getGuardianSubForCurrentUser();
  if (!user) return { error: "You must be signed in." };
  if (!sub?.stripeSubscriptionId) return { error: "Subscription not found." };
  try {
    const stripe = getStripeServer();
    await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
    await prisma.guardianSubscription.update({
      where: { id: sub.id },
      data: { status: "cancelled", cancelledAt: new Date() },
    });
    revalidatePath("/dashboard/owner/giving");
    revalidatePath("/giving");
    return {};
  } catch (e) {
    console.error("cancelGuardianSubscription", e);
    return { error: e instanceof Error ? e.message : "Failed to cancel." };
  }
}

export type GuardianSubscriptionDetails = {
  id: string;
  userId: string;
  charityId: string | null;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  amountMonthly: number;
  tier: GuardianTier;
  status: GuardianStatus;
  startedAt: Date | null;
  pausedAt: Date | null;
  cancelledAt: Date | null;
};

export async function getGuardianSubscription(userId: string): Promise<GuardianSubscriptionDetails | null> {
  const row = await prisma.guardianSubscription.findUnique({
    where: { userId },
  });
  if (!row) return null;
  return { ...row };
}

/** Webhook + internal: upsert Guardian row after Checkout completes. */
export async function upsertGuardianFromCheckoutSession(params: {
  userId: string;
  charityId: string | null;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  amountMonthlyCents: number;
  tier: GuardianTier;
  showOnLeaderboard: boolean;
}): Promise<void> {
  const charityId = params.charityId;
  const sub = await prisma.guardianSubscription.upsert({
    where: { userId: params.userId },
    create: {
      userId: params.userId,
      charityId,
      stripeSubscriptionId: params.stripeSubscriptionId,
      stripeCustomerId: params.stripeCustomerId,
      amountMonthly: params.amountMonthlyCents,
      tier: params.tier,
      status: "active",
      startedAt: new Date(),
      pausedAt: null,
      cancelledAt: null,
    },
    update: {
      charityId,
      stripeSubscriptionId: params.stripeSubscriptionId,
      stripeCustomerId: params.stripeCustomerId,
      amountMonthly: params.amountMonthlyCents,
      tier: params.tier,
      status: "active",
      startedAt: new Date(),
      pausedAt: null,
      cancelledAt: null,
    },
  });

  await prisma.userGivingPreference.upsert({
    where: { userId: params.userId },
    create: {
      userId: params.userId,
      preferredCharityId: charityId,
      guardianSubscriptionId: sub.id,
      showOnLeaderboard: params.showOnLeaderboard,
    },
    update: {
      preferredCharityId: charityId,
      guardianSubscriptionId: sub.id,
      showOnLeaderboard: params.showOnLeaderboard,
    },
  });

  revalidatePath("/giving");
  revalidatePath("/giving/become-a-guardian");
  revalidatePath("/dashboard/owner/giving");
}

/** Record a paid Guardian invoice (monthly). Idempotent on stripeInvoiceId. */
export async function recordGuardianDonation(params: {
  userId: string;
  charityId: string | null;
  amountCents: number;
  stripeInvoiceId: string;
}): Promise<void> {
  if (params.amountCents <= 0) return;
  const existing = await prisma.donation.findFirst({
    where: { stripeInvoiceId: params.stripeInvoiceId },
    select: { id: true },
  });
  if (existing) return;

  const addEur = params.amountCents / 100;
  await prisma.$transaction(async (tx) => {
    await tx.donation.create({
      data: {
        userId: params.userId,
        charityId: params.charityId,
        source: DonationSource.guardian,
        amount: params.amountCents,
        stripeInvoiceId: params.stripeInvoiceId,
      },
    });
    const userRow = await tx.user.findUnique({
      where: { id: params.userId },
      select: { totalDonated: true },
    });
    await tx.user.update({
      where: { id: params.userId },
      data: { totalDonated: (userRow?.totalDonated ?? 0) + addEur },
    });
  });
  revalidatePath("/giving");
  revalidatePath("/dashboard/owner/giving");
}

/** Sync Prisma Guardian row from Stripe subscription (webhook). */
export async function syncGuardianSubscriptionFromStripe(params: {
  stripeSubscriptionId: string;
  status: StripeSubscriptionSyncStatus;
  cancelAtPeriodEnd?: boolean;
}): Promise<void> {
  const row = await prisma.guardianSubscription.findFirst({
    where: { stripeSubscriptionId: params.stripeSubscriptionId },
    select: { id: true, userId: true, status: true },
  });
  if (!row) return;
  const prevStatus = row.status;

  if (params.status === "cancelled") {
    await prisma.guardianSubscription.update({
      where: { id: row.id },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
      },
    });
  } else if (params.status === "paused") {
    await prisma.guardianSubscription.update({
      where: { id: row.id },
      data: { status: "paused", pausedAt: new Date() },
    });
  } else if (params.status === "active") {
    await prisma.guardianSubscription.update({
      where: { id: row.id },
      data: { status: "active", pausedAt: null, cancelledAt: null },
    });
  }

  if (params.status === "paused" && prevStatus === "active") {
    try {
      const totalDonatedEur = await getUserGuardianTotalDonatedEur(row.userId);
      await notifyGuardianPaused({ userId: row.userId, totalDonatedEur });
    } catch (e) {
      console.error("syncGuardianSubscriptionFromStripe: paused email failed", e);
    }
  }
  if (params.status === "cancelled" && prevStatus !== "cancelled") {
    try {
      const totalDonatedEur = await getUserGuardianTotalDonatedEur(row.userId);
      await notifyGuardianCancelled({ userId: row.userId, totalDonatedEur });
    } catch (e) {
      console.error("syncGuardianSubscriptionFromStripe: cancelled email failed", e);
    }
  }

  revalidatePath("/dashboard/owner/giving");
  revalidatePath("/giving");
}

export type StripeSubscriptionSyncStatus = "active" | "paused" | "cancelled";
