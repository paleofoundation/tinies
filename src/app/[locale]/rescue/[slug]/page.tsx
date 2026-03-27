import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrgDonationSummary, getOrgRecentDonations } from "@/lib/giving/org-donation-actions";
import {
  getPublicRescueOrgBySlug,
  normalizeExternalUrl,
} from "@/lib/rescue/public-profile";
import { getActiveCampaignsForRescueOrg, getMemorialListingsForRescueOrg } from "@/lib/campaign/campaign-public";
import { RescueProfileShareEditorial } from "./RescueProfileShareEditorial";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const HOME_INNER = "mx-auto w-full max-w-[1280px] px-6 lg:px-10";
const BORDER_TEAL_15 = "rgba(10, 128, 128, 0.15)";

const CARD_STYLE = {
  borderRadius: 20,
  border: `1px solid ${BORDER_TEAL_15}`,
  backgroundColor: "var(--color-background)",
  padding: 24,
  boxShadow: "0 2px 8px rgba(10, 128, 128, 0.06)",
} as const;

function formatEur(cents: unknown): string {
  const n = typeof cents === "number" && Number.isFinite(cents) ? Math.max(0, Math.round(cents)) : 0;
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(n / 100);
}

function safeDonationSummary(
  raw: Awaited<ReturnType<typeof getOrgDonationSummary>> | null | undefined
): Awaited<ReturnType<typeof getOrgDonationSummary>> {
  return {
    totalReceivedDirectCents:
      typeof raw?.totalReceivedDirectCents === "number" && Number.isFinite(raw.totalReceivedDirectCents)
        ? raw.totalReceivedDirectCents
        : 0,
    totalReceivedFundPayoutsCents:
      typeof raw?.totalReceivedFundPayoutsCents === "number" && Number.isFinite(raw.totalReceivedFundPayoutsCents)
        ? raw.totalReceivedFundPayoutsCents
        : 0,
    totalReceivedAllTimeCents:
      typeof raw?.totalReceivedAllTimeCents === "number" && Number.isFinite(raw.totalReceivedAllTimeCents)
        ? raw.totalReceivedAllTimeCents
        : 0,
    thisMonthDirectCents:
      typeof raw?.thisMonthDirectCents === "number" && Number.isFinite(raw.thisMonthDirectCents)
        ? raw.thisMonthDirectCents
        : 0,
    supporterCount:
      typeof raw?.supporterCount === "number" && Number.isFinite(raw.supporterCount) ? Math.max(0, raw.supporterCount) : 0,
    pendingPayoutCents:
      typeof raw?.pendingPayoutCents === "number" && Number.isFinite(raw.pendingPayoutCents) ? raw.pendingPayoutCents : 0,
    latestDonationAt: raw?.latestDonationAt ?? null,
    charityIds: Array.isArray(raw?.charityIds) ? raw.charityIds : [],
  };
}

function locationLine(org: { district: string | null; location: string | null }): string | null {
  const parts = [org.district, org.location].filter((p): p is string => Boolean(p?.trim()));
  if (parts.length === 0) return null;
  return [...new Set(parts)].join(" · ");
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 01.75-.75h10.19l-3.72-3.72a.75.75 0 111.06-1.06l5 5a.75.75 0 010 1.06l-5 5a.75.75 0 11-1.06-1.06l3.72-3.72H3.75A.75.75 0 013 10z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const org = await getPublicRescueOrgBySlug(slug);
  if (!org) {
    return { title: "Rescue organisation" };
  }
  const title = org.name;
  const ogTitle = `${org.name} | Tinies`;
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
      title: ogTitle,
      description: desc.slice(0, 200),
      url,
      siteName: "Tinies",
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: { card: "summary_large_image", title: ogTitle, description: desc.slice(0, 200) },
  };
}

