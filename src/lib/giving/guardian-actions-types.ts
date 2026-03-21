import type { GuardianStatus, GuardianTier } from "@prisma/client";

export type CreateGuardianCheckoutInput = {
  amountMonthlyCents: number;
  tier: GuardianTier;
  charityId: string | null;
  showOnLeaderboard?: boolean;
};

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
