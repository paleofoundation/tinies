"use client";

import { useEffect, useRef, useCallback } from "react";
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";

const inputBaseClass =
  "w-full rounded-[var(--radius-lg)] border py-2.5 pl-4 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40";
const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-body), sans-serif",
  backgroundColor: "var(--color-surface)",
  borderColor: "var(--color-border)",
  color: "var(--color-text)",
};

export type AddressAutocompleteProps = {
  value: string;
  onChange: (address: string, lat?: number, lng?: number) => void;
  placeholder?: string;
  defaultCountry?: string;
  id?: string;
  className?: string;
  /** Optional: match Tinies search bar layout with icon (no border on one side) */
  withIcon?: boolean;
};

function AddressAutocompleteInner({
  value,
  onChange,
  placeholder = "Address or area",
  defaultCountry = "cy",
  id,
  className = "",
  withIcon = false,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary("places");
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!places || !inputRef.current) return;
    const opts: google.maps.places.AutocompleteOptions = {
      types: ["address"],
      fields: ["formatted_address", "geometry"],
    };
    if (defaultCountry && defaultCountry.length === 2) {
      opts.componentRestrictions = { country: [defaultCountry] };
    }
    const autocomplete = new places.Autocomplete(inputRef.current, opts);

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const addr = place.formatted_address ?? "";
      const location = place.geometry?.location;
      const lat = location ? location.lat() : undefined;
      const lng = location ? location.lng() : undefined;
      onChangeRef.current(addr, lat, lng);
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [places, defaultCountry]);

  return (
    <input
      ref={inputRef}
      type="text"
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value, undefined, undefined)}
      placeholder={placeholder}
      autoComplete="off"
      className={
        withIcon
          ? `${inputBaseClass} min-w-0 flex-1 border-0 bg-transparent py-2.5 pr-3 pl-2 focus:ring-0 ${className}`.trim()
          : `${inputBaseClass} ${className}`.trim()
      }
      style={withIcon ? { ...inputStyle, border: "none" } : inputStyle}
      aria-label="Address or area"
    />
  );
}

/** Plain input fallback when Google Maps API key is missing. */
function AddressAutocompleteFallback({
  value,
  onChange,
  placeholder = "Address or area",
  id,
  className = "",
  withIcon = false,
}: AddressAutocompleteProps) {
  return (
    <input
      type="text"
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value, undefined, undefined)}
      placeholder={placeholder}
      className={
        withIcon
          ? `${inputBaseClass} min-w-0 flex-1 border-0 bg-transparent py-2.5 pr-3 pl-2 focus:ring-0 ${className}`.trim()
          : `${inputBaseClass} ${className}`.trim()
      }
      style={withIcon ? { ...inputStyle, border: "none" } : inputStyle}
      aria-label="Address or area"
    />
  );
}

export function AddressAutocomplete(props: AddressAutocompleteProps) {
  const apiKey =
    typeof process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === "string"
      ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.trim()
      : "";

  if (!apiKey) {
    return <AddressAutocompleteFallback {...props} />;
  }

  return (
    <APIProvider apiKey={apiKey} libraries={["places"]}>
      <AddressAutocompleteInner {...props} />
    </APIProvider>
  );
}
