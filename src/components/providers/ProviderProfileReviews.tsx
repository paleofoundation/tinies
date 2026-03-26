"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import type { ProviderReviewPublic } from "@/app/[locale]/services/book/booking-action-types";
import { GivingTierBadge } from "@/components/giving/GivingTierBadge";

const SERVICE_TYPE_LABELS: Record<string, string> = {
  walking: "Dog walking",
  sitting: "Pet sitting",
  boarding: "Boarding",
  drop_in: "Drop-in",
  daycare: "Daycare",
};

type Props = {
  reviews: ProviderReviewPublic[];
  featuredId: string | null;
  avgRating: number | null;
  reviewCount: number;
};

function formatReviewDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export function ProviderProfileReviews({ reviews, featuredId, avgRating, reviewCount }: Props) {
  const [filter, setFilter] = useState<string>("all");

  const serviceTypes = useMemo(() => {
    const s = new Set(reviews.map((r) => r.serviceType));
    return [...s].sort();
  }, [reviews]);

  const filtered = useMemo(() => {
    if (filter === "all") return reviews;
    return reviews.filter((r) => r.serviceType === filter);
  }, [reviews, filter]);

  const featured = featuredId ? reviews.find((r) => r.id === featuredId) : null;
  const list = featured ? filtered.filter((r) => r.id !== featured.id) : filtered;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            {typeof avgRating === "number" && Number.isFinite(avgRating)
              ? `${avgRating.toFixed(1)} stars`
              : "Reviews"}
            {reviewCount > 0 ? ` from ${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}` : ""}
          </p>
        </div>
        {serviceTypes.length > 1 ? (
          <label className="flex items-center gap-2 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
            <span style={{ color: "var(--color-text-muted)" }}>Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-[var(--radius-lg)] border px-3 py-2"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}
            >
              <option value="all">All services</option>
              {serviceTypes.map((t) => (
                <option key={t} value={t}>
                  {SERVICE_TYPE_LABELS[t] ?? t}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {featured && (filter === "all" || featured.serviceType === filter) ? (
        <div
          className="mt-6 rounded-[var(--radius-xl)] border p-6"
          style={{
            borderColor: "var(--color-primary)",
            backgroundColor: "var(--color-primary-muted-06)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-primary)" }}>
            Featured review
          </p>
          <ReviewCard review={featured} />
        </div>
      ) : null}

      {list.length === 0 && !featured ? (
        <p className="mt-6 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          No reviews in this category yet.
        </p>
      ) : (
        <ul className="mt-6 space-y-6">
          {list.map((review) => (
            <li
              key={review.id}
              className="rounded-[var(--radius-lg)] border p-5 shadow-sm"
              style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <ReviewCard review={review} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: ProviderReviewPublic }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
          {review.reviewerName}
        </span>
        {review.reviewerGivingTier ? <GivingTierBadge tier={review.reviewerGivingTier} size="sm" /> : null}
        <span className="rounded-full border px-2 py-0.5 text-xs font-medium" style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>
          {SERVICE_TYPE_LABELS[review.serviceType] ?? review.serviceType}
        </span>
        <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {formatReviewDate(review.createdAt)}
        </span>
        <span className="flex items-center gap-0.5 text-amber-500">
          {Array.from({ length: 5 }).map((_, j) => (
            <Star
              key={j}
              className={`h-4 w-4 ${j < review.rating ? "fill-current" : ""}`}
              style={j >= review.rating ? { color: "var(--color-text-muted)" } : undefined}
            />
          ))}
        </span>
      </div>
      <p className="mt-2 leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
        {review.text}
      </p>
      {Array.isArray(review.photos) && review.photos.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {review.photos.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="relative block h-20 w-20 overflow-hidden rounded-lg">
              <Image src={url} alt="" fill className="object-cover" sizes="80px" />
            </a>
          ))}
        </div>
      )}
      {review.providerResponse ? (
        <div
          className="mt-4 rounded-[var(--radius-lg)] border-l-4 py-2 pl-4"
          style={{ borderColor: "var(--color-primary)", backgroundColor: "var(--color-background)" }}
        >
          <p className="text-sm font-medium" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
            Response from provider
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            {review.providerResponse}
          </p>
        </div>
      ) : null}
    </>
  );
}
