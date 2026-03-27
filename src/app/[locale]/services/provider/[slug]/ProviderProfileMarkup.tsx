import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import {
  BadgeCheck,
  Calendar,
  Check,
  Clock,
  MapPin,
  MessageCircle,
  Repeat2,
  ShieldCheck,
  Star,
} from "lucide-react";
import type {
  ProviderForBooking,
  ProviderReviewPublic,
} from "@/app/[locale]/services/book/booking-action-types";
import type { FavoriteViewerKind } from "@/lib/providers/favorite-actions-types";
import { ProviderLocationMap } from "@/components/maps";
import { HOLIDAY_LABELS } from "@/lib/constants/holidays";
import { ProviderFavoriteButton } from "@/components/providers/ProviderFavoriteButton";
import { ProviderCertificationsSection } from "@/components/providers/ProviderCertificationsSection";
import { ProviderVideoIntro } from "@/components/providers/ProviderVideoIntro";
import { MeetAndGreetRequestModal } from "./MeetAndGreetRequestModal";
import { ProviderProfilePageReviews } from "./ProviderProfilePageReviews";
import { ProviderProfileSharePanel } from "./ProviderProfileSharePanel";
import { ProviderGalleryClient } from "./ProviderGalleryClient";
import { ProviderAboutAccordion, type AboutAccordionSection } from "./ProviderAboutAccordion";
import type { ResolvedListingVideo } from "@/lib/adoption/listing-video";
import type { ProviderImpactStats } from "./get-provider-impact-stats";

const SERVICE_TYPE_LABELS: Record<string, string> = {
  walking: "Dog Walking",
  sitting: "Pet Sitting",
  boarding: "Overnight Boarding",
  drop_in: "Drop-in visit",
  daycare: "Daycare",
};

