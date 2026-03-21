import Image from "next/image";
import {
  Search,
  CreditCard,
  Camera,
  PawPrint,
  Heart,
  Leaf,
  BookOpen,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HomeSearchBar } from "@/components/layout/HomeSearchBar";
import { getFeaturedAvailableListings } from "@/lib/adoption/featured-for-home";
import { getBlogPostSummaries } from "@/lib/blog/load-posts";
import { BlogCard } from "@/components/blog/BlogCard";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export const dynamic = "force-dynamic";

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

export default async function Home() {
  const tHero = await getTranslations("home.hero");
  const tPreview = await getTranslations("home.howItWorksPreview");
  const featuredListings = await getFeaturedAvailableListings(4);
  const recentPosts = getBlogPostSummaries().slice(0, 3);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {/* Hero */}
      <header className="relative overflow-hidden px-4 pt-10 pb-16 sm:px-6 sm:pt-16 sm:pb-24 lg:px-8">
        <div className="absolute inset-0 rounded-b-[3rem] sm:rounded-b-[4rem]" style={{ backgroundColor: "rgba(10, 110, 92, 0.05)" }} />
        <div className="relative mx-auto text-center" style={{ maxWidth: "var(--max-width)" }}>
          <h1
            className="font-normal tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-4xl)", color: "var(--color-text)" }}
          >
            {tHero("title")}
          </h1>
          <p className="mt-4 mx-auto max-w-xl text-lg sm:text-xl" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            {tHero("tagline")}
          </p>
          <p className="mt-2 text-base font-medium sm:text-lg" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}>
            {tHero("subtagline")}
          </p>

          {/* Search area: geocodes location and redirects to /services/search?lat=&lng=&type= */}
          <HomeSearchBar />
        </div>
      </header>

      {/* How It Works */}
      <section className="px-4 py-20 sm:px-6 lg:px-8" style={{ paddingTop: "var(--space-section)", paddingBottom: "var(--space-section)" }}>
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <h2
            className="text-center"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
          >
            {tPreview("title")}
          </h2>
          <p className="mt-2 mx-auto max-w-lg text-center" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            {tPreview("subtitle")}
          </p>
          <div className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}>
                <Search className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>{tPreview("stepSearch")}</h3>
              <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                {tPreview("stepSearchDesc")}
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}>
                <CreditCard className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>{tPreview("stepBook")}</h3>
              <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                {tPreview("stepBookDesc")}
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}>
                <Camera className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>{tPreview("stepRelax")}</h3>
              <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                {tPreview("stepRelaxDesc")}
              </p>
            </div>
          </div>
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
                <p
                  className="mt-2 max-w-lg"
                  style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
                >
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

      {/* Tinies Looking for Homes */}
      <section className="rounded-t-[2rem] bg-white px-4 py-20 sm:px-6 sm:rounded-t-[3rem] lg:px-8" style={{ paddingTop: "var(--space-section)", paddingBottom: "var(--space-section)" }}>
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <h2
            className="text-center"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
          >
            Tinies looking for homes
          </h2>
          <p className="mt-2 mx-auto max-w-lg text-center" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
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
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {featuredListings.map((listing) => {
                const photo = listing.photos[0];
                return (
                  <article
                    key={listing.slug}
                    className="rounded-[var(--radius-lg)] border p-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
                    style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)", padding: "var(--space-card)" }}
                  >
                    <div
                      className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] border"
                      style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)" }}
                    >
                      {photo ? (
                        <Image
                          src={photo}
                          alt={`${listing.name}, ${formatSpecies(listing.species)} — adoptable`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-6xl" aria-hidden>
                          🐾
                        </div>
                      )}
                    </div>
                    <h3 className="mt-6 font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                      {listing.name}
                    </h3>
                    <p className="text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                      {formatSpecies(listing.species)}
                      {listing.estimatedAge ? ` · ${listing.estimatedAge}` : ""}
                    </p>
                    <Link
                      href={`/adopt/${listing.slug}`}
                      className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] px-4 font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", backgroundColor: "var(--color-secondary)" }}
                    >
                      <Heart className="h-4 w-4" />
                      Adopt this Tiny
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
          <div className="mt-12 text-center">
            <Link
              href="/adopt"
              className="inline-flex items-center gap-2 font-semibold hover:underline"
              style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}
            >
              View all adoptable Tinies
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust signals bar */}
      <section className="border-t px-4 py-20 sm:px-6 lg:px-8" style={{ borderColor: "var(--color-border)", paddingTop: "var(--space-section)", paddingBottom: "var(--space-section)" }}>
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <div className="flex flex-col gap-10 text-center sm:flex-row sm:justify-around sm:gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-primary-100)", color: "var(--color-primary)" }}>
                <PawPrint className="h-6 w-6" />
              </div>
              <p className="text-xl font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                50+ Verified Providers
              </p>
              <p className="text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>Across Cyprus</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-secondary-100)", color: "var(--color-secondary)" }}>
                <Heart className="h-6 w-6" />
              </div>
              <p className="text-xl font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                100+ Happy Tinies Adopted
              </p>
              <p className="text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>And counting</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-primary-100)", color: "var(--color-primary)" }}>
                <Leaf className="h-6 w-6" />
              </div>
              <p className="text-xl font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                90% of our commission goes to rescue animal care
              </p>
              <p className="text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>Food, vet care, shelter</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Tinies */}
      <section className="border-t bg-white px-4 py-20 sm:px-6 lg:px-8" style={{ borderColor: "var(--color-border)", paddingTop: "var(--space-section)", paddingBottom: "var(--space-section)" }}>
        <div className="mx-auto max-w-[720px] text-center">
          <p className="leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)", fontSize: "var(--text-base)" }}>
            Tinies was built to fund Gardens of St Gertrude, a cat sanctuary in Parekklisia caring for 92 cats. Every booking on this platform helps feed, shelter, and provide medical care for rescue animals across Cyprus.
          </p>
        </div>
      </section>
    </div>
  );
}
