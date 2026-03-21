import type { ServiceType } from "@prisma/client";
import type { GivingTier } from "@/lib/utils/giving-helpers";

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
  services: ServiceOffer[];
  cancellationPolicy: string;
  avgRating: number | null;
  reviewCount: number;
  repeatClientCount: number;
  serviceAreaLat: number | null;
  serviceAreaLng: number | null;
  serviceAreaRadiusKm: number | null;
  bio: string | null;
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
};

export type ProviderReviewPublic = {
  id: string;
  reviewerName: string;
  reviewerId: string;
  reviewerGivingTier: GivingTier;
  rating: number;
  text: string;
  photos: string[];
  createdAt: Date;
  providerResponse: string | null;
  responseAt: Date | null;
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
