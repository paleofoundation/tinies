"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import type { ProviderReviewPublic } from "@/app/[locale]/services/book/booking-action-types";
import { GivingTierBadge } from "@/components/giving/GivingTierBadge";

const BORDER_TEAL_15 = "rgba(10, 128, 128, 0.15)";
const CARD_SHADOW = "0 2px 8px rgba(10, 128, 128, 0.06)";

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

function CoralStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, j) => (
        <Star
          key={j}
          className="h-4 w-4 shrink-0"
          style={{
            color: "var(--color-secondary)",
            fill: j < rating ? "var(--color-secondary)" : "transparent",
            opacity: j < rating ? 1 : 0.35,
          }}
          strokeWidth={1.75}
        />
      ))}
    </div>
  );
}

export function ProviderProfilePageReviews({ reviews, featuredId, avgRating, reviewCount }: Props) {
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

  const summaryRight =
    typeof avgRating === "number" && Number.isFinite(avgRating) ? (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-lg" style={{ color: "#F59E0B" }} aria-hidden>
          ★
        </span>
        <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
          {avgRating.toFixed(1)}
        </span>
        <span className="text-sm" style={{ fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.5)" }}>
          ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
        </span>
      </div>
    ) : (
      <span className="text-sm" style={{ fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.5)" }}>
        {reviewCount > 0 ? `${reviewCount} reviews` : "No ratings yet"}
      </span>
    );

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h2
          className="text-[1.125rem] font-bold"
          style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}
        >
          Reviews
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          {summaryRight}
          {serviceTypes.length > 1 ? (
            <label className="flex items-center gap-2 text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
              <span style={{ color: "rgba(28,28,28,0.5)" }}>Filter:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm"
                style={{
                  borderColor: BORDER_TEAL_15,
                  backgroundColor: "var(--color-background)",
                  color: "var(--color-text)",
                }}
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
      </div>

      {featured && (filter === "all" || featured.serviceType === filter) ? (
        <div
          className="mb-6 rounded-2xl border p-5"
          style={{
            borderColor: BORDER_TEAL_15,
            backgroundColor: "var(--color-primary-50)",
            boxShadow: CARD_SHADOW,
          }}
        >
          <p className="mb-3 text-[0.6875rem] font-bold uppercase tracking-[0.06em]" style={{ color: "var(--color-primary)" }}>
            Featured review
          </p>
          <ReviewBody review={featured} />
        </div>
      ) : null}

      {list.length === 0 && !featured ? (
        <p className="text-sm" style={{ fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.7)" }}>
          No reviews in this category yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {list.map((review) => (
            <li
              key={review.id}
              className="rounded-2xl border p-5"
              style={{
                borderColor: BORDER_TEAL_15,
                backgroundColor: "var(--color-primary-50)",
                boxShadow: CARD_SHADOW,
              }}
            >
              <ReviewBody review={review} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ReviewBody({ review }: { review: ProviderReviewPublic }) {
  return (
    <>
      <CoralStars rating={review.rating} />
      <p
        className="mt-3 text-[0.9375rem] italic leading-[1.7]"
        style={{ fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.7)" }}
      >
        {review.text}
      </p>
      <div
        className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem]"
        style={{ fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.5)" }}
      >
        <span className="font-semibold" style={{ color: "var(--color-text)" }}>
          {review.reviewerName}
        </span>
        {review.reviewerGivingTier ? <GivingTierBadge tier={review.reviewerGivingTier} size="sm" /> : null}
        <span>·</span>
        <span>{SERVICE_TYPE_LABELS[review.serviceType] ?? review.serviceType}</span>
        <span>·</span>
        <span>{formatReviewDate(review.createdAt)}</span>
      </div>
      {Array.isArray(review.photos) && review.photos.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {review.photos.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="relative block h-20 w-20 overflow-hidden rounded-lg">
              <Image src={url} alt="" fill className="object-cover" sizes="80px" />
            </a>
          ))}
        </div>
      ) : null}
      {review.providerResponse ? (
        <div
          className="mt-4 rounded-xl border-l-4 py-2 pl-4"
          style={{ borderColor: "var(--color-primary)", backgroundColor: "var(--color-background)" }}
        >
          <p className="text-sm font-medium" style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
            Response from provider
          </p>
          <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.7)" }}>
            {review.providerResponse}
          </p>
        </div>
      ) : null}
    </>
  );
}