const PRICE_UNIT_LABELS: Record<string, string> = {
  per_walk: "per walk",
  per_hour: "per hour",
  per_day: "per day",
  per_visit: "per visit",
  per_night: "per night",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const SLOTS = ["Morning", "Afternoon", "Evening"] as const;

const HOME_INNER = "mx-auto w-full max-w-[1280px] px-6";
const BORDER_TEAL_15 = "rgba(10, 128, 128, 0.15)";
const CARD_SHADOW = "0 2px 8px rgba(10, 128, 128, 0.06)";

function formatEur(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

function formatMemberSinceLabel(value: Date | string | number): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function ContentCard({
  children,
  className = "",
  style,
  noPadding,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  noPadding?: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] border bg-white ${noPadding ? "overflow-hidden p-0" : "p-6"} ${className}`}
      style={{ borderColor: BORDER_TEAL_15, boxShadow: CARD_SHADOW, ...style }}
    >
      {children}
    </div>
  );
}

function TrustSignalRow({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: "rgba(10, 128, 128, 0.08)" }}
      >
        {icon}
      </div>
      <span className="text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
        {label}
      </span>
    </div>
  );
}

function buildAvailabilityGrid(av: Record<string, boolean> | null) {
  return DAYS.map((day) => ({
    day,
    morning: av?.[`${day}-Morning`] ?? false,
    afternoon: av?.[`${day}-Afternoon`] ?? false,
    evening: av?.[`${day}-Evening`] ?? false,
  }));
}

function responseTimePillLabel(
  minutes: number | null | undefined,
  completedBookings: number,
  reviewCount: number
): string {
  if (minutes != null && Number.isFinite(minutes)) {
    if (minutes < 60) return `Usually responds within ${minutes} minutes`;
    const h = Math.round(minutes / 60);
    return `Usually responds within ${h} hour${h === 1 ? "" : "s"}`;
  }
  if (completedBookings === 0 && reviewCount === 0) return "New provider";
  return "Responds quickly";
}

function formatCertSidebarDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function buildAboutSections(provider: ProviderForBooking | null): {
  sections: AboutAccordionSection[];
  defaultOpenId: string;
} {
  if (!provider) return { sections: [], defaultOpenId: "" };
  const sections: AboutAccordionSection[] = [];

  const aboutBits: string[] = [];
  if (provider.bio?.trim()) aboutBits.push(provider.bio.trim());
  if (provider.emergencyProtocol?.trim()) aboutBits.push(`Emergencies: ${provider.emergencyProtocol.trim()}`);
  if (provider.insuranceDetails?.trim()) aboutBits.push(`Insurance: ${provider.insuranceDetails.trim()}`);
  if (aboutBits.length) sections.push({ id: "about", title: "About me", body: aboutBits.join("\n\n") });

  const petExp: string[] = [];
  if (provider.whyIDoThis?.trim()) petExp.push(provider.whyIDoThis.trim());
  if (provider.experienceTags?.length) petExp.push(`Experience: ${provider.experienceTags.join(", ")}`);
  if (provider.qualifications?.length) {
    petExp.push(
      provider.qualifications
        .map((q) => {
          const meta = [q.issuer, q.year].filter(Boolean).join(" · ");
          const head = meta ? `${q.title} — ${meta}` : q.title;
          return q.description ? `${head}\n${q.description}` : head;
        })
        .join("\n\n")
    );
  }
  if (provider.previousExperience?.trim()) petExp.push(provider.previousExperience.trim());
  if (provider.acceptedBreeds.length) petExp.push(`Breed experience: ${provider.acceptedBreeds.join(", ")}`);
  if (provider.notAccepted.length) petExp.push(`Not accepted: ${provider.notAccepted.join(", ")}`);
  if (petExp.length) sections.push({ id: "pet-exp", title: "My experience with pets", body: petExp.join("\n\n") });

  if (provider.typicalDay?.trim()) {
    sections.push({
      id: "typical",
      title: "What a typical booking looks like",
      body: provider.typicalDay.trim(),
    });
  }

  const homeBits: string[] = [];
  if (provider.homeDescription?.trim()) homeBits.push(provider.homeDescription.trim());
  if (provider.childrenInHome?.trim()) homeBits.push(`Children in home: ${provider.childrenInHome}`);
  if (provider.dogsOnFurniture != null) homeBits.push(`Pets on furniture: ${provider.dogsOnFurniture ? "Yes" : "No"}`);
  if (provider.pottyBreakFrequency?.trim()) homeBits.push(`Potty breaks: ${provider.pottyBreakFrequency}`);
  if (homeBits.length) sections.push({ id: "home", title: "My home setup", body: homeBits.join("\n\n") });

  if (provider.infoWantedAboutPet?.trim()) {
    sections.push({
      id: "about-pet",
      title: "What I\u2019d like to know about your pet",
      body: provider.infoWantedAboutPet.trim(),
    });
  }

  const defaultOpenId = sections.find((s) => s.id === "about")?.id ?? sections[0]?.id ?? "";
  return { sections, defaultOpenId };
}

export type ProviderProfileMarkupProps = {
  jsonLd: Record<string, unknown>;
  slug: string;
  name: string;
  provider: ProviderForBooking | null;
  galleryUrls: string[];
  initials: string;
  districtLabel: string;
  videoResolved: ResolvedListingVideo | null;
  featuredReviewId: string | null;
  reviews: ProviderReviewPublic[];
  avgRating: number | null;
  reviewCount: number;
  messageHref: string;
  favorited: boolean;
  favoriteViewerKind: FavoriteViewerKind;
  profileUrl: string;
  rrLabel: string | null;
  impactStats: ProviderImpactStats | null;
};

const cardTitleClass = "text-[1.125rem] font-bold";
const cardBodyClass = "text-[0.9375rem] leading-[1.7]";
const cardBodyStyle = { fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.7)" } as const;

export function ProviderProfileMarkup({
  jsonLd,
  slug,
  name,
  provider,
  galleryUrls,
  initials,
  districtLabel,
  videoResolved,
  featuredReviewId,
  reviews,
  avgRating,
  reviewCount,
  messageHref,
  favorited,
  favoriteViewerKind,
  profileUrl,
  rrLabel,
  impactStats,
}: ProviderProfileMarkupProps) {
  const availabilityGrid = buildAvailabilityGrid(provider?.availability ?? null);
  const firstName = name.trim().split(/\s+/)[0] || name;
  const { sections: aboutSections, defaultOpenId: aboutDefaultOpenId } = buildAboutSections(provider);
  const responsePill = responseTimePillLabel(
    provider?.responseTimeMinutes ?? null,
    provider?.completedBookingsCount ?? 0,
    reviewCount
  );
  const repeatClientsDisplay = impactStats?.repeatClientsCount ?? provider?.repeatClientCount ?? 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-text)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className={`${HOME_INNER} pb-16 pt-0`}>
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start lg:gap-8">
          <div className="min-w-0 space-y-8">
            <div className="pt-5 pb-2">
              <Link
                href="/services/search"
                className="inline-flex items-center gap-2 text-[0.8125rem] font-semibold hover:underline"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-primary)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Back to search
              </Link>
            </div>

            <ContentCard className="overflow-hidden p-0" noPadding>
              <ProviderGalleryClient images={galleryUrls} initials={initials} />
              <div className="px-7 pb-7 pt-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h1
                    className="uppercase"
                    style={{
                      fontFamily: "var(--font-display), sans-serif",
                      fontWeight: 900,
                      fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                      color: "var(--color-text)",
                      lineHeight: 1.05,
                    }}
                  >
                    {name}
                  </h1>
                  {provider?.verified ? (
                    <span
                      className="inline-flex items-center rounded-full px-3 py-1 text-[0.75rem] font-semibold"
                      style={{
                        fontFamily: "var(--font-body)",
                        backgroundColor: "rgba(10, 128, 128, 0.08)",
                        color: "var(--color-primary)",
                      }}
                    >
                      ✓ Verified
                    </span>
                  ) : null}
                </div>
                {provider?.headline?.trim() ? (
                  <p className="mt-3 text-base" style={{ fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.7)" }}>
                    {provider.headline.trim()}
                  </p>
                ) : null}

                <div
                  className="mt-4 flex flex-wrap gap-5 text-[0.875rem]"
                  style={{ fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.7)" }}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-base leading-none" style={{ color: "#F59E0B" }} aria-hidden>
                      ★
                    </span>
                    {avgRating != null
                      ? `${Number(avgRating.toFixed(1))} · ${reviewCount} reviews`
                      : reviewCount > 0
                        ? `${reviewCount} reviews`
                        : "No reviews yet"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                    {districtLabel}
                    {provider?.serviceAreaRadiusKm != null ? ` · ~${provider.serviceAreaRadiusKm} km radius` : ""}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 shrink-0" aria-hidden />
                    Member since {formatMemberSinceLabel(provider?.memberSince ?? new Date())}
                  </span>
                </div>

                <div
                  className="mt-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.75rem] font-semibold"
                  style={{
                    fontFamily: "var(--font-body)",
                    backgroundColor: "rgba(10, 128, 128, 0.06)",
                    color: "var(--color-primary)",
                  }}
                >
                  <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {responsePill}
                </div>

                {provider?.backgroundCheckPassed ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        fontFamily: "var(--font-body)",
                        borderColor: BORDER_TEAL_15,
                        color: "var(--color-text)",
                      }}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" style={{ color: "var(--color-primary)" }} aria-hidden />
                      Background check
                    </span>
                  </div>
                ) : null}

                {provider?.languages && provider.languages.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {provider.languages.map((lang) => (
                      <span
                        key={lang}
                        className="rounded-full border px-3 py-1 text-xs font-medium"
                        style={{ borderColor: BORDER_TEAL_15, color: "rgba(28,28,28,0.7)" }}
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                ) : null}

                {provider && provider.confirmedHolidays.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {provider.confirmedHolidays.map((id) => (
                      <span
                        key={id}
                        className="rounded-full border px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          borderColor: "var(--color-primary-200)",
                          backgroundColor: "var(--color-primary-50)",
                          color: "var(--color-primary)",
                        }}
                      >
                        Available for {HOLIDAY_LABELS[id] ?? id}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-2.5">
                  <Link
                    href={`/services/book/${slug}`}
                    className="inline-flex items-center justify-center rounded-full px-6 py-3 text-[0.875rem] font-semibold text-white transition-opacity hover:opacity-90"
                    style={{
                      fontFamily: "var(--font-body)",
                      backgroundColor: "var(--color-secondary)",
                    }}
                  >
                    Book now
                  </Link>
                  {provider ? (
                    <MeetAndGreetRequestModal providerSlug={slug} providerName={name} variant="editorial" />
                  ) : null}
                  <Link
                    href={messageHref}
                    className="inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-[0.875rem] font-semibold transition-opacity hover:opacity-90"
                    style={{
                      fontFamily: "var(--font-body)",
                      borderColor: BORDER_TEAL_15,
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text)",
                    }}
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden />
                    Message
                  </Link>
                  {provider ? (
                    <div className="inline-flex shrink-0 [&_a]:flex [&_a]:h-[46px] [&_a]:w-[46px] [&_a]:items-center [&_a]:justify-center [&_a]:rounded-full [&_a]:border [&_a]:border-[rgba(10,128,128,0.15)] [&_button]:flex [&_button]:h-[46px] [&_button]:w-[46px] [&_button]:items-center [&_button]:justify-center [&_button]:rounded-full [&_button]:border [&_button]:border-[rgba(10,128,128,0.15)]">
                      <Suspense fallback={null}>
                        <ProviderFavoriteButton
                          providerUserId={provider.providerId}
                          initialFavorited={favorited}
                          viewerKind={favoriteViewerKind}
                          loginReturnPath={`/services/provider/${slug}`}
                          size="lg"
                        />
                      </Suspense>
                    </div>
                  ) : null}
                </div>
              </div>
            </ContentCard>

            {impactStats ? (
              <div
                className="rounded-[20px] px-7 py-5 text-white"
                style={{
                  background: "linear-gradient(135deg, var(--color-primary) 0%, #0B9494 100%)",
                  boxShadow: CARD_SHADOW,
                }}
              >
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-0">
                  {[
                    { v: impactStats.completedBookingsCount.toLocaleString("en-GB"), l: "Bookings completed" },
                    { v: repeatClientsDisplay.toLocaleString("en-GB"), l: "Repeat clients" },
                    { v: formatEur(impactStats.totalEarnedCents), l: "Total earned" },
                    { v: formatEur(impactStats.rescueFundedCents), l: "Rescue funded" },
                  ].map((stat, i) => (
                    <div
                      key={stat.l}
                      className={`min-w-0 px-2 text-center lg:px-4 ${i > 0 ? "lg:border-l" : ""}`}
                      style={i > 0 ? { borderColor: "rgba(255,255,255,0.2)" } : undefined}
                    >
                      <p className="text-[1.25rem] font-extrabold leading-tight" style={{ fontFamily: "var(--font-body)" }}>
                        {stat.v}
                      </p>
                      <p
                        className="mt-1 text-[0.6875rem] font-medium uppercase tracking-wide"
                        style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-body)" }}
                      >
                        {stat.l}
                      </p>
                    </div>
                  ))}
                </div>
                <p
                  className="mt-5 text-center text-[0.6875rem]"
                  style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-body)" }}
                >
                  Every booking through Tinies funds rescue animal care across Cyprus.
                </p>
              </div>
            ) : null}

            {videoResolved && provider ? (
              <ContentCard className="[&_section]:mt-0">
                <ProviderVideoIntro providerName={name} video={videoResolved} />
              </ContentCard>
            ) : null}

            {aboutSections.length > 0 ? (
              <ContentCard>
                <h2 className={`${cardTitleClass} mb-4`} style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
                  About {firstName}
                </h2>
                <ProviderAboutAccordion sections={aboutSections} defaultOpenId={aboutDefaultOpenId} />
              </ContentCard>
            ) : null}

            {(provider?.homeType != null ||
              provider?.hasYard != null ||
              provider?.smokingHome != null ||
              (provider?.petsInHome != null && provider.petsInHome.trim() !== "")) && (
              <ContentCard>
                <section aria-labelledby="env-heading">
                  <h2 id="env-heading" className={`${cardTitleClass} mb-4`} style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
                    Home &amp; environment
                  </h2>
                  <div
                    className="grid gap-3"
                    style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}
                  >
                    {provider?.homeType ? (
                      <div className="rounded-xl p-3.5" style={{ backgroundColor: "var(--color-primary-50)" }}>
                        <p
                          className="text-[0.6875rem] font-bold uppercase tracking-[0.06em]"
                          style={{ color: "rgba(28,28,28,0.5)" }}
                        >
                          Home type
                        </p>
                        <p className="mt-1.5 text-[0.875rem] font-semibold" style={{ color: "var(--color-text)" }}>
                          {provider.homeType === "house" ? "House" : provider.homeType === "apartment" ? "Apartment" : provider.homeType}
                        </p>
                      </div>
                    ) : null}
                    {provider?.hasYard != null ? (
                      <div className="rounded-xl p-3.5" style={{ backgroundColor: "var(--color-primary-50)" }}>
                        <p
                          className="text-[0.6875rem] font-bold uppercase tracking-[0.06em]"
                          style={{ color: "rgba(28,28,28,0.5)" }}
                        >
                          Yard
                        </p>
                        <p className="mt-1.5 text-[0.875rem] font-semibold" style={{ color: "var(--color-text)" }}>
                          {provider.hasYard ? (provider.yardFenced ? "Yes, fenced" : "Yes") : "No"}
                        </p>
                      </div>
                    ) : null}
                    {provider?.smokingHome != null ? (
                      <div className="rounded-xl p-3.5" style={{ backgroundColor: "var(--color-primary-50)" }}>
                        <p
                          className="text-[0.6875rem] font-bold uppercase tracking-[0.06em]"
                          style={{ color: "rgba(28,28,28,0.5)" }}
                        >
                          Smoking
                        </p>
                        <p className="mt-1.5 text-[0.875rem] font-semibold" style={{ color: "var(--color-text)" }}>
                          {provider.smokingHome ? "Yes" : "No"}
                        </p>
                      </div>
                    ) : null}
                    {provider?.petsInHome?.trim() ? (
                      <div className="rounded-xl p-3.5" style={{ backgroundColor: "var(--color-primary-50)" }}>
                        <p
                          className="text-[0.6875rem] font-bold uppercase tracking-[0.06em]"
                          style={{ color: "rgba(28,28,28,0.5)" }}
                        >
                          Other pets
                        </p>
                        <p className="mt-1.5 text-[0.875rem] font-semibold" style={{ color: "var(--color-text)" }}>
                          {provider.petsInHome}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </section>
              </ContentCard>
            )}

            <ContentCard noPadding className="overflow-hidden">
              <h2
                id="pricing-heading"
                className={`${cardTitleClass} border-b px-6 pb-0 pt-5`}
                style={{ fontFamily: "var(--font-body)", color: "var(--color-text)", borderColor: BORDER_TEAL_15 }}
              >
                Services &amp; pricing
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[360px] text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "var(--color-primary-50)", borderBottom: `1px solid ${BORDER_TEAL_15}` }}>
                      {["Service", "Base price", "Extra pet", "Unit", "Max pets"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3.5 text-left text-[0.75rem] font-bold uppercase"
                          style={{ color: "rgba(28,28,28,0.5)", fontFamily: "var(--font-body)" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {provider?.services?.length ? (
                      provider.services.map((s) => (
                        <tr key={s.type} style={{ borderBottom: `1px solid ${BORDER_TEAL_15}` }}>
                          <td className="px-4 py-3.5 font-semibold" style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
                            {SERVICE_TYPE_LABELS[s.type] ?? s.type}
                          </td>
                          <td className="px-4 py-3.5 font-bold" style={{ color: "var(--color-primary)", fontFamily: "var(--font-body)" }}>
                            {formatEur(s.base_price ?? 0)}
                          </td>
                          <td className="px-4 py-3.5" style={{ color: "rgba(28,28,28,0.7)", fontFamily: "var(--font-body)" }}>
                            {formatEur(s.additional_pet_price ?? 0)}
                          </td>
                          <td className="px-4 py-3.5" style={{ color: "rgba(28,28,28,0.7)", fontFamily: "var(--font-body)" }}>
                            {PRICE_UNIT_LABELS[s.price_unit] ?? s.price_unit}
                          </td>
                          <td className="px-4 py-3.5" style={{ color: "rgba(28,28,28,0.5)", fontFamily: "var(--font-body)" }}>
                            {s.max_pets ?? "—"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr style={{ borderBottom: `1px solid ${BORDER_TEAL_15}` }}>
                        <td colSpan={5} className="px-4 py-3.5" style={{ color: "rgba(28,28,28,0.7)" }}>
                          No services listed.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ContentCard>

            <ContentCard noPadding className="overflow-hidden">
              <div className="border-b px-6 pb-4 pt-5" style={{ borderColor: BORDER_TEAL_15 }}>
                <h2 id="avail-heading" className={cardTitleClass} style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
                  Availability
                </h2>
                <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.5)" }}>
                  Typical weekly schedule
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[320px] text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "var(--color-primary-50)", borderBottom: `1px solid ${BORDER_TEAL_15}` }}>
                      <th className="px-4 py-3.5 text-left" />
                      {availabilityGrid.map((r) => (
                        <th
                          key={r.day}
                          className="px-4 py-3.5 text-center text-[0.75rem] font-bold uppercase"
                          style={{ color: "rgba(28,28,28,0.5)", fontFamily: "var(--font-body)" }}
                        >
                          {r.day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SLOTS.map((slot) => (
                      <tr key={slot} style={{ borderBottom: `1px solid ${BORDER_TEAL_15}` }}>
                        <td
                          className="px-4 py-3.5 text-[0.75rem] font-bold capitalize"
                          style={{ color: "rgba(28,28,28,0.5)", fontFamily: "var(--font-body)" }}
                        >
                          {slot}
                        </td>
                        {availabilityGrid.map((r) => {
                          const on = r[slot.toLowerCase() as "morning" | "afternoon" | "evening"];
                          return (
                            <td key={`${r.day}-${slot}`} className="px-4 py-3.5 text-center">
                              {on ? (
                                <span
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-full"
                                  style={{ backgroundColor: "rgba(10, 128, 128, 0.1)", color: "var(--color-primary)" }}
                                >
                                  <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                                </span>
                              ) : (
                                <span style={{ color: "rgba(28,28,28,0.5)" }}>—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ContentCard>

            <ContentCard>
              <section aria-labelledby="reviews-heading">
                <ProviderProfilePageReviews
                  reviews={reviews}
                  featuredId={featuredReviewId}
                  avgRating={avgRating}
                  reviewCount={reviewCount}
                />
              </section>
            </ContentCard>

            {provider?.serviceAreaLat != null && provider?.serviceAreaLng != null && provider?.serviceAreaRadiusKm != null && (
              <ContentCard className="overflow-hidden p-0" noPadding>
                <div className="border-b px-6 pb-4 pt-5" style={{ borderColor: BORDER_TEAL_15 }}>
                  <h2 id="loc-heading" className={cardTitleClass} style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
                    Service area
                  </h2>
                  <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.5)" }}>
                    Approximate coverage
                  </p>
                </div>
                <ProviderLocationMap
                  lat={provider.serviceAreaLat}
                  lng={provider.serviceAreaLng}
                  radiusKm={provider.serviceAreaRadiusKm}
                  className="min-h-[280px]"
                />
              </ContentCard>
            )}

            {provider && provider.certifications.length > 0 ? (
              <ContentCard className="[&_section]:mt-0 [&_h2]:text-[1.125rem]">
                <ProviderCertificationsSection certifications={provider.certifications} />
              </ContentCard>
            ) : null}
          </div>

          <aside className="flex flex-col gap-5 lg:sticky lg:top-20">
            <div
              className="rounded-[20px] border-2 bg-white p-6"
              style={{ borderColor: "var(--color-primary)", boxShadow: CARD_SHADOW }}
            >
              <h3 className="text-base font-bold" style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
                Ready to book?
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.7)" }}>
                Secure checkout on Tinies. {name} will confirm your request.
              </p>
              <Link
                href={`/services/book/${slug}`}
                className="mt-4 flex w-full items-center justify-center rounded-full py-3 text-[0.9375rem] font-bold text-white transition-opacity hover:opacity-90"
                style={{
                  fontFamily: "var(--font-body)",
                  backgroundColor: "var(--color-secondary)",
                  boxShadow: "0 4px 16px rgba(10, 128, 128, 0.08)",
                }}
              >
                Book now
              </Link>
              {provider ? (
                <div className="mt-3 w-full">
                  <MeetAndGreetRequestModal
                    providerSlug={slug}
                    providerName={name}
                    variant="editorial"
                    className="w-full justify-center"
                  />
                </div>
              ) : null}
            </div>

            <ContentCard>
              <p
                className="text-[0.8125rem] font-bold uppercase tracking-[0.06em]"
                style={{ fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.5)" }}
              >
                Trust &amp; credentials
              </p>
              <div className="mt-4 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: "rgba(10, 128, 128, 0.08)" }}
                  >
                    <BadgeCheck className="h-4 w-4" style={{ color: "var(--color-primary)" }} aria-hidden />
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: provider?.verified ? "var(--color-primary)" : "var(--color-text)",
                    }}
                  >
                    {provider?.verified ? "Verified identity" : "Identity not verified"}
                  </span>
                </div>
                {provider?.backgroundCheckPassed ? (
                  <TrustSignalRow
                    icon={<ShieldCheck className="h-4 w-4" style={{ color: "var(--color-primary)" }} aria-hidden />}
                    label="Background check passed"
                  />
                ) : null}
                <TrustSignalRow
                  icon={<Calendar className="h-4 w-4" style={{ color: "var(--color-primary)" }} aria-hidden />}
                  label={`Member since ${formatMemberSinceLabel(provider?.memberSince ?? new Date())}`}
                />
                <TrustSignalRow
                  icon={<Clock className="h-4 w-4" style={{ color: "var(--color-primary)" }} aria-hidden />}
                  label={responsePill}
                />
                <TrustSignalRow
                  icon={<MessageCircle className="h-4 w-4" style={{ color: "var(--color-primary)" }} aria-hidden />}
                  label={rrLabel ?? "Response rate not shown"}
                />
                <TrustSignalRow
                  icon={<Star className="h-4 w-4" style={{ color: "var(--color-primary)" }} aria-hidden />}
                  label={`${(provider?.completedBookingsCount ?? 0).toLocaleString("en-GB")} completed bookings`}
                />
                <TrustSignalRow
                  icon={<Repeat2 className="h-4 w-4" style={{ color: "var(--color-primary)" }} aria-hidden />}
                  label={`${repeatClientsDisplay.toLocaleString("en-GB")} repeat clients`}
                />
              </div>

              {provider && provider.certifications.length > 0 ? (
                <div className="mt-4 border-t pt-4" style={{ borderColor: BORDER_TEAL_15 }}>
                  <p
                    className="text-[0.75rem] font-bold uppercase tracking-[0.06em]"
                    style={{ fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.5)" }}
                  >
                    Certifications
                  </p>
                  <ul className="mt-3 flex flex-col gap-2">
                    {provider.certifications.map((c) => (
                      <li
                        key={`${c.courseSlug}-${c.completedAt.toISOString()}`}
                        className="flex gap-3 rounded-xl border px-3.5 py-3"
                        style={{
                          borderColor: BORDER_TEAL_15,
                          backgroundColor: "var(--color-primary-50)",
                        }}
                      >
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
                          style={{ backgroundColor: "var(--color-primary)" }}
                          aria-hidden
                        >
                          <Check className="h-5 w-5 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[0.8125rem] font-semibold" style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
                            {c.badgeLabel}
                          </p>
                          <p className="mt-0.5 text-[0.6875rem]" style={{ fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.5)" }}>
                            {c.courseTitle} · {c.score}% · {formatCertSidebarDate(c.completedAt)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </ContentCard>

            <ProviderProfileSharePanel shareUrl={profileUrl} shareTitle={`Book ${name} on Tinies`} />

            <div
              className="rounded-2xl border p-5 text-center"
              style={{
                borderColor: BORDER_TEAL_15,
                background: "linear-gradient(135deg, rgba(244,93,72,0.08) 0%, rgba(10,128,128,0.06) 100%)",
              }}
            >
              <p className="text-[0.8125rem] font-bold" style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
                Every booking helps rescue animals
              </p>
              <p className="mt-2 text-xs leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.7)" }}>
                About 90% of Tinies commission supports rescue care and transparency through Tinies Giving.
              </p>
              <Link
                href="/giving"
                className="mt-3 inline-flex items-center gap-1 text-[0.8125rem] font-bold hover:underline"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-secondary)" }}
              >
                Learn more →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
