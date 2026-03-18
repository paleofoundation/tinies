"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ChevronDown, Loader2 } from "lucide-react";
import { geocodeSearchLocation } from "@/app/services/search/actions";

const SERVICE_OPTIONS: { label: string; value: string }[] = [
  { label: "Dog Walking", value: "walking" },
  { label: "Pet Sitting", value: "sitting" },
  { label: "Overnight Boarding", value: "boarding" },
  { label: "Drop-In Visits", value: "drop_in" },
  { label: "Daycare", value: "daycare" },
];

export function HomeSearchBar() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const serviceType = service || "walking";
    const params = new URLSearchParams();
    params.set("type", serviceType);

    const trimmed = location.trim();
    if (trimmed) {
      setLoading(true);
      try {
        const coords = await geocodeSearchLocation(trimmed);
        if (coords) {
          params.set("lat", String(coords.lat));
          params.set("lng", String(coords.lng));
        }
      } finally {
        setLoading(false);
      }
    }

    router.push(`/services/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 flex flex-col gap-3 sm:mx-auto sm:max-w-2xl sm:flex-row sm:items-stretch sm:justify-center sm:gap-0 sm:overflow-hidden sm:rounded-[var(--radius-lg)] sm:border sm:shadow-[var(--shadow-md)]"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:flex-[2] sm:items-stretch">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Address or area"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-[var(--radius-lg)] border py-3.5 pl-4 pr-4 focus:outline-none focus:ring-2 sm:rounded-none sm:rounded-l-[var(--radius-lg)] sm:border-r-0"
            style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
            aria-label="Location"
          />
        </div>
        <div className="relative flex-1 sm:max-w-[200px]">
          <ChevronDown className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 pointer-events-none" style={{ color: "var(--color-text-muted)" }} />
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="w-full appearance-none rounded-[var(--radius-lg)] border py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 sm:rounded-none sm:border-r"
            style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
            aria-label="Service type"
          >
            <option value="">Choose a service</option>
            {SERVICE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-pill)] px-6 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70 sm:rounded-none sm:rounded-r-[var(--radius-lg)]"
        style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", backgroundColor: "var(--color-primary)" }}
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
        Find Care
      </button>
      {error && (
        <p className="absolute top-full mt-1 w-full text-center text-sm sm:relative sm:mt-0 sm:col-span-2" style={{ color: "var(--color-error)" }}>
          {error}
        </p>
      )}
    </form>
  );
}
