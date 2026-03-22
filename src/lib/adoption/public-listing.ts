import { prisma } from "@/lib/prisma";

function asStringList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string");
}

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

/** Public animal profile: available + active listings only (org verification does not hide listings). */
export async function getPublicAdoptionListingBySlug(
  slug: string
): Promise<PublicAdoptionListing | null> {
  const normalized = slug.trim();
  if (!normalized) return null;

  try {
    const listing = await prisma.adoptionListing.findFirst({
      where: {
        slug: { equals: normalized, mode: "insensitive" },
        status: "available",
        active: true,
      },
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
    if (!listing) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[getPublicAdoptionListingBySlug] no row", {
          slug: normalized,
          hint: "Expect status=available, active=true; slug match is case-insensitive",
        });
      }
      return null;
    }
    return {
      ...listing,
      photos: asStringList(listing.photos),
      destinationCountries: asStringList(listing.destinationCountries),
    };
  } catch (e) {
    console.error("getPublicAdoptionListingBySlug", e);
    return null;
  }
}
