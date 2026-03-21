import type { SearchProviderCard } from "@/lib/utils/search-helpers";

const FEATURED_SNIPPET_LENGTH = 80;
const EARTH_RADIUS_KM = 6371;

/** Haversine distance in km between two points. */
export function haversineKm(
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

export type ProfileRowForSearchCard = {
  slug: string;
  userId: string;
  bio: string | null;
  servicesOffered: unknown;
  serviceAreaLat: number | null;
  serviceAreaLng: number | null;
  avgRating: number | null;
  reviewCount: number;
  repeatClientCount: number;
  cancellationPolicy: string;
  updatedAt: Date;
  confirmedHolidays: string[];
  user: { name: string; avatarUrl: string | null; district: string | null };
  reviews: { text: string }[];
};

export function mapProfileToSearchProviderCard(
  p: ProfileRowForSearchCard,
  options: {
    serviceType?: string;
    searchLat?: number | null;
    searchLng?: number | null;
  }
): SearchProviderCard {
  const raw = p.servicesOffered as unknown;
  const services: { type: string; base_price?: number }[] = Array.isArray(raw)
    ? raw.map((s: Record<string, unknown>) => ({
        type: String(s.type ?? ""),
        base_price: Number(s.base_price) ?? 0,
      }))
    : [];
  const selectedType = options.serviceType?.toLowerCase();
  const forService = selectedType
    ? services.find((s) => s.type.toLowerCase() === selectedType)
    : services[0];
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
  const searchLat = options.searchLat;
  const searchLng = options.searchLng;
  const hasLocation =
    searchLat != null &&
    searchLng != null &&
    Number.isFinite(searchLat) &&
    Number.isFinite(searchLng);
  const distanceKm =
    hasLocation && plat != null && plng != null
      ? haversineKm(searchLat!, searchLng!, plat, plng)
      : null;
  return {
    slug: p.slug,
    providerUserId: p.userId,
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
}
