import { prisma } from "@/lib/prisma";

export type FeaturedAdoptionListing = {
  name: string;
  slug: string;
  estimatedAge: string | null;
  species: string;
  photos: string[];
};

/**
 * Most recently created active listings in "available" status (homepage preview).
 */
export async function getFeaturedAvailableListings(
  limit = 4
): Promise<FeaturedAdoptionListing[]> {
  try {
    return await prisma.adoptionListing.findMany({
      where: {
        status: "available",
        active: true,
        org: { verified: true },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        name: true,
        slug: true,
        estimatedAge: true,
        species: true,
        photos: true,
      },
    });
  } catch (e) {
    console.error("getFeaturedAvailableListings", e);
    return [];
  }
}
