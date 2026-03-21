import type { Metadata } from "next";
import Link from "next/link";
import { getApprovedSuccessStories } from "@/lib/adoption/success-stories";
import { TiniesWhoMadeItGallery, type GalleryStory } from "./TiniesWhoMadeItGallery";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tinies who made it | Adoption success stories",
  description:
    "Every adoption is a story worth telling. See rescue animals who found forever homes through Tinies — from Cyprus to families abroad and locally.",
  openGraph: {
    title: "Tinies who made it | Adoption success stories",
    description: "Rescue animals who found their forever homes through our community.",
    url: `${BASE_URL}/adopt/tinies-who-made-it`,
    siteName: "Tinies",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tinies who made it",
    description: "Rescue animals who found their forever homes through our community.",
  },
};

function toGalleryStories(rows: Awaited<ReturnType<typeof getApprovedSuccessStories>>): GalleryStory[] {
  return rows.map((r) => ({
    placementId: r.placementId,
    animalName: r.animalName,
    species: r.species,
    beforePhoto: r.beforePhoto,
    afterPhoto: r.afterPhoto,
    originLabel: r.originLabel,
    destinationLabel: r.destinationLabel,
    quote: r.quote,
    adoptedAtIso: r.adoptedAt.toISOString(),
    rescueName: r.rescueName,
    rescueSlug: r.rescueSlug,
  }));
}

export default async function TiniesWhoMadeItPage() {
  const rows = await getApprovedSuccessStories();
  const stories = toGalleryStories(rows);

  const jsonLd =
    stories.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: stories.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: s.animalName,
            description: s.quote ?? `Adopted via Tinies from ${s.originLabel} to ${s.destinationLabel}`,
            url: `${BASE_URL}/adopt/tinies-who-made-it#story-${s.placementId}`,
          })),
        }
      : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      ) : null}

      <section className="relative overflow-hidden px-4 pt-10 pb-12 sm:px-6 sm:pt-14 sm:pb-16 lg:px-8">
        <div className="absolute inset-0 rounded-b-[3rem] sm:rounded-b-[4rem]" style={{ backgroundColor: "rgba(10, 128, 128, 0.06)" }} />
        <div className="relative mx-auto text-center" style={{ maxWidth: "var(--max-width)" }}>
          <h1
            className="font-normal tracking-tight sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-4xl)", color: "var(--color-text)" }}
          >
            Tinies who made it
          </h1>
          <p className="mt-4 mx-auto max-w-2xl text-lg leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Every adoption is a story worth telling. These tinies found their forever homes through our community.
          </p>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8" style={{ paddingBottom: "var(--space-section)" }}>
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          {stories.length === 0 ? (
            <div
              className="mx-auto max-w-xl rounded-[var(--radius-lg)] border px-8 py-12 text-center"
              style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}
            >
              <p className="text-base leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                Our first tinies are on their way to their forever homes. Check back soon for their stories.
              </p>
              <Link
                href="/adopt"
                className="mt-8 inline-flex h-12 items-center justify-center rounded-[var(--radius-pill)] px-8 font-semibold text-white transition-opacity hover:opacity-90"
                style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-primary)" }}
              >
                Browse available animals
              </Link>
            </div>
          ) : (
            <TiniesWhoMadeItGallery stories={stories} siteBaseUrl={BASE_URL} />
          )}
        </div>
      </section>
    </div>
  );
}
