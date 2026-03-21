"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapPin, List, Map, Star, Loader2 } from "lucide-react";
import { SearchMap, AddressAutocomplete } from "@/components/maps";
import { geocodeSearchLocation } from "./actions";
import type { SearchProviderCard, SortOption } from "@/lib/utils/search-helpers";
import { HOLIDAY_LABELS, HOLIDAY_IDS } from "@/lib/constants/holidays";
import { ProviderSearchListCard } from "@/components/providers/ProviderSearchListCard";
import { ProviderFavoriteButton } from "@/components/providers/ProviderFavoriteButton";
import type { FavoriteViewerKind } from "@/lib/providers/favorite-actions-types";

const SERVICE_TYPES = [
  { value: "", label: "All services" },
  { value: "walking", label: "Dog Walking" },
  { value: "sitting", label: "Pet Sitting" },
  { value: "boarding", label: "Overnight Boarding" },
  { value: "drop_in", label: "Drop-In Visits" },
  { value: "daycare", label: "Daycare" },
] as const;

const DISTRICTS = [
  "All districts",
  "Nicosia",
  "Limassol",
  "Larnaca",
  "Paphos",
  "Famagusta",
] as const;

const CANCELLATION_OPTIONS = [
  { value: "", label: "Any policy" },
  { value: "flexible", label: "Flexible" },
  { value: "moderate", label: "Moderate" },
  { value: "strict", label: "Strict" },
] as const;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "distance", label: "Nearest" },
  { value: "rating", label: "Highest Rated" },
  { value: "price_low", label: "Lowest Price" },
  { value: "price_high", label: "Highest Price" },
  { value: "review_count", label: "Most Reviews" },
];

const SERVICE_LABELS: Record<string, string> = {
  walking: "Walking",
  sitting: "Sitting",
  boarding: "Boarding",
  drop_in: "Drop-in",
  daycare: "Daycare",
};

function getServiceLabel(type: string) {
  return SERVICE_TYPES.find((t) => t.value === type)?.label ?? "Search results";
}

function formatServiceLabel(type: string) {
  return SERVICE_LABELS[type] ?? type;
}

/** Format price in EUR from cents. */
function formatEur(cents: number): string {
  return `EUR ${(cents / 100).toFixed(2)}`;
}

