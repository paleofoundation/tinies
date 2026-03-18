"use client";

import { useEffect, useRef, useMemo } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";

type WalkPoint = { lat: number; lng: number; timestamp: number };

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function totalDistanceKm(route: WalkPoint[]): number {
  let km = 0;
  for (let i = 1; i < route.length; i++) {
    km += haversineKm(route[i - 1].lat, route[i - 1].lng, route[i].lat, route[i].lng);
  }
  return Math.round(km * 1000) / 1000;
}

function RouteAndMarker({
  route,
  currentPosition,
}: {
  route: WalkPoint[];
  currentPosition: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (!map || typeof google === "undefined") return;
    const path = route.map((p) => ({ lat: p.lat, lng: p.lng }));
    if (path.length > 0) {
      const line = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: "#2D6A4F",
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
    if (!map || typeof google === "undefined" || !pos) return;
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
  }, [map, pos?.lat, pos?.lng]);

  return null;
}

export type WalkTrackerProps = {
  route: WalkPoint[];
  currentPosition?: { lat: number; lng: number } | null;
  startedAt: Date | null;
  className?: string;
};

export function WalkTracker({
  route,
  currentPosition = null,
  startedAt,
  className = "",
}: WalkTrackerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const center = useMemo(() => {
    if (route.length > 0) {
      const last = route[route.length - 1];
      return { lat: last.lat, lng: last.lng };
    }
    return { lat: 35.1856, lng: 33.3823 };
  }, [route]);

  const distanceKm = useMemo(() => totalDistanceKm(route), [route]);
  const elapsedMinutes = startedAt
    ? Math.floor((Date.now() - new Date(startedAt).getTime()) / (60 * 1000))
    : 0;

  if (!apiKey) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)] ${className}`}
        style={{ minHeight: "280px" }}
      >
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Map unavailable (missing API key).
        </p>
        <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Distance: {distanceKm.toFixed(2)} km · Time: {elapsedMinutes} min
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="font-medium tabular-nums" style={{ color: "var(--color-text)" }}>
          Distance: {distanceKm.toFixed(2)} km
        </span>
        <span className="font-medium tabular-nums" style={{ color: "var(--color-text)" }}>
          Elapsed: {elapsedMinutes} min
        </span>
      </div>
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
            <RouteAndMarker route={route} currentPosition={currentPosition} />
          </Map>
        </APIProvider>
      </div>
    </div>
  );
}
