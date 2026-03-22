"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import type { SearchProviderCard } from "@/lib/utils/search-helpers";
import { HOLIDAY_LABELS } from "@/lib/constants/holidays";

/** Format price in EUR from cents. */
function formatEur(cents: number): string {
  return `EUR ${(cents / 100).toFixed(2)}`;
}

function getAvailabilityFreshness(updatedAt: string): string {
  const then = new Date(updatedAt);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfThen = new Date(then.getFullYear(), then.getMonth(), then.getDate());
  const daysDiff = Math.floor((startOfToday.getTime() - startOfThen.getTime()) / (24 * 60 * 60 * 1000));
  if (daysDiff === 0) return "Calendar updated today";
  if (daysDiff === 1) return "Updated yesterday";
  return `Updated ${daysDiff} days ago`;
}

const SERVICE_LABELS: Record<string, string> = {
  walking: "Walking",
  sitting: "Sitting",
  boarding: "Boarding",
  drop_in: "Drop-in",
  daycare: "Daycare",
};

function formatServiceLabel(type: string) {
  return SERVICE_LABELS[type] ?? type;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export type ProviderSearchListCardProps = {
  provider: SearchProviderCard;
  highlighted?: boolean;
  listRef?: (el: HTMLLIElement | null) => void;
  favoriteSlot?: React.ReactNode;
  primaryCta?: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
};

export function ProviderSearchListCard({
  provider,
  highlighted = false,
  listRef,
  favoriteSlot,
  primaryCta,
  secondaryCta,
}: ProviderSearchListCardProps) {
  const primary = primaryCta ?? {
    href: `/services/provider/${provider.slug}`,
    label: "View Profile",
  };

  return (
    <li
      ref={listRef}
      className={`relative rounded-[var(--radius-lg)] border p-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] ${highlighted ? "ring-2 ring-[var(--color-primary)]" : ""}`}
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: highlighted ? "var(--color-primary)" : "var(--color-border)",
        boxShadow: "var(--shadow-md)",
        padding: "var(--space-card)",
      }}
    >
      {favoriteSlot ? (
        <div className="absolute right-6 top-6 z-10 sm:right-8 sm:top-8">{favoriteSlot}</div>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:pr-14">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center text-lg font-semibold text-[var(--color-primary)]">
          {provider.avatarUrl ? (
            <Image
              src={provider.avatarUrl}
              alt={provider.name}
              fill
              className="object-cover"
              sizes="64px"
              unoptimized={provider.avatarUrl.includes("supabase")}
            />
          ) : (
            <span>{provider.initials}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
              {provider.name}
            </h2>
            {provider.certificationDots.length > 0 ? (
              <span className="flex items-center gap-1" aria-label="Certifications">
                {provider.certificationDots.map((d) => (
                  <span
                    key={d.slug}
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: d.colorVar }}
                    title={d.label}
                  />
                ))}
              </span>
            ) : null}
            <span className="flex items-center gap-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {provider.rating != null ? Number(provider.rating.toFixed(1)) : "—"}
            </span>
            <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              ({provider.reviewCount} reviews)
              {provider.repeatClientCount > 0 && (
                <>
                  {" "}
                  · {provider.repeatClientCount} repeat client{provider.repeatClientCount !== 1 ? "s" : ""}
                </>
              )}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {provider.district ?? "Cyprus"}
            {provider.distanceKm != null && <span className="ml-1"> · {provider.distanceKm.toFixed(1)} km away</span>}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
            {getAvailabilityFreshness(provider.updatedAt)} · Cancellation: {capitalize(provider.cancellationPolicy)}
          </p>
          {provider.confirmedHolidays.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {provider.confirmedHolidays.map((id) => (
                <span
                  key={id}
                  className="rounded-full border px-2 py-0.5 text-xs font-medium"
                  style={{ borderColor: "var(--color-primary-200)", backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}
                >
                  Available for {HOLIDAY_LABELS[id] ?? id}
                </span>
              ))}
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {provider.services.map((s) => (
              <span
                key={s}
                className="rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: "var(--color-primary-50)",
                  color: "var(--color-primary)",
                  borderColor: "var(--color-primary-200)",
                }}
              >
                {formatServiceLabel(s)}
              </span>
            ))}
          </div>
          {provider.featuredReviewSnippet && (
            <p className="mt-2 text-sm italic" style={{ color: "var(--color-text-secondary)" }}>
              &ldquo;{provider.featuredReviewSnippet}&rdquo;
            </p>
          )}
          {provider.bio && (
            <p className="mt-2 line-clamp-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {provider.bio}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-secondary)" }}>
              {provider.priceFrom != null ? `From ${formatEur(provider.priceFrom)}` : "—"}
            </span>
            <Link
              href={primary.href}
              className="inline-flex h-12 items-center rounded-[var(--radius-pill)] px-6 font-semibold text-white transition-opacity hover:opacity-90"
              style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", backgroundColor: "var(--color-primary)" }}
            >
              {primary.label}
            </Link>
            {secondaryCta ? (
              <Link
                href={secondaryCta.href}
                className="inline-flex h-12 items-center rounded-[var(--radius-pill)] border-2 bg-transparent px-6 font-semibold transition-opacity hover:opacity-90"
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  fontSize: "var(--text-base)",
                  borderColor: "var(--color-primary)",
                  color: "var(--color-primary)",
                }}
              >
                {secondaryCta.label}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}
