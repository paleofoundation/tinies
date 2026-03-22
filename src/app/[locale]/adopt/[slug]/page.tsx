import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Heart, MapPin } from "lucide-react";
import {
  getCountryAdoptionSeo,
  parseFromCyprusToAdoptionCountrySegment,
} from "@/lib/adoption/country-requirements";
import { getPublicAdoptionListingBySlug, type PublicAdoptionListing } from "@/lib/adoption/public-listing";
import {
  MemorialAdoptionListingPage,
  memorialListingMetadata,
} from "@/components/adoption/MemorialAdoptionListingPage";
import { resolveListingVideoUrl } from "@/lib/adoption/listing-video";
import { FromCyprusToCountryPageContent } from "../FromCyprusToCountryPageContent";
import TiniesWhoMadeItPageContent, {
  tiniesWhoMadeItMetadata,
} from "../tinies-who-made-it/TiniesWhoMadeItPageContent";

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app").replace(/\/$/, "");

/** If the dynamic segment wins over the static `tinies-who-made-it` route, still show the gallery (not a listing 404). */
const RESERVED_ADOPTION_SLUGS = new Set(["tinies-who-made-it"]);

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function formatSpecies(species: string): string {
  if (!species) return "Pet";
  return species.charAt(0).toUpperCase() + species.slice(1).toLowerCase();
}

