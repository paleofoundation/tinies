import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Heart, MapPin } from "lucide-react";
import { getPublicAdoptionListingBySlug } from "@/lib/adoption/public-listing";
import TiniesWhoMadeItPageContent, {
  tiniesWhoMadeItMetadata,
} from "../tinies-who-made-it/TiniesWhoMadeItPageContent";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

/** If the dynamic segment wins over the static `tinies-who-made-it` route, still show the gallery (not a listing 404). */
const RESERVED_ADOPTION_SLUGS = new Set(["tinies-who-made-it"]);

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function formatSpecies(species: string): string {
  if (!species) return "Pet";
  return species.charAt(0).toUpperCase() + species.slice(1).toLowerCase();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED_ADOPTION_SLUGS.has(slug)) {
    return tiniesWhoMadeItMetadata;
  }
  const listing = await getPublicAdoptionListingBySlug(slug);
  if (!listing) return { title: "Adopt | Tinies" };
  const title = `${listing.name} — Adopt | Tinies`;
  const description = `Adopt ${listing.name}, a ${formatSpecies(listing.species)}${listing.breed ? ` (${listing.breed})` : ""} from ${listing.org.name} in Cyprus.`;
  const url = `${BASE_URL}/adopt/${slug}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Tinies",
      type: "website",
      images: listing.photos[0] ? [{ url: listing.photos[0] }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function AdoptionListingProfilePage({ params }: Props) {
  const { slug } = await params;
  if (RESERVED_ADOPTION_SLUGS.has(slug)) {
    return <TiniesWhoMadeItPageContent />;
  }
  const listing = await getPublicAdoptionListingBySlug(slug);
  if (!listing) notFound();

  const photo = listing.photos[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.name,
    description:
      [listing.temperament, listing.medicalHistory, listing.specialNeeds].filter(Boolean).join(" ") ||
      `${formatSpecies(listing.species)} available for adoption`,
    image: photo ?? undefined,
    brand: { "@type": "Brand", name: listing.org.name },
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/adopt/apply/${listing.slug}`,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="mx-auto px-4 py-12 sm:px-6 sm:py-16" style={{ maxWidth: "var(--max-width)" }}>
        <Link
          href="/adopt"
          className="text-sm font-medium hover:underline"
          style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
        >
          ← All adoptable Tinies
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] border"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
          >
            {photo ? (
              <Image src={photo} alt={`${listing.name}, ${formatSpecies(listing.species)}`} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
            ) : (
              <div className="flex h-full items-center justify-center text-8xl" aria-hidden>
                🐾
              </div>
            )}
          </div>

          <div>
            <h1
              className="font-normal tracking-tight"
              style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
            >
              {listing.name}
            </h1>
            <p className="mt-2 text-lg" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              {formatSpecies(listing.species)}
              {listing.breed ? ` · ${listing.breed}` : ""}
              {listing.estimatedAge ? ` · ${listing.estimatedAge}` : ""}
              {listing.sex ? ` · ${listing.sex}` : ""}
            </p>
            {listing.org.location ? (
              <p className="mt-4 flex items-center gap-2 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}>
                <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                {listing.org.location}
              </p>
            ) : null}
            <p className={`text-sm ${listing.org.location ? "mt-2" : "mt-4"}`} style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              Cared for by{" "}
              {listing.org.verified ? (
                <Link href={`/rescue/${listing.org.slug}`} className="font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
                  {listing.org.name}
                </Link>
              ) : (
                <span className="font-semibold" style={{ color: "var(--color-text)" }}>
                  {listing.org.name}
                </span>
              )}
            </p>

            {listing.temperament && (
              <section className="mt-8">
                <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                  Temperament
                </h2>
                <p className="mt-2 leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                  {listing.temperament}
                </p>
              </section>
            )}
            {listing.medicalHistory && (
              <section className="mt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                  Medical
                </h2>
                <p className="mt-2 leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                  {listing.medicalHistory}
                </p>
              </section>
            )}
            {listing.specialNeeds && (
              <section className="mt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                  Special needs
                </h2>
                <p className="mt-2 leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                  {listing.specialNeeds}
                </p>
              </section>
            )}
            {listing.internationalEligible && listing.destinationCountries.length > 0 && (
              <section className="mt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                  International adoption
                </h2>
                <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                  Eligible for: {listing.destinationCountries.join(", ")}
                </p>
              </section>
            )}

            <Link
              href={`/adopt/apply/${listing.slug}`}
              className="mt-10 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] px-6 font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
              style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-secondary)" }}
            >
              <Heart className="h-5 w-5" />
              Apply to adopt
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
