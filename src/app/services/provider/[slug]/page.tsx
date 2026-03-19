import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  Star,
  MapPin,
  Calendar,
  MessageCircle,
  Share2,
  Heart,
} from "lucide-react";
import { getProviderBySlug, getProviderReviewsBySlug } from "@/app/services/book/actions";
import { ProviderLocationMap } from "@/components/maps";
import { HOLIDAY_LABELS } from "@/lib/constants/holidays";
import { GivingTierBadge } from "@/components/giving/GivingTierBadge";
import { MeetAndGreetRequestModal } from "./MeetAndGreetRequestModal";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let provider: Awaited<ReturnType<typeof getProviderBySlug>> = null;
  try {
    provider = await getProviderBySlug(slug);
  } catch (e) {
    console.error("getProviderBySlug (metadata)", e);
  }
  const name = provider?.providerName ?? slugToName(slug);
  const title = `${name} | Pet Care Provider | Tinies`;
  const description = `View ${name}'s profile, services, availability, and reviews. Book trusted pet care in Cyprus.`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";
  const url = `${baseUrl}/services/provider/${slug}`;
  return {
    title,
    description,
    openGraph: { title, description, url, siteName: "Tinies", type: "profile" },
    twitter: { card: "summary_large_image", title, description },
  };
}

