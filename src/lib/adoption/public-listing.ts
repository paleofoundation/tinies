import { prisma } from "@/lib/prisma";

export type PublicAdoptionListing = {
  id: string;
  slug: string;
  name: string;
  species: string;
  breed: string | null;
  estimatedAge: string | null;
  sex: string | null;
  spayedNeutered: boolean | null;
  photos: string[];
  temperament: string | null;
  medicalHistory: string | null;
  specialNeeds: string | null;
  internationalEligible: boolean;
  destinationCountries: string[];
  org: { name: string; slug: string; location: string | null; verified: boolean };
};

/** Public animal profile: available + active listings only. */
export async function getPublicAdoptionListingBySlug(
  slug: string
): Promise<PublicAdoptionListing | null> {
  try {
    const listing = await prisma.adoptionListing.findFirst({
      where: { slug, status: "available", active: true },
      select: {
        id: true,
        slug: true,
        name: true,
        species: true,
        breed: true,
        estimatedAge: true,
        sex: true,
        spayedNeutered: true,
        photos: true,
        temperament: true,
        medicalHistory: true,
        specialNeeds: true,
        internationalEligible: true,
        destinationCountries: true,
        org: { select: { name: true, slug: true, location: true, verified: true } },
      },
    });
    return listing;
  } catch (e) {
    console.error("getPublicAdoptionListingBySlug", e);
    return null;
  }
}
