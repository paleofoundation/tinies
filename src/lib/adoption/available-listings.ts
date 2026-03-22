import { prisma } from "@/lib/prisma";
import type { AdoptBrowseQuery } from "./adopt-browse-params";
import { districtSlugToLocationToken } from "./adopt-browse-params";
import { ageYearsMatchesBand, parseEstimatedAgeToYears } from "./parse-estimated-age";

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
export async function getAllAvailableAdoptionListings(
  filters: AdoptBrowseQuery = {}
): Promise<AdoptBrowseListing[]> {
  try {
    const orgWhere =
      filters.rescueOrgSlug != null && filters.rescueOrgSlug.length > 0
        ? { verified: true as const, slug: filters.rescueOrgSlug }
        : filters.district != null
          ? {
              verified: true as const,
              location: {
                contains: districtSlugToLocationToken(filters.district),
                mode: "insensitive" as const,
              },
            }
          : { verified: true as const };

    const rows = await prisma.adoptionListing.findMany({
      where: {
        status: "available",
        active: true,
        org: orgWhere,
        ...(filters.international
          ? {
              internationalEligible: true,
              destinationCountries: { isEmpty: false },
            }
          : {}),
        ...(filters.species != null
          ? {
              species: {
                equals: filters.species,
                mode: "insensitive",
              },
            }
          : {}),
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
        org: { select: { name: true, slug: true, location: true, verified: true } },
      },
    });

    if (filters.age == null) return rows;

    return rows.filter((row) => {
      const years = parseEstimatedAgeToYears(row.estimatedAge);
      return ageYearsMatchesBand(years, filters.age!);
    });
  } catch (e) {
    console.error("getAllAvailableAdoptionListings", e);
    return [];
  }
}
