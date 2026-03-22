import Image from "next/image";
import {
  Search,
  Calendar,
  Heart,
  BookOpen,
  Star,
  ArrowRight,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HomeSearchBar } from "@/components/layout/HomeSearchBar";
import { getHomepageData } from "@/lib/home/get-homepage-data";
import { getBlogPostSummaries } from "@/lib/blog/load-posts";
import { BlogCard } from "@/components/blog/BlogCard";
import { formatPrice } from "@/lib/utils";

export const revalidate = 300;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

const HERO_CATS_URL =
  "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/hero_cats_v2.jpg";
const SANCTUARY_STORY_URL =
  "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/hero_garden_cat.jpg";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Tinies",
  url: BASE_URL,
  description: "Trusted pet care and rescue adoption in Cyprus. No matter the size.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/services/search?type={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

function formatSpecies(species: string): string {
  if (!species) return "Pet";
  return species.charAt(0).toUpperCase() + species.slice(1).toLowerCase();
}

function StarRow({ rating }: { rating: number }) {
  const rounded = Math.min(5, Math.max(0, Math.round(rating)));
  return (
    <div className="flex gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className="h-4 w-4 shrink-0"
          strokeWidth={1.5}
          style={{
            fill: i < rounded ? "var(--color-secondary)" : "transparent",
            color: i < rounded ? "var(--color-secondary)" : "var(--color-text-muted)",
          }}
        />
      ))}
    </div>
  );
}

function providerPhoto(p: {
  avatarUrl: string | null;
  photos: string[];
}): string | null {
  if (p.avatarUrl?.trim()) return p.avatarUrl.trim();
  const first = p.photos[0]?.trim();
  return first || null;
}

