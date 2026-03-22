/**
 * Types for search. Kept in a non-"use server" file so they can be imported
 * by both server actions and client components.
 */

export type SearchProviderCard = {
  slug: string;
  /** Provider's user id (for favorites, messaging). */
  providerUserId: string;
  name: string;
  avatarUrl: string | null;
  initials: string;
  rating: number | null;
  reviewCount: number;
  repeatClientCount: number;
  district: string | null;
  services: string[];
  priceFrom: number | null;
  bio: string | null;
  featuredReviewSnippet: string | null;
  lat: number | null;
  lng: number | null;
  distanceKm: number | null;
  cancellationPolicy: string;
  updatedAt: string;
  confirmedHolidays: string[];
  /** Small trust dots next to name on search cards (passed courses). */
  certificationDots: { slug: string; label: string; colorVar: string }[];
};

export type SortOption =
  | "distance"
  | "rating"
  | "price_low"
  | "price_high"
  | "review_count";

export type SearchFilters = {
  serviceType?: string;
  district?: string;
  priceMin?: number;
  priceMax?: number;
  minRating?: number;
  cancellationPolicy?: string;
  homeType?: string;
  hasYard?: boolean;
  holiday?: string;
  lat?: number;
  lng?: number;
  sort?: SortOption;
};
