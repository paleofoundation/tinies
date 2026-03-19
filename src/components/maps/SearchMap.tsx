"use client";

import { useCallback, useMemo } from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

const CYPRUS_CENTER = { lat: 35.1856, lng: 33.3823 };
const DEFAULT_ZOOM = 10;

export type ProviderMapPin = {
  slug: string;
  lat: number;
  lng: number;
};

type SearchMapProps = {
  providers: ProviderMapPin[];
  highlightedSlug: string | null;
  onMarkerClick: (slug: string) => void;
  className?: string;
};

const MAP_UNAVAILABLE_MESSAGE = "Map not available.";

export function SearchMap({
  providers,
  highlightedSlug,
  onMarkerClick,
  className = "",
}: SearchMapProps) {
  const apiKey = typeof process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === "string"
    ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.trim()
    : "";
  const providersWithCoords = useMemo(
    () => providers.filter((p) => p.lat != null && p.lng != null) as { slug: string; lat: number; lng: number }[],
    [providers]
  );

  if (!apiKey) {
    return (
      <div
        className={`flex items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)] ${className}`}
        style={{ minHeight: "400px" }}
      >
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {MAP_UNAVAILABLE_MESSAGE}
        </p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] ${className}`} style={{ minHeight: "400px" }}>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={CYPRUS_CENTER}
          defaultZoom={DEFAULT_ZOOM}
          style={{ width: "100%", height: "100%", minHeight: "400px" }}
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          {providersWithCoords.map((p, index) => (
            <Marker
              key={p.slug}
              position={{ lat: p.lat, lng: p.lng }}
              title={p.slug}
              label={String(index + 1)}
              onClick={() => onMarkerClick(p.slug)}
              zIndex={highlightedSlug === p.slug ? 1 : 0}
            />
          ))}
        </Map>
      </APIProvider>
    </div>
  );
}
