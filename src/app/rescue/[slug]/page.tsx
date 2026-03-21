import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  ExternalLink,
  Facebook,
  Globe,
  Heart,
  Instagram,
  MapPin,
  PawPrint,
} from "lucide-react";
import {
  getPublicRescueOrgBySlug,
  normalizeExternalUrl,
} from "@/lib/rescue/public-profile";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function formatLabel(value: string | null | undefined): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function donationsSectionBody(
  howDonationsUsed: string | null,
  mission: string | null
): string | null {
  if (howDonationsUsed) return howDonationsUsed;
  if (mission && mission.trim()) return mission.trim();
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const org = await getPublicRescueOrgBySlug(slug);
  if (!org) {
    return { title: "Rescue organisation | Tinies" };
  }
  const title = `${org.name} | Tinies`;
  const description =
    org.mission?.trim() ||
    `Verified rescue organisation on Tinies${org.location ? ` — ${org.location}` : ""}.`;
  const url = `${BASE_URL}/rescue/${slug}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Tinies",
      type: "website",
      images: org.logoUrl ? [{ url: org.logoUrl }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PublicRescueOrgPage({ params }: Props) {
  const { slug } = await params;
  const org = await getPublicRescueOrgBySlug(slug);
  if (!org) notFound();

  const donationsBody = donationsSectionBody(org.howDonationsUsed, org.mission);
  const fb = normalizeExternalUrl(org.socialLinks.facebook);
  const ig = normalizeExternalUrl(org.socialLinks.instagram);
  const sameAs = [org.websiteHref, fb, ig].filter(Boolean) as string[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Organization", "NGO"],
    name: org.name,
    description: org.mission ?? undefined,
    url: `${BASE_URL}/rescue/${org.slug}`,
    logo: org.logoUrl ?? undefined,
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(org.charityRegistration
      ? {
          identifier: {
            "@type": "PropertyValue",
            name: "Charity registration number",
            value: org.charityRegistration,
          },
        }
      : {}),
  };

  const listingCount = org.listings.length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="mx-auto px-4 py-12 sm:px-6 sm:py-16" style={{ maxWidth: "var(--max-width)" }}>
        <Link
          href="/adopt"
          className="text-sm font-medium hover:underline"
          style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
        >
          ← Browse adoptable animals
        </Link>

        <header className="mt-10 flex flex-col gap-8 border-b pb-10 sm:flex-row sm:items-start" style={{ borderColor: "var(--color-border)" }}>
          <div
            className="relative mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-full border sm:mx-0 sm:h-32 sm:w-32"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
          >
            {org.logoUrl ? (
              <Image src={org.logoUrl} alt={`${org.name} logo`} fill className="object-cover" sizes="128px" />
            ) : (
              <div className="flex h-full w-full items-center justify-center" aria-hidden>
                <Building2 className="h-14 w-14" style={{ color: "var(--color-primary-300)" }} strokeWidth={1.25} />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h1
              className="font-normal tracking-tight"
              style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
            >
              {org.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium"
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  borderColor: "var(--color-border)",
                  color: "var(--color-success, #16A34A)",
                  backgroundColor: "rgba(22, 163, 74, 0.08)",
                }}
              >
                <BadgeCheck className="h-4 w-4 shrink-0" aria-hidden />
                Verified organisation
              </span>
            </div>
            {org.mission && (
              <p className="mt-6 text-lg leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                {org.mission}
              </p>
            )}
            <div className="mt-6 flex flex-col gap-3 text-sm sm:text-base" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              {org.location && (
                <p className="flex items-center justify-center gap-2 sm:justify-start">
                  <MapPin className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />
                  {org.location}
                </p>
              )}
              {org.websiteHref && (
                <p className="flex items-center justify-center gap-2 sm:justify-start">
                  <Globe className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />
                  <a
                    href={org.websiteHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium hover:underline"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Website
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </p>
              )}
              {(fb || ig) && (
                <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                  {fb && (
                    <a
                      href={fb}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] border px-3 py-2 font-medium transition-opacity hover:opacity-90"
                      style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                    >
                      <Facebook className="h-4 w-4" aria-hidden />
                      Facebook
                    </a>
                  )}
                  {ig && (
                    <a
                      href={ig}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] border px-3 py-2 font-medium transition-opacity hover:opacity-90"
                      style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                    >
                      <Instagram className="h-4 w-4" aria-hidden />
                      Instagram
                    </a>
                  )}
                </div>
              )}
              {org.charityRegistration && (
                <p style={{ color: "var(--color-text-muted)" }}>
                  Charity registration: <span style={{ color: "var(--color-text-secondary)" }}>{org.charityRegistration}</span>
                </p>
              )}
            </div>
          </div>
        </header>

        {donationsBody && (
          <section className="mt-12" aria-labelledby="donations-heading">
            <h2
              id="donations-heading"
              className="font-normal"
              style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
            >
              How donations are used
            </h2>
            <p className="mt-3 max-w-3xl leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              {donationsBody}
            </p>
          </section>
        )}

        <section className="mt-14" aria-labelledby="animals-heading">
          <h2
            id="animals-heading"
            className="font-normal"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
          >
            Animals in our care
          </h2>
          <p className="mt-2" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Currently caring for {listingCount} {listingCount === 1 ? "animal" : "animals"} available for adoption on Tinies.
          </p>
          {org.listings.length === 0 ? (
            <p className="mt-8 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}>
              No listings are live right now. Check back soon or explore other rescues on our{" "}
              <Link href="/adopt" className="font-medium underline" style={{ color: "var(--color-primary)" }}>
                adopt page
              </Link>
              .
            </p>
          ) : (
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {org.listings.map((listing) => {
                const photo = listing.photos[0];
                const speciesLabel = formatLabel(listing.species) || "Pet";
                const sexLabel = formatLabel(listing.sex);
                return (
                  <article
                    key={listing.slug}
                    className="group rounded-[var(--radius-lg)] border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
                    style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}
                  >
                    <Link href={`/adopt/${listing.slug}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-t-[var(--radius-lg)]">
                      <div
                        className="relative h-40 overflow-hidden rounded-t-[var(--radius-lg)] border-b group-hover:bg-[var(--color-primary-50)]"
                        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}
                      >
                        {photo ? (
                          <Image
                            src={photo}
                            alt={`${listing.name}, ${speciesLabel}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center" aria-hidden>
                            <PawPrint className="h-16 w-16" style={{ color: "var(--color-primary-300)" }} strokeWidth={1.25} />
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-8" style={{ padding: "var(--space-card)" }}>
                      <Link href={`/adopt/${listing.slug}`}>
                        <h3 className="font-semibold hover:underline" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                          {listing.name}
                        </h3>
                      </Link>
                      <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                        {speciesLabel}
                        {listing.breed ? ` · ${listing.breed}` : ""}
                      </p>
                      <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                        {listing.estimatedAge ?? "Age TBC"}
                        {sexLabel ? ` · ${sexLabel}` : ""}
                      </p>
                      <Link
                        href={`/adopt/${listing.slug}`}
                        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] px-4 font-semibold text-white transition-opacity group-hover:opacity-90"
                        style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", backgroundColor: "var(--color-secondary)" }}
                      >
                        <Heart className="h-4 w-4" aria-hidden />
                        View profile
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section
          className="mt-16 rounded-[var(--radius-xl)] border p-8 sm:p-10"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            boxShadow: "var(--shadow-md)",
          }}
          aria-labelledby="support-heading"
        >
          <h2
            id="support-heading"
            className="font-normal"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
          >
            Support this organisation
          </h2>
          <p className="mt-3 max-w-2xl" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Tinies Giving helps donors support verified animal charities. Your gift helps rescues feed, treat, and rehome animals.
          </p>
          <Link
            href="/giving"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-[var(--radius-pill)] px-8 font-semibold text-white transition-opacity hover:opacity-90"
            style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-primary)" }}
          >
            Donate
          </Link>
        </section>
      </main>
    </div>
  );
}
