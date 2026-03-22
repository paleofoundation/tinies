import type { ServiceType } from "@prisma/client";
import type { GivingTier } from "@/lib/utils/giving-helpers";
import type { ProviderQualificationRow } from "@/lib/utils/provider-helpers";

export type ServiceOffer = {
  type: string;
  base_price: number;
  additional_pet_price: number;
  price_unit: string;
  max_pets: number;
};

export type ProviderForBooking = {
  slug: string;
  providerName: string;
  providerId: string;
  /** Public profile / hero image */
  avatarUrl: string | null;
  district: string | null;
  memberSince: Date;
  verified: boolean;
  services: ServiceOffer[];
  cancellationPolicy: string;
  avgRating: number | null;
  reviewCount: number;
  repeatClientCount: number;
  repeatClientRate: number | null;
  responseRate: number | null;
  responseTimeMinutes: number | null;
  completedBookingsCount: number;
  serviceAreaLat: number | null;
  serviceAreaLng: number | null;
  serviceAreaRadiusKm: number | null;
  bio: string | null;
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
  backgroundCheckPassed: boolean;
  photos: string[];
  availability: Record<string, boolean> | null;
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
  confirmedHolidays: string[];
  certifications: {
    courseTitle: string;
    courseSlug: string;
    badgeLabel: string;
    badgeColor: string | null;
    score: number;
    completedAt: Date;
    certificateId: string | null;
  }[];
};

export type ProviderReviewPublic = {
  id: string;
  reviewerName: string;
  reviewerId: string;
  reviewerGivingTier: GivingTier | null;
  rating: number;
  text: string;
  photos: string[];
  createdAt: Date;
  providerResponse: string | null;
  responseAt: Date | null;
  serviceType: string;
};

export type CreateBookingWithPaymentIntentInput = {
  providerSlug: string;
  serviceType: ServiceType;
  startDatetime: string; // ISO
  endDatetime: string; // ISO
  petIds: string[];
  specialInstructions?: string;
  roundUpEnabled: boolean;
  /** For drop_in: visits per day (multiplies total by days × visitsPerDay). */
  visitsPerDay?: number;
};

export type CreateBookingWithPaymentIntentResult = {
  clientSecret?: string;
  bookingId?: string;
  error?: string;
};
