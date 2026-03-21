/**
 * Guardian subscription helpers for Stripe webhooks and internal use.
 * No "use server" — safe to import from Route Handlers (e.g. /api/webhooks/stripe).
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { DonationSource, type GuardianTier } from "@prisma/client";
import {
  notifyGuardianPaused,
  notifyGuardianCancelled,
  getUserGuardianTotalDonatedEur,
} from "@/lib/notifications/guardian-notifications";

/** Metadata marker on Checkout Session + Stripe Subscription for Tinies Guardian. */
export const TINIES_GUARDIAN_CHECKOUT_TYPE = "tinies_guardian";

/** Tier from monthly amount (EUR cents): 3 / 5 / 10 / custom. */
export function guardianTierFromAmountCents(amountCents: number): GuardianTier {
  if (amountCents === 300) return "friend";
  if (amountCents === 500) return "guardian";
  if (amountCents === 1000) return "champion";
  return "custom";
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

export type StripeSubscriptionSyncStatus = "active" | "paused" | "cancelled";

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
