import { prisma } from "@/lib/prisma";
import { parseCampaignMilestones, parseCampaignUpdates } from "./campaign-types";

export type PublicCampaignPageData = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  coverPhotoUrl: string | null;
  goalAmountCents: number | null;
  raisedAmountCents: number;
  donorCount: number;
  status: string;
  milestones: ReturnType<typeof parseCampaignMilestones>;
  updates: ReturnType<typeof parseCampaignUpdates>;
  org: {
    id: string;
    slug: string;
    name: string;
    coverPhotoUrl: string | null;
    verified: boolean;
  };
  charityId: string | null;
};

export async function getPublicCampaignByOrgAndSlug(
  orgSlug: string,
  campaignSlug: string
): Promise<PublicCampaignPageData | null> {
  const normalizedOrg = orgSlug.trim();
  const normalizedCamp = campaignSlug.trim();
  if (!normalizedOrg || !normalizedCamp) return null;

  try {
    const row = await prisma.campaign.findFirst({
      where: {
        slug: { equals: normalizedCamp, mode: "insensitive" },
        status: "active",
        rescueOrg: {
          slug: { equals: normalizedOrg, mode: "insensitive" },
          verified: true,
        },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        description: true,
        coverPhotoUrl: true,
        goalAmountCents: true,
        raisedAmountCents: true,
        donorCount: true,
        status: true,
        milestones: true,
        updates: true,
        rescueOrg: {
          select: {
            id: true,
            slug: true,
            name: true,
            coverPhotoUrl: true,
            verified: true,
          },
        },
      },
    });
    if (!row) return null;

    const [charity, donationSum, campaignDonationCount] = await Promise.all([
      prisma.charity.findFirst({
        where: { rescueOrgId: row.rescueOrg.id, active: true, verified: true },
        select: { id: true },
      }),
      prisma.donation.aggregate({
        where: { campaignLink: { campaignId: row.id } },
        _sum: { amount: true },
      }),
      prisma.campaignDonation.count({ where: { campaignId: row.id } }),
    ]);

    const raisedFromDonations = donationSum._sum.amount ?? 0;
    const raisedAmountCents =
      campaignDonationCount > 0 ? raisedFromDonations : row.raisedAmountCents;
    const donorCount = campaignDonationCount > 0 ? campaignDonationCount : row.donorCount;

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      coverPhotoUrl: row.coverPhotoUrl,
      goalAmountCents: row.goalAmountCents,
      raisedAmountCents,
      donorCount,
      status: row.status,
      milestones: parseCampaignMilestones(row.milestones),
      updates: parseCampaignUpdates(row.updates),
      org: row.rescueOrg,
      charityId: charity?.id ?? null,
    };
  } catch (e) {
    console.error("getPublicCampaignByOrgAndSlug", e);
    return null;
  }
}

export type FeaturedCampaignCard = {
  slug: string;
  title: string;
  subtitle: string | null;
  coverPhotoUrl: string | null;
  raisedAmountCents: number;
  goalAmountCents: number | null;
  donorCount: number;
  orgSlug: string;
  orgName: string;
};

export async function getFeaturedCampaignsForMarketing(limit = 6): Promise<FeaturedCampaignCard[]> {
  try {
    const rows = await prisma.campaign.findMany({
      where: { status: "active", featured: true },
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: {
        slug: true,
        title: true,
        subtitle: true,
        coverPhotoUrl: true,
        raisedAmountCents: true,
        goalAmountCents: true,
        donorCount: true,
        rescueOrg: { select: { slug: true, name: true } },
      },
    });
    return rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      subtitle: r.subtitle,
      coverPhotoUrl: r.coverPhotoUrl,
      raisedAmountCents: r.raisedAmountCents,
      goalAmountCents: r.goalAmountCents,
      donorCount: r.donorCount,
      orgSlug: r.rescueOrg.slug,
      orgName: r.rescueOrg.name,
    }));
  } catch (e) {
    console.error("getFeaturedCampaignsForMarketing", e);
    return [];
  }
}

export async function getActiveCampaignsForRescueOrg(orgId: string) {
  return prisma.campaign.findMany({
    where: { rescueOrgId: orgId, status: "active" },
    orderBy: { featured: "desc" },
    select: {
      slug: true,
      title: true,
      subtitle: true,
      coverPhotoUrl: true,
      raisedAmountCents: true,
      goalAmountCents: true,
      donorCount: true,
      featured: true,
    },
  });
}

export type MemorialListingCard = {
  slug: string;
  name: string;
  photos: string[];
};

export async function getMemorialListingsForRescueOrg(orgId: string): Promise<MemorialListingCard[]> {
  const rows = await prisma.adoptionListing.findMany({
    where: { orgId, status: "memorial", active: true },
    orderBy: { updatedAt: "desc" },
    select: { slug: true, name: true, photos: true },
  });
  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    photos: Array.isArray(r.photos) ? r.photos.filter((p): p is string => typeof p === "string") : [],
  }));
}

export type CampaignSupporterRow = {
  id: string;
  donorName: string | null;
  message: string | null;
  amountCents: number;
  createdAt: Date;
};

export async function getRecentCampaignSupporters(
  campaignId: string,
  take = 20
): Promise<CampaignSupporterRow[]> {
  const rows = await prisma.campaignDonation.findMany({
    where: { campaignId },
    orderBy: { createdAt: "desc" },
    take,
    include: { donation: { select: { amount: true, createdAt: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    donorName: r.donorName,
    message: r.message,
    amountCents: r.donation.amount,
    createdAt: r.donation.createdAt,
  }));
}
