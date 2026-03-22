import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  Facebook,
  HandHeart,
  Heart,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import { AdoptionListingCard } from "@/components/adoption/AdoptionListingCard";
import { RescueOrgShareRow } from "@/components/rescue/RescueOrgShareRow";
import { getOrgDonationSummary, getOrgRecentDonations } from "@/lib/giving/org-donation-actions";
import { resolveListingVideoUrl } from "@/lib/adoption/listing-video";
import type { AdoptBrowseListing } from "@/lib/adoption/available-listings";
import {
  getPublicRescueOrgBySlug,
  normalizeExternalUrl,
} from "@/lib/rescue/public-profile";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function formatEur(cents: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function locationLine(org: {
  district: string | null;
  location: string | null;
}): string | null {
  const parts = [org.district, org.location].filter((p): p is string => Boolean(p?.trim()));
  if (parts.length === 0) return null;
  return [...new Set(parts)].join(" · ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const org = await getPublicRescueOrgBySlug(slug);
  if (!org) {
    return { title: "Rescue organisation | Tinies" };
  }
  const title = `${org.name} | Tinies`;
  const desc =
    org.description?.trim() ||
    org.mission?.trim() ||
    `Verified rescue organisation on Tinies${org.location ? ` — ${org.location}` : ""}.`;
  const url = `${BASE_URL}/rescue/${slug}`;
  const ogImage = org.coverPhotoUrl ?? org.logoUrl;
  return {
    title,
    description: desc.slice(0, 160),
    openGraph: {
      title,
      description: desc.slice(0, 200),
      url,
      siteName: "Tinies",
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description: desc.slice(0, 200) },
  };
}

export default async function PublicRescueOrgPage({ params }: Props) {
  const { slug } = await params;
  const org = await getPublicRescueOrgBySlug(slug);
  if (!org) notFound();

  const [donationSummary, recentDonations] = await Promise.all([
    getOrgDonationSummary(org.id),
    getOrgRecentDonations(org.id, 5),
  ]);

  const fb = normalizeExternalUrl(org.socialLinks.facebook);
  const ig = normalizeExternalUrl(org.socialLinks.instagram);
  const sameAs = [org.websiteHref, fb, ig].filter(Boolean) as string[];

  const aboutBody = org.description?.trim() || org.mission?.trim() || null;
  const tagline = org.mission?.trim() || null;
  const loc = locationLine(org);
  const year = new Date().getFullYear();
  const yearsOperating =
    org.foundedYear != null ? Math.max(0, year - org.foundedYear) : null;
  const adoptedCount = org.totalAnimalsAdopted ?? org.completedPlacementsCount;
  const donateHref = org.charityGiveSlug ? `/giving/${org.charityGiveSlug}` : "/giving";
  const seeAllAdoptHref = `/adopt?rescue=${encodeURIComponent(org.slug)}`;

  const browseListings: AdoptBrowseListing[] = org.listings.map((l) => ({
    ...l,
    org: {
      name: org.name,
      slug: org.slug,
      location: org.location,
      verified: true,
    },
  }));
  const previewListings = browseListings.slice(0, 8);

  const facilityGallery = org.facilityPhotos.filter(Boolean).slice(0, 10);
  const facilityHero = facilityGallery[0];
  const facilityThumbs = facilityGallery.slice(1);
  const facilityVideo = resolveListingVideoUrl(org.facilityVideoUrl);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NonprofitOrganization",
    name: org.name,
    description: aboutBody ?? tagline ?? undefined,
    url: `${BASE_URL}/rescue/${org.slug}`,
    logo: org.logoUrl ?? undefined,
    image:
      [org.coverPhotoUrl, ...facilityGallery].filter(Boolean).length > 0
        ? [org.coverPhotoUrl, ...facilityGallery].filter((x): x is string => Boolean(x))
        : undefined,
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(org.foundedYear != null
      ? { foundingDate: `${org.foundedYear}-01-01` }
      : {}),
    ...(org.contactEmail ? { email: org.contactEmail } : {}),
    ...(org.contactPhone ? { telephone: org.contactPhone } : {}),
    ...(loc
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: org.district ?? org.location ?? loc,
            addressCountry: "CY",
          },
        }
      : {}),
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

  const shareUrl = `${BASE_URL}/rescue/${org.slug}`;
  const shareTitle = `Support ${org.name} on Tinies`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero / cover */}
      <div className="relative w-full overflow-hidden">
        <div className="relative h-56 sm:h-72 md:h-80">
          {org.coverPhotoUrl ? (
            <Image
              src={org.coverPhotoUrl}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: `linear-gradient(135deg, var(--color-primary) 0%, rgba(10, 128, 128, 0.85) 45%, var(--color-secondary) 100%)`,
              }}
              aria-hidden
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" aria-hidden />
        </div>

        <div className="relative mx-auto px-4 sm:px-6" style={{ maxWidth: "var(--max-width)" }}>
          <div className="-mt-16 flex flex-col items-center gap-6 pb-10 sm:-mt-20 sm:flex-row sm:items-end sm:gap-8">
            <div
              className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 shadow-lg sm:h-36 sm:w-36"
              style={{ borderColor: "var(--color-surface)", backgroundColor: "var(--color-surface)" }}
            >
              {org.logoUrl ? (
                <Image src={org.logoUrl} alt={`${org.name} logo`} fill className="object-cover" sizes="144px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center" aria-hidden>
                  <Building2 className="h-14 w-14 sm:h-16 sm:w-16" style={{ color: "var(--color-primary)" }} strokeWidth={1.25} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 pb-1 text-center sm:pb-4 sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1
                  className="font-normal tracking-tight text-white drop-shadow-sm"
                  style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)" }}
                >
                  {org.name}
                </h1>
                <span
                  className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm"
                  style={{ fontFamily: "var(--font-body), sans-serif" }}
                >
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Verified
                </span>
              </div>
              {tagline ? (
                <p className="mt-2 max-w-2xl text-base text-white/95 drop-shadow-sm sm:text-lg" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                  {tagline}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-white/90 sm:justify-start" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                {loc ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                    {loc}
                  </span>
                ) : null}
                {org.foundedYear != null ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 shrink-0" aria-hidden />
                    Founded {org.foundedYear}
                  </span>
                ) : null}
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <Link
                  href={donateHref}
                  className="inline-flex h-12 items-center justify-center rounded-[var(--radius-pill)] px-8 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-95"
                  style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-secondary)" }}
                >
                  <HandHeart className="mr-2 h-4 w-4" aria-hidden />
                  Donate
                </Link>
                {org.websiteHref ? (
                  <a
                    href={org.websiteHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-white/50 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-opacity hover:bg-white/20"
                    style={{ fontFamily: "var(--font-body), sans-serif" }}
                  >
                    Visit website
                    <ExternalLink className="h-4 w-4" aria-hidden />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto px-4 py-12 sm:px-6 sm:py-16" style={{ maxWidth: "var(--max-width)" }}>
        <Link
          href="/adopt"
          className="text-sm font-medium hover:underline"
          style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
        >
          ← Browse adoptable animals
        </Link>

        {/* Impact metrics */}
        <section className="mt-12" aria-labelledby="impact-heading">
          <h2 id="impact-heading" className="sr-only">
            Impact at a glance
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "In our care on Tinies",
                value: String(org.listings.length),
                sub: "Available for adoption",
              },
              {
                label: "Animals adopted",
                value: String(adoptedCount),
                sub: org.totalAnimalsAdopted != null ? "As reported by the rescue" : "Completed placements on Tinies",
              },
              {
                label: "Received through Tinies",
                value: formatEur(donationSummary.totalReceivedAllTimeCents),
                sub: "Direct gifts & Giving Fund",
              },
              {
                label: "Years operating",
                value: yearsOperating != null ? String(yearsOperating) : "—",
                sub: org.foundedYear != null ? `Since ${org.foundedYear}` : "Year founded not set",
              },
            ].map((tile) => (
              <div
                key={tile.label}
                className="rounded-[var(--radius-xl)] border p-6"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                  {tile.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tabular-nums" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
                  {tile.value}
                </p>
                <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}>
                  {tile.sub}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section className="mt-16 space-y-10" aria-labelledby="about-heading">
          <h2
            id="about-heading"
            className="font-normal"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
          >
            About {org.name}
          </h2>
          {aboutBody ? (
            <p className="max-w-3xl whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              {aboutBody}
            </p>
          ) : (
            <p className="text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}>
              This rescue hasn&apos;t added a long description yet.
            </p>
          )}

          {facilityHero ? (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                Our facility
              </h3>
              <div
                className="relative mt-3 aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] border"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
              >
                <Image src={facilityHero} alt={`${org.name} facility`} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 896px" />
              </div>
              {facilityThumbs.length > 0 ? (
                <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
                  {facilityThumbs.map((src, i) => (
                    <li key={`${src}-${i}`} className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--color-border)" }}>
                      <Image src={src} alt={`${org.name}, facility photo ${i + 2}`} fill className="object-cover" sizes="(max-width: 640px) 33vw, 200px" />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {facilityVideo ? (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                Video tour
              </h3>
              <div className="mt-3 overflow-hidden rounded-[var(--radius-xl)] border" style={{ borderColor: "var(--color-border)" }}>
                {facilityVideo.kind === "youtube" ? (
                  <div className="aspect-video w-full bg-black">
                    <iframe
                      title={`Video tour — ${org.name}`}
                      src={facilityVideo.embedSrc}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <video src={facilityVideo.src} controls className="aspect-video w-full bg-black object-contain" />
                )}
              </div>
            </div>
          ) : null}

          {(org.operatingHours?.trim() || org.volunteerInfo?.trim()) && (
            <div className="grid gap-8 md:grid-cols-2">
              {org.operatingHours?.trim() ? (
                <div className="rounded-[var(--radius-lg)] border p-5" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
                  <h3 className="inline-flex items-center gap-2 text-sm font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                    <Clock className="h-4 w-4" style={{ color: "var(--color-primary)" }} aria-hidden />
                    Operating hours
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                    {org.operatingHours.trim()}
                  </p>
                </div>
              ) : null}
              {org.volunteerInfo?.trim() ? (
                <div className="rounded-[var(--radius-lg)] border p-5" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
                  <h3 className="inline-flex items-center gap-2 text-sm font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                    <Users className="h-4 w-4" style={{ color: "var(--color-primary)" }} aria-hidden />
                    Volunteering
                  </h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                    {org.volunteerInfo.trim()}
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </section>

        {/* What we need */}
        {org.donationNeeds?.trim() ? (
          <section className="mt-16" aria-labelledby="needs-heading">
            <h2 id="needs-heading" className="sr-only">
              What we need
            </h2>
            <div
              className="rounded-[var(--radius-xl)] border p-8 sm:p-10"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "rgba(10, 128, 128, 0.06)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <h3 className="font-normal" style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}>
                What we need right now
              </h3>
              <p className="mt-4 max-w-3xl whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                {org.donationNeeds.trim()}
              </p>
              <p className="mt-6 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                You can help by donating through Tinies — gifts are tracked transparently and support verified animal charities.
              </p>
              <Link
                href={donateHref}
                className="mt-6 inline-flex h-12 items-center justify-center rounded-[var(--radius-pill)] px-8 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-primary)" }}
              >
                Donate through Tinies
              </Link>
            </div>
          </section>
        ) : null}

        {/* Team */}
        {org.teamMembers.length > 0 ? (
          <section className="mt-16" aria-labelledby="team-heading">
            <h2
              id="team-heading"
              className="font-normal"
              style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
            >
              The team
            </h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {org.teamMembers.map((m, idx) => {
                const parts = m.name.trim().split(/\s+/).filter(Boolean);
                const initials =
                  parts.length >= 2
                    ? `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
                    : (parts[0]?.slice(0, 2).toUpperCase() ?? "?");
                return (
                  <li
                    key={`${m.name}-${idx}`}
                    className="rounded-[var(--radius-xl)] border p-6"
                    style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
                  >
                    <div className="flex gap-4">
                      <div
                        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border"
                        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}
                      >
                        {m.photo ? (
                          <Image src={m.photo} alt="" fill className="object-cover" sizes="64px" />
                        ) : (
                          <span
                            className="flex h-full w-full items-center justify-center text-sm font-semibold"
                            style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}
                            aria-hidden
                          >
                            {initials}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
                          {m.name}
                        </p>
                        <p className="text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}>
                          {m.role}
                        </p>
                        {m.bio ? (
                          <p className="mt-2 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                            {m.bio}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {/* Animals */}
        <section className="mt-16" id="our-animals" aria-labelledby="animals-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2
              id="animals-heading"
              className="font-normal"
              style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
            >
              Our animals
            </h2>
            {org.listings.length > 8 ? (
              <Link
                href={seeAllAdoptHref}
                className="text-sm font-semibold hover:underline"
                style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
              >
                See all {org.listings.length} animals
              </Link>
            ) : null}
          </div>
          <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Animals currently listed for adoption on Tinies.
          </p>
          {previewListings.length === 0 ? (
            <p className="mt-8 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}>
              No listings are live right now. Check back soon or explore other rescues on our{" "}
              <Link href="/adopt" className="font-medium underline" style={{ color: "var(--color-primary)" }}>
                adopt page
              </Link>
              .
            </p>
          ) : (
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {previewListings.map((listing) => (
                <AdoptionListingCard key={listing.slug} listing={listing} />
              ))}
            </div>
          )}
        </section>

        {/* Donation transparency */}
        <section className="mt-16" aria-labelledby="transparency-heading">
          <h2
            id="transparency-heading"
            className="font-normal"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
          >
            Donation transparency
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Totals include direct donations to linked charities and completed Giving Fund allocations attributed to this organisation.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-[var(--radius-lg)] border p-6" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                Total through Tinies
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
                {formatEur(donationSummary.totalReceivedAllTimeCents)}
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border p-6" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                Supporters
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
                {donationSummary.supporterCount}
              </p>
            </div>
          </div>
          {recentDonations.length > 0 ? (
            <div className="mt-8">
              <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                Recent support
              </h3>
              <ul className="mt-3 divide-y rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
                {recentDonations.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                    <span style={{ color: "var(--color-text-secondary)" }}>A supporter</span>
                    <span className="font-medium tabular-nums" style={{ color: "var(--color-text)" }}>
                      {formatEur(d.amountCents)}
                    </span>
                    <span className="w-full text-xs sm:w-auto" style={{ color: "var(--color-text-muted)" }}>
                      {d.sourceLabel} ·{" "}
                      {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d.createdAt))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <Link
            href="/giving"
            className="mt-8 inline-flex text-sm font-semibold hover:underline"
            style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
          >
            View full transparency report →
          </Link>
        </section>

        {org.howDonationsUsed ? (
          <section className="mt-14" aria-labelledby="funds-heading">
            <h2
              id="funds-heading"
              className="font-normal"
              style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
            >
              How donations are used
            </h2>
            <p className="mt-3 max-w-3xl whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              {org.howDonationsUsed}
            </p>
          </section>
        ) : null}

        {/* Contact */}
        <section className="mt-16 rounded-[var(--radius-xl)] border p-8" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", boxShadow: "var(--shadow-sm)" }} aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="font-normal" style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}>
            Contact
          </h2>
          <ul className="mt-4 space-y-3 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            {org.contactEmail ? (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />
                <a href={`mailto:${org.contactEmail}`} className="font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
                  {org.contactEmail}
                </a>
              </li>
            ) : null}
            {org.contactPhone ? (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />
                <a href={`tel:${org.contactPhone.replace(/\s+/g, "")}`} className="font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
                  {org.contactPhone}
                </a>
              </li>
            ) : null}
            {org.websiteHref ? (
              <li className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />
                <a href={org.websiteHref} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
                  Website
                </a>
              </li>
            ) : null}
            {loc ? (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />
                <span>{loc}</span>
              </li>
            ) : null}
          </ul>
          {(fb || ig) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {fb ? (
                <a
                  href={fb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] border px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                >
                  <Facebook className="h-4 w-4" aria-hidden />
                  Facebook
                </a>
              ) : null}
              {ig ? (
                <a
                  href={ig}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] border px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                >
                  <Instagram className="h-4 w-4" aria-hidden />
                  Instagram
                </a>
              ) : null}
            </div>
          )}
        </section>

        {/* Share */}
        <section className="mt-12 border-t pt-10" style={{ borderColor: "var(--color-border)" }}>
          <RescueOrgShareRow shareUrl={shareUrl} shareTitle={shareTitle} />
        </section>

        <section
          className="mt-12 rounded-[var(--radius-xl)] border p-8 text-center sm:p-10"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            boxShadow: "var(--shadow-md)",
          }}
          aria-label="Support via adoption"
        >
          <Heart className="mx-auto h-8 w-8" style={{ color: "var(--color-secondary)" }} aria-hidden />
          <p className="mt-4 text-lg" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
            Prefer to adopt?
          </p>
          <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Meet the animals in our care and apply through Tinies.
          </p>
          <Link
            href={seeAllAdoptHref}
            className="mt-6 inline-flex h-12 items-center justify-center rounded-[var(--radius-pill)] px-8 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-secondary)" }}
          >
            View adoptable animals
          </Link>
        </section>
      </main>
    </div>
  );
}
