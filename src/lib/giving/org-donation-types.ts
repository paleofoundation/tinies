export type OrgDonationSummary = {
  totalReceivedDirectCents: number;
  totalReceivedFundPayoutsCents: number;
  totalReceivedAllTimeCents: number;
  thisMonthDirectCents: number;
  supporterCount: number;
  pendingPayoutCents: number;
  latestDonationAt: Date | null;
  charityIds: string[];
};

export type OrgDonationRow = {
  id: string;
  createdAt: Date;
  amountCents: number;
  sourceLabel: string;
  donorDisplay: string;
};

export type OrgPayoutRow = {
  id: string;
  monthLabel: string;
  amountCents: number;
  paymentMethod: string;
  status: string;
  paidAt: Date | null;
};