/** e.g. "Calendar updated today" or "Updated 3 days ago". */
export function SearchContent({
  initialProviders,
  initialServiceType = "",
  initialDistrict = "",
  initialPriceMin = "",
  initialPriceMax = "",
  initialMinRating = null,
  initialLat = null,
  initialLng = null,
  initialSort = undefined,
  initialCancellationPolicy = undefined,
  initialHomeType = undefined,
  initialHasYard = undefined,
  initialHoliday = undefined,
  favoriteViewerKind = "guest",
  favoritedProviderUserIds = [],
}: {
  initialProviders: SearchProviderCard[];
  initialServiceType?: string;
  initialDistrict?: string;
  initialPriceMin?: string;
  initialPriceMax?: string;
  initialMinRating?: number | null;
  initialLat?: number | null;
  initialLng?: number | null;
  initialSort?: SortOption;
  initialCancellationPolicy?: string;
  initialHomeType?: string;
  initialHasYard?: boolean;
  initialHoliday?: string;
  favoriteViewerKind?: FavoriteViewerKind;
  favoritedProviderUserIds?: string[];
}) {
  const favoritedSet = useMemo(
    () => new Set(favoritedProviderUserIds),
    [favoritedProviderUserIds]
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serviceType, setServiceType] = useState(initialServiceType);
  const [district, setDistrict] = useState(initialDistrict);
  const [priceMin, setPriceMin] = useState(initialPriceMin);
  const [priceMax, setPriceMax] = useState(initialPriceMax);
  const [minRating, setMinRating] = useState<number | null>(initialMinRating ?? null);
  const [cancellationPolicy, setCancellationPolicy] = useState(initialCancellationPolicy ?? "");
  const [homeType, setHomeType] = useState(initialHomeType ?? "");
  const [hasYard, setHasYard] = useState(initialHasYard ?? false);
  const [holiday, setHoliday] = useState(initialHoliday ?? "");
  const [sort, setSort] = useState<SortOption>(initialSort ?? (initialLat != null && initialLng != null ? "distance" : "rating"));
  const [locationQuery, setLocationQuery] = useState("");
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "map">("list");
  const [highlightedSlug, setHighlightedSlug] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLLIElement | null>>({});

  useEffect(() => {
    setServiceType(searchParams.get("type") ?? "");
    setDistrict(searchParams.get("district") ?? "");
    setPriceMin(searchParams.get("priceMin") ?? "");
    setPriceMax(searchParams.get("priceMax") ?? "");
    const r = searchParams.get("minRating");
    const num = r ? parseInt(r, 10) : NaN;
    setMinRating(Number.isFinite(num) ? num : null);
    setCancellationPolicy(searchParams.get("cancellationPolicy") ?? "");
    setHomeType(searchParams.get("homeType") ?? "");
    setHasYard(searchParams.get("hasYard") === "true");
    setHoliday(searchParams.get("holiday") ?? "");
    const s = searchParams.get("sort");
    setSort((s as SortOption) || (searchParams.get("lat") && searchParams.get("lng") ? "distance" : "rating"));
  }, [searchParams]);

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (serviceType) params.set("type", serviceType);
    if (district) params.set("district", district);
    if (priceMin) params.set("priceMin", priceMin);
    if (priceMax) params.set("priceMax", priceMax);
    if (minRating != null) params.set("minRating", String(minRating));
    if (cancellationPolicy) params.set("cancellationPolicy", cancellationPolicy);
    if (homeType) params.set("homeType", homeType);
    if (hasYard) params.set("hasYard", "true");
    if (holiday) params.set("holiday", holiday);
    if (sort) params.set("sort", sort);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    if (lat) params.set("lat", lat);
    if (lng) params.set("lng", lng);
    const q = params.toString();
    return q ? `/services/search?${q}` : "/services/search";
  }, [serviceType, district, priceMin, priceMax, minRating, cancellationPolicy, homeType, hasYard, holiday, sort, searchParams]);

  const applyFilters = useCallback(() => {
    router.push(buildUrl());
  }, [router, buildUrl]);

  const handleLocationSubmit = useCallback(async () => {
    const q = locationQuery.trim();
    if (!q) return;
    setGeocodeError(null);
    setGeocodeLoading(true);
    try {
      const coords = await geocodeSearchLocation(q);
      if (coords) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("lat", String(coords.lat));
        params.set("lng", String(coords.lng));
        router.push(`/services/search?${params}`);
      } else {
        setGeocodeError("Address not found. Try a different search.");
      }
    } finally {
      setGeocodeLoading(false);
    }
  }, [locationQuery, searchParams, router]);

  const handleAddressSelect = useCallback(
    (address: string, latVal?: number, lngVal?: number) => {
      setLocationQuery(address);
      setGeocodeError(null);
      if (latVal != null && lngVal != null) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("lat", String(latVal));
        params.set("lng", String(lngVal));
        router.push(`/services/search?${params}`);
      }
    },
    [searchParams, router]
  );

  const setSortAndNavigate = useCallback(
    (newSort: SortOption) => {
      setSort(newSort);
      const params = new URLSearchParams(searchParams.toString());
      params.set("sort", newSort);
      router.push(`/services/search?${params}`);
    },
    [searchParams, router]
  );

  const pageTitle = useMemo(() => getServiceLabel(serviceType), [serviceType]);

  const pricingContext = useMemo(() => {
    if (initialProviders.length === 0) return null;
    const districtLabel = district || "this area";
    const serviceLabel = serviceType ? formatServiceLabel(serviceType).toLowerCase() : "this service";
    const prices = initialProviders
      .map((p) => p.priceFrom)
      .filter((c): c is number => c != null);
    if (prices.length === 0) return null;
    const minCents = Math.min(...prices);
    const maxCents = Math.max(...prices);
    return `Providers in ${districtLabel} typically charge ${formatEur(minCents)}–${formatEur(maxCents)} for ${serviceLabel}.`;
  }, [initialProviders, district, serviceType]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <div className="mx-auto px-4 py-20 sm:px-6 lg:px-8" style={{ maxWidth: "var(--max-width)" }}>
        <h1
          className="font-normal sm:text-3xl"
          style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
        >
          {pageTitle}
        </h1>
        <p className="mt-2" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          Verified providers in Cyprus
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="search-location" className="block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
              Location
            </label>
            <div className="mt-1 flex rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
              <MapPin className="ml-3 h-5 w-5 shrink-0 self-center" style={{ color: "var(--color-text-muted)" }} />
              <AddressAutocomplete
                id="search-location"
                value={locationQuery}
                onChange={handleAddressSelect}
                placeholder="Address or area"
                defaultCountry="cy"
                withIcon
              />
            </div>
            {geocodeError && (
              <p className="mt-1 text-sm" style={{ color: "var(--color-error)" }}>{geocodeError}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleLocationSubmit}
            disabled={geocodeLoading || !locationQuery.trim()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-lg)] px-5 font-semibold text-white disabled:opacity-50 sm:shrink-0"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {geocodeLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Search by location"}
          </button>
        </div>

        <div className="mt-10 flex flex-col gap-10 lg:flex-row">
          <aside className="lg:w-56 lg:shrink-0">
            <div
              className="rounded-[var(--radius-lg)] border p-8"
              style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)", padding: "var(--space-card)" }}
            >
              <h2 className="font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                Filters
              </h2>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                    Service type
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    onBlur={applyFilters}
                    className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                    style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                  >
                    {SERVICE_TYPES.map((t) => (
                      <option key={t.value || "all"} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                    District
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    onBlur={applyFilters}
                    className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                    style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d === "All districts" ? "" : d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                      Min €
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      onBlur={applyFilters}
                      className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                      style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                      Max €
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="100"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      onBlur={applyFilters}
                      className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                      style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    Minimum rating
                  </label>
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          const next = minRating === star ? null : star;
                          setMinRating(next);
                          const params = new URLSearchParams(searchParams.toString());
                          if (next != null) params.set("minRating", String(next));
                          else params.delete("minRating");
                          router.push(params.toString() ? `/services/search?${params}` : "/services/search");
                        }}
                        className={`rounded p-1 transition-colors ${minRating !== null && star <= minRating ? "text-amber-500" : "hover:text-amber-500/70"}`}
                        style={minRating === null || star > minRating ? { color: "var(--color-text-muted)" } : undefined}
                        aria-label={`${star} stars minimum`}
                      >
                        <Star className="h-5 w-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                    Cancellation policy
                  </label>
                  <select
                    value={cancellationPolicy}
                    onChange={(e) => setCancellationPolicy(e.target.value)}
                    onBlur={applyFilters}
                    className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                    style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                  >
                    {CANCELLATION_OPTIONS.map((o) => (
                      <option key={o.value || "any"} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                    Home type
                  </label>
                  <select
                    value={homeType}
                    onChange={(e) => setHomeType(e.target.value)}
                    onBlur={applyFilters}
                    className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                    style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                  >
                    <option value="">Any</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                  </select>
                </div>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hasYard}
                    onChange={(e) => {
                      setHasYard(e.target.checked);
                      const params = new URLSearchParams(searchParams.toString());
                      if (e.target.checked) params.set("hasYard", "true");
                      else params.delete("hasYard");
                      router.push(params.toString() ? `/services/search?${params}` : "/services/search");
                    }}
                    className="h-4 w-4 rounded border-[var(--color-primary)]/30 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <span className="text-sm" style={{ color: "var(--color-text)" }}>Has yard (e.g. fenced)</span>
                </label>
                <div>
                  <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                    Holiday availability
                  </label>
                  <select
                    value={holiday}
                    onChange={(e) => setHoliday(e.target.value)}
                    onBlur={applyFilters}
                    className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                    style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                  >
                    <option value="">Any</option>
                    {HOLIDAY_IDS.map((id) => (
                      <option key={id} value={id}>Available for {HOLIDAY_LABELS[id]}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={applyFilters}
                  className="w-full rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                >
                  Apply filters
                </button>
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1 flex flex-col lg:flex-row lg:gap-6">
            <div className="min-w-0 flex-1">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                  {initialProviders.length} providers
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="sr-only" htmlFor="search-sort">Sort by</label>
                  <select
                    id="search-sort"
                    value={sort}
                    onChange={(e) => setSortAndNavigate(e.target.value as SortOption)}
                    className="rounded-[var(--radius-lg)] border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                <div className="flex rounded-[var(--radius-pill)] border p-0.5" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    className={`flex items-center gap-2 rounded-[var(--radius-pill)] px-4 py-2 text-sm font-semibold transition-colors ${view === "list" ? "text-white" : "hover:bg-[var(--color-primary-50)]"}`}
                    style={{
                      fontFamily: "var(--font-body), sans-serif",
                      ...(view === "list" ? { backgroundColor: "var(--color-primary)" } : { color: "var(--color-text-secondary)" }),
                    }}
                  >
                    <List className="h-4 w-4" />
                    List
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("map")}
                    className={`flex items-center gap-2 rounded-[var(--radius-pill)] px-4 py-2 text-sm font-semibold transition-colors ${view === "map" ? "text-white" : "hover:bg-[var(--color-primary-50)]"}`}
                    style={{
                      fontFamily: "var(--font-body), sans-serif",
                      ...(view === "map" ? { backgroundColor: "var(--color-primary)" } : { color: "var(--color-text-secondary)" }),
                    }}
                  >
                    <Map className="h-4 w-4" />
                    Map
                  </button>
                </div>
                </div>
              </div>

              <ul className={`space-y-6 lg:pr-0 ${view === "list" ? "block" : "hidden lg:block"}`}>
                {initialProviders.map((provider) => (
                  <ProviderSearchListCard
                    key={provider.slug}
                    provider={provider}
                    highlighted={highlightedSlug === provider.slug}
                    listRef={(el) => {
                      cardRefs.current[provider.slug] = el;
                    }}
                    favoriteSlot={
                      favoriteViewerKind === "authenticated_non_owner" ? undefined : (
                        <ProviderFavoriteButton
                          providerUserId={provider.providerUserId}
                          initialFavorited={favoritedSet.has(provider.providerUserId)}
                          viewerKind={favoriteViewerKind}
                        />
                      )
                    }
                  />
                ))}
              </ul>

              {pricingContext && (
                <p className="mt-6 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                  {pricingContext}
                </p>
              )}

              {view === "map" && (
                <div className="mt-4 block lg:hidden">
                  <SearchMap
                    providers={initialProviders.filter((p) => p.lat != null && p.lng != null).map((p) => ({ slug: p.slug, lat: p.lat!, lng: p.lng! }))}
                    highlightedSlug={highlightedSlug}
                    onMarkerClick={(slug) => {
                      setHighlightedSlug(slug);
                      cardRefs.current[slug]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                    }}
                    className="min-h-[400px]"
                  />
                </div>
              )}
            </div>

            <div className="hidden lg:block lg:w-[420px] lg:shrink-0 lg:self-start lg:sticky lg:top-24">
              <SearchMap
                providers={initialProviders.filter((p) => p.lat != null && p.lng != null).map((p) => ({ slug: p.slug, lat: p.lat!, lng: p.lng! }))}
                highlightedSlug={highlightedSlug}
                onMarkerClick={(slug) => {
                  setHighlightedSlug(slug);
                  cardRefs.current[slug]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }}
                className="min-h-[400px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
