import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Heart } from "lucide-react";
import type { PublicAdoptionListing } from "@/lib/adoption/public-listing";
import { resolveListingVideoUrl } from "@/lib/adoption/listing-video";
import { getCanonicalSiteOrigin } from "@/lib/constants/site-url";

const SITE_ORIGIN = getCanonicalSiteOrigin();

function absoluteOgImageUrl(src: string, origin: string): string {
  const t = src.trim();
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("/")) return `${origin}${t}`;
  return `${origin}/${t}`;
}

/** Default land campaign seeded for Gardens of St Gertrude; safe to link from memorial copy. */
export const SAFE_LAND_CAMPAIGN_SLUG = "safe-land-for-92-cats";

function formatSpecies(species: string): string {
  if (!species) return "Pet";
  return species.charAt(0).toUpperCase() + species.slice(1).toLowerCase();
}

export function memorialListingMetadata(listing: PublicAdoptionListing): Metadata {
  const title = `In loving memory of ${listing.name}`;
  const ogTitle = `${title} | Tinies`;
  const description =
    listing.backstory?.trim().slice(0, 155) ||
    `Remembering ${listing.name}, cared for by ${listing.org.name} in Cyprus.`;
  const url = `${SITE_ORIGIN}/adopt/${listing.slug}`;
  const ogImages = listing.photos
    .filter(Boolean)
    .slice(0, 4)
    .map((src) => ({ url: absoluteOgImageUrl(src, SITE_ORIGIN), alt: listing.name }));
  const primaryImage = ogImages[0]?.url;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: "Tinies",
      type: "website",
      images: ogImages.length > 0 ? ogImages : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      ...(primaryImage ? { images: [primaryImage] } : {}),
    },
  };
}

type Props = { listing: PublicAdoptionListing };

