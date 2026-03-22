import { prisma } from "@/lib/prisma";
import { teamMembersFromPrismaJson } from "@/lib/validations/rescue-org-showcase";

function asStringList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string");
}

export type RescueSocialLinks = {
  facebook?: string;
  instagram?: string;
};

export type PublicRescueListing = {
  slug: string;
  name: string;
  species: string;
  breed: string | null;
  estimatedAge: string | null;
  sex: string | null;
  photos: string[];
};

export type RescueTeamMemberPublic = {
  name: string;
  role: string;
  photo?: string;
  bio?: string;
};

export type PublicRescueOrgProfile = {
  id: string;
  slug: string;
  name: string;
  mission: string | null;
  description: string | null;
  foundedYear: number | null;
  teamMembers: RescueTeamMemberPublic[];
  facilityPhotos: string[];
  facilityVideoUrl: string | null;
  operatingHours: string | null;
  volunteerInfo: string | null;
  donationNeeds: string | null;
  totalAnimalsRescued: number | null;
  totalAnimalsAdopted: number | null;
  contactPhone: string | null;
  contactEmail: string | null;
  district: string | null;
  coverPhotoUrl: string | null;
  location: string | null;
  website: string | null;
  websiteHref: string | null;
  logoUrl: string | null;
  charityRegistration: string | null;
  verified: true;
  socialLinks: RescueSocialLinks;
  /** From linked charity row when present; otherwise use mission in the UI */
  howDonationsUsed: string | null;
  /** Giving page slug when a linked charity exists */
  charityGiveSlug: string | null;
  listings: PublicRescueListing[];
  completedPlacementsCount: number;
};

function parseSocialLinks(json: unknown): RescueSocialLinks {
  if (json === null || json === undefined || typeof json !== "object") {
    return {};
  }
  const o = json as Record<string, unknown>;
  const pick = (keys: string[]): string | undefined => {
    for (const k of keys) {
      const v = o[k];
      if (typeof v === "string" && v.trim().length > 0) {
        return v.trim();
      }
    }
    return undefined;
  };
  return {
    facebook: pick(["facebook", "Facebook", "fb"]),
    instagram: pick(["instagram", "Instagram", "ig"]),
  };
}

export function normalizeExternalUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const t = url.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

/**
 * Verified rescue orgs only, with active available listings for public profile.
 */
export async function getPublicRescueOrgBySlug(slug: string): Promise<PublicRescueOrgProfile | null> {
  try {
    const org = await prisma.rescueOrg.findFirst({
      where: { slug, verified: true },
      select: {
        id: true,
        userId: true,
        slug: true,
        name: true,
        mission: true,
        description: true,
        foundedYear: true,
        teamMembers: true,
        facilityPhotos: true,
        facilityVideoUrl: true,
        operatingHours: true,
        volunteerInfo: true,
        donationNeeds: true,
        totalAnimalsRescued: true,
        totalAnimalsAdopted: true,
        contactPhone: true,
        contactEmail: true,
        district: true,
        coverPhotoUrl: true,
        location: true,
        website: true,
        logoUrl: true,
        charityRegistration: true,
        verified: true,
        socialLinks: true,
      },
    });

    if (!org) return null;

    const [charity, listings, completedPlacementsCount] = await Promise.all([
      prisma.charity.findFirst({
        where: {
          active: true,
          OR: [{ slug: org.slug }, { userId: org.userId }, { rescueOrgId: org.id }],
        },
        select: { howFundsUsed: true, slug: true },
      }),
      prisma.adoptionListing.findMany({
        where: {
          orgId: org.id,
          status: "available",
          active: true,
        },
        orderBy: { createdAt: "desc" },
        select: {
          slug: true,
          name: true,
          species: true,
          breed: true,
          estimatedAge: true,
          sex: true,
          photos: true,
        },
      }),
      prisma.adoptionPlacement.count({
        where: { rescueOrgId: org.id, status: "completed" },
      }),
    ]);

    const howDonationsUsed =
      charity?.howFundsUsed && charity.howFundsUsed.trim().length > 0
        ? charity.howFundsUsed.trim()
        : null;

    return {
      id: org.id,
      slug: org.slug,
      name: org.name,
      mission: org.mission,
      description: org.description,
      foundedYear: org.foundedYear,
      teamMembers: teamMembersFromPrismaJson(org.teamMembers),
      facilityPhotos: [...org.facilityPhotos],
      facilityVideoUrl: org.facilityVideoUrl,
      operatingHours: org.operatingHours,
      volunteerInfo: org.volunteerInfo,
      donationNeeds: org.donationNeeds,
      totalAnimalsRescued: org.totalAnimalsRescued,
      totalAnimalsAdopted: org.totalAnimalsAdopted,
      contactPhone: org.contactPhone,
      contactEmail: org.contactEmail,
      district: org.district,
      coverPhotoUrl: org.coverPhotoUrl,
      location: org.location,
      website: org.website,
      websiteHref: normalizeExternalUrl(org.website),
      logoUrl: org.logoUrl,
      charityRegistration: org.charityRegistration,
      verified: true,
      socialLinks: parseSocialLinks(org.socialLinks),
      howDonationsUsed,
      charityGiveSlug: charity?.slug ?? null,
      listings: listings.map((l) => ({
        ...l,
        photos: asStringList(l.photos),
      })),
      completedPlacementsCount,
    };
  } catch (e) {
    console.error("getPublicRescueOrgBySlug", e);
    return null;
  }
}
