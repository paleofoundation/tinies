import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  BadgeCheck,
  Calendar,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
} from "lucide-react";
import { getProviderBySlug, getProviderReviewsBySlug } from "@/app/[locale]/services/book/actions";
import type { ProviderReviewPublic } from "@/app/[locale]/services/book/booking-action-types";
import { ProviderLocationMap } from "@/components/maps";
import { HOLIDAY_LABELS } from "@/lib/constants/holidays";
import { resolveListingVideoUrl } from "@/lib/adoption/listing-video";
import { getFavoriteViewerState } from "@/lib/providers/favorite-actions";
import { ProviderFavoriteButton } from "@/components/providers/ProviderFavoriteButton";
import { ProviderProfileShareRow } from "@/components/providers/ProviderProfileShareRow";
import { ProviderProfileReviews } from "@/components/providers/ProviderProfileReviews";
import { ProviderCertificationsSection } from "@/components/providers/ProviderCertificationsSection";
import { ProviderVideoIntro } from "@/components/providers/ProviderVideoIntro";
import { MeetAndGreetRequestModal } from "./MeetAndGreetRequestModal";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function slugToName(slug: string) {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

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

const PRICE_UNIT_LABELS: Record<string, string> = {
  per_walk: "per walk",
  per_hour: "per hour",
  per_day: "per day",
  per_visit: "per visit",
  per_night: "per night",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const SLOTS = ["Morning", "Afternoon", "Evening"] as const;

function buildAvailabilityGrid(av: Record<string, boolean> | null) {
  return DAYS.map((day) => ({
    day,
    morning: av?.[`${day}-Morning`] ?? false,
    afternoon: av?.[`${day}-Afternoon`] ?? false,
    evening: av?.[`${day}-Evening`] ?? false,
  }));
}

function responseTimeLabel(minutes: number | null): string | null {
  if (minutes == null) return null;
  if (minutes < 60) return `Usually responds within ${minutes} minutes`;
  const h = Math.round(minutes / 60);
  return `Usually responds within ${h} hour${h === 1 ? "" : "s"}`;
}

function repeatClientLine(rate: number | null): string | null {
  if (rate == null) return null;
  return `${Math.round(rate)}% of clients book again`;
}

function responseRateLabel(rr: number | null): string | null {
  if (rr == null) return null;
  const pct = rr <= 1 ? Math.round(rr * 100) : Math.round(rr);
  return `${pct}% response rate`;
}

function pickFeaturedReviewId(reviews: ProviderReviewPublic[]): string | null {
  if (reviews.length === 0) return null;
  let best = reviews[0];
  let bestScore = -1;
  for (const r of reviews) {
    const score = r.rating * 1000 + Math.min(r.text.length, 800);
    if (score > bestScore) {
      bestScore = score;
      best = r;
    }
  }
  return best.id;
}

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
  const description =
    provider?.headline?.trim() ||
    provider?.bio?.slice(0, 155) ||
    `View ${name}'s profile, services, availability, and reviews. Book trusted pet care in Cyprus.`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";
  const url = `${baseUrl}/services/provider/${slug}`;
  const og = provider?.avatarUrl ?? provider?.photos[0];
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Tinies",
      type: "profile",
      images: og ? [{ url: og }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProviderProfilePage({ params }: Props) {
  const { slug } = await params;
  let provider: Awaited<ReturnType<typeof getProviderBySlug>> = null;
  let reviews: ProviderReviewPublic[] = [];
  try {
    [provider, reviews] = await Promise.all([getProviderBySlug(slug), getProviderReviewsBySlug(slug)]);
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
  const messageHref = provider ? `/dashboard/messages/with/${provider.providerId}` : "/dashboard/messages";

  const favoriteViewer = await getFavoriteViewerState();
  const favorited =
    provider != null &&
    favoriteViewer.kind === "owner" &&
    favoriteViewer.favoritedProviderUserIds.includes(provider.providerId);
  const avgRating = provider?.avgRating ?? null;
  const reviewCount = provider?.reviewCount ?? 0;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";
  const profileUrl = `${baseUrl}/services/provider/${slug}`;
  const heroImage = provider?.avatarUrl ?? provider?.photos[0] ?? null;
  const districtLabel = provider?.district?.trim() || "Cyprus";
  const availabilityGrid = buildAvailabilityGrid(provider?.availability ?? null);
  const videoResolved = provider?.videoIntroUrl ? resolveListingVideoUrl(provider.videoIntroUrl) : null;
  const featuredReviewId = pickFeaturedReviewId(reviews);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    description: provider?.headline ?? provider?.bio ?? undefined,
    url: profileUrl,
    image: [heroImage, ...(provider?.photos ?? []), ...(provider?.homePhotos ?? [])].filter(Boolean),
    address: { "@type": "PostalAddress", addressLocality: districtLabel, addressCountry: "CY" },
    ...(avgRating != null &&
      reviewCount > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: avgRating.toFixed(1),
          reviewCount,
          bestRating: 5,
        },
      }),
    ...(provider?.languages?.length ? { knowsLanguage: provider.languages } : {}),
    makesOffer:
      provider?.services?.map((s) => ({
        "@type": "Offer",
        name: SERVICE_TYPE_LABELS[s.type] ?? s.type,
        price: (s.base_price / 100).toFixed(2),
        priceCurrency: "EUR",
        description: `${PRICE_UNIT_LABELS[s.price_unit] ?? s.price_unit}; +${formatEur(s.additional_pet_price)} per extra pet`,
      })) ?? [],
  };

  const respTime = responseTimeLabel(provider?.responseTimeMinutes ?? null);
  const repeatLine = repeatClientLine(provider?.repeatClientRate ?? null);
  const rrLabel = responseRateLabel(provider?.responseRate ?? null);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="border-b" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <div className="mx-auto px-4 py-10 sm:px-6 sm:py-12" style={{ maxWidth: "var(--max-width)" }}>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
            <div
              className="relative mx-auto aspect-square w-full max-w-[280px] shrink-0 overflow-hidden rounded-[var(--radius-xl)] border shadow-md sm:max-w-[320px]"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}
            >
              {heroImage ? (
                <Image src={heroImage} alt="" fill className="object-cover" sizes="320px" priority />
              ) : (
                <div
                  className="flex h-full min-h-[240px] w-full items-center justify-center text-5xl font-bold text-white"
                  style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-primary)" }}
                  aria-hidden
                >
                  {initials}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 text-center lg:text-left">
              <h1
                className="font-normal tracking-tight sm:text-4xl"
                style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
              >
                {name}
              </h1>
              {provider?.headline?.trim() ? (
                <p className="mt-2 text-lg" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                  {provider.headline.trim()}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                {provider?.verified ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-sm font-medium"
                    style={{
                      fontFamily: "var(--font-body), sans-serif",
                      borderColor: "var(--color-border)",
                      backgroundColor: "var(--color-primary-50)",
                      color: "var(--color-primary)",
                    }}
                  >
                    <BadgeCheck className="h-4 w-4" aria-hidden />
                    Verified identity
                  </span>
                ) : null}
                {provider?.backgroundCheckPassed ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-sm font-medium"
                    style={{
                      fontFamily: "var(--font-body), sans-serif",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text)",
                    }}
                  >
                    <ShieldCheck className="h-4 w-4" style={{ color: "var(--color-primary)" }} aria-hidden />
                    Background check
                  </span>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm lg:justify-start" style={{ color: "var(--color-text-secondary)" }}>
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" aria-hidden />
                  {avgRating != null ? `${Number(avgRating.toFixed(1))} (${reviewCount} reviews)` : reviewCount > 0 ? `${reviewCount} reviews` : "No reviews yet"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                  {districtLabel}
                  {provider?.serviceAreaRadiusKm != null ? ` · ~${provider.serviceAreaRadiusKm} km radius` : ""}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-4 w-4 shrink-0" aria-hidden />
                  Member since {new Date(provider?.memberSince ?? Date.now()).getFullYear()}
                </span>
              </div>

              {provider?.languages && provider.languages.length > 0 ? (
                <div className="mt-3 flex flex-wrap justify-center gap-2 lg:justify-start">
                  {provider.languages.map((lang) => (
                    <span
                      key={lang}
                      className="rounded-[var(--radius-pill)] border px-3 py-1 text-xs font-medium"
                      style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              ) : null}

              {(respTime || repeatLine) && (
                <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm lg:justify-start" style={{ color: "var(--color-text-muted)" }}>
                  {respTime ? (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-4 w-4 shrink-0" aria-hidden />
                      {respTime}
                    </span>
                  ) : null}
                  {repeatLine ? (
                    <span className="inline-flex items-center gap-1">
                      <Heart className="h-4 w-4 shrink-0" aria-hidden />
                      {repeatLine}
                    </span>
                  ) : null}
                </div>
              )}

              {provider && provider.confirmedHolidays.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
                  {provider.confirmedHolidays.map((id) => (
                    <span
                      key={id}
                      className="rounded-full border px-2.5 py-0.5 text-xs font-medium"
                      style={{ borderColor: "var(--color-primary-200)", backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}
                    >
                      Available for {HOLIDAY_LABELS[id] ?? id}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Link
                  href={`/services/book/${slug}`}
                  className="inline-flex h-12 items-center justify-center rounded-[var(--radius-pill)] px-8 font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", backgroundColor: "var(--color-secondary)" }}
                >
                  Book Now
                </Link>
                {provider ? <MeetAndGreetRequestModal providerSlug={slug} providerName={name} /> : null}
                <Link
                  href={messageHref}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-pill)] border-2 px-6 font-semibold transition-opacity hover:opacity-90"
                  style={{
                    fontFamily: "var(--font-body), sans-serif",
                    fontSize: "var(--text-base)",
                    borderColor: "var(--color-primary)",
                    color: "var(--color-primary)",
                  }}
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  Message
                </Link>
                {provider ? (
                  <Suspense fallback={null}>
                    <ProviderFavoriteButton
                      providerUserId={provider.providerId}
                      initialFavorited={favorited}
                      viewerKind={favoriteViewer.kind}
                      loginReturnPath={`/services/provider/${slug}`}
                      size="lg"
                    />
                  </Suspense>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto px-4 py-12 sm:px-6 sm:py-16" style={{ maxWidth: "var(--max-width)" }}>
        <div className="grid gap-12 lg:grid-cols-[1fr_minmax(260px,300px)] lg:items-start lg:gap-14">
          <div className="min-w-0 space-y-14">
            {videoResolved && provider ? <ProviderVideoIntro providerName={name} video={videoResolved} /> : null}

            {provider?.whyIDoThis?.trim() ? (
              <section aria-labelledby="why-heading">
                <h2
                  id="why-heading"
                  className="font-normal"
                  style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
                >
                  Why I do this
                </h2>
                <div
                  className="mt-4 rounded-[var(--radius-xl)] border p-6 sm:p-8"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "rgba(244, 93, 72, 0.06)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <p className="whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                    {provider.whyIDoThis.trim()}
                  </p>
                </div>
              </section>
            ) : null}

            <section aria-labelledby="exp-heading">
              <h2
                id="exp-heading"
                className="font-normal"
                style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
              >
                Experience &amp; qualifications
              </h2>
              {provider?.experienceTags && provider.experienceTags.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {provider.experienceTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-[var(--radius-pill)] px-3 py-1 text-sm font-medium capitalize"
                      style={{ backgroundColor: "rgba(10, 128, 128, 0.12)", color: "var(--color-primary)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              {provider?.qualifications && provider.qualifications.length > 0 ? (
                <ul className="mt-6 space-y-3">
                  {provider.qualifications.map((q, i) => (
                    <li
                      key={`${q.title}-${i}`}
                      className="rounded-[var(--radius-lg)] border p-4"
                      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
                    >
                      <p className="font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                        {q.title}
                      </p>
                      <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        {[q.issuer, q.year].filter(Boolean).join(" · ")}
                        {q.description ? ` — ${q.description}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : null}

              {provider?.previousExperience?.trim() ? (
                <p className="mt-6 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                  {provider.previousExperience.trim()}
                </p>
              ) : null}

              {provider && (provider.acceptedBreeds.length > 0 || provider.notAccepted.length > 0) ? (
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  {provider.acceptedBreeds.length > 0 ? (
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                        Breed experience
                      </h3>
                      <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        {provider.acceptedBreeds.join(", ")}
                      </p>
                    </div>
                  ) : null}
                  {provider.notAccepted.length > 0 ? (
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                        Not accepted
                      </h3>
                      <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        {provider.notAccepted.join(", ")}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>

            {(provider?.homePhotos?.length || provider?.homeDescription?.trim()) && (
              <section aria-labelledby="home-heading">
                <h2
                  id="home-heading"
                  className="font-normal"
                  style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
                >
                  Where your pet will stay
                </h2>
                {provider.homeDescription?.trim() ? (
                  <p className="mt-3 max-w-3xl leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                    {provider.homeDescription.trim()}
                  </p>
                ) : null}
                {provider.homePhotos.length > 0 ? (
                  <div className="mt-6">
                    <div className="relative aspect-[4/3] max-w-3xl overflow-hidden rounded-[var(--radius-xl)] border" style={{ borderColor: "var(--color-border)" }}>
                      <Image src={provider.homePhotos[0]} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 720px" />
                    </div>
                    {provider.homePhotos.length > 1 ? (
                      <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
                        {provider.homePhotos.slice(1).map((src, i) => (
                          <li key={`${src}-${i}`} className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--color-border)" }}>
                            <Image src={src} alt="" fill className="object-cover" sizes="180px" />
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </section>
            )}

            <section aria-labelledby="about-heading">
              <h2 id="about-heading" className="font-normal" style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}>
                About
              </h2>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                {provider?.bio ??
                  "This provider has not added a bio yet. Message them to learn more about their experience."}
              </p>
            </section>

            {(provider?.homeType ||
              provider?.hasYard != null ||
              provider?.smokingHome != null ||
              provider?.petsInHome ||
              provider?.childrenInHome) && (
              <section aria-labelledby="env-heading">
                <h2 id="env-heading" className="font-normal" style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}>
                  Home &amp; environment
                </h2>
                <div className="mt-4 space-y-3 rounded-[var(--radius-lg)] border p-5" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
                  {provider?.homeType ? (
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      <span className="font-medium" style={{ color: "var(--color-text)" }}>
                        Home type:
                      </span>{" "}
                      {provider.homeType === "house" ? "House" : provider.homeType === "apartment" ? "Apartment" : provider.homeType}
                    </p>
                  ) : null}
                  {provider?.hasYard != null ? (
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      <span className="font-medium" style={{ color: "var(--color-text)" }}>
                        Yard:
                      </span>{" "}
                      {provider.hasYard ? (provider.yardFenced ? "Yes, fenced" : "Yes") : "No"}
                    </p>
                  ) : null}
                  {provider?.smokingHome != null ? (
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      <span className="font-medium" style={{ color: "var(--color-text)" }}>
                        Smoking home:
                      </span>{" "}
                      {provider.smokingHome ? "Yes" : "No"}
                    </p>
                  ) : null}
                  {provider?.petsInHome ? (
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      <span className="font-medium" style={{ color: "var(--color-text)" }}>
                        Pets in home:
                      </span>{" "}
                      {provider.petsInHome}
                    </p>
                  ) : null}
                  {provider?.childrenInHome ? (
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      <span className="font-medium" style={{ color: "var(--color-text)" }}>
                        Children in home:
                      </span>{" "}
                      {provider.childrenInHome}
                    </p>
                  ) : null}
                </div>
              </section>
            )}

            {provider?.typicalDay ? (
              <section aria-labelledby="typical-heading">
                <h2 id="typical-heading" className="font-normal" style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}>
                  A typical day
                </h2>
                <p className="mt-3 whitespace-pre-wrap leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  {provider.typicalDay}
                </p>
              </section>
            ) : null}

            {provider?.infoWantedAboutPet ? (
              <section aria-labelledby="info-heading">
                <h2 id="info-heading" className="font-normal" style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}>
                  What I&apos;d like to know about your pet
                </h2>
                <p className="mt-3 whitespace-pre-wrap leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  {provider.infoWantedAboutPet}
                </p>
              </section>
            ) : null}

            <section aria-labelledby="pricing-heading">
              <h2 id="pricing-heading" className="font-normal" style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}>
                Services &amp; pricing
              </h2>
              <div className="mt-4 overflow-x-auto rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--color-border)" }}>
                <table className="w-full min-w-[360px] text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                      <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--color-text)" }}>
                        Service
                      </th>
                      <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--color-text)" }}>
                        Base price
                      </th>
                      <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--color-text)" }}>
                        Extra pet
                      </th>
                      <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--color-text)" }}>
                        Unit
                      </th>
                      <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--color-text)" }}>
                        Max pets
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {provider?.services?.length ? (
                      provider.services.map((s) => (
                        <tr key={s.type} className="border-b" style={{ borderColor: "var(--color-border)" }}>
                          <td className="px-4 py-3" style={{ color: "var(--color-text)" }}>
                            {SERVICE_TYPE_LABELS[s.type] ?? s.type}
                          </td>
                          <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
                            {formatEur(s.base_price ?? 0)}
                          </td>
                          <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
                            {formatEur(s.additional_pet_price ?? 0)}
                          </td>
                          <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
                            {PRICE_UNIT_LABELS[s.price_unit] ?? s.price_unit}
                          </td>
                          <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
                            {s.max_pets ?? "—"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-b" style={{ borderColor: "var(--color-border)" }}>
                        <td colSpan={5} className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
                          No services listed.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section aria-labelledby="avail-heading">
              <h2 id="avail-heading" className="font-normal" style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}>
                Availability
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                Typical weekly schedule
              </p>
              <div className="mt-4 overflow-x-auto rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
                <table className="w-full min-w-[320px] text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                      <th className="px-3 py-2 text-left font-medium" style={{ color: "var(--color-text-secondary)" }} />
                      {availabilityGrid.map((r) => (
                        <th key={r.day} className="px-3 py-2 text-center font-medium" style={{ color: "var(--color-text)" }}>
                          {r.day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SLOTS.map((slot) => (
                      <tr key={slot} className="border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
                        <td className="px-3 py-2 font-medium capitalize" style={{ color: "var(--color-text-secondary)" }}>
                          {slot}
                        </td>
                        {availabilityGrid.map((r) => {
                          const on = r[slot.toLowerCase() as "morning" | "afternoon" | "evening"];
                          return (
                            <td key={`${r.day}-${slot}`} className="px-3 py-2 text-center">
                              <span
                                className="inline-block h-6 w-6 rounded text-center text-xs leading-6"
                                style={
                                  on
                                    ? { backgroundColor: "var(--color-primary-200)", color: "var(--color-primary)" }
                                    : { backgroundColor: "var(--color-neutral-200)", color: "var(--color-text-muted)" }
                                }
                              >
                                {on ? "✓" : "—"}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {provider?.photos && provider.photos.length > 0 ? (
              <section aria-labelledby="photos-heading">
                <h2 id="photos-heading" className="font-normal" style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}>
                  Gallery
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {provider.photos.map((url, i) => (
                    <div key={`${url}-${i}`} className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--color-border)" }}>
                      <Image src={url} alt="" fill className="object-cover" sizes="(max-width: 640px) 50vw, 33vw" />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {provider?.serviceAreaLat != null && provider?.serviceAreaLng != null && provider?.serviceAreaRadiusKm != null && (
              <section aria-labelledby="loc-heading">
                <h2 id="loc-heading" className="font-normal" style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}>
                  Service area
                </h2>
                <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  Approximate coverage
                </p>
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

            {provider && provider.certifications.length > 0 ? (
              <ProviderCertificationsSection certifications={provider.certifications} />
            ) : null}

            <section aria-labelledby="reviews-heading">
              <h2 id="reviews-heading" className="font-normal" style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}>
                Reviews
              </h2>
              <ProviderProfileReviews reviews={reviews} featuredId={featuredReviewId} avgRating={avgRating} reviewCount={reviewCount} />
            </section>

            <section className="border-t pt-10" style={{ borderColor: "var(--color-border)" }}>
              <ProviderProfileShareRow shareUrl={profileUrl} shareTitle={`Book ${name} on Tinies`} />
            </section>

            <section className="rounded-[var(--radius-lg)] p-8 text-center text-white" style={{ backgroundColor: "var(--color-primary)" }}>
              <h2 className="text-xl font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "white" }}>
                Ready to book?
              </h2>
              <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(255,255,255,0.9)" }}>
                Secure checkout on Tinies. {name} will confirm your request.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={`/services/book/${slug}`}
                  className="inline-flex h-12 items-center justify-center rounded-[var(--radius-pill)] bg-white px-8 font-semibold transition-opacity hover:opacity-90"
                  style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}
                >
                  Book Now
                </Link>
                {provider ? <MeetAndGreetRequestModal providerSlug={slug} providerName={name} variant="light" /> : null}
              </div>
            </section>

            <p className="mt-8">
              <Link href="/services/search" className="text-sm hover:underline" style={{ color: "var(--color-text-secondary)" }}>
                ← Back to search
              </Link>
            </p>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24">
            <div className="rounded-[var(--radius-xl)] border p-6" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", boxShadow: "var(--shadow-sm)" }}>
              <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                Trust signals
              </h3>
              <ul className="mt-4 space-y-3 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {provider?.verified ? (
                  <li className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />
                    Verified on Tinies
                  </li>
                ) : null}
                {provider?.backgroundCheckPassed ? (
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />
                    Background check
                  </li>
                ) : null}
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />
                  Member since {new Date(provider?.memberSince ?? Date.now()).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                </li>
                {rrLabel ? <li>{rrLabel}</li> : null}
                {repeatLine ? <li>{repeatLine}</li> : null}
                <li>{provider?.completedBookingsCount ?? 0} completed bookings</li>
                {provider?.languages && provider.languages.length > 0 ? <li>Languages: {provider.languages.join(", ")}</li> : null}
                {provider?.emergencyProtocol?.trim() ? (
                  <li className="border-t pt-3" style={{ borderColor: "var(--color-border)" }}>
                    <span className="font-medium" style={{ color: "var(--color-text)" }}>
                      Emergencies:
                    </span>{" "}
                    {provider.emergencyProtocol.trim()}
                  </li>
                ) : null}
                {provider?.insuranceDetails?.trim() ? (
                  <li>
                    <span className="font-medium" style={{ color: "var(--color-text)" }}>
                      Insurance:
                    </span>{" "}
                    {provider.insuranceDetails.trim()}
                  </li>
                ) : null}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
