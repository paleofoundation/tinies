"use client";

import { useCallback, useEffect, useRef, type ComponentProps } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";

const CYPRUS_CENTER = { lat: 35.1856, lng: 33.3823 };
const DEFAULT_ZOOM = 10;
const MIN_RADIUS_KM = 1;
const MAX_RADIUS_KM = 50;

type ServiceAreaCircleProps = {
  center: { lat: number; lng: number } | null;
  radiusKm: number;
};

function ServiceAreaCircle({ center, radiusKm }: ServiceAreaCircleProps) {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map || typeof google === "undefined") return;
    if (!center) {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
      return;
    }
    const circle = new google.maps.Circle({
      map,
      center: { lat: center.lat, lng: center.lng },
      radius: radiusKm * 1000,
      strokeColor: "#2D6A4F",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#2D6A4F",
      fillOpacity: 0.2,
      editable: false,
    });
    circleRef.current = circle;
    return () => {
      circle.setMap(null);
      circleRef.current = null;
    };
  }, [map, center?.lat, center?.lng, radiusKm]);

  return null;
}

export type ServiceAreaValue = {
  lat: number | null;
  lng: number | null;
  radiusKm: number;
};

type ServiceAreaPickerProps = {
  value: ServiceAreaValue;
  onChange: (value: ServiceAreaValue) => void;
  className?: string;
};

export function ServiceAreaPicker({
  value,
  onChange,
  className = "",
}: ServiceAreaPickerProps) {
  const apiKey = typeof process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === "string"
    ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.trim()
    : "";
  const center =
    value.lat != null && value.lng != null
      ? { lat: value.lat, lng: value.lng }
      : null;

  const handleMapClick = useCallback<
    NonNullable<ComponentProps<typeof Map>["onClick"]>
  >(
    (event) => {
      const latLng = event.detail.latLng;
      if (!latLng) return;
      onChange({
        lat: latLng.lat,
        lng: latLng.lng,
        radiusKm: value.radiusKm,
      });
    },
    [onChange, value.radiusKm]
  );

  const handleRadiusChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const km = Math.min(
        MAX_RADIUS_KM,
        Math.max(MIN_RADIUS_KM, Number(e.target.value))
      );
      onChange({
        lat: value.lat,
        lng: value.lng,
        radiusKm: km,
      });
    },
    [onChange, value.lat, value.lng]
  );

  if (!apiKey) {
    return (
      <div
        className={`flex items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)] ${className}`}
        style={{ minHeight: "320px" }}
      >
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Map not available.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]"
        style={{ minHeight: "320px" }}
      >
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={center ?? CYPRUS_CENTER}
            defaultZoom={DEFAULT_ZOOM}
            style={{ width: "100%", height: "100%", minHeight: "320px" }}
            gestureHandling="greedy"
            onClick={handleMapClick}
          >
            <ServiceAreaCircle center={center} radiusKm={value.radiusKm} />
          </Map>
        </APIProvider>
      </div>
      <div>
        <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Service area radius: {value.radiusKm} km
        </label>
        <input
          type="range"
          min={MIN_RADIUS_KM}
          max={MAX_RADIUS_KM}
          value={value.radiusKm}
          onChange={handleRadiusChange}
          className="mt-2 w-full accent-[var(--color-primary)]"
          style={{ accentColor: "var(--color-primary)" }}
        />
        <p className="mt-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
          Click the map to set your service area center. Drag the slider to set how far you&apos;ll travel (1–50 km).
        </p>
      </div>
    </div>
  );
}