function slugToName(slug: string) {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

/** Prices in servicesOffered are stored in cents. */
function formatEur(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  walking: "Dog Walking",
  sitting: "Pet Sitting",
  boarding: "Overnight Boarding",
  drop_in: "Drop-in visit",
  daycare: "Daycare",
};

const AVAILABILITY_GRID = [
  { day: "Mon", morning: true, afternoon: true, evening: true },
  { day: "Tue", morning: true, afternoon: true, evening: false },
  { day: "Wed", morning: false, afternoon: true, evening: true },
  { day: "Thu", morning: true, afternoon: true, evening: true },
  { day: "Fri", morning: true, afternoon: true, evening: false },
  { day: "Sat", morning: true, afternoon: false, evening: false },
  { day: "Sun", morning: false, afternoon: true, evening: true },
] as const;

function formatReviewDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

const GALLERY_COLORS = ["#0A6E5C", "#0A6E5C", "#F45D48", "#0A6E5C", "#0A6E5C", "#F45D48"] as const;

export default async function ProviderProfilePage({ params }: Props) {
  const { slug } = await params;
  let provider: Awaited<ReturnType<typeof getProviderBySlug>> = null;
  let reviews: Awaited<ReturnType<typeof getProviderReviewsBySlug>> = [];
  try {
    [provider, reviews] = await Promise.all([
      getProviderBySlug(slug),
      getProviderReviewsBySlug(slug),
    ]);
  } catch (e) {
    console.error("ProviderProfilePage data fetch", e);
  }
  const name = provider?.providerName ?? slugToName(slug);
  const initials = name
    .split(" ")
    .map((s) => s.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const messageHref = provider
    ? `/dashboard/messages/with/${provider.providerId}`
    : "/dashboard/messages";
  const avgRating = provider?.avgRating ?? null;
  const reviewCount = provider?.reviewCount ?? 0;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";
  const profileUrl = `${baseUrl}/services/provider/${slug}`;
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: name,
    url: profileUrl,
    address: { "@type": "PostalAddress", addressLocality: "Cyprus" },
    ...(avgRating != null &&
      reviewCount > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: avgRating.toFixed(1),
          reviewCount,
          bestRating: 5,
        },
      }),
    ...(provider?.services?.length && {
      priceRange: "€",
    }),
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      {/* Hero */}
      <section className="border-b bg-white" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <div className="mx-auto px-4 py-12 sm:px-6 sm:py-14" style={{ maxWidth: "var(--max-width)" }}>
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full text-3xl font-bold text-white" style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-primary)" }}>
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="font-normal sm:text-3xl" style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}>{name}</h1>
                <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-sm font-medium" style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)", borderColor: "var(--color-primary-200)" }}>
                  <BadgeCheck className="h-4 w-4" />
                  Verified
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm sm:justify-start" style={{ color: "var(--color-text-secondary)" }}>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {avgRating != null ? `${Number(avgRating.toFixed(1))} (${reviewCount} reviews)` : reviewCount > 0 ? `${reviewCount} reviews` : "No reviews yet"}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 shrink-0" />
                  Limassol
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 shrink-0" />
                  Member since 2024
                </span>
                {provider && provider.repeatClientCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4 shrink-0" />
                    {provider.repeatClientCount} repeat client{provider.repeatClientCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {provider && provider.confirmedHolidays.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  {provider.confirmedHolidays.map((id) => (
                    <span key={id} className="rounded-full border px-2.5 py-0.5 text-xs font-medium" style={{ borderColor: "var(--color-primary-200)", backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}>
                      Available for {HOLIDAY_LABELS[id] ?? id}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <Link
                  href={messageHref}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-pill)] px-6 font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", backgroundColor: "var(--color-primary)" }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Message {name}
                </Link>
                <Link
                  href={`/services/book/${slug}`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-pill)] border-2 bg-transparent px-6 font-semibold transition-opacity hover:opacity-90"
                  style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
                >
                  Book Now
                </Link>
                {provider && (
                  <MeetAndGreetRequestModal providerSlug={slug} providerName={name} />
                )}
                <button
                  type="button"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-pill)] border bg-white px-6 font-semibold transition-opacity hover:opacity-90"
                  style={{ fontFamily: "var(--font-body), sans-serif", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto px-4 py-14 sm:px-6 sm:py-16" style={{ maxWidth: "var(--max-width)" }}>
        {/* Bio */}
        <section className="mb-12">
          <h2 className="text-lg font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>About</h2>
          <p className="mt-3 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            {provider?.bio ?? "I've been caring for dogs and cats for over 5 years. I work from home and have a fenced garden, so your pet will have plenty of space and attention. I only take a few bookings at a time so everyone gets the best care. I'm happy to send photo updates and can administer medication if needed."}
          </p>
        </section>

        {/* Home & Environment */}
        {(provider?.homeType || provider?.hasYard != null || provider?.yardFenced != null || provider?.smokingHome != null || provider?.petsInHome || provider?.childrenInHome || provider?.dogsOnFurniture != null || provider?.pottyBreakFrequency) && (
          <section className="mb-12">
            <h2 className="text-lg font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>Home & Environment</h2>
            <div className="mt-4 space-y-3 rounded-[var(--radius-lg)] border p-5" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
              {provider?.homeType && (
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  <span className="font-medium" style={{ color: "var(--color-text)" }}>Home type:</span>{" "}
                  {provider.homeType === "house" ? "House" : provider.homeType === "apartment" ? "Apartment" : provider.homeType}
                </p>
              )}
              {provider?.hasYard != null && (
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  <span className="font-medium" style={{ color: "var(--color-text)" }}>Yard:</span>{" "}
                  {provider.hasYard ? (provider.yardFenced ? "Yes, fenced" : "Yes") : "No"}
                </p>
              )}
              {provider?.smokingHome != null && (
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  <span className="font-medium" style={{ color: "var(--color-text)" }}>Smoking home:</span>{" "}
                  {provider.smokingHome ? "Yes" : "No"}
                </p>
              )}
              {provider?.dogsOnFurniture != null && (
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  <span className="font-medium" style={{ color: "var(--color-text)" }}>Dogs on furniture:</span>{" "}
                  {provider.dogsOnFurniture ? "Yes" : "No"}
                </p>
              )}
              {provider?.petsInHome && (
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  <span className="font-medium" style={{ color: "var(--color-text)" }}>Pets in home:</span>{" "}
                  {provider.petsInHome}
                </p>
              )}
              {provider?.childrenInHome && (
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  <span className="font-medium" style={{ color: "var(--color-text)" }}>Children in home:</span>{" "}
                  {provider.childrenInHome}
                </p>
              )}
              {provider?.pottyBreakFrequency && (
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  <span className="font-medium" style={{ color: "var(--color-text)" }}>Potty breaks:</span>{" "}
                  {provider.pottyBreakFrequency}
                </p>
              )}
            </div>
          </section>
        )}

        {/* A Typical Day */}
        {provider?.typicalDay && (
          <section className="mb-12">
            <h2 className="text-lg font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>A Typical Day</h2>
            <p className="mt-3 leading-relaxed whitespace-pre-wrap" style={{ color: "var(--color-text-secondary)" }}>{provider.typicalDay}</p>
          </section>
        )}

        {/* What I'd Like to Know About Your Pet */}
        {provider?.infoWantedAboutPet && (
          <section className="mb-12">
            <h2 className="text-lg font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>What I&apos;d Like to Know About Your Pet</h2>
            <p className="mt-3 leading-relaxed whitespace-pre-wrap" style={{ color: "var(--color-text-secondary)" }}>{provider.infoWantedAboutPet}</p>
          </section>
        )}

        {/* Services & pricing — from provider.services (prices in cents) */}
        <section className="mb-12">
          <h2 className="text-lg font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>Services & pricing</h2>
          <div className="mt-4 overflow-x-auto rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--color-border)" }}>
            <table className="w-full min-w-[320px] text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--color-text)" }}>Service</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--color-text)" }}>Base price</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--color-text)" }}>Additional pet</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--color-text)" }}>Max pets</th>
                </tr>
              </thead>
              <tbody>
                {provider?.services?.length ? (
                  provider.services.map((s) => (
                    <tr key={s.type} className="border-b" style={{ borderColor: "var(--color-border)" }}>
                      <td className="px-4 py-3" style={{ color: "var(--color-text)" }}>{SERVICE_TYPE_LABELS[s.type] ?? s.type}</td>
                      <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>{formatEur(s.base_price ?? 0)}</td>
                      <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>{formatEur(s.additional_pet_price ?? 0)}</td>
                      <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>{s.max_pets ?? "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b" style={{ borderColor: "var(--color-border)" }}>
                    <td colSpan={4} className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>No services listed.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Availability */}
        <section className="mb-12">
          <h2 className="text-lg font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>Availability</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Typical weekly schedule (read-only)</p>
          <div className="mt-4 overflow-x-auto rounded-[var(--radius-lg)] border bg-white" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
            <table className="w-full min-w-[320px] text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                  <th className="px-3 py-2 text-left font-medium" style={{ color: "var(--color-text-secondary)" }}></th>
                  {AVAILABILITY_GRID.map((r) => (
                    <th key={r.day} className="px-3 py-2 text-center font-medium" style={{ color: "var(--color-text)" }}>{r.day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(["morning", "afternoon", "evening"] as const).map((slot) => (
                  <tr key={slot} className="border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
                    <td className="px-3 py-2 font-medium capitalize" style={{ color: "var(--color-text-secondary)" }}>{slot}</td>
                    {AVAILABILITY_GRID.map((r) => (
                      <td key={r.day} className="px-3 py-2 text-center">
                        <span
                          className={`inline-block h-6 w-6 rounded ${
                            r[slot] ? "" : ""
                          }`}
                          style={r[slot] ? { backgroundColor: "var(--color-primary-200)", color: "var(--color-primary)" } : { backgroundColor: "var(--color-neutral-200)", color: "var(--color-text-muted)" }}
                        >
                          {r[slot] ? "✓" : "—"}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Photo gallery */}
        <section className="mb-12">
          <h2 className="text-lg font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>Photos</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {GALLERY_COLORS.map((color, i) => (
              <div
                key={i}
                className="aspect-square rounded-[14px]"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </section>

        {/* Location / Service area */}
        {provider?.serviceAreaLat != null && provider?.serviceAreaLng != null && provider?.serviceAreaRadiusKm != null && (
          <section className="mb-12">
            <h2 className="text-lg font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>Location</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Approximate service area</p>
            <div className="mt-4">
              <ProviderLocationMap
                lat={provider.serviceAreaLat}
                lng={provider.serviceAreaLng}
                radiusKm={provider.serviceAreaRadiusKm}
                className="min-h-[280px]"
              />
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="mb-12">
          <h2 className="text-lg font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>Reviews</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            {avgRating != null ? ` · ${Number(avgRating.toFixed(1))} average` : ""}
          </p>
          {reviews.length === 0 ? (
            <p className="mt-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>No reviews yet.</p>
          ) : (
            <ul className="mt-6 space-y-6">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="rounded-[var(--radius-lg)] border p-5 shadow-sm"
                  style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium" style={{ color: "var(--color-text)" }}>{review.reviewerName}</span>
                    {review.reviewerGivingTier ? <GivingTierBadge tier={review.reviewerGivingTier} size="sm" /> : null}
                    <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{formatReviewDate(review.createdAt)}</span>
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
                  <p className="mt-2 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{review.text}</p>
                  {review.photos.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {review.photos.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                          <img src={url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                  {review.providerResponse && (
                    <div className="mt-4 rounded-[var(--radius-lg)] border-l-4 pl-4 py-2" style={{ borderColor: "var(--color-primary)", backgroundColor: "var(--color-background)" }}>
                      <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>Response from provider</p>
                      <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>{review.providerResponse}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* CTA */}
        <section className="rounded-[var(--radius-lg)] p-8 text-center text-white" style={{ backgroundColor: "var(--color-primary)" }}>
          <h2 className="text-xl font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "white" }}>Ready to book?</h2>
          <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(255,255,255,0.9)" }}>Send a request and {name} will respond within a few hours.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={messageHref}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-white px-6 font-semibold transition-opacity hover:opacity-90"
              style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", color: "var(--color-primary)" }}
            >
              <MessageCircle className="h-4 w-4" />
              Message {name}
            </Link>
            <Link
              href={`/services/book/${slug}`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-pill)] border-2 border-white/50 bg-transparent px-6 font-semibold text-white transition-opacity hover:opacity-90"
              style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)" }}
            >
              Book Now
            </Link>
            {provider && (
              <MeetAndGreetRequestModal providerSlug={slug} providerName={name} variant="light" />
            )}
          </div>
        </section>

        <p className="mt-8">
          <Link href="/services/search" className="text-sm hover:underline" style={{ color: "var(--color-text-secondary)" }}>
            ← Back to search
          </Link>
        </p>
      </div>
    </div>
  );
}