export default async function PublicRescueOrgPage({ params }: Props) {
  const { slug } = await params;
  const org = await getPublicRescueOrgBySlug(slug);
  if (!org) notFound();

  const [donationSummaryRaw, , activeCampaigns, memorialListings] = await Promise.all([
    getOrgDonationSummary(org.id).catch((e) => {
      console.error("getOrgDonationSummary", e);
      return null;
    }),
    getOrgRecentDonations(org.id, 5).catch((e) => {
      console.error("getOrgRecentDonations", e);
      return [];
    }),
    getActiveCampaignsForRescueOrg(org.id),
    getMemorialListingsForRescueOrg(org.id),
  ]);

  const donationSummary = safeDonationSummary(donationSummaryRaw);

  const fb = normalizeExternalUrl(org.socialLinks?.facebook);
  const ig = normalizeExternalUrl(org.socialLinks?.instagram);
  const sameAs = [org.websiteHref, fb, ig].filter(Boolean) as string[];

  const aboutBody = org.description?.trim() || org.mission?.trim() || null;
  const tagline = org.mission?.trim() || org.description?.trim() || null;
  const loc = locationLine(org);
  const year = new Date().getFullYear();
  const yearsOperating = org.foundedYear != null ? Math.max(0, year - org.foundedYear) : null;
  const adoptedCountRaw = org.totalAnimalsAdopted ?? org.completedPlacementsCount;
  const adoptedCount =
    typeof adoptedCountRaw === "number" && Number.isFinite(adoptedCountRaw) ? Math.max(0, Math.round(adoptedCountRaw)) : 0;
  const donateHref = org.charityGiveSlug ? `/giving/${org.charityGiveSlug}` : "/giving";
  const seeAllAdoptHref = `/adopt?rescue=${encodeURIComponent(org.slug)}`;

  const listingsSafe = Array.isArray(org.listings) ? org.listings : [];
  const previewListings = listingsSafe.slice(0, 8);
  const facilityGallery = (Array.isArray(org.facilityPhotos) ? org.facilityPhotos : []).filter(Boolean).slice(0, 10);

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
    ...(org.foundedYear != null ? { foundingDate: `${org.foundedYear}-01-01` } : {}),
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

  const shortSupportName = org.name.split(/\s+/).slice(0, 2).join(" ");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative w-full overflow-hidden" style={{ height: "clamp(280px, 35vw, 440px)" }}>
        {org.coverPhotoUrl ? (
          <Image src={org.coverPhotoUrl} alt="" fill className="object-cover" priority sizes="100vw" />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-muted-85) 45%, var(--color-secondary) 100%)`,
            }}
            aria-hidden
          />
        )}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)" }}
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-7">
          <div className={`pointer-events-auto w-full ${HOME_INNER}`}>
            <Link
              href="/rescue"
              className="mb-3 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-white/90 transition-opacity hover:opacity-100"
              style={{ fontFamily: "var(--font-body), sans-serif" }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 shrink-0" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                  clipRule="evenodd"
                />
              </svg>
              All rescue partners
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h1
                className="text-[clamp(2rem,5vw,3.5rem)] font-black uppercase leading-[0.94] tracking-[-0.04em] text-white"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                {org.name}
              </h1>
              {org.verified ? (
                <span
                  className="rounded-full px-3 py-1 text-[0.6875rem] font-semibold text-white"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(8px)",
                    fontFamily: "var(--font-body), sans-serif",
                  }}
                >
                  ✓ Verified
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <main className={`${HOME_INNER} pt-8 pb-16`}>
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1fr_380px] lg:items-start">
          <div className="flex flex-col gap-6">
            <div
              className="flex flex-wrap items-center gap-x-6 gap-y-2"
              style={{ ...CARD_STYLE, padding: "20px 24px" }}
            >
              <p
                className="min-w-0 flex-[1_1_300px] text-[0.9375rem] leading-[1.6]"
                style={{ color: "rgba(28, 28, 28, 0.7)", fontFamily: "var(--font-body), sans-serif" }}
              >
                {tagline ?? "Verified rescue organisation on Tinies."}
              </p>
              <div className="flex flex-wrap gap-2">
                {org.district?.trim() ? (
                  <span
                    className="rounded-full px-3 py-1 text-[0.8125rem] font-semibold"
                    style={{
                      backgroundColor: "rgba(10, 128, 128, 0.06)",
                      color: "var(--color-primary)",
                      fontFamily: "var(--font-body), sans-serif",
                    }}
                  >
                    {org.district.trim()}
                  </span>
                ) : null}
                {org.foundedYear != null ? (
                  <span
                    className="rounded-full px-3 py-1 text-[0.8125rem] font-semibold"
                    style={{
                      backgroundColor: "rgba(10, 128, 128, 0.06)",
                      color: "var(--color-primary)",
                      fontFamily: "var(--font-body), sans-serif",
                    }}
                  >
                    Founded {org.foundedYear}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                [String(listingsSafe.length), "In our care", "On Tinies"],
                [String(adoptedCount), "Adopted", org.totalAnimalsAdopted != null ? "As reported by the rescue" : "Through Tinies"],
                [formatEur(donationSummary.totalReceivedAllTimeCents), "Received", "Through Tinies"],
                [
                  yearsOperating != null ? `${yearsOperating} years` : "—",
                  "Years operating",
                  org.foundedYear != null ? `Since ${org.foundedYear}` : "Year founded not set",
                ],
              ].map(([val, label, sub]) => (
                <div key={label} className="text-center" style={{ ...CARD_STYLE, padding: 20 }}>
                  <div
                    className="text-2xl font-black uppercase leading-none tracking-[-0.02em]"
                    style={{ fontFamily: "var(--font-display), sans-serif", color: "var(--color-primary)" }}
                  >
                    {val}
                  </div>
                  <div className="mt-1.5 text-[0.8125rem] font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                    {label}
                  </div>
                  <div className="text-[0.6875rem]" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
                    {sub}
                  </div>
                </div>
              ))}
            </div>

            <div style={CARD_STYLE}>
              <h2 className="mb-4 text-[1.125rem] font-bold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                About {org.name}
              </h2>
              {aboutBody ? (
                <p
                  className="mb-6 text-[0.9375rem] leading-[1.8] whitespace-pre-wrap"
                  style={{ color: "rgba(28, 28, 28, 0.7)", fontFamily: "var(--font-body), sans-serif" }}
                >
                  {aboutBody}
                </p>
              ) : (
                <p className="mb-6 text-[0.9375rem]" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
                  This rescue hasn&apos;t added a long description yet.
                </p>
              )}
              {(org.operatingHours?.trim() || org.volunteerInfo?.trim()) && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {org.operatingHours?.trim() ? (
                    <div
                      className="rounded-[14px] border p-[18px]"
                      style={{
                        backgroundColor: "var(--color-primary-50)",
                        borderColor: BORDER_TEAL_15,
                      }}
                    >
                      <div
                        className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.06em]"
                        style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}
                      >
                        Operating hours
                      </div>
                      <div className="text-[0.875rem] font-medium" style={{ color: "#1C1C1C", fontFamily: "var(--font-body), sans-serif" }}>
                        {org.operatingHours.trim()}
                      </div>
                    </div>
                  ) : null}
                  {org.volunteerInfo?.trim() ? (
                    <div
                      className="rounded-[14px] border p-[18px]"
                      style={{
                        backgroundColor: "var(--color-primary-50)",
                        borderColor: BORDER_TEAL_15,
                      }}
                    >
                      <div
                        className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.06em]"
                        style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}
                      >
                        Volunteering
                      </div>
                      <div className="whitespace-pre-wrap text-[0.875rem] font-medium" style={{ color: "#1C1C1C", fontFamily: "var(--font-body), sans-serif" }}>
                        {org.volunteerInfo.trim()}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {org.donationNeeds?.trim() ? (
              <div
                style={{
                  ...CARD_STYLE,
                  background: "linear-gradient(135deg, rgba(244,93,72,0.04) 0%, rgba(10,128,128,0.04) 100%)",
                }}
              >
                <h2 className="mb-4 text-[1.125rem] font-bold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                  What we need right now
                </h2>
                <p
                  className="mb-5 text-[0.9375rem] leading-[1.8] whitespace-pre-wrap"
                  style={{ color: "rgba(28, 28, 28, 0.7)", fontFamily: "var(--font-body), sans-serif" }}
                >
                  {org.donationNeeds.trim()}
                </p>
                <p className="mb-5 text-[0.8125rem] leading-relaxed" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
                  You can help by donating through Tinies — gifts are tracked transparently and support verified animal charities.
                </p>
                <Link
                  href={donateHref}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[0.875rem] font-semibold text-white shadow-[0_2px_8px_rgba(10,128,128,0.06)] transition-opacity hover:opacity-95"
                  style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-secondary)" }}
                >
                  <HeartIcon className="h-4 w-4" />
                  Donate through Tinies
                </Link>
              </div>
            ) : null}

            {activeCampaigns.length > 0 ? (
              <div>
                <p
                  className="mb-3 text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
                  style={{ fontFamily: "var(--font-display), sans-serif", color: "var(--color-secondary)" }}
                >
                  Active campaigns
                </p>
                <h2
                  className="mb-6 text-[clamp(1.75rem,4vw,2.5rem)] font-black uppercase leading-[0.94] tracking-[-0.04em]"
                  style={{ fontFamily: "var(--font-display), sans-serif", color: "#1C1C1C" }}
                >
                  help us
                  <br />
                  <span style={{ color: "var(--color-primary)" }}>reach our goals</span>
                </h2>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {activeCampaigns.map((c) => (
                    <Link
                      key={c.id}
                      href={`/rescue/${org.slug}/campaign/${c.slug}`}
                      className="group block overflow-hidden rounded-[24px] border bg-[var(--color-background)] shadow-[0_2px_8px_rgba(10,128,128,0.06)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(10,128,128,0.08)]"
                      style={{ borderColor: BORDER_TEAL_15 }}
                    >
                      <div className="relative h-[180px] w-full overflow-hidden" style={{ backgroundColor: "var(--color-primary-50)" }}>
                        {c.coverPhotoUrl ? (
                          <Image
                            src={c.coverPhotoUrl}
                            alt=""
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        ) : null}
                      </div>
                      <div className="p-[22px]">
                        <p className="mb-2 text-base font-bold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                          {c.title}
                        </p>
                        {c.subtitle ? (
                          <p className="mb-3.5 text-[0.8125rem] leading-relaxed" style={{ color: "rgba(28, 28, 28, 0.7)", fontFamily: "var(--font-body), sans-serif" }}>
                            {c.subtitle}
                          </p>
                        ) : null}
                        <div
                          className="flex items-center justify-between gap-3 border-t pt-3 text-[0.8125rem]"
                          style={{ borderColor: BORDER_TEAL_15 }}
                        >
                          <span style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
                            {formatEur(c.raisedAmountCents)} raised · {c.donorCount} supporters
                          </span>
                          <span
                            className="inline-flex shrink-0 items-center gap-1 font-bold"
                            style={{ color: "var(--color-secondary)", fontFamily: "var(--font-body), sans-serif" }}
                          >
                            Support <ArrowIcon className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <p
                className="mb-3 text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
                style={{ fontFamily: "var(--font-display), sans-serif", color: "var(--color-primary)" }}
              >
                Our animals
              </p>
              <h2
                className="mb-6 text-[clamp(1.75rem,4vw,2.5rem)] font-black uppercase leading-[0.94] tracking-[-0.04em]"
                style={{ fontFamily: "var(--font-display), sans-serif", color: "#1C1C1C" }}
              >
                meet the
                <br />
                <span style={{ color: "var(--color-secondary)" }}>tinies</span>
              </h2>
              {previewListings.length === 0 ? (
                <p className="text-sm" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
                  No listings are live right now. Check back soon or explore other rescues on our{" "}
                  <Link href="/adopt" className="font-semibold underline" style={{ color: "var(--color-primary)" }}>
                    adopt page
                  </Link>
                  .
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {previewListings.map((listing) => {
                      const thumb = listing.photos[0];
                      const meta = [listing.breed || listing.species, listing.estimatedAge, listing.sex].filter(Boolean).join(" · ");
                      return (
                        <Link
                          key={listing.slug}
                          href={`/adopt/${listing.slug}`}
                          className="group block overflow-hidden border bg-[var(--color-background)] shadow-[0_2px_8px_rgba(10,128,128,0.06)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(10,128,128,0.08)]"
                          style={{ borderColor: BORDER_TEAL_15, borderRadius: 0 }}
                        >
                          <div className="relative h-[200px] w-full overflow-hidden bg-[var(--color-primary-50)]">
                            {thumb ? (
                              <Image
                                src={thumb}
                                alt=""
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                                sizes="(max-width: 640px) 100vw, 33vw"
                              />
                            ) : null}
                          </div>
                          <div className="p-[18px]">
                            <div
                              className="text-[1.25rem] font-black uppercase leading-tight tracking-[-0.02em]"
                              style={{ fontFamily: "var(--font-display), sans-serif", color: "#1C1C1C" }}
                            >
                              {listing.name}
                            </div>
                            {meta ? (
                              <div className="mt-1 text-[0.75rem] font-medium" style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}>
                                {meta}
                              </div>
                            ) : null}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <Link
                    href={seeAllAdoptHref}
                    className="mt-5 inline-flex items-center gap-1.5 text-[0.875rem] font-bold hover:underline"
                    style={{ color: "var(--color-secondary)", fontFamily: "var(--font-body), sans-serif" }}
                  >
                    View all adoptable animals <ArrowIcon className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>

            <div
              className="rounded-[20px] p-6 text-white"
              style={{
                backgroundColor: "var(--color-primary)",
                boxShadow: "0 2px 8px rgba(10, 128, 128, 0.06)",
              }}
            >
              <p
                className="mb-3 text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
                style={{ fontFamily: "var(--font-display), sans-serif", color: "rgba(255, 255, 255, 0.6)" }}
              >
                Donation transparency
              </p>
              <div className="mb-4 flex flex-wrap gap-8">
                <div>
                  <div
                    className="text-[2rem] font-black uppercase leading-none tracking-[-0.02em]"
                    style={{ fontFamily: "var(--font-display), sans-serif" }}
                  >
                    {formatEur(donationSummary.totalReceivedAllTimeCents)}
                  </div>
                  <div className="mt-1 text-[0.6875rem]" style={{ color: "rgba(255, 255, 255, 0.6)", fontFamily: "var(--font-body), sans-serif" }}>
                    Total through Tinies
                  </div>
                </div>
                <div>
                  <div
                    className="text-[2rem] font-black uppercase leading-none tracking-[-0.02em]"
                    style={{ fontFamily: "var(--font-display), sans-serif" }}
                  >
                    {donationSummary.supporterCount}
                  </div>
                  <div className="mt-1 text-[0.6875rem]" style={{ color: "rgba(255, 255, 255, 0.6)", fontFamily: "var(--font-body), sans-serif" }}>
                    Supporters
                  </div>
                </div>
              </div>
              <p className="text-[0.8125rem] leading-relaxed" style={{ color: "rgba(255, 255, 255, 0.7)", fontFamily: "var(--font-body), sans-serif" }}>
                Totals include direct donations and completed Giving Fund allocations attributed to this organisation.
              </p>
              <Link
                href="/giving"
                className="mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-bold hover:underline"
                style={{ color: "rgba(255, 255, 255, 0.9)", fontFamily: "var(--font-body), sans-serif" }}
              >
                View full transparency report <ArrowIcon className="h-3.5 w-3.5" />
              </Link>
            </div>

            {memorialListings.length > 0 ? (
              <div style={CARD_STYLE}>
                <p
                  className="mb-3 text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
                  style={{ fontFamily: "var(--font-display), sans-serif", color: "rgba(28, 28, 28, 0.5)" }}
                >
                  In memoriam
                </p>
                <p className="mb-5 text-[0.8125rem] leading-relaxed" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
                  Remembering the animals who left a mark on us. Their stories stay with Tinies.
                </p>
                <div className="flex flex-wrap gap-4">
                  {memorialListings.map((m) => {
                    const thumb = Array.isArray(m.photos) ? m.photos[0] : undefined;
                    return (
                      <Link key={m.slug} href={`/adopt/${m.slug}`} className="block w-[120px]" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                        <div
                          className="mb-2 h-[120px] w-[120px] overflow-hidden rounded-2xl border"
                          style={{ borderColor: BORDER_TEAL_15 }}
                        >
                          {thumb ? (
                            <Image src={thumb} alt="" width={120} height={120} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[var(--color-primary-50)] text-2xl" aria-hidden>
                              🐾
                            </div>
                          )}
                        </div>
                        <p className="text-center text-[0.875rem] font-semibold" style={{ color: "var(--color-text)" }}>
                          {m.name}
                        </p>
                        <p className="text-center text-[0.6875rem]" style={{ color: "rgba(28, 28, 28, 0.5)" }}>
                          Remember
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="flex flex-col gap-5 lg:sticky lg:top-20 lg:self-start">
            <div
              className="rounded-[20px] bg-[var(--color-background)] p-6 shadow-[0_2px_8px_rgba(10,128,128,0.06)]"
              style={{ border: "2px solid var(--color-secondary)" }}
            >
              <div className="mb-4 flex items-center gap-2">
                <HeartIcon className="h-[18px] w-[18px] shrink-0 text-[var(--color-secondary)]" />
                <p className="text-base font-bold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                  Support {shortSupportName}
                </p>
              </div>
              <p className="mb-5 text-[0.8125rem] leading-relaxed" style={{ color: "rgba(28, 28, 28, 0.7)", fontFamily: "var(--font-body), sans-serif" }}>
                Your donation goes directly to this rescue. Every euro is tracked transparently.
              </p>
              <Link
                href={donateHref}
                className="mb-2.5 flex w-full items-center justify-center rounded-full py-3.5 text-[0.9375rem] font-bold text-white transition-opacity hover:opacity-95"
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  backgroundColor: "var(--color-secondary)",
                  boxShadow: "0 4px 16px rgba(244, 93, 72, 0.2)",
                }}
              >
                Donate now
              </Link>
              <Link
                href="/giving/become-a-guardian"
                className="flex w-full items-center justify-center rounded-full border bg-[var(--color-background)] py-3 text-[0.875rem] font-semibold transition-colors hover:bg-[var(--color-primary-50)]"
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  borderColor: "var(--color-primary)",
                  color: "var(--color-primary)",
                }}
              >
                Become a Guardian
              </Link>
            </div>

            <div style={CARD_STYLE}>
              <p className="mb-2 text-[0.9375rem] font-bold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                Prefer to adopt?
              </p>
              <p className="mb-3 text-[0.8125rem] leading-relaxed" style={{ color: "rgba(28, 28, 28, 0.7)", fontFamily: "var(--font-body), sans-serif" }}>
                Meet the animals in our care and apply through Tinies.
              </p>
              <Link href={seeAllAdoptHref} className="inline-flex items-center gap-1 text-[0.875rem] font-bold hover:underline" style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}>
                View adoptable animals <ArrowIcon className="h-4 w-4" />
              </Link>
            </div>

            <div style={CARD_STYLE}>
              <p
                className="mb-3 text-[0.8125rem] font-bold uppercase tracking-[0.06em]"
                style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}
              >
                Contact
              </p>
              <ul className="space-y-2 text-sm" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                {org.contactEmail ? (
                  <li>
                    <a href={`mailto:${org.contactEmail}`} className="font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
                      {org.contactEmail}
                    </a>
                  </li>
                ) : null}
                {org.websiteHref ? (
                  <li>
                    <a
                      href={org.websiteHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:underline"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Website
                    </a>
                  </li>
                ) : null}
                {org.contactPhone ? (
                  <li>
                    <a href={`tel:${org.contactPhone.replace(/\s+/g, "")}`} className="font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
                      {org.contactPhone}
                    </a>
                  </li>
                ) : null}
                {loc ? <li style={{ color: "rgba(28, 28, 28, 0.5)" }}>{loc}</li> : null}
              </ul>
              {(fb || ig) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {fb ? (
                    <a
                      href={fb}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.8125rem] font-semibold hover:underline"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Facebook
                    </a>
                  ) : null}
                  {ig ? (
                    <a
                      href={ig}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.8125rem] font-semibold hover:underline"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Instagram
                    </a>
                  ) : null}
                </div>
              )}
            </div>

            <RescueProfileShareEditorial shareUrl={shareUrl} shareTitle={shareTitle} />

            <div
              className="rounded-2xl border p-5 text-center"
              style={{
                borderColor: BORDER_TEAL_15,
                background: "linear-gradient(135deg, rgba(244,93,72,0.08) 0%, rgba(10,128,128,0.06) 100%)",
              }}
            >
              <p className="text-[0.8125rem] font-bold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                Every booking helps
              </p>
              <p className="mt-2 text-[0.75rem] leading-relaxed" style={{ color: "rgba(28, 28, 28, 0.7)", fontFamily: "var(--font-body), sans-serif" }}>
                90% of every Tinies commission supports rescue partners like this one when you book local pet care.
              </p>
              <Link href="/services" className="mt-3 inline-flex items-center gap-1 text-[0.8125rem] font-bold hover:underline" style={{ color: "var(--color-secondary)", fontFamily: "var(--font-body), sans-serif" }}>
                Find care <ArrowIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
