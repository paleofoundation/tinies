import { AdoptionListingStatus, BookingStatus, GuardianStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSiteImageUrlsForKeys } from "@/lib/images/get-site-image";

export type HomepageFeaturedProvider = {
  slug: string;
  headline: string | null;
  avgRating: number | null;
  reviewCount: number;
  photos: string[];
  displayName: string;
  district: string | null;
  avatarUrl: string | null;
};

export type HomepageFeaturedListing = {
  name: string;
  slug: string;
  estimatedAge: string | null;
  species: string;
  breed: string | null;
  photos: string[];
  personalitySnippet: string | null;
};

export type HomepageRecentReview = {
  id: string;
  rating: number;
  textExcerpt: string;
  reviewerFirstName: string;
  providerName: string;
  providerSlug: string;
  createdAt: Date;
};

export type HomepageFeaturedCampaign = {
  slug: string;
  title: string;
  subtitle: string | null;
  coverPhotoUrl: string | null;
  raisedAmountCents: number;
  orgSlug: string;
  orgName: string;
};

export type HomepageData = {
  completedBookingsCount: number;
  fiveStarReviewsCount: number;
  completedAdoptionsCount: number;
  donationsTotalCents: number;
  verifiedProvidersCount: number;
  activeGuardiansCount: number;
  featuredProviders: HomepageFeaturedProvider[];
  featuredListings: HomepageFeaturedListing[];
  recentReviews: HomepageRecentReview[];
  featuredCampaign: HomepageFeaturedCampaign | null;
};

const LISTING_SELECT = {
  id: true,
  name: true,
  slug: true,
  estimatedAge: true,
  species: true,
  breed: true,
  photos: true,
  personality: true,
  temperament: true,
} as const;

function personalitySnippet(listing: {
  personality: string | null;
  temperament: string | null;
}): string | null {
  const raw = (listing.personality?.trim() || listing.temperament?.trim() || "").replace(/\s+/g, " ");
  if (!raw) return null;
  return raw.length <= 150 ? raw : `${raw.slice(0, 147)}…`;
}

function firstName(fullName: string | null | undefined): string {
  const t = fullName?.trim();
  if (!t) return "Pet owner";
  return t.split(/\s+/)[0] ?? t;
}

async function mergeHomepageProviderAvatars(
  items: HomepageFeaturedProvider[]
): Promise<HomepageFeaturedProvider[]> {
  if (items.length === 0) return items;
  const map = await getSiteImageUrlsForKeys(items.map((p) => `provider-${p.slug}`));
  return items.map((p) => {
    const u = map.get(`provider-${p.slug}`);
    return u ? { ...p, avatarUrl: u } : p;
  });
}

async function mergeHomepageListingPhotos(
  items: HomepageFeaturedListing[]
): Promise<HomepageFeaturedListing[]> {
  if (items.length === 0) return items;
  const keys: string[] = [];
  for (const L of items) {
    L.photos.forEach((_, i) => keys.push(`adoption-${L.slug}-${i + 1}`));
  }
  const map = await getSiteImageUrlsForKeys(keys);
  return items.map((L) => ({
    ...L,
    photos: L.photos.map((p, i) => map.get(`adoption-${L.slug}-${i + 1}`) ?? p),
  }));
}

async function featuredProvidersForHome(): Promise<HomepageFeaturedProvider[]> {
  const baseSelect = {
    slug: true,
    headline: true,
    avgRating: true,
    reviewCount: true,
    photos: true,
    userId: true,
    user: {
      select: {
        name: true,
        district: true,
        avatarUrl: true,
      },
    },
  } as const;

  const qualified = await prisma.providerProfile.findMany({
    where: {
      verified: true,
      avgRating: { gte: 4.5 },
      reviewCount: { gte: 3 },
    },
    orderBy: [{ avgRating: "desc" }, { reviewCount: "desc" }],
    take: 4,
    select: baseSelect,
  });

  const mapRow = (p: (typeof qualified)[number]): HomepageFeaturedProvider => ({
    slug: p.slug,
    headline: p.headline,
    avgRating: p.avgRating,
    reviewCount: p.reviewCount,
    photos: p.photos,
    displayName: p.user.name ?? "Provider",
    district: p.user.district,
    avatarUrl: p.user.avatarUrl,
  });

  if (qualified.length >= 4) {
    return qualified.map(mapRow);
  }

  const exclude = new Set(qualified.map((p) => p.userId));
  const more = await prisma.providerProfile.findMany({
    where: {
      verified: true,
      userId: { notIn: [...exclude] },
    },
    orderBy: [{ avgRating: "desc" }, { reviewCount: "desc" }],
    take: 4 - qualified.length,
    select: baseSelect,
  });

  return [...qualified, ...more].map(mapRow);
}

