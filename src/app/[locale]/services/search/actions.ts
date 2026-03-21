"use server";

import { prisma } from "@/lib/prisma";
import { geocodeAddress } from "@/lib/utils/geocoding";
import type { SearchProviderCard, SearchFilters } from "@/lib/utils/search-helpers";
import { mapProfileToSearchProviderCard } from "@/lib/providers/search-provider-card-map";

/** Geocode an address for search; returns lat/lng or null. */
export async function geocodeSearchLocation(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  return geocodeAddress(address);
}

/** Get verified providers for search with distance, sort, and filters. */
export async function getSearchProviders(
  filters: SearchFilters = {}
): Promise<SearchProviderCard[]> {
  try {
  const profiles = await prisma.providerProfile.findMany({
    where: {
      verified: true,
      ...(filters.homeType ? { homeType: filters.homeType } : {}),
      ...(filters.hasYard === true ? { hasYard: true } : {}),
      ...(filters.holiday ? { confirmedHolidays: { has: filters.holiday } } : {}),
    },
    include: {
      user: { select: { name: true, avatarUrl: true, district: true } },
      reviews: {
        where: { rating: 5 },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { text: true },
      },
    },
  });

  const searchLat = filters.lat;
  const searchLng = filters.lng;
  const hasLocation = searchLat != null && searchLng != null;
  const sort = filters.sort ?? (hasLocation ? "distance" : "rating");

  let result: SearchProviderCard[] = profiles.map((p) =>
    mapProfileToSearchProviderCard(
      {
        slug: p.slug,
        userId: p.userId,
        bio: p.bio,
        servicesOffered: p.servicesOffered,
        serviceAreaLat: p.serviceAreaLat,
        serviceAreaLng: p.serviceAreaLng,
        avgRating: p.avgRating,
        reviewCount: p.reviewCount,
        repeatClientCount: p.repeatClientCount,
        cancellationPolicy: p.cancellationPolicy,
        updatedAt: p.updatedAt,
        confirmedHolidays: p.confirmedHolidays,
        user: p.user,
        reviews: p.reviews,
      },
      {
        serviceType: filters.serviceType,
        searchLat,
        searchLng,
      }
    )
  );

  if (filters.serviceType) {
    result = result.filter((r) =>
      r.services.some((s) => s.toLowerCase() === filters.serviceType!.toLowerCase())
    );
  }
  if (filters.district) {
    result = result.filter(
      (r) => r.district?.toLowerCase() === filters.district!.toLowerCase()
    );
  }
  if (filters.minRating != null) {
    result = result.filter(
      (r) => r.rating != null && r.rating >= filters.minRating!
    );
  }
  const priceMinCents = filters.priceMin != null ? Math.round(filters.priceMin * 100) : null;
  const priceMaxCents = filters.priceMax != null ? Math.round(filters.priceMax * 100) : null;
  if (priceMinCents != null) {
    result = result.filter(
      (r) => r.priceFrom != null && r.priceFrom >= priceMinCents
    );
  }
  if (priceMaxCents != null) {
    result = result.filter(
      (r) => r.priceFrom != null && r.priceFrom <= priceMaxCents
    );
  }
  if (filters.cancellationPolicy) {
    result = result.filter(
      (r) =>
        r.cancellationPolicy.toLowerCase() ===
        filters.cancellationPolicy!.toLowerCase()
    );
  }

  result.sort((a, b) => {
    switch (sort) {
      case "distance":
        if (a.distanceKm == null && b.distanceKm == null) return 0;
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      case "rating":
        const ra = a.rating ?? 0;
        const rb = b.rating ?? 0;
        return rb - ra;
      case "price_low":
        const pa = a.priceFrom ?? Infinity;
        const pb = b.priceFrom ?? Infinity;
        return pa - pb;
      case "price_high":
        const pha = a.priceFrom ?? -Infinity;
        const phb = b.priceFrom ?? -Infinity;
        return phb - pha;
      case "review_count":
        return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
      default:
        return 0;
    }
  });

  return result;
  } catch (e) {
    console.error("getSearchProviders", e);
    return [];
  }
}