export function MemorialAdoptionListingPage({ listing }: Props) {
  const campaignHref = `/rescue/${listing.org.slug}/campaign/${SAFE_LAND_CAMPAIGN_SLUG}`;
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Thing",
    name: `In loving memory of ${listing.name}`,
    description:
      [listing.backstory, listing.personality].filter(Boolean).join(" ") ||
      `${formatSpecies(listing.species)} remembered on Tinies`,
    image: gallery.length > 0 ? gallery : undefined,
  };

  const sectionTitleClass = "text-xs font-semibold uppercase tracking-wide";
  const sectionTitleStyle = { color: "var(--color-text-muted)" } as const;
  const bodyStyle = { fontFamily: "var(--font-body), sans-serif" } as const;
  const mutedBg = "var(--color-primary-muted-04)";
  const softBorder = "var(--color-primary-muted-12)";

  return (
    <div className="min-h-screen" style={{ backgroundColor: mutedBg, color: "var(--color-text)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="mx-auto px-4 py-12 sm:px-6 sm:py-16" style={{ maxWidth: "var(--max-width)" }}>
        <Link
          href="/adopt"
          className="text-sm font-medium hover:underline"
          style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
        >
          ← Browse adoptable animals
        </Link>

        <p
          className="mt-6 text-center text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}
        >
          In memoriam
        </p>
        <h1
          className="mt-3 text-center font-normal tracking-tight"
          style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
        >
          In loving memory of {listing.name}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed" style={{ ...bodyStyle, color: "var(--color-text-secondary)" }}>
          {formatSpecies(listing.species)}
          {listing.breed ? ` · ${listing.breed}` : ""}
          {listing.estimatedAge ? ` · ${listing.estimatedAge}` : ""}
          {listing.sex ? ` · ${listing.sex}` : ""}
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_minmax(280px,380px)] lg:items-start lg:gap-14">
          <div className="space-y-8">
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] border"
              style={{ borderColor: softBorder, backgroundColor: "var(--color-surface)", boxShadow: "var(--shadow-sm)" }}
            >
              {hero ? (
                <Image
                  src={hero}
                  alt={`${listing.name}, ${formatSpecies(listing.species)}`}
                  fill
                  className="object-cover opacity-[0.97]"
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-8xl" aria-hidden>
                  🐾
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" aria-hidden />
            </div>

            {thumbs.length > 0 ? (
              <div>
                <h2 className={sectionTitleClass} style={sectionTitleStyle}>
                  Photos
                </h2>
                <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
                  {thumbs.map((src, i) => (
                    <li key={`${src}-${i}`} className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: softBorder }}>
                      <Image src={src} alt={`${listing.name}, photo ${i + 2}`} fill className="object-cover" sizes="(max-width: 640px) 33vw, 180px" />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {video ? (
              <section aria-labelledby="memorial-video">
                <h2 id="memorial-video" className={sectionTitleClass} style={sectionTitleStyle}>
                  Remembering {listing.name}
                </h2>
                <div className="mt-3 overflow-hidden rounded-[var(--radius-xl)] border" style={{ borderColor: softBorder }}>
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
                aria-labelledby="family-heading-memorial"
                className="rounded-[var(--radius-xl)] border p-6 sm:p-8"
                style={{
                  borderColor: softBorder,
                  backgroundColor: "var(--color-surface)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <h2
                  id="family-heading-memorial"
                  className="font-normal tracking-tight"
                  style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
                >
                  Family
                </h2>
                <p className="mt-2 text-sm leading-relaxed" style={{ ...bodyStyle, color: "var(--color-text-secondary)" }}>
                  {listing.name}&apos;s circle at the sanctuary.
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
                            style={{ borderColor: softBorder, backgroundColor: "var(--color-surface)" }}
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
                <section aria-labelledby="memorial-story">
                  <h2
                    id="memorial-story"
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
                <section aria-labelledby="memorial-personality">
                  <h2
                    id="memorial-personality"
                    className="font-normal tracking-tight"
                    style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
                  >
                    Who they were
                  </h2>
                  <p className="mt-4 whitespace-pre-wrap leading-relaxed" style={{ ...bodyStyle, color: "var(--color-text-secondary)" }}>
                    {listing.personality}
                  </p>
                </section>
              ) : null}

              {listing.temperament ? (
                <section aria-labelledby="memorial-glance">
                  <h2 id="memorial-glance" className={sectionTitleClass} style={sectionTitleStyle}>
                    At a glance
                  </h2>
                  <p className="mt-3 leading-relaxed" style={{ ...bodyStyle, color: "var(--color-text-secondary)" }}>
                    {listing.temperament}
                  </p>
                </section>
              ) : null}

              {listing.medicalHistory ? (
                <section aria-labelledby="memorial-medical">
                  <h2 id="memorial-medical" className={sectionTitleClass} style={sectionTitleStyle}>
                    Medical notes
                  </h2>
                  <p className="mt-3 whitespace-pre-wrap leading-relaxed" style={{ ...bodyStyle, color: "var(--color-text-secondary)" }}>
                    {listing.medicalHistory}
                  </p>
                </section>
              ) : null}
            </div>
          </div>

          <aside className="lg:sticky lg:top-24">
            <div
              className="rounded-[var(--radius-xl)] border p-6 sm:p-8"
              style={{
                borderColor: softBorder,
                backgroundColor: "var(--color-surface)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                Cared for by
              </p>
              {listing.org.verified ? (
                <Link
                  href={`/rescue/${listing.org.slug}`}
                  className="mt-2 block text-lg font-semibold hover:underline"
                  style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-primary)" }}
                >
                  {listing.org.name}
                </Link>
              ) : (
                <p className="mt-2 text-lg font-semibold" style={{ fontFamily: "var(--font-heading), serif" }}>
                  {listing.org.name}
                </p>
              )}
              {listing.fosterLocation ? (
                <p className="mt-3 text-sm" style={{ ...bodyStyle, color: "var(--color-text-secondary)" }}>
                  {listing.fosterLocation}
                </p>
              ) : null}
              {listing.org.location ? (
                <p className="mt-3 flex items-center gap-2 text-sm" style={{ ...bodyStyle, color: "var(--color-text-muted)" }}>
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                  {listing.org.location}
                </p>
              ) : null}

              <div
                className="mt-8 rounded-[var(--radius-lg)] border p-5"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-primary-muted-06)" }}
              >
                <Heart className="h-6 w-6" style={{ color: "var(--color-secondary)" }} aria-hidden />
                <p className="mt-3 font-normal leading-snug" style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-lg)", color: "var(--color-text)" }}>
                  {listing.name}&apos;s story inspired the Safe Land Campaign.
                </p>
                <p className="mt-2 text-sm leading-relaxed" style={{ ...bodyStyle, color: "var(--color-text-secondary)" }}>
                  Help us protect the cats who are still here — secure land, shelter, and a future for every life in our care.
                </p>
                <Link
                  href={campaignHref}
                  className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-[var(--radius-pill)] px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-primary)" }}
                >
                  Support the Safe Land Campaign
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
