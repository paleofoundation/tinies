import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import {
  BadgeCheck,
  Calendar,
  Check,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
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
import type { ResolvedListingVideo } from "@/lib/adoption/listing-video";

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

export type ProviderProfileMarkupProps = {
  jsonLd: Record<string, unknown>;
  slug: string;
  name: string;
  provider: ProviderForBooking | null;
  heroImage: string | null;
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
  respTime: string | null;
  repeatLine: string | null;
  rrLabel: string | null;
};

const cardTitleClass = "text-[1.125rem] font-bold";
const cardBodyClass = "text-[0.9375rem] leading-[1.7]";
const cardBodyStyle = { fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.7)" } as const;

export function ProviderProfileMarkup({
  jsonLd,
  slug,
  name,
  provider,
  heroImage,
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
  respTime,
  repeatLine,
  rrLabel,
}: ProviderProfileMarkupProps) {
  const availabilityGrid = buildAvailabilityGrid(provider?.availability ?? null);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-text)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className={`${HOME_INNER} pb-16 pt-0`}>
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-8">
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
              <div className="relative h-[200px] w-full sm:h-[260px] lg:h-[320px]">
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 752px"
                    priority
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center text-5xl font-bold text-white"
                    style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-primary)" }}
                    aria-hidden
                  >
                    {initials}
                  </div>
                )}
              </div>
              <div className="px-7 pb-7 pt-7">
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

                {(respTime || repeatLine) && (
                  <div className="mt-3 flex flex-wrap gap-4 text-sm" style={{ color: "rgba(28,28,28,0.5)" }}>
                    {respTime ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-4 w-4 shrink-0" aria-hidden />
                        {respTime}
                      </span>
                    ) : null}
                    {repeatLine ? (
                      <span className="inline-flex items-center gap-1">
                        <Heart className="h-4 w-4 shrink-0" aria-hidden />
                        {repeatLine}
                      </span>
                    ) : null}
                  </div>
                )}

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

                <div className="mt-6 flex flex-wrap gap-3">
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
                    <Suspense fallback={null}>
                      <ProviderFavoriteButton
                        providerUserId={provider.providerId}
                        initialFavorited={favorited}
                        viewerKind={favoriteViewerKind}
                        loginReturnPath={`/services/provider/${slug}`}
                        size="lg"
                      />
                    </Suspense>
                  ) : null}
                </div>
              </div>
            </ContentCard>

            {videoResolved && provider ? (
              <ContentCard className="[&_section]:mt-0">
                <ProviderVideoIntro providerName={name} video={videoResolved} />
              </ContentCard>
            ) : null}

            {provider?.whyIDoThis?.trim() ? (
              <ContentCard>
                <section aria-labelledby="why-heading">
                  <h2 id="why-heading" className={`${cardTitleClass} mb-4`} style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
                    Why I do this
                  </h2>
                  <p className={`${cardBodyClass} whitespace-pre-wrap`} style={cardBodyStyle}>
                    {provider.whyIDoThis.trim()}
                  </p>
                </section>
              </ContentCard>
            ) : null}

            <ContentCard>
              <section aria-labelledby="exp-heading">
                <h2 id="exp-heading" className={`${cardTitleClass} mb-4`} style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
                  Experience &amp; qualifications
                </h2>
                {provider?.experienceTags && provider.experienceTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {provider.experienceTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full px-3 py-1 text-sm font-medium capitalize"
                        style={{ backgroundColor: "rgba(10, 128, 128, 0.12)", color: "var(--color-primary)" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                {provider?.qualifications && provider.qualifications.length > 0 ? (
                  <ul className="mt-6 space-y-3">
                    {provider.qualifications.map((q, i) => (
                      <li
                        key={`${q.title}-${i}`}
                        className="rounded-xl border p-4"
                        style={{ borderColor: BORDER_TEAL_15, backgroundColor: "var(--color-primary-50)" }}
                      >
                        <p className="font-semibold" style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
                          {q.title}
                        </p>
                        <p className="mt-1 text-sm" style={{ color: "rgba(28,28,28,0.7)" }}>
                          {[q.issuer, q.year].filter(Boolean).join(" · ")}
                          {q.description ? ` — ${q.description}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {provider?.previousExperience?.trim() ? (
                  <p className={`mt-6 whitespace-pre-wrap ${cardBodyClass}`} style={cardBodyStyle}>
                    {provider.previousExperience.trim()}
                  </p>
                ) : null}

                {provider && (provider.acceptedBreeds.length > 0 || provider.notAccepted.length > 0) ? (
                  <div className="mt-8 grid gap-6 sm:grid-cols-2">
                    {provider.acceptedBreeds.length > 0 ? (
                      <div>
                        <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                          Breed experience
                        </h3>
                        <p className="mt-2 text-sm" style={{ color: "rgba(28,28,28,0.7)" }}>
                          {provider.acceptedBreeds.join(", ")}
                        </p>
                      </div>
                    ) : null}
                    {provider.notAccepted.length > 0 ? (
                      <div>
                        <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                          Not accepted
                        </h3>
                        <p className="mt-2 text-sm" style={{ color: "rgba(28,28,28,0.7)" }}>
                          {provider.notAccepted.join(", ")}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </section>
            </ContentCard>

            {(provider?.homePhotos?.length || provider?.homeDescription?.trim()) && (
              <ContentCard>
                <section aria-labelledby="home-heading">
                  <h2 id="home-heading" className={`${cardTitleClass} mb-4`} style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
                    Where your pet will stay
                  </h2>
                  {provider?.homeDescription?.trim() ? (
                    <p className={`${cardBodyClass} max-w-3xl`} style={cardBodyStyle}>
                      {provider.homeDescription.trim()}
                    </p>
                  ) : null}
                  {provider && provider.homePhotos.length > 0 ? (
                    <div className="mt-6">
                      <div className="relative aspect-[4/3] max-w-3xl overflow-hidden rounded-xl border" style={{ borderColor: BORDER_TEAL_15 }}>
                        <Image src={provider.homePhotos[0]} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 720px" />
                      </div>
                      {provider.homePhotos.length > 1 ? (
                        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
                          {provider.homePhotos.slice(1).map((src, i) => (
                            <li key={`${src}-${i}`} className="relative aspect-square overflow-hidden rounded-xl border" style={{ borderColor: BORDER_TEAL_15 }}>
                              <Image src={src} alt="" fill className="object-cover" sizes="180px" />
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}
                </section>
              </ContentCard>
            )}

            <ContentCard>
              <section aria-labelledby="about-heading">
                <h2 id="about-heading" className={`${cardTitleClass} mb-4`} style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
                  About
                </h2>
                <p className={`${cardBodyClass} whitespace-pre-wrap`} style={cardBodyStyle}>
                  {provider?.bio ??
                    "This provider has not added a bio yet. Message them to learn more about their experience."}
                </p>
              </section>
            </ContentCard>

            {(provider?.homeType ||
              provider?.hasYard != null ||
              provider?.smokingHome != null ||
              provider?.petsInHome ||
              provider?.childrenInHome) && (
              <ContentCard>
                <section aria-labelledby="env-heading">
                  <h2 id="env-heading" className={`${cardTitleClass} mb-4`} style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
                    Home &amp; environment
                  </h2>
                  <div
                    className="grid gap-3"
                    style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}
                  >
                    {provider?.homeType ? (
                      <div className="rounded-xl p-4" style={{ backgroundColor: "var(--color-primary-50)" }}>
                        <p
                          className="text-[0.6875rem] font-bold uppercase tracking-[0.06em]"
                          style={{ color: "rgba(28,28,28,0.5)" }}
                        >
                          Home type
                        </p>
                        <p className="mt-2 text-[0.9375rem] font-semibold" style={{ color: "var(--color-text)" }}>
                          {provider.homeType === "house" ? "House" : provider.homeType === "apartment" ? "Apartment" : provider.homeType}
                        </p>
                      </div>
                    ) : null}
                    {provider?.hasYard != null ? (
                      <div className="rounded-xl p-4" style={{ backgroundColor: "var(--color-primary-50)" }}>
                        <p
                          className="text-[0.6875rem] font-bold uppercase tracking-[0.06em]"
                          style={{ color: "rgba(28,28,28,0.5)" }}
                        >
                          Yard
                        </p>
                        <p className="mt-2 text-[0.9375rem] font-semibold" style={{ color: "var(--color-text)" }}>
                          {provider.hasYard ? (provider.yardFenced ? "Yes, fenced" : "Yes") : "No"}
                        </p>
                      </div>
                    ) : null}
                    {provider?.smokingHome != null ? (
                      <div className="rounded-xl p-4" style={{ backgroundColor: "var(--color-primary-50)" }}>
                        <p
                          className="text-[0.6875rem] font-bold uppercase tracking-[0.06em]"
                          style={{ color: "rgba(28,28,28,0.5)" }}
                        >
                          Smoking home
                        </p>
                        <p className="mt-2 text-[0.9375rem] font-semibold" style={{ color: "var(--color-text)" }}>
                          {provider.smokingHome ? "Yes" : "No"}
                        </p>
                      </div>
                    ) : null}
                    {provider?.petsInHome ? (
                      <div className="rounded-xl p-4" style={{ backgroundColor: "var(--color-primary-50)" }}>
                        <p
                          className="text-[0.6875rem] font-bold uppercase tracking-[0.06em]"
                          style={{ color: "rgba(28,28,28,0.5)" }}
                        >
                          Pets in home
                        </p>
                        <p className="mt-2 text-[0.9375rem] font-semibold" style={{ color: "var(--color-text)" }}>
                          {provider.petsInHome}
                        </p>
                      </div>
                    ) : null}
                    {provider?.childrenInHome ? (
                      <div className="rounded-xl p-4" style={{ backgroundColor: "var(--color-primary-50)" }}>
                        <p
                          className="text-[0.6875rem] font-bold uppercase tracking-[0.06em]"
                          style={{ color: "rgba(28,28,28,0.5)" }}
                        >
                          Children in home
                        </p>
                        <p className="mt-2 text-[0.9375rem] font-semibold" style={{ color: "var(--color-text)" }}>
                          {provider.childrenInHome}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </section>
              </ContentCard>
            )}

            {provider?.typicalDay ? (
              <ContentCard>
                <section aria-labelledby="typical-heading">
                  <h2 id="typical-heading" className={`${cardTitleClass} mb-4`} style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
                    A typical day
                  </h2>
                  <p className={`${cardBodyClass} whitespace-pre-wrap`} style={cardBodyStyle}>
                    {provider.typicalDay}
                  </p>
                </section>
              </ContentCard>
            ) : null}

            {provider?.infoWantedAboutPet ? (
              <ContentCard>
                <section aria-labelledby="info-heading">
                  <h2 id="info-heading" className={`${cardTitleClass} mb-4`} style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
                    What I&apos;d like to know about your pet
                  </h2>
                  <p className={`${cardBodyClass} whitespace-pre-wrap`} style={cardBodyStyle}>
                    {provider.infoWantedAboutPet}
                  </p>
                </section>
              </ContentCard>
            ) : null}

            {(provider?.emergencyProtocol?.trim() || provider?.insuranceDetails?.trim()) ? (
              <ContentCard>
                <h2 className={`${cardTitleClass} mb-4`} style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
                  Good to know
                </h2>
                {provider?.emergencyProtocol?.trim() ? (
                  <p className={`${cardBodyClass} mb-3`} style={cardBodyStyle}>
                    <span className="font-semibold" style={{ color: "var(--color-text)" }}>
                      Emergencies:{" "}
                    </span>
                    {provider.emergencyProtocol.trim()}
                  </p>
                ) : null}
                {provider?.insuranceDetails?.trim() ? (
                  <p className={`${cardBodyClass}`} style={cardBodyStyle}>
                    <span className="font-semibold" style={{ color: "var(--color-text)" }}>
                      Insurance:{" "}
                    </span>
                    {provider.insuranceDetails.trim()}
                  </p>
                ) : null}
              </ContentCard>
            ) : null}

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

            {provider?.photos && provider.photos.length > 0 ? (
              <ContentCard>
                <section aria-labelledby="photos-heading">
                  <h2 id="photos-heading" className={`${cardTitleClass} mb-4`} style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
                    Gallery
                  </h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {provider.photos.map((url, i) => (
                      <div key={`${url}-${i}`} className="relative aspect-square overflow-hidden rounded-xl border" style={{ borderColor: BORDER_TEAL_15 }}>
                        <Image src={url} alt="" fill className="object-cover" sizes="(max-width: 640px) 50vw, 33vw" />
                      </div>
                    ))}
                  </div>
                </section>
              </ContentCard>
            ) : null}

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
                Trust signals
              </p>
              <div className="mt-4 flex flex-col gap-4">
                <TrustSignalRow
                  icon={<BadgeCheck className="h-4 w-4" style={{ color: "var(--color-primary)" }} aria-hidden />}
                  label={provider?.verified ? "Verified on Tinies" : "Not yet verified"}
                />
                <TrustSignalRow
                  icon={<Calendar className="h-4 w-4" style={{ color: "var(--color-primary)" }} aria-hidden />}
                  label={`Member since ${formatMemberSinceLabel(provider?.memberSince ?? new Date())}`}
                />
                <TrustSignalRow
                  icon={<MessageCircle className="h-4 w-4" style={{ color: "var(--color-primary)" }} aria-hidden />}
                  label={rrLabel ?? "Response rate not shown"}
                />
                <TrustSignalRow
                  icon={<Star className="h-4 w-4" style={{ color: "var(--color-primary)" }} aria-hidden />}
                  label={`${(provider?.completedBookingsCount ?? 0).toLocaleString("en-GB")} completed bookings`}
                />
              </div>
            </ContentCard>

            <ProviderProfileSharePanel shareUrl={profileUrl} shareTitle={`Book ${name} on Tinies`} />
          </aside>
        </div>
      </div>
    </div>
  );
}
