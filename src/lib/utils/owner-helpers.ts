/**
 * Types for owner dashboard. Kept in a non-"use server" file so they can be imported
 * by both server actions and client components.
 */

export type CreatePetResult = { error?: string; petId?: string };
export type UpdatePetResult = { error?: string };
export type DeletePetResult = { error?: string };

export type OwnerBookingCard = {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatarUrl: string | null;
  serviceType: string;
  startDatetime: Date;
  endDatetime: Date;
  petNames: string[];
  totalPriceCents: number;
  status: string;
  specialInstructions: string | null;
  existingReview: { id: string; canEdit: boolean } | null;
  walkStartedAt: Date | null;
  walkEndedAt: Date | null;
  walkDistanceKm: number | null;
  walkDurationMinutes: number | null;
  walkSummaryMapUrl: string | null;
  serviceReport: {
    arrivalTime?: string;
    departureTime?: string;
    notes?: string;
    photos?: string[];
    activities?: string[];
    submittedAt?: string;
  } | null;
  hasDispute: boolean;
  hasGuaranteeClaim: boolean;
  tipAmount: number | null;
};

export type WalkRouteData = {
  walkRoute: { lat: number; lng: number; timestamp: number }[];
  walkActivities: { type: string; lat: number; lng: number; timestamp: number }[];
  walkStartedAt: Date | null;
  walkEndedAt: Date | null;
  status: string;
};
