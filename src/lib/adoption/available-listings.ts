import { prisma } from "@/lib/prisma";

export type AdoptBrowseListing = {
  slug: string;
  name: string;
  species: string;
  breed: string | null;
  estimatedAge: string | null;
  sex: string | null;
  photos: string[];
  org: { name: string; slug: string; location: string | null; verified: boolean };
};

/** All active, available adoption listings for /adopt browse (newest first). */
export async function getAllAvailableAdoptionListings(): Promise<AdoptBrowseListing[]> {
  try {
    return await prisma.adoptionListing.findMany({
      where: { status: "available", active: true },
      orderBy: { createdAt: "desc" },
      select: {
        slug: true,
        name: true,
        species: true,
        breed: true,
        estimatedAge: true,
        sex: true,
        photos: true,
        org: { select: { name: true, slug: true, location: true, verified: true } },
      },
    });
  } catch (e) {
    console.error("getAllAvailableAdoptionListings", e);
    return [];
  }
}