function buildListingMetaDescription(listing: PublicAdoptionListing): string {
  const base = `Adopt ${listing.name}, a ${formatSpecies(listing.species)}${listing.breed ? ` (${listing.breed})` : ""} from ${listing.org.name} in Cyprus.`;
  const lead = listing.backstory?.trim() || listing.personality?.trim();
  if (!lead) return base;
  const oneLine = lead.replace(/\s+/g, " ");
  const extra = oneLine.length <= 120 ? oneLine : `${oneLine.slice(0, 117)}…`;
  return `${base} ${extra}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED_ADOPTION_SLUGS.has(slug)) {
    return tiniesWhoMadeItMetadata;
  }
  const countrySegment = parseFromCyprusToAdoptionCountrySegment(slug);
  if (countrySegment !== null) {
    const seo = getCountryAdoptionSeo(countrySegment);
    if (!seo) {
      return { title: "International adoption | Tinies" };
    }
    const title = `Adopt a Rescue Animal from Cyprus to ${seo.seoTitleCountry} | Tinies`;
    const description = `Adopt a rescue dog or cat from Cyprus to ${seo.seoTitleCountry}. EU pet passport, vet preparation, transport, and Tinies coordination — one transparent fee, no hidden costs.`;
    const url = `${BASE_URL}/adopt/from-cyprus-to-${countrySegment}`;
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        siteName: "Tinies",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  }
  const listing = await getPublicAdoptionListingBySlug(slug);
  if (!listing) return { title: "Adopt | Tinies" };
  const title = `${listing.name}${listing.lineageTitle ? ` — ${listing.lineageTitle}` : ""} — Adopt | Tinies`;
  const description = buildListingMetaDescription(listing);
  const url = `${BASE_URL}/adopt/${slug}`;
  const ogImages = listing.photos.filter(Boolean).slice(0, 4).map((src) => ({ url: src }));
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Tinies",
      type: "website",
      images: ogImages.length > 0 ? ogImages : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function AdoptionListingProfilePage({ params }: Props) {
  const { slug } = await params;
  if (RESERVED_ADOPTION_SLUGS.has(slug)) {
    return <TiniesWhoMadeItPageContent />;
  }
  const countrySegment = parseFromCyprusToAdoptionCountrySegment(slug);
  if (countrySegment !== null) {
    const seo = getCountryAdoptionSeo(countrySegment);
    if (!seo) notFound();
    return <FromCyprusToCountryPageContent seo={seo} />;
  }
  const listing = await getPublicAdoptionListingBySlug(slug);
  if (!listing) notFound();

  if (listing.isMemorial) {
    return <MemorialAdoptionListingPage listing={listing} />;
  }

  const gallery = listing.photos.filter(Boolean).slice(0, 10);
  const hero = gallery[0];
  const thumbs = gallery.slice(1);
  const video = resolveListingVideoUrl(listing.videoUrl);
  const hasFamily =
    Boolean(listing.lineageTitle?.trim()) ||
    Boolean(listing.familyNotes?.trim()) ||
    listing.mother != null ||
    listing.father != null ||
    listing.siblings.length > 0;
  const jsonLdImages = gallery.length > 0 ? gallery : hero ? [hero] : [];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.name,
    description:
      [listing.backstory, listing.personality, listing.temperament, listing.medicalHistory, listing.specialNeeds].filter(Boolean).join(" ") ||
      `${formatSpecies(listing.species)} available for adoption`,
    image: jsonLdImages.length > 0 ? jsonLdImages : undefined,
    brand: { "@type": "Brand", name: listing.org.name },
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/adopt/apply/${listing.slug}`,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
    },
  };

  const sectionTitleClass =
    "text-xs font-semibold uppercase tracking-wide";
  const sectionTitleStyle = { color: "var(--color-text-secondary)" } as const;
  const bodyStyle = { fontFamily: "var(--font-body), sans-serif" } as const;

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

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_minmax(280px,380px)] lg:items-start lg:gap-14">
          <div className="space-y-8">
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] border"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
            >
              {hero ? (
                <Image
                  src={hero}
                  alt={`${listing.name}, ${formatSpecies(listing.species)}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-8xl" aria-hidden>
                  🐾
                </div>
              )}
            </div>

            {thumbs.length > 0 ? (
              <div>
                <h2 className={sectionTitleClass} style={sectionTitleStyle}>
                  More photos
                </h2>
                <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
                  {thumbs.map((src, i) => (
                    <li key={`${src}-${i}`} className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--color-border)" }}>
                      <Image src={src} alt={`${listing.name}, photo ${i + 2}`} fill className="object-cover" sizes="(max-width: 640px) 33vw, 180px" />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {video ? (
              <section aria-labelledby="listing-video">
                <h2 id="listing-video" className={sectionTitleClass} style={sectionTitleStyle}>
                  Watch {listing.name}
                </h2>
                <div className="mt-3 overflow-hidden rounded-[var(--radius-xl)] border" style={{ borderColor: "var(--color-border)" }}>
                  {video.kind === "youtube" ? (
                    <div className="aspect-video w-full bg-black">
                      <iframe
                        title={`Video of ${listing.name}`}
                        src={video.embedSrc}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <video src={video.src} controls className="aspect-video w-full bg-black object-contain" />
                  )}
                </div>
              </section>
            ) : null}

            {hasFamily ? (
              <section
                aria-labelledby="family-heading"
                className="rounded-[var(--radius-xl)] border p-6 sm:p-8"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "rgba(10, 128, 128, 0.04)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <h2
                  id="family-heading"
                  className="font-normal tracking-tight"
                  style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
                >
                  Family
                </h2>
                <p className="mt-2 text-sm leading-relaxed" style={{ ...bodyStyle, color: "var(--color-text-secondary)" }}>
                  Every rescue has roots. Here&apos;s what we know about {listing.name}&apos;s circle.
                </p>
                <dl className="mt-6 space-y-4 text-sm" style={bodyStyle}>
                  {listing.mother ? (
                    <div>
                      <dt className="font-semibold" style={{ color: "var(--color-text)" }}>
                        Mother
                      </dt>
                      <dd className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        {listing.mother.type === "listing" ? (
                          <Link href={`/adopt/${listing.mother.slug}`} className="font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
                            {listing.mother.name}
                          </Link>
                        ) : (
                          <span>{listing.mother.name}</span>
                        )}
                      </dd>
                    </div>
                  ) : null}
                  {listing.father ? (
                    <div>
                      <dt className="font-semibold" style={{ color: "var(--color-text)" }}>
                        Father
                      </dt>
                      <dd className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        {listing.father.type === "listing" ? (
                          <Link href={`/adopt/${listing.father.slug}`} className="font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
                            {listing.father.name}
                          </Link>
                        ) : (
                          <span>{listing.father.name}</span>
                        )}
                      </dd>
                    </div>
                  ) : null}
                </dl>
                {listing.siblings.length > 0 ? (
                  <div className="mt-6">
                    <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                      Siblings on Tinies
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-4">
                      {listing.siblings.map((s) => (
                        <li key={s.slug}>
                          <Link
                            href={`/adopt/${s.slug}`}
                            className="block w-28 overflow-hidden rounded-[var(--radius-lg)] border transition-shadow hover:shadow-[var(--shadow-md)]"
                            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
                          >
                            <div className="relative aspect-square w-full">
                              {s.photo ? (
                                <Image src={s.photo} alt="" fill className="object-cover" sizes="112px" />
                              ) : (
                                <div className="flex h-full items-center justify-center text-2xl" aria-hidden>
                                  🐾
                                </div>
                              )}
                            </div>
                            <p className="truncate px-2 py-2 text-center text-xs font-medium" style={{ color: "var(--color-text)" }}>
                              {s.name}
                            </p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {listing.familyNotes ? (
                  <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed" style={{ ...bodyStyle, color: "var(--color-text-secondary)" }}>
                    {listing.familyNotes}
                  </p>
                ) : null}
              </section>
            ) : null}

            <div className="max-w-3xl space-y-10 lg:max-w-none">
              {listing.backstory ? (
                <section aria-labelledby="story-back">
                  <h2
                    id="story-back"
                    className="font-normal tracking-tight"
                    style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
                  >
                    Their story
                  </h2>
                  <p className="mt-4 whitespace-pre-wrap leading-relaxed" style={{ ...bodyStyle, color: "var(--color-text-secondary)" }}>
                    {listing.backstory}
                  </p>
                </section>
              ) : null}

              {listing.personality ? (
                <section aria-labelledby="story-personality">
                  <h2
                    id="story-personality"
                    className="font-normal tracking-tight"
                    style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
                  >
                    Personality &amp; quirks
                  </h2>
                  <p className="mt-4 whitespace-pre-wrap leading-relaxed" style={{ ...bodyStyle, color: "var(--color-text-secondary)" }}>
                    {listing.personality}
                  </p>
                </section>
              ) : null}

              {listing.idealHome ? (
                <section aria-labelledby="story-home">
                  <h2
                    id="story-home"
                    className="font-normal tracking-tight"
                    style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
                  >
                    The right home
                  </h2>
                  <p className="mt-4 whitespace-pre-wrap leading-relaxed" style={{ ...bodyStyle, color: "var(--color-text-secondary)" }}>
                    {listing.idealHome}
                  </p>
                </section>
              ) : null}

              {listing.temperament ? (
                <section aria-labelledby="story-temperament">
                  <h2 id="story-temperament" className={sectionTitleClass} style={sectionTitleStyle}>
                    At a glance
                  </h2>
                  <p className="mt-3 leading-relaxed" style={bodyStyle}>
                    {listing.temperament}
                  </p>
                </section>
              ) : null}

              {listing.medicalHistory ? (
                <section aria-labelledby="story-medical">
                  <h2 id="story-medical" className={sectionTitleClass} style={sectionTitleStyle}>
                    Medical
                  </h2>
                  <p className="mt-3 whitespace-pre-wrap leading-relaxed" style={{ ...bodyStyle, color: "var(--color-text-secondary)" }}>
                    {listing.medicalHistory}
                  </p>
                </section>
              ) : null}

              {listing.specialNeeds ? (
                <section aria-labelledby="story-needs">
                  <h2 id="story-needs" className={sectionTitleClass} style={sectionTitleStyle}>
                    Special needs
                  </h2>
                  <p className="mt-3 whitespace-pre-wrap leading-relaxed" style={{ ...bodyStyle, color: "var(--color-text-secondary)" }}>
                    {listing.specialNeeds}
                  </p>
                </section>
              ) : null}

              {listing.internationalEligible && listing.destinationCountries.length > 0 ? (
                <section aria-labelledby="story-intl">
                  <h2 id="story-intl" className={sectionTitleClass} style={sectionTitleStyle}>
                    International adoption
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed" style={{ ...bodyStyle, color: "var(--color-text-secondary)" }}>
                    Eligible for: {listing.destinationCountries.join(", ")}
                  </p>
                </section>
              ) : null}
            </div>
          </div>

          <aside className="lg:sticky lg:top-24">
            <div
              className="rounded-[var(--radius-xl)] border p-6 sm:p-8"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", boxShadow: "var(--shadow-sm)" }}
            >
              <h1
                className="font-normal tracking-tight"
                style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
              >
                {listing.name}
                {listing.lineageTitle ? (
                  <span style={{ color: "var(--color-primary)" }}>{` — ${listing.lineageTitle}`}</span>
                ) : null}
              </h1>
              {listing.alternateNames.length > 0 ? (
                <p
                  className="mt-2 text-sm italic"
                  style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}
                >
                  Also known as: {listing.alternateNames.join(", ")}
                </p>
              ) : null}
              {listing.nameStory?.trim() ? (
                <p className="mt-2 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                  {listing.nameStory.trim()}
                </p>
              ) : null}
              <p
                className={
                  listing.alternateNames.length > 0 || listing.nameStory?.trim()
                    ? "mt-3 text-lg"
                    : "mt-2 text-lg"
                }
                style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
              >
                {formatSpecies(listing.species)}
                {listing.breed ? ` · ${listing.breed}` : ""}
                {listing.estimatedAge ? ` · ${listing.estimatedAge}` : ""}
                {listing.sex ? ` · ${listing.sex}` : ""}
              </p>
              {listing.fosterLocation ? (
                <p className="mt-3 inline-block rounded-full px-3 py-1 text-sm" style={{ backgroundColor: "rgba(10, 128, 128, 0.1)", color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}>
                  In foster · {listing.fosterLocation}
                </p>
              ) : null}
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

              {listing.goodWith.length > 0 || listing.notGoodWith.length > 0 ? (
                <div className="mt-6 space-y-4 border-t pt-6" style={{ borderColor: "var(--color-border)" }}>
                  {listing.goodWith.length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                        Usually good with
                      </p>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {listing.goodWith.map((t) => (
                          <li
                            key={t}
                            className="rounded-full px-3 py-1 text-sm"
                            style={{ backgroundColor: "rgba(10, 128, 128, 0.12)", color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {listing.notGoodWith.length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                        May not suit
                      </p>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {listing.notGoodWith.map((t) => (
                          <li
                            key={t}
                            className="rounded-full px-3 py-1 text-sm"
                            style={{ backgroundColor: "rgba(244, 93, 72, 0.12)", color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <Link
                href={`/adopt/apply/${listing.slug}`}
                className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] px-6 font-semibold text-white transition-opacity hover:opacity-90"
                style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-secondary)" }}
              >
                <Heart className="h-5 w-5" />
                Apply to adopt
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
