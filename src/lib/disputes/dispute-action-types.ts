import type { DisputeRuling } from "@prisma/client";

export type DisputeCard = {
  id: string;
  bookingId: string;
  disputeType: string;
  description: string;
  evidencePhotos: string[];
  status: string;
  respondentResponse: string | null;
  respondentPhotos: string[];
  createdAt: Date;
  openedByName: string;
  respondentName: string;
  isReporter: boolean;
  bookingSummary: string;
};

export type ClaimCard = {
  id: string;
  bookingId: string;
  claimType: string;
  description: string;
  photos: string[];
  status: string;
  otherPartyResponse: string | null;
  otherPartyPhotos: string[];
  createdAt: Date;
  reporterName: string;
  isReporter: boolean;
  bookingSummary: string;
};

export type AdminDisputeRow = {
  id: string;
  bookingId: string;
  disputeType: string;
  description: string;
  evidencePhotos: string[];
  respondentResponse: string | null;
  respondentPhotos: string[];
  status: string;
  ruling: DisputeRuling | null;
  refundAmount: number | null;
  openedByName: string;
  respondentName: string;
  bookingTotalCents: number;
  stripePaymentIntentId: string | null;
  createdAt: Date;
};

export type AdminClaimRow = {
  id: string;
  bookingId: string;
  claimType: string;
  description: string;
  photos: string[];
  otherPartyResponse: string | null;
  otherPartyPhotos: string[];
  status: string;
  ruling: string | null;
  payoutAmount: number | null;
  payoutRecipientName: string | null;
  reporterName: string;
  createdAt: Date;
  ownerId: string;
  ownerName: string;
  providerId: string;
  providerName: string;
};

export type AdminResolveDisputeInput = {
  ruling: DisputeRuling;
  refundAmountCents?: number | null;
  rulingNotes?: string | null;
};

export type AdminResolveClaimInput = {
  ruling: "approved_full" | "approved_partial" | "denied";
  payoutAmountCents?: number | null;
  payoutRecipientId?: string | null;
  rulingNotes?: string | null;
};
