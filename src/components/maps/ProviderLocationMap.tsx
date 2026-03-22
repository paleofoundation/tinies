"use client";

import { useEffect, useMemo, useRef } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";

const CYPRUS_CENTER = { lat: 35.1856, lng: 33.3823 };
const DEFAULT_ZOOM = 10;

type ServiceAreaCircleProps = {
  center: { lat: number; lng: number };
  radiusKm: number;
};

function ServiceAreaCircle({ center, radiusKm }: ServiceAreaCircleProps) {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map || typeof google === "undefined") return;
    const circle = new google.maps.Circle({
      map,
      center: { lat: center.lat, lng: center.lng },
      radius: radiusKm * 1000,
      strokeColor: "#2D6A4F",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#2D6A4F",
      fillOpacity: 0.15,
    });
    circleRef.current = circle;
    return () => {
      circle.setMap(null);
      circleRef.current = null;
    };
  }, [map, center.lat, center.lng, radiusKm]);

  return null;
}

type ProviderLocationMapProps = {
  lat: number;
  lng: number;
  radiusKm: number;
  className?: string;
};

const MAP_UNAVAILABLE_MESSAGE = "Map not available.";

export function ProviderLocationMap({
  lat,
  lng,
  radiusKm,
  className = "",
}: ProviderLocationMapProps) {
  const apiKey = typeof process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === "string"
    ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.trim()
    : "";
  const center = useMemo(() => ({ lat, lng }), [lat, lng]);
  const safeRadiusKm = Math.max(0.25, Number.isFinite(radiusKm) ? radiusKm : 0.25);
  const defaultZoom = Math.max(9, Math.min(15, 12 - Math.log2(safeRadiusKm)));

  if (!apiKey) {
    return (
      <div
        className={`flex items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)] ${className}`}
        style={{ minHeight: "280px" }}
      >
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {MAP_UNAVAILABLE_MESSAGE}
        </p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] ${className}`} style={{ minHeight: "280px" }}>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={center}
          defaultZoom={defaultZoom}
          style={{ width: "100%", height: "100%", minHeight: "280px" }}
          gestureHandling="cooperative"
        >
          <ServiceAreaCircle center={center} radiusKm={safeRadiusKm} />
        </Map>
      </APIProvider>
    </div>
  );
}
