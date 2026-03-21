export type DonationRow = {
  id: string;
  date: Date;
  amountCents: number;
  source: string;
  donorFirstName: string | null;
};

export type PayoutRow = {
  id: string;
  month: string;
  amountCents: number;
  breakdown: { source: string; amountCents: number }[];
  status: string;
  expectedBy: string | null;
};

export type UpdateCharityProfileInput = {
  name?: string;
  mission?: string | null;
  logoUrl?: string | null;
  photos?: string[];
  howFundsUsed?: string | null;
  annualUpdateText?: string | null;
  website?: string | null;
};

export type AdminInviteCharityInput = {
  name: string;
  mission: string | null;
  contactName: string;
  contactEmail: string;
  logoUrl: string | null;
};
