"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useMemo, useState } from "react";
import { Search, ChevronDown, Loader2 } from "lucide-react";
import { geocodeSearchLocation } from "@/app/[locale]/services/search/actions";
import { AddressAutocomplete } from "@/components/maps";

type HomeSearchBarProps = {
  /** Larger rounded card layout for the homepage hero (service + location + CTA). */
  variant?: "default" | "hero";
};

export function HomeSearchBar({ variant = "default" }: HomeSearchBarProps) {
  const t = useTranslations("home.search");
  const serviceOptions = useMemo(
    () =>
      [
        { label: t("walking"), value: "walking" },
        { label: t("sitting"), value: "sitting" },
        { label: t("boarding"), value: "boarding" },
        { label: t("dropIn"), value: "drop_in" },
        { label: t("daycare"), value: "daycare" },
      ] as const,
    [t]
  );
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [service, setService] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAddressChange(address: string, latVal?: number, lngVal?: number) {
    setLocation(address);
    setLat(latVal ?? null);
    setLng(lngVal ?? null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const serviceType = service || "walking";
    const params = new URLSearchParams();
    params.set("type", serviceType);

    const trimmed = location.trim();
    if (trimmed) {
      if (lat != null && lng != null) {
        params.set("lat", String(lat));
        params.set("lng", String(lng));
      } else {
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
    }

    router.push(`/services/search?${params.toString()}`);
  }

  const isHero = variant === "hero";

  return (
    <form
      onSubmit={handleSubmit}
      className={
        isHero
          ? "mt-8 flex w-full max-w-3xl flex-col gap-3 rounded-2xl border p-3 shadow-[var(--shadow-lg)] sm:mx-auto sm:flex-row sm:items-stretch sm:gap-0 sm:p-2 sm:shadow-[var(--shadow-md)]"
          : "mt-8 flex flex-col gap-3 sm:mx-auto sm:max-w-2xl sm:flex-row sm:items-stretch sm:justify-center sm:gap-0 sm:overflow-hidden sm:rounded-[var(--radius-lg)] sm:border sm:shadow-[var(--shadow-md)]"
      }
      style={{
        backgroundColor: isHero ? "rgba(255, 255, 255, 0.97)" : "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div
        className={
          isHero
            ? "flex flex-1 flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0"
            : "flex flex-1 flex-col gap-1 sm:flex-row sm:flex-[2] sm:items-stretch"
        }
      >
        {isHero ? (
          <>
            <div className="relative min-w-0 flex-1 sm:max-w-[220px] sm:flex-none">
              <ChevronDown
                className="absolute left-4 top-1/2 z-[1] h-5 w-5 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--color-text-muted)" }}
              />
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full appearance-none rounded-xl border py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 sm:rounded-l-xl sm:rounded-r-none sm:border-r-0"
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
                aria-label={t("serviceAria")}
              >
                <option value="">{t("chooseService")}</option>
                {serviceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative min-w-0 flex-1">
              <AddressAutocomplete
                value={location}
                onChange={handleAddressChange}
                placeholder={t("placeholder")}
                defaultCountry="cy"
                className="rounded-xl border py-3.5 sm:rounded-none sm:border-y-0 sm:border-r-0 sm:border-l sm:border-l-[var(--color-border)]"
              />
            </div>
          </>
        ) : (
          <>
            <div className="relative flex-1">
              <AddressAutocomplete
                value={location}
                onChange={handleAddressChange}
                placeholder={t("placeholder")}
                defaultCountry="cy"
                className="py-3.5 sm:rounded-none sm:rounded-l-[var(--radius-lg)] sm:border-r-0"
              />
            </div>
            <div className="relative flex-1 sm:max-w-[200px]">
              <ChevronDown
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--color-text-muted)" }}
              />
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full appearance-none rounded-[var(--radius-lg)] border py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 sm:rounded-none sm:border-r"
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
                aria-label={t("serviceAria")}
              >
                <option value="">{t("chooseService")}</option>
                {serviceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
      <button
        type="submit"
        disabled={loading}
        className={
          isHero
            ? "inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl px-6 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70 sm:h-auto sm:rounded-r-xl sm:px-8"
            : "inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-pill)] px-6 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70 sm:rounded-none sm:rounded-r-[var(--radius-lg)]"
        }
        style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", backgroundColor: "var(--color-primary)" }}
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
        {t("cta")}
      </button>
      {error && (
        <p className="absolute top-full mt-1 w-full text-center text-sm sm:relative sm:mt-0 sm:col-span-2" style={{ color: "var(--color-error)" }}>
          {error}
        </p>
      )}
    </form>
  );
}
