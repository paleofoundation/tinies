/**
 * Types and constants for provider dashboard. Kept in a non-"use server" file
 * so they can be imported by both server actions and client components.
 */

export type ProviderStripeStatus = {
  hasProfile: boolean;
  hasStripeConnect: boolean;
};

export type CreateStripeConnectOnboardingResult = {
  url?: string;
  error?: string;
};

export type ProviderBookingCard = {
  id: string;
  ownerName: string;
  petNames: string[];
  serviceType: string;
  startDatetime: Date;
  endDatetime: Date;
  totalPriceCents: number;
  specialInstructions: string | null;
  status: string;
  createdAt: Date;
  stripePaymentIntentId: string | null;
  walkStartedAt: Date | null;
  walkEndedAt: Date | null;
  walkRoute: { lat: number; lng: number; timestamp: number }[] | null;
  walkDistanceKm: number | null;
  walkDurationMinutes: number | null;
  walkSummaryMapUrl: string | null;
  walkActivities: { type: string; lat: number; lng: number; timestamp: number }[] | null;
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
  /** Present when this booking was completed with a Tinies Card. */
  tiniesCardId: string | null;
};

export type ProviderEarnings = {
  totalEarnedCents: number;
  tipsTotalCents: number;
  completedBookingsCount: number;
};

/** Tips received (for earnings UI line items). */
export type ProviderTipLineItem = {
  bookingId: string;
  ownerName: string;
  dateLabel: string;
  amountCents: number;
};

export type ProviderRecurringClientRow = {
  id: string;
  ownerName: string;
  serviceType: string;
  daysOfWeek: number[];
  timeSlot: string;
  pricePerSessionCents: number;
  status: string;
  nextBookingDate: Date | null;
};

export type ProviderRecurringUpcomingRow = {
  bookingId: string;
  startDatetime: Date;
  ownerName: string;
  recurringBookingId: string | null;
};

export type ProviderReviewForDashboard = {
  id: string;
  reviewerName: string;
  rating: number;
  text: string;
  createdAt: Date;
  providerResponse: string | null;
  responseAt: Date | null;
};

export type SubmitServiceReportInput = {
  arrivalTime?: string;
  departureTime?: string;
  notes?: string;
  photos?: string[];
  activities?: string[];
};

export type ProviderWizardProfile = {
  profileId: string;
  userId: string;
  slug: string;
  district: string | null;
  avatarUrl: string | null;
  bio: string | null;
  servicesOffered: { type: string; base_price?: number; additional_pet_price?: number; price_unit?: string; max_pets?: number }[];
  photos: string[];
  availability: Record<string, boolean> | null;
  petTypesAccepted: string | null;
  maxPets: number | null;
  idDocumentUrl: string | null;
  cancellationPolicy: string;
};

export type ProviderCompletenessResult = {
  percentage: number;
  showWizard: boolean;
  profile: ProviderWizardProfile | null;
  incompleteSteps: ("profilePhoto" | "bio" | "services" | "photos" | "availability" | "petPrefs" | "idVerification" | "cancellationPolicy")[];
  error?: string;
};

export type ServiceOfferInput = { type: string; base_price: number; additional_pet_price: number; price_unit: string; max_pets: number };

export type ProviderHomeDetails = {
  homeType: string | null;
  hasYard: boolean | null;
  yardFenced: boolean | null;
  smokingHome: boolean | null;
  petsInHome: string | null;
  childrenInHome: string | null;
  dogsOnFurniture: boolean | null;
  pottyBreakFrequency: string | null;
  typicalDay: string | null;
  infoWantedAboutPet: string | null;
};

export type UpdateProviderHomeDetailsInput = {
  homeType?: string | null;
  hasYard?: boolean | null;
  yardFenced?: boolean | null;
  smokingHome?: boolean | null;
  petsInHome?: string | null;
  childrenInHome?: string | null;
  dogsOnFurniture?: boolean | null;
  pottyBreakFrequency?: string | null;
  typicalDay?: string | null;
  infoWantedAboutPet?: string | null;
};

export type ProviderQualificationRow = {
  title: string;
  issuer?: string;
  year?: number;
  description?: string;
};

/** Rich trust profile fields (public provider page + editor). */
export type ProviderRichProfileData = {
  headline: string | null;
  videoIntroUrl: string | null;
  experienceTags: string[];
  qualifications: ProviderQualificationRow[];
  languages: string[];
  homeDescription: string | null;
  homePhotos: string[];
  whyIDoThis: string | null;
  previousExperience: string | null;
  insuranceDetails: string | null;
  emergencyProtocol: string | null;
  acceptedBreeds: string[];
  notAccepted: string[];
  responseTimeMinutes: number | null;
  backgroundCheckPassed: boolean;
};

export type UpdateProviderRichProfileInput = {
  headline: string | null;
  videoIntroUrl: string | null;
  experienceTags: string[];
  qualifications: ProviderQualificationRow[];
  languages: string[];
  homeDescription: string | null;
  homePhotos: string[];
  whyIDoThis: string | null;
  previousExperience: string | null;
  insuranceDetails: string | null;
  emergencyProtocol: string | null;
  acceptedBreeds: string[];
  notAccepted: string[];
  responseTimeMinutes: number | null;
  backgroundCheckPassed: boolean;
};

export function emptyProviderRichProfile(): ProviderRichProfileData {
  return {
    headline: null,
    videoIntroUrl: null,
    experienceTags: [],
    qualifications: [],
    languages: [],
    homeDescription: null,
    homePhotos: [],
    whyIDoThis: null,
    previousExperience: null,
    insuranceDetails: null,
    emergencyProtocol: null,
    acceptedBreeds: [],
    notAccepted: [],
    responseTimeMinutes: null,
    backgroundCheckPassed: false,
  };
}

export const HOLIDAY_OPTIONS: { id: string; label: string }[] = [
  { id: "christmas-2026", label: "Christmas 2026" },
  { id: "new-year-2027", label: "New Year 2027" },
  { id: "easter-2027", label: "Easter 2027" },
  { id: "summer-2027", label: "Summer 2027" },
];
