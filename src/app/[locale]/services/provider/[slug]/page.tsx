import type { Metadata } from "next";
import { getProviderBySlug, getProviderReviewsBySlug } from "@/app/[locale]/services/book/actions";
import type { ProviderReviewPublic } from "@/app/[locale]/services/book/booking-action-types";
import { resolveListingVideoUrl } from "@/lib/adoption/listing-video";
import { getFavoriteViewerState } from "@/lib/providers/favorite-actions";
import { ProviderProfileMarkup } from "./ProviderProfileMarkup";
import { withQueryTimeout } from "@/lib/utils/with-query-timeout";

/** Coerce Prisma/serialized values so .toFixed and client props never throw. */
function asDisplayRating(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function slugToName(slug: string) {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function formatEur(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

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

function responseTimeLabel(minutes: number | null): string | null {
  if (minutes == null) return null;
  if (minutes < 60) return `Usually responds within ${minutes} minutes`;
  const h = Math.round(minutes / 60);
  return `Usually responds within ${h} hour${h === 1 ? "" : "s"}`;
}

function repeatClientLine(rate: number | null): string | null {
  if (rate == null) return null;
  return `${Math.round(rate)}% of clients book again`;
}

function responseRateLabel(rr: number | null): string | null {
  if (rr == null) return null;
  const pct = rr <= 1 ? Math.round(rr * 100) : Math.round(rr);
  return `${pct}% response rate`;
}

function pickFeaturedReviewId(reviews: ProviderReviewPublic[]): string | null {
  if (reviews.length === 0) return null;
  let best = reviews[0];
  let bestScore = -1;
  for (const r of reviews) {
    const score = r.rating * 1000 + Math.min(r.text.length, 800);
    if (score > bestScore) {
      bestScore = score;
      best = r;
    }
  }
  return best.id;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let provider: Awaited<ReturnType<typeof getProviderBySlug>> = null;
  try {
    provider = await getProviderBySlug(slug);
  } catch (e) {
    console.error("getProviderBySlug (metadata)", e);
  }
  const name = provider?.providerName ?? slugToName(slug);
  const title = `${name} · Pet Care Provider`;
  const ogTitle = `${title} | Tinies`;
  const description =
    provider?.headline?.trim() ||
    provider?.bio?.slice(0, 155) ||
    `View ${name}'s profile, services, availability, and reviews. Book trusted pet care in Cyprus.`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";
  const url = `${baseUrl}/services/provider/${slug}`;
  const og = provider?.avatarUrl ?? provider?.photos[0];
  return {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: "Tinies",
      type: "profile",
      images: og ? [{ url: og }] : undefined,
    },
    twitter: { card: "summary_large_image", title: ogTitle, description },
  };
}

export default async function ProviderProfilePage({ params }: Props) {
  const { slug } = await params;
  let provider: Awaited<ReturnType<typeof getProviderBySlug>> = null;
  let reviews: ProviderReviewPublic[] = [];
  try {
    const loaded = await withQueryTimeout(
      Promise.all([getProviderBySlug(slug), getProviderReviewsBySlug(slug)]),
      [null, []] as [typeof provider, ProviderReviewPublic[]],
      `provider-profile:${slug}`,
      8000
    );
    [provider, reviews] = loaded;
  } catch (e) {
    console.error("ProviderProfilePage data fetch", e);
  }
  let favoriteViewer: Awaited<ReturnType<typeof getFavoriteViewerState>> = {
    kind: "guest",
    favoritedProviderUserIds: [],
  };
  try {
    favoriteViewer = await getFavoriteViewerState();
  } catch (e) {
    console.error("ProviderProfilePage getFavoriteViewerState", e);
  }
  const name = provider?.providerName ?? slugToName(slug);
  const initials = name
    .split(" ")
    .map((s) => s.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const messageHref = provider ? `/dashboard/messages/with/${provider.providerId}` : "/dashboard/messages";

  const favorited =
    provider != null &&
    favoriteViewer.kind === "owner" &&
    favoriteViewer.favoritedProviderUserIds.includes(provider.providerId);
  const avgRating = asDisplayRating(provider?.avgRating ?? null);
  const reviewCount = provider?.reviewCount ?? 0;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";
  const profileUrl = `${baseUrl}/services/provider/${slug}`;
  const heroImage = provider?.avatarUrl ?? provider?.photos[0] ?? null;
  const districtLabel = provider?.district?.trim() || "Cyprus";
  const videoResolved = provider?.videoIntroUrl ? resolveListingVideoUrl(provider.videoIntroUrl) : null;
  const featuredReviewId = pickFeaturedReviewId(reviews);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    description: provider?.headline ?? provider?.bio ?? undefined,
    url: profileUrl,
    image: [heroImage, ...(provider?.photos ?? []), ...(provider?.homePhotos ?? [])].filter(Boolean),
    address: { "@type": "PostalAddress", addressLocality: districtLabel, addressCountry: "CY" },
    ...(avgRating != null &&
      reviewCount > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: avgRating.toFixed(1),
          reviewCount,
          bestRating: 5,
        },
      }),
    ...(provider?.languages?.length ? { knowsLanguage: provider.languages } : {}),
    makesOffer:
      provider?.services?.map((s) => ({
        "@type": "Offer",
        name: SERVICE_TYPE_LABELS[s.type] ?? s.type,
        price: (s.base_price / 100).toFixed(2),
        priceCurrency: "EUR",
        description: `${PRICE_UNIT_LABELS[s.price_unit] ?? s.price_unit}; +${formatEur(s.additional_pet_price)} per extra pet`,
      })) ?? [],
  };

  const respTime = responseTimeLabel(provider?.responseTimeMinutes ?? null);
  const repeatLine = repeatClientLine(provider?.repeatClientRate ?? null);
  const rrLabel = responseRateLabel(provider?.responseRate ?? null);

  return (
    <ProviderProfileMarkup
      jsonLd={jsonLd}
      slug={slug}
      name={name}
      provider={provider}
      heroImage={heroImage}
      initials={initials}
      districtLabel={districtLabel}
      videoResolved={videoResolved}
      featuredReviewId={featuredReviewId}
      reviews={reviews}
      avgRating={avgRating}
      reviewCount={reviewCount}
      messageHref={messageHref}
      favorited={favorited}
      favoriteViewerKind={favoriteViewer.kind}
      profileUrl={profileUrl}
      respTime={respTime}
      repeatLine={repeatLine}
      rrLabel={rrLabel}
    />
  );
}
