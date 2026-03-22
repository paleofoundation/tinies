import { prisma } from "@/lib/prisma";
import { getSiteImageUrlsForKeys } from "@/lib/images/get-site-image";

function asStringList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string");
}

export type PublicListingParent =
  | { type: "listing"; slug: string; name: string }
  | { type: "name"; name: string };

export type PublicListingFamilySibling = {
  slug: string;
  name: string;
  photo: string | null;
};

export type PublicAdoptionListing = {
  id: string;
  slug: string;
  /** Memorial pages are public by URL but excluded from adoption browse. */
  isMemorial: boolean;
  name: string;
  alternateNames: string[];
  nameStory: string | null;
  species: string;
  breed: string | null;
  estimatedAge: string | null;
  sex: string | null;
  spayedNeutered: boolean | null;
  photos: string[];
  temperament: string | null;
  medicalHistory: string | null;
  specialNeeds: string | null;
  backstory: string | null;
  personality: string | null;
  idealHome: string | null;
  goodWith: string[];
  notGoodWith: string[];
  videoUrl: string | null;
  fosterLocation: string | null;
  internationalEligible: boolean;
  destinationCountries: string[];
  lineageTitle: string | null;
  familyNotes: string | null;
  mother: PublicListingParent | null;
  father: PublicListingParent | null;
  siblings: PublicListingFamilySibling[];
  org: { name: string; slug: string; location: string | null; verified: boolean };
};

function parentFromRow(
  listingRel: { slug: string; name: string } | null,
  nameOnly: string | null
): PublicListingParent | null {
  if (listingRel) return { type: "listing", slug: listingRel.slug, name: listingRel.name };
  const n = nameOnly?.trim();
  if (n) return { type: "name", name: n };
  return null;
}

/** Public animal profile: active listings with status `available` or `memorial` (direct URL). */
export async function getPublicAdoptionListingBySlug(
  slug: string
): Promise<PublicAdoptionListing | null> {
  const normalized = slug.trim();
  if (!normalized) return null;

  try {
    const listing = await prisma.adoptionListing.findFirst({
      where: {
        slug: { equals: normalized, mode: "insensitive" },
        status: { in: ["available", "memorial"] },
        active: true,
      },
      select: {
        id: true,
        slug: true,
        status: true,
        name: true,
        alternateNames: true,
        nameStory: true,
        species: true,
        breed: true,
        estimatedAge: true,
        sex: true,
        spayedNeutered: true,
        photos: true,
        temperament: true,
        medicalHistory: true,
        specialNeeds: true,
        backstory: true,
        personality: true,
        idealHome: true,
        goodWith: true,
        notGoodWith: true,
        videoUrl: true,
        fosterLocation: true,
        internationalEligible: true,
        destinationCountries: true,
        lineageTitle: true,
        familyNotes: true,
        motherName: true,
        fatherName: true,
        siblingIds: true,
        motherListing: { select: { slug: true, name: true } },
        fatherListing: { select: { slug: true, name: true } },
        org: { select: { name: true, slug: true, location: true, verified: true } },
      },
    });
    if (!listing) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[getPublicAdoptionListingBySlug] no row", {
          slug: normalized,
          hint: "Expect status=available|memorial, active=true; slug match is case-insensitive",
        });
      }
      return null;
    }

    const siblingIds = asStringList(listing.siblingIds);
    const siblingRows =
      siblingIds.length > 0
        ? await prisma.adoptionListing.findMany({
            where: {
              id: { in: siblingIds },
              status: { in: ["available", "memorial"] },
              active: true,
            },
            select: { id: true, slug: true, name: true, photos: true },
          })
        : [];
    const byId = new Map(siblingRows.map((r) => [r.id, r]));
    const siblings: PublicListingFamilySibling[] = siblingIds
      .map((id) => byId.get(id))
      .filter((r): r is NonNullable<typeof r> => r != null)
      .map((r) => ({
        slug: r.slug,
        name: r.name,
        photo: r.photos[0] ?? null,
      }));

    const basePhotos = asStringList(listing.photos);
    const photoKeys = basePhotos.map((_, i) => `adoption-${listing.slug}-${i + 1}`);
    const photoOverrides = await getSiteImageUrlsForKeys(photoKeys);
    const photos = basePhotos.map((p, i) => photoOverrides.get(`adoption-${listing.slug}-${i + 1}`) ?? p);

    return {
      id: listing.id,
      slug: listing.slug,
      isMemorial: listing.status === "memorial",
      name: listing.name,
      alternateNames: asStringList(listing.alternateNames),
      nameStory: listing.nameStory,
      species: listing.species,
      breed: listing.breed,
      estimatedAge: listing.estimatedAge,
      sex: listing.sex,
      spayedNeutered: listing.spayedNeutered,
      photos,
      temperament: listing.temperament,
      medicalHistory: listing.medicalHistory,
      specialNeeds: listing.specialNeeds,
      backstory: listing.backstory,
      personality: listing.personality,
      idealHome: listing.idealHome,
      goodWith: asStringList(listing.goodWith),
      notGoodWith: asStringList(listing.notGoodWith),
      videoUrl: listing.videoUrl,
      fosterLocation: listing.fosterLocation,
      internationalEligible: listing.internationalEligible,
      destinationCountries: asStringList(listing.destinationCountries),
      lineageTitle: listing.lineageTitle,
      familyNotes: listing.familyNotes,
      mother: parentFromRow(listing.motherListing, listing.motherName),
      father: parentFromRow(listing.fatherListing, listing.fatherName),
      siblings,
      org: listing.org,
    };
  } catch (e) {
    console.error("getPublicAdoptionListingBySlug", e);
    return null;
  }
}