export default async function Home() {
  const tHero = await getTranslations("home.hero");
  const tPreview = await getTranslations("home.howItWorksPreview");
  const homeData = await getHomepageData();
  const recentPosts = getBlogPostSummaries().slice(0, 3);

  const {
    completedBookingsCount,
    fiveStarReviewsCount,
    completedAdoptionsCount,
    donationsTotalCents,
    activeGuardiansCount,
    featuredProviders,
    featuredListings,
    recentReviews,
  } = homeData;

  const donationDisplay = formatPrice(donationsTotalCents, { useSymbol: false });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />

      {/* Hero */}
      <header className="relative min-h-[min(88vh,720px)] overflow-hidden">
        <Image
          src={HERO_CATS_URL}
          alt="Rescue cats at Gardens of St Gertrude sanctuary, Cyprus"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/50 to-black/60" aria-hidden />
        <div className="relative z-10 flex min-h-[min(88vh,720px)] flex-col justify-end px-4 pb-14 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8">
          <div className="mx-auto w-full text-center" style={{ maxWidth: "var(--max-width)" }}>
            <h1
              className="font-normal tracking-tight text-white drop-shadow-sm sm:text-5xl md:text-6xl"
              style={{ fontFamily: "var(--font-heading), serif", fontSize: "clamp(2.25rem, 5vw, 3.5rem)", lineHeight: 1.1 }}
            >
              {tHero("title")}
            </h1>
            <p
              className="mx-auto mt-5 max-w-2xl text-lg text-white/95 sm:text-xl"
              style={{ fontFamily: "var(--font-body), sans-serif", textShadow: "0 1px 12px rgba(0,0,0,0.35)" }}
            >
              {tHero("tagline")}
            </p>

            <div className="mt-8 flex flex-col items-center gap-4">
              <HomeSearchBar variant="hero" />
              <div
                className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm sm:text-base"
                style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(255,255,255,0.92)" }}
              >
                <span>92+ verified providers</span>
                <span className="hidden sm:inline" aria-hidden>
                  •
                </span>
                <span>90% to animal rescue</span>
                <span className="hidden sm:inline" aria-hidden>
                  •
                </span>
                <span>EUR 2,000 guarantee</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <Link
                  href="/services/search"
                  className="inline-flex h-11 items-center justify-center rounded-full border-2 border-white/90 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                  style={{ fontFamily: "var(--font-body), sans-serif" }}
                >
                  Book now
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex h-11 items-center justify-center rounded-full border-2 border-white/50 bg-transparent px-6 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
                  style={{ fontFamily: "var(--font-body), sans-serif" }}
                >
                  Meet & greet
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Social proof bar */}
      <section
        className="border-b px-4 py-6 sm:px-6 lg:px-8"
        style={{ borderColor: "var(--color-border)", backgroundColor: "rgba(10, 128, 128, 0.06)" }}
      >
        <div className="mx-auto flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-10 sm:gap-y-3" style={{ maxWidth: "var(--max-width)" }}>
          <p className="text-center sm:text-left" style={{ fontFamily: "var(--font-body), sans-serif" }}>
            <span className="text-lg font-bold sm:text-xl" style={{ color: "var(--color-primary)" }}>
              {completedBookingsCount.toLocaleString("en-CY")}
            </span>{" "}
            <span style={{ color: "var(--color-text-secondary)" }}>bookings completed</span>
          </p>
          <span className="hidden text-[var(--color-text-muted)] sm:inline" aria-hidden>
            •
          </span>
          <p className="text-center sm:text-left" style={{ fontFamily: "var(--font-body), sans-serif" }}>
            <span className="text-lg font-bold sm:text-xl" style={{ color: "var(--color-primary)" }}>
              {fiveStarReviewsCount.toLocaleString("en-CY")}
            </span>{" "}
            <span style={{ color: "var(--color-text-secondary)" }}>five-star reviews</span>
          </p>
          <span className="hidden text-[var(--color-text-muted)] sm:inline" aria-hidden>
            •
          </span>
          <p className="text-center sm:text-left" style={{ fontFamily: "var(--font-body), sans-serif" }}>
            <span className="text-lg font-bold sm:text-xl" style={{ color: "var(--color-primary)" }}>
              {completedAdoptionsCount.toLocaleString("en-CY")}
            </span>{" "}
            <span style={{ color: "var(--color-text-secondary)" }}>animals adopted</span>
          </p>
          <span className="hidden text-[var(--color-text-muted)] sm:inline" aria-hidden>
            •
          </span>
          <p className="text-center sm:text-left" style={{ fontFamily: "var(--font-body), sans-serif" }}>
            <span className="text-lg font-bold sm:text-xl" style={{ color: "var(--color-primary)" }}>
              {donationDisplay}
            </span>{" "}
            <span style={{ color: "var(--color-text-secondary)" }}>donated to rescue</span>
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20 sm:px-6 lg:px-8" style={{ paddingTop: "var(--space-section)", paddingBottom: "var(--space-section)" }}>
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <h2
            className="text-center"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
          >
            {tPreview("title")}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            {tPreview("subtitle")}
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-6">
            <div
              className="flex flex-col rounded-[var(--radius-xl)] border border-[var(--color-primary)]/15 bg-white p-8 text-center shadow-[var(--shadow-sm)]"
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "rgba(10, 128, 128, 0.12)", color: "var(--color-primary)" }}>
                <Search className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                {tPreview("stepSearch")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                {tPreview("stepSearchDesc")}
              </p>
            </div>
            <div
              className="flex flex-col rounded-[var(--radius-xl)] border border-[var(--color-primary)]/15 bg-white p-8 text-center shadow-[var(--shadow-sm)]"
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "rgba(10, 128, 128, 0.12)", color: "var(--color-primary)" }}>
                <Calendar className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                {tPreview("stepBook")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                {tPreview("stepBookDesc")}
              </p>
            </div>
            <div
              className="flex flex-col rounded-[var(--radius-xl)] border border-[var(--color-primary)]/15 bg-white p-8 text-center shadow-[var(--shadow-sm)]"
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "rgba(10, 128, 128, 0.12)", color: "var(--color-primary)" }}>
                <Heart className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                {tPreview("stepRelax")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                {tPreview("stepRelaxDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured providers */}
      <section className="border-t px-4 py-20 sm:px-6 lg:px-8" style={{ borderColor: "var(--color-border)", paddingTop: "var(--space-section)", paddingBottom: "var(--space-section)" }}>
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <h2
            className="text-center"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
          >
            Trusted by pet owners across Cyprus
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm sm:text-base" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Verified carers with real reviews. Tap a profile to book or request a meet-and-greet.
          </p>
          {featuredProviders.length === 0 ? (
            <p className="mt-10 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Verified providers will appear here as they join.{" "}
              <Link href="/services/search" className="font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
                Browse search
              </Link>
            </p>
          ) : (
            <div className="mt-10 flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4 snap-x snap-mandatory sm:snap-none">
              {featuredProviders.map((p) => {
                const img = providerPhoto(p);
                const rating = p.avgRating ?? 0;
                return (
                  <Link
                    key={p.slug}
                    href={`/services/provider/${p.slug}`}
                    className="w-[min(280px,82vw)] shrink-0 snap-center overflow-hidden rounded-[var(--radius-xl)] border transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] sm:w-auto"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", boxShadow: "var(--shadow-md)" }}
                  >
                    <div className="relative aspect-[4/3] w-full" style={{ backgroundColor: "rgba(10, 128, 128, 0.08)" }}>
                      {img ? (
                        <Image
                          src={img}
                          alt={`${p.displayName}, verified pet care provider`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 82vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl" aria-hidden>
                          🐾
                        </div>
                      )}
                    </div>
                    <div className="p-5 text-left">
                      <p className="font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                        {p.displayName}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <StarRow rating={rating} />
                        <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                          {rating.toFixed(1)} · {p.reviewCount} reviews
                        </span>
                      </div>
                      {p.headline ? (
                        <p className="mt-2 line-clamp-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                          {p.headline}
                        </p>
                      ) : null}
                      {p.district ? (
                        <p className="mt-2 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-primary)" }}>
                          {p.district}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Tinies looking for homes */}
      <section
        className="rounded-t-[2rem] px-4 py-20 sm:px-6 sm:rounded-t-[3rem] lg:px-8"
        style={{ paddingTop: "var(--space-section)", paddingBottom: "var(--space-section)", backgroundColor: "var(--color-surface)" }}
      >
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <h2
            className="text-center"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
          >
            Tinies looking for homes
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Adopt a rescue animal and give them a forever home.
          </p>
          {featuredListings.length === 0 ? (
            <p className="mt-12 text-center text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              New adoptable animals will appear here soon.{" "}
              <Link href="/adopt" className="font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
                Browse all adoptions
              </Link>
            </p>
          ) : (
            <div className="mt-12 flex gap-6 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4 snap-x snap-mandatory sm:snap-none">
              {featuredListings.map((listing) => {
                const photo = listing.photos[0];
                return (
                  <article
                    key={listing.slug}
                    className="w-[min(280px,85vw)] shrink-0 snap-center overflow-hidden rounded-[var(--radius-xl)] border transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] sm:w-auto"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", boxShadow: "var(--shadow-md)" }}
                  >
                    <div className="relative aspect-[4/3] w-full border-b" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                      {photo ? (
                        <Image
                          src={photo}
                          alt={`${listing.name}, ${formatSpecies(listing.species)} — adoptable`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-6xl" aria-hidden>
                          🐾
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                        {listing.name}
                      </h3>
                      <p className="text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                        {listing.breed ? `${listing.breed} · ` : ""}
                        {formatSpecies(listing.species)}
                        {listing.estimatedAge ? ` · ${listing.estimatedAge}` : ""}
                      </p>
                      {listing.personalitySnippet ? (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                          {listing.personalitySnippet}
                        </p>
                      ) : null}
                      <Link
                        href={`/adopt/${listing.slug}`}
                        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                        style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}
                      >
                        Meet {listing.name}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          <div className="mt-10 text-center">
            <Link
              href="/adopt"
              className="inline-flex items-center gap-2 font-semibold hover:underline"
              style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}
            >
              View all adoptable tinies
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* The Tinies Promise */}
      <section className="border-t px-4 py-20 sm:px-6 lg:px-8" style={{ borderColor: "var(--color-border)", paddingTop: "var(--space-section)", paddingBottom: "var(--space-section)" }}>
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <h2
            className="text-center"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
          >
            Why Tinies is different
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-primary)" }}>
                90% to rescue
              </h3>
              <p className="mt-3 text-sm leading-relaxed sm:text-base" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                We&apos;re not a business that donates. We&apos;re a rescue operation that runs a marketplace. 90% of every commission feeds, shelters, and provides vet care for rescue animals.
              </p>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-primary)" }}>
                Real verification
              </h3>
              <p className="mt-3 text-sm leading-relaxed sm:text-base" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                Every provider is identity-verified. Every rescue org is registered. Every euro is tracked.
              </p>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-primary)" }}>
                The Tinies Guarantee
              </h3>
              <p className="mt-3 text-sm leading-relaxed sm:text-base" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                Up to EUR 2,000 vet coverage. Full refund for no-shows. Your pet is protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent reviews */}
      <section
        className="border-t px-4 py-20 sm:px-6 lg:px-8"
        style={{
          borderColor: "var(--color-border)",
          paddingTop: "var(--space-section)",
          paddingBottom: "var(--space-section)",
          backgroundColor: "rgba(10, 128, 128, 0.04)",
        }}
      >
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <h2
            className="text-center"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
          >
            What pet owners are saying
          </h2>
          {recentReviews.length === 0 ? (
            <p className="mt-10 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Reviews from completed bookings will show here.
            </p>
          ) : (
            <ul className="mt-12 grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recentReviews.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-col rounded-[var(--radius-xl)] border bg-white p-6 shadow-[var(--shadow-sm)]"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <StarRow rating={r.rating} />
                  <p className="mt-3 flex-1 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                    &ldquo;{r.textExcerpt}&rdquo;
                  </p>
                  <p className="mt-4 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {r.reviewerFirstName} ·{" "}
                    <Link href={`/services/provider/${r.providerSlug}`} className="font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
                      {r.providerName}
                    </Link>
                    <br />
                    <time dateTime={r.createdAt.toISOString()}>{r.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</time>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* From the blog */}
      {recentPosts.length > 0 ? (
        <section
          className="border-t px-4 py-20 sm:px-6 lg:px-8"
          style={{
            borderColor: "var(--color-border)",
            paddingTop: "var(--space-section)",
            paddingBottom: "var(--space-section)",
          }}
        >
          <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2
                  className="flex items-center gap-2"
                  style={{
                    fontFamily: "var(--font-heading), serif",
                    fontSize: "var(--text-3xl)",
                    color: "var(--color-text)",
                  }}
                >
                  <BookOpen className="h-8 w-8 shrink-0 text-[var(--color-primary)]" aria-hidden />
                  From the blog
                </h2>
                <p className="mt-2 max-w-lg" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                  Pet care tips, adoption guides, and rescue stories from Cyprus.
                </p>
              </div>
              <Link
                href="/blog"
                className="shrink-0 text-sm font-semibold hover:underline"
                style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}
              >
                View all posts →
              </Link>
            </div>
            <ul className="mt-12 grid list-none gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post) => (
                <li key={post.slug}>
                  <BlogCard post={post} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Gardens of St Gertrude */}
      <section className="relative min-h-[420px] overflow-hidden sm:min-h-[480px]">
        <Image
          src={SANCTUARY_STORY_URL}
          alt="Cat in the garden at Gardens of St Gertrude sanctuary"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/40" aria-hidden />
        <div className="relative z-10 flex min-h-[420px] flex-col justify-center px-4 py-16 sm:min-h-[480px] sm:px-10 lg:px-16">
          <div className="mx-auto w-full" style={{ maxWidth: "var(--max-width)" }}>
            <h2
              className="max-w-xl text-3xl font-normal text-white sm:text-4xl"
              style={{ fontFamily: "var(--font-heading), serif", textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}
            >
              This is where it started. 92 cats. One sanctuary. Every booking helps.
            </h2>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/about"
                className="inline-flex h-12 items-center rounded-full bg-white px-6 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}
              >
                Learn our story
              </Link>
              <Link
                href="/giving"
                className="inline-flex h-12 items-center rounded-full border-2 border-white/90 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                style={{ fontFamily: "var(--font-body), sans-serif" }}
              >
                Support the sanctuary
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Become a Guardian */}
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8" style={{ backgroundColor: "var(--color-primary)" }}>
        <div className="mx-auto text-center" style={{ maxWidth: "42rem" }}>
          <h2 className="text-2xl font-normal text-white sm:text-3xl" style={{ fontFamily: "var(--font-heading), serif" }}>
            {activeGuardiansCount > 0
              ? `Join ${activeGuardiansCount.toLocaleString("en-CY")} Tinies Guardians supporting rescue animals every month`
              : "Join Tinies Guardians supporting rescue animals every month"}
          </h2>
          <p className="mt-4 text-white/90" style={{ fontFamily: "var(--font-body), sans-serif" }}>
            Starting from EUR 3/month — 100% goes to the sanctuary you choose.
          </p>
          <Link
            href="/giving/become-a-guardian"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}
          >
            Become a Guardian
          </Link>
        </div>
      </section>
    </div>
  );
}
