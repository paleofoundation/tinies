import type { Metadata } from "next";
import { Heart } from "lucide-react";
import Link from "next/link";
import { getAllAvailableAdoptionListings } from "@/lib/adoption/available-listings";
import {
  adoptBrowseQueryHasFilters,
  parseAdoptBrowseQuery,
} from "@/lib/adoption/adopt-browse-params";
import { AdoptBrowseFilters } from "@/components/adoption/AdoptBrowseFilters";
import { AdoptionListingCard } from "@/components/adoption/AdoptionListingCard";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Adopt a Tiny | Rescue Animals in Cyprus",
  description:
    "Every tiny deserves a home. Rescue organisations post their own adoption listings on Tinies. Browse dogs and cats, apply through the platform, and connect with rescues and transport providers.",
  openGraph: {
    title: "Adopt a Tiny | Rescue Animals in Cyprus",
    description: "Every tiny deserves a home. Browse rescue animals in Cyprus and apply to adopt through Tinies.",
    url: `${BASE_URL}/adopt`,
    siteName: "Tinies",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Adopt a Tiny | Rescue Animals in Cyprus", description: "Every tiny deserves a home. Browse rescue animals in Cyprus and apply to adopt through Tinies." },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdoptPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const browseQuery = parseAdoptBrowseQuery(rawParams);
  const listings = await getAllAvailableAdoptionListings(browseQuery);
  const filtersActive = adoptBrowseQueryHasFilters(browseQuery);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-10 pb-12 sm:px-6 sm:pt-14 sm:pb-16 lg:px-8">
        <div className="absolute inset-0 rounded-b-[3rem] sm:rounded-b-[4rem]" style={{ backgroundColor: "rgba(244, 93, 72, 0.05)" }} />
        <div className="relative mx-auto text-center" style={{ maxWidth: "var(--max-width)" }}>
          <h1
            className="font-normal tracking-tight sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-4xl)", color: "var(--color-text)" }}
          >
            Every tiny deserves a home.
          </h1>
          <p className="mt-4 mx-auto max-w-2xl text-lg" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Rescue organisations list their animals on Tinies. Browse dogs and cats, apply through the platform, and connect with rescues and transport providers — locally in Cyprus or internationally.
          </p>
          <p className="mt-6">
            <Link
              href="/adopt/tinies-who-made-it"
              className="text-sm font-semibold hover:underline"
              style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}
            >
              See tinies who made it →
            </Link>
          </p>
        </div>
      </section>

      {/* Two paths: Local vs International */}
      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="rounded-[var(--radius-lg)] border p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)", padding: "var(--space-card)" }}>
              <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                Adopt locally in Cyprus
              </h2>
              <p className="mt-3 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                You&apos;re in Cyprus and ready to adopt. Browse animals listed by rescues near you, meet them, and take your tiny home. Each rescue sets their own adoption process and fees.
              </p>
              <Link
                href="#animals"
                className="mt-6 inline-flex items-center font-semibold hover:underline"
                style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}
              >
                Browse local animals →
              </Link>
            </div>
            <div className="rounded-[var(--radius-lg)] border p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)", padding: "var(--space-card)" }}>
              <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                Adopt internationally from Cyprus
              </h2>
              <p className="mt-3 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                You&apos;re in the UK, Germany, or elsewhere in the EU. Apply through Tinies; rescues and transport providers handle vet prep, EU pet passport, and transport. One platform — they run the process.
              </p>
              <Link
                href="/adopt?international=true"
                className="mt-6 inline-flex items-center font-semibold hover:underline"
                style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-secondary)" }}
              >
                Browse animals for international adoption →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <AdoptBrowseFilters query={browseQuery} />

      {/* Animal grid */}
      <section id="animals" className="px-4 pb-20 sm:px-6 lg:px-8" style={{ paddingBottom: "var(--space-section)" }}>
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <h2
            className="font-normal sm:text-2xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
          >
            Tinies looking for homes
          </h2>
          <p className="mt-2" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Animals listed by rescue organisations — waiting for you.
          </p>
          <p
            className="mt-4 text-sm font-medium"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}
            aria-live="polite"
          >
            Showing {listings.length} {listings.length === 1 ? "animal" : "animals"}
          </p>
          {listings.length === 0 && filtersActive ? (
            <div
              className="mt-10 rounded-[var(--radius-lg)] border px-6 py-10 text-center"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
            >
              <p
                className="text-sm font-medium"
                style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}
              >
                No tinies match your filters. Try broadening your search.
              </p>
              <Link
                href="/adopt"
                className="mt-4 inline-flex items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                style={{ fontFamily: "var(--font-body), sans-serif" }}
              >
                Clear filters
              </Link>
            </div>
          ) : null}
          {listings.length === 0 && !filtersActive ? (
            <p className="mt-10 text-center text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              No adoptable animals are listed yet. Check back soon, or contact rescues you know to join Tinies.
            </p>
          ) : null}
          {listings.length > 0 ? (
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {listings.map((listing) => (
                <AdoptionListingCard key={listing.slug} listing={listing} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
