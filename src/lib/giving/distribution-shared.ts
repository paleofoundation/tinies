/** Shared types + helpers for giving fund distribution (not server actions). */

export type DistributionPreviewRow = {
  charityId: string;
  charityName: string;
  proposedShareCents: number;
  directDonationCountThisMonth: number;
  directDonationsTotalCentsThisMonth: number;
  totalWithShareCents: number;
};

export type DistributionPreview = {
  unallocatedCents: number;
  pendingOrProcessingLockedCents: number;
  availableForDistributionCents: number;
  platformCommissionToFundCents: number;
  distributedCompletedCents: number;
  charityRows: DistributionPreviewRow[];
  currentMonthStartIso: string;
  canApprove: boolean;
  approveBlockedReason?: string;
};

export type PastDistributionBreakdownRow = {
  charityId: string;
  charityName: string;
  amountCents: number;
};

export type PastDistributionRow = {
  id: string;
  monthLabel: string;
  monthStartIso: string;
  totalFundAmountCents: number;
  charityCount: number;
  distributionMethod: string;
  payoutStatus: string;
  approvedByName: string | null;
  approvedAtIso: string | null;
  breakdown: PastDistributionBreakdownRow[];
};

/** Split `total` cents across `n` recipients; remainder distributed 1¢ each to first recipients. */
export function equalSplitCents(total: number, n: number): number[] {
  if (n <= 0 || total <= 0) return [];
  const base = Math.floor(total / n);
  const rem = total - base * n;
  return Array.from({ length: n }, (_, i) => base + (i < rem ? 1 : 0));
}