async function featuredListingsForHome(limit = 4): Promise<HomepageFeaturedListing[]> {
  const baseWhere = {
    status: "available" as const,
    active: true,
    org: { verified: true },
  };

  const catish = await prisma.adoptionListing.findMany({
    where: {
      ...baseWhere,
      OR: [
        { species: { equals: "cat", mode: "insensitive" } },
        { species: { contains: "cat", mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: LISTING_SELECT,
  });

  const rows = [...catish];
  if (rows.length < limit) {
    const more = await prisma.adoptionListing.findMany({
      where: {
        ...baseWhere,
        id: { notIn: rows.map((r) => r.id) },
      },
      orderBy: { createdAt: "desc" },
      take: limit - rows.length,
      select: LISTING_SELECT,
    });
    rows.push(...more);
  }

  return rows.map((listing) => ({
    name: listing.name,
    slug: listing.slug,
    estimatedAge: listing.estimatedAge,
    species: listing.species,
    breed: listing.breed,
    photos: listing.photos,
    personalitySnippet: personalitySnippet(listing),
  }));
}

/**
 * Single fetch for homepage metrics and featured content.
 * Pair with `export const revalidate = 300` on the home page for 5-minute ISR.
 *
 * Core stats are fetched in isolation so a failure in featured/reviews queries
 * does not zero out the whole metrics row.
 */
export async function getHomepageData(): Promise<HomepageData> {
  let completedBookingsCount = 0;
  let fiveStarReviewsCount = 0;
  let completedAdoptionsCount = 0;
  let donationsTotalCents = 0;
  let activeGuardiansCount = 0;
  let verifiedProvidersCount = 0;

  try {
    const [b, r5, adoptedListings, don, guardians, verified] = await Promise.all([
      prisma.booking.count({ where: { status: BookingStatus.completed } }),
      prisma.review.count({ where: { rating: 5 } }),
      prisma.adoptionListing.count({ where: { status: AdoptionListingStatus.adopted } }),
      prisma.donation.aggregate({ _sum: { amount: true } }),
      prisma.guardianSubscription.count({ where: { status: GuardianStatus.active } }),
      prisma.providerProfile.count({ where: { verified: true } }),
    ]);
    completedBookingsCount = b;
    fiveStarReviewsCount = r5;
    completedAdoptionsCount = adoptedListings;
    donationsTotalCents = don._sum.amount ?? 0;
    activeGuardiansCount = guardians;
    verifiedProvidersCount = verified;
  } catch (e) {
    console.error("getHomepageData (core metrics)", e);
  }

  let featuredProviders: HomepageFeaturedProvider[] = [];
  try {
    featuredProviders = await mergeHomepageProviderAvatars(await featuredProvidersForHome());
  } catch (e) {
    console.error("getHomepageData (featuredProviders)", e);
  }

  let featuredListings: HomepageFeaturedListing[] = [];
  try {
    featuredListings = await mergeHomepageListingPhotos(await featuredListingsForHome(4));
  } catch (e) {
    console.error("getHomepageData (featuredListings)", e);
  }

  let recentReviews: HomepageRecentReview[] = [];
  try {
    const reviewRows = await prisma.review.findMany({
      where: { rating: { gte: 4 } },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        rating: true,
        text: true,
        createdAt: true,
        reviewer: { select: { name: true } },
        providerProfile: {
          select: {
            slug: true,
            user: { select: { name: true } },
          },
        },
      },
    });
    recentReviews = reviewRows.map((row) => {
      const excerpt =
        row.text.length <= 150 ? row.text : `${row.text.slice(0, 147).trim()}…`;
      return {
        id: row.id,
        rating: row.rating,
        textExcerpt: excerpt,
        reviewerFirstName: firstName(row.reviewer.name),
        providerName: row.providerProfile.user.name ?? "Provider",
        providerSlug: row.providerProfile.slug,
        createdAt: row.createdAt,
      };
    });
  } catch (e) {
    console.error("getHomepageData (recentReviews)", e);
  }

  let featuredCampaign: HomepageFeaturedCampaign | null = null;
  try {
    const featuredCampaignRow = await prisma.campaign.findFirst({
      where: { status: "active", featured: true },
      orderBy: { updatedAt: "desc" },
      select: {
        slug: true,
        title: true,
        subtitle: true,
        coverPhotoUrl: true,
        raisedAmountCents: true,
        rescueOrg: { select: { slug: true, name: true } },
      },
    });
    if (featuredCampaignRow) {
      featuredCampaign = {
        slug: featuredCampaignRow.slug,
        title: featuredCampaignRow.title,
        subtitle: featuredCampaignRow.subtitle,
        coverPhotoUrl: featuredCampaignRow.coverPhotoUrl,
        raisedAmountCents: featuredCampaignRow.raisedAmountCents,
        orgSlug: featuredCampaignRow.rescueOrg.slug,
        orgName: featuredCampaignRow.rescueOrg.name,
      };
    }
  } catch (e) {
    console.error("getHomepageData (featuredCampaign)", e);
  }

  return {
    completedBookingsCount,
    fiveStarReviewsCount,
    completedAdoptionsCount,
    donationsTotalCents,
    verifiedProvidersCount,
    activeGuardiansCount,
    featuredProviders,
    featuredListings,
    recentReviews,
    featuredCampaign,
  };
}
