/**
 * Types for giving/charity flows. Kept in a non-"use server" file so they can be
 * imported by both server actions and client components.
 */

import type { GuardianTier } from "@prisma/client";

export type GivingPageStats = {
  totalDonatedCents: number;
  charitiesFundedCount: number;
  activeGuardiansCount: number;
  supporterCount: number;
  monthlyBreakdown: { year: number; month: number; source: string; totalCents: number }[];
  featuredCharities: { id: string; name: string; mission: string | null; logoUrl: string | null; slug: string }[];
  allCharities: { id: string; name: string; mission: string | null; logoUrl: string | null; slug: string }[];
};

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

export type GivingTier = "friend" | "guardian" | "champion" | "hero" | null;

export type CommunityGiverCard = {
  displayName: string;
  country: string | null;
  countryFlag: string;
  tier: GivingTier;
  charityName: string;
  isAnonymous: boolean;
};

export type TickerItem = {
  id: string;
  type: "donation" | "guardian_started";
  displayName: string;
  isAnonymous: boolean;
  amountEur?: number;
  charityName: string;
  createdAt: Date;
};

export type CreateQuickDonationInput = {
  amountCents: number;
  charityId: string | null;
  donorName?: string | null;
  donorEmail?: string | null;
  showOnLeaderboard?: boolean;
};

export type CreateQuickGuardianSubscriptionInput = {
  amountCents: number;
  tier: GuardianTier;
  charityId: string | null;
  donorEmail: string;
  donorName?: string | null;
  showOnLeaderboard?: boolean;
};
