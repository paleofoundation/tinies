/**
 * Giving ledger types and constants. Kept out of `actions.ts` because
 * `"use server"` modules may only export async functions.
 */

import type { DonationSource } from "@prisma/client";

/** Share of each booking commission allocated to animal rescue / Giving Fund (90%). */
export const PLATFORM_COMMISSION_TO_RESCUE_RATE = 0.9;

export type GivingStats = {
  totalDonatedAllTimeCents: number;
  totalDonatedThisMonthCents: number;
  activeDonorsCount: number;
  charitiesSupportedCount: number;
  /** All-time total donated in cents (alias for transparency UI). */
  totalAllTime: number;
  /** Distinct charities with attributed donations (alias). */
  charitiesSupported: number;
  activeGuardiansCount: number;
};

/** Monthly aggregates for /giving transparency table (months with any activity only). */
export type GivingMonthlyTransparencyRow = {
  year: number;
  month: number;
  label: string;
  totalCents: number;
  platformCents: number;
  roundupCents: number;
  guardianCents: number;
  oneTimeCents: number;
};

export type GivingRescuePartnerCard = {
  slug: string;
  name: string;
  missionExcerpt: string;
  logoUrl: string | null;
  /** null = no linked charity row; show “Just joined” */
  receivedThroughTiniesCents: number | null;
};

export type UserGivingHistoryRow = {
  id: string;
  createdAt: Date;
  amountCents: number;
  source: DonationSource;
  charityId: string | null;
  charityName: string | null;
  bookingId: string | null;
};

export type CharityDonationLedgerSummary = {
  totalReceivedCents: number;
  bySource: Record<string, number>;
  donorCount: number;
};
