import { prisma } from "@/lib/prisma";

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

export type PublicRescueOrgProfile = {
  slug: string;
  name: string;
  mission: string | null;
  location: string | null;
  website: string | null;
  websiteHref: string | null;
  logoUrl: string | null;
  charityRegistration: string | null;
  verified: true;
  socialLinks: RescueSocialLinks;
  /** From linked charity row when present; otherwise use mission in the UI */
  howDonationsUsed: string | null;
  listings: PublicRescueListing[];
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
export async function getPublicRescueOrgBySlug(
  slug: string
): Promise<PublicRescueOrgProfile | null> {
  try {
    const org = await prisma.rescueOrg.findFirst({
      where: { slug, verified: true },
      select: {
        id: true,
        userId: true,
        slug: true,
        name: true,
        mission: true,
        location: true,
        website: true,
        logoUrl: true,
        charityRegistration: true,
        verified: true,
        socialLinks: true,
      },
    });

    if (!org) return null;

    const charity = await prisma.charity.findFirst({
      where: {
        active: true,
        OR: [{ slug: org.slug }, { userId: org.userId }],
      },
      select: { howFundsUsed: true },
    });

    const listings = await prisma.adoptionListing.findMany({
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
    });

    const howDonationsUsed =
      charity?.howFundsUsed && charity.howFundsUsed.trim().length > 0
        ? charity.howFundsUsed.trim()
        : null;

    return {
      slug: org.slug,
      name: org.name,
      mission: org.mission,
      location: org.location,
      website: org.website,
      websiteHref: normalizeExternalUrl(org.website),
      logoUrl: org.logoUrl,
      charityRegistration: org.charityRegistration,
      verified: true,
      socialLinks: parseSocialLinks(org.socialLinks),
      howDonationsUsed,
      listings: listings.map((l) => ({
        ...l,
        photos: asStringList(l.photos),
      })),
    };
  } catch (e) {
    console.error("getPublicRescueOrgBySlug", e);
    return null;
  }
}
