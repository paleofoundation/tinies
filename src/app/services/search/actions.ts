"use server";

import { prisma } from "@/lib/prisma";
import { geocodeAddress } from "@/lib/utils/geocoding";
import type { SearchProviderCard, SearchFilters } from "@/lib/utils/search-helpers";

const FEATURED_SNIPPET_LENGTH = 80;
const EARTH_RADIUS_KM = 6371;

/** Haversine distance in km between two points. */
function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

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

  let result: SearchProviderCard[] = profiles.map((p) => {
    const raw = p.servicesOffered as unknown;
    const services: { type: string; base_price?: number }[] = Array.isArray(raw)
      ? raw.map((s: Record<string, unknown>) => ({
          type: String(s.type ?? ""),
          base_price: Number(s.base_price) ?? 0,
        }))
      : [];
    const selectedType = filters.serviceType?.toLowerCase();
    const forService = selectedType
      ? services.find((s) => s.type.toLowerCase() === selectedType)
      : services[0];
    /** base_price in DB is stored in cents (1200 = EUR 12.00). */
    const priceFromCents =
      forService?.base_price != null ? forService.base_price : null;
    const featuredText = p.reviews[0]?.text;
    const snippet =
      featuredText != null && featuredText.length > 0
        ? featuredText.length <= FEATURED_SNIPPET_LENGTH
          ? featuredText
          : featuredText.slice(0, FEATURED_SNIPPET_LENGTH).trim() + "…"
        : null;
    const initials = p.user.name
      .split(" ")
      .map((s) => s.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const plat = p.serviceAreaLat ?? null;
    const plng = p.serviceAreaLng ?? null;
    const distanceKm =
      hasLocation && plat != null && plng != null
        ? haversineKm(searchLat!, searchLng!, plat, plng)
        : null;
    return {
      slug: p.slug,
      name: p.user.name,
      avatarUrl: p.user.avatarUrl,
      initials,
      rating: p.avgRating,
      reviewCount: p.reviewCount,
      repeatClientCount: p.repeatClientCount,
      district: p.user.district,
      services: services.map((s) => s.type).filter(Boolean),
      priceFrom: priceFromCents,
      bio: p.bio,
      featuredReviewSnippet: snippet,
      lat: plat,
      lng: plng,
      distanceKm,
      cancellationPolicy: p.cancellationPolicy,
      updatedAt: p.updatedAt.toISOString(),
      confirmedHolidays: p.confirmedHolidays,
    };
  });

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
