"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { BRAND_PRIMARY_HEX } from "@/lib/constants/brand";
import { totalRouteDistanceKm, type WalkRoutePoint } from "@/lib/walk/route-metrics";

type WalkPoint = WalkRoutePoint;
type WalkActivity = { type: string; lat: number; lng: number; timestamp: number };

const ROUTE_STROKE = BRAND_PRIMARY_HEX;

const ACTIVITY_COLORS: Record<string, string> = {
  pee: "#EAB308",
  poo: "#78350f",
  food: "#16a34a",
  water: "#0ea5e9",
};

function RouteAndMarker({
  route,
  currentPosition,
  walkActivities = [],
  showPositionMarker,
}: {
  route: WalkPoint[];
  currentPosition: { lat: number; lng: number } | null;
  walkActivities?: WalkActivity[];
  showPositionMarker: boolean;
}) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const activityMarkersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!map || typeof google === "undefined") return;
    const path = route.map((p) => ({ lat: p.lat, lng: p.lng }));
    if (path.length > 0) {
      const line = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: ROUTE_STROKE,
        strokeOpacity: 0.9,
        strokeWeight: 5,
      });
      line.setMap(map);
      polylineRef.current = line;
    }
    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [map, route]);

  const pos = currentPosition ?? (route.length > 0 ? { lat: route[route.length - 1].lat, lng: route[route.length - 1].lng } : null);

  useEffect(() => {
    if (!map || typeof google === "undefined" || !pos || !showPositionMarker) return;
    const marker = new google.maps.Marker({
      position: pos,
      map,
      title: "Current position",
    });
    markerRef.current = marker;
    return () => {
      marker.setMap(null);
      markerRef.current = null;
    };
  }, [map, pos?.lat, pos?.lng, showPositionMarker]);

  useEffect(() => {
    if (!map || typeof google === "undefined") return;
    activityMarkersRef.current.forEach((m) => m.setMap(null));
    activityMarkersRef.current = [];
    walkActivities.forEach((a) => {
      const marker = new google.maps.Marker({
        position: { lat: a.lat, lng: a.lng },
        map,
        title: a.type,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: ACTIVITY_COLORS[a.type] ?? "#6B7280",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });
      activityMarkersRef.current.push(marker);
    });
    return () => {
      activityMarkersRef.current.forEach((m) => m.setMap(null));
      activityMarkersRef.current = [];
    };
  }, [map, walkActivities]);

  return null;
}

export type WalkTrackerProps = {
  route: WalkPoint[];
  currentPosition?: { lat: number; lng: number } | null;
  startedAt: Date | null;
  /** When set, elapsed time is fixed (walk finished); otherwise it ticks with the clock. */
  endedAt?: Date | null;
  walkActivities?: WalkActivity[];
  activitySummary?: string;
  className?: string;
  /** Provider live walk: show pulse badge and refresh elapsed every second. */
  trackingActive?: boolean;
  /** Live walk / provider: show current GPS pin. Hide for owner completed summary (polyline only). */
  showPositionMarker?: boolean;
};

export function walkActivitySummary(activities: WalkActivity[]): string {
  if (activities.length === 0) return "";
  const counts = { pee: 0, poo: 0, food: 0, water: 0 };
  activities.forEach((a) => {
    if (a.type in counts) (counts as Record<string, number>)[a.type]++;
  });
  const parts: string[] = [];
  if (counts.pee) parts.push(`${counts.pee} pee break${counts.pee > 1 ? "s" : ""}`);
  if (counts.poo) parts.push(`${counts.poo} poo`);
  if (counts.food) parts.push("food provided");
  if (counts.water) parts.push("water provided");
  return parts.length ? `During this walk: ${parts.join(", ")}.` : "";
}

export function WalkTracker({
  route,
  currentPosition = null,
  startedAt,
  endedAt = null,
  walkActivities = [],
  activitySummary: activitySummaryProp,
  className = "",
  trackingActive = false,
  showPositionMarker = true,
}: WalkTrackerProps) {
  const [liveTick, setLiveTick] = useState(0);
  useEffect(() => {
    if (endedAt || !startedAt) return;
    const id = window.setInterval(() => setLiveTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [endedAt, startedAt]);

  const apiKey = typeof process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === "string"
    ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.trim()
    : "";
  const center = useMemo(() => {
    if (route.length > 0) {
      const last = route[route.length - 1];
      return { lat: last.lat, lng: last.lng };
    }
    return { lat: 35.1856, lng: 33.3823 };
  }, [route]);

  const distanceKm = useMemo(() => totalRouteDistanceKm(route), [route]);
  const elapsedMinutes = useMemo(() => {
    if (!startedAt) return 0;
    const startMs = new Date(startedAt).getTime();
    const endMs = endedAt ? new Date(endedAt).getTime() : Date.now();
    return Math.max(0, Math.floor((endMs - startMs) / (60 * 1000)));
    // liveTick keeps elapsed updating while walk is in progress
  }, [startedAt, endedAt, liveTick]);
  const activitySummary = activitySummaryProp ?? walkActivitySummary(walkActivities);

  if (!apiKey) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)] ${className}`}
        style={{ minHeight: "280px" }}
      >
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Map not available.
        </p>
        <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Distance: {distanceKm.toFixed(2)} km · Time: {elapsedMinutes} min
        </p>
        {activitySummary && <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{activitySummary}</p>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {trackingActive && (
        <div
          className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-primary)",
            color: "#fff",
          }}
        >
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ backgroundColor: "#fff" }}
            />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          Tracking active
        </div>
      )}
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="font-medium tabular-nums" style={{ color: "var(--color-text)" }}>
          Distance: {distanceKm.toFixed(2)} km
        </span>
        <span className="font-medium tabular-nums" style={{ color: "var(--color-text)" }}>
          Elapsed: {elapsedMinutes} min
        </span>
      </div>
      {activitySummary && <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{activitySummary}</p>}
      <div
        className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]"
        style={{ minHeight: "280px" }}
      >
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={center}
            defaultZoom={16}
            style={{ width: "100%", height: "100%", minHeight: "280px" }}
            gestureHandling="cooperative"
          >
            <RouteAndMarker
              route={route}
              currentPosition={currentPosition}
              walkActivities={walkActivities}
              showPositionMarker={showPositionMarker}
            />
          </Map>
        </APIProvider>
      </div>
    </div>
  );
}
