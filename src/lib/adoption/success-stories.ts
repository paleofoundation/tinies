import { prisma } from "@/lib/prisma";
import { PlacementStatus } from "@prisma/client";

const GALLERY_STATUSES: PlacementStatus[] = [
  PlacementStatus.delivered,
  PlacementStatus.follow_up,
  PlacementStatus.completed,
];

export type SuccessStoryGalleryRow = {
  placementId: string;
  animalName: string;
  species: string;
  beforePhoto: string | null;
  afterPhoto: string | null;
  originLabel: string;
  destinationLabel: string;
  quote: string | null;
  adoptedAt: Date;
  rescueName: string;
  rescueSlug: string;
};

function formatDestination(city: string, country: string): string {
  const c = city.trim();
  const co = country.trim();
  if (c && co) return `${c}, ${co}`;
  return c || co || "Abroad";
}

/** Success stories whose destination matches any of the given country strings (placement or application). */
export async function getApprovedSuccessStoriesForDestinationMatchers(
  matchers: string[],
  take = 6
): Promise<SuccessStoryGalleryRow[]> {
  const unique = [...new Set(matchers.map((m) => m.trim()).filter(Boolean))];
  if (unique.length === 0) return [];

  const orConditions = unique.flatMap((m) => [
    { destinationCountry: { equals: m, mode: "insensitive" as const } },
    { application: { country: { equals: m, mode: "insensitive" as const } } },
  ]);

  const rows = await prisma.adoptionPlacement.findMany({
    where: {
      successStoryApprovedAt: { not: null },
      status: { in: GALLERY_STATUSES },
      OR: orConditions,
    },
    orderBy: { successStoryApprovedAt: "desc" },
    take,
    include: {
      listing: { select: { name: true, species: true, photos: true } },
      application: { select: { city: true, country: true } },
      rescueOrg: { select: { name: true, slug: true, location: true } },
    },
  });

  return rows.map((r) => {
    const beforePhoto = r.listing.photos[0] ?? null;
    const afterPhoto = r.successStoryPhotos[0] ?? null;
    const origin = r.rescueOrg.location?.trim() || "Cyprus";
    const adoptedAt = r.arrivalDate ?? r.successStoryApprovedAt ?? r.updatedAt;
    const text = r.successStoryText?.trim() ?? "";
    return {
      placementId: r.id,
      animalName: r.listing.name,
      species: r.listing.species,
      beforePhoto,
      afterPhoto,
      originLabel: origin,
      destinationLabel: formatDestination(r.application.city, r.application.country),
      quote: text.length > 0 ? text : null,
      adoptedAt,
      rescueName: r.rescueOrg.name,
      rescueSlug: r.rescueOrg.slug,
    };
  });
}

export async function getApprovedSuccessStories(): Promise<SuccessStoryGalleryRow[]> {
  const rows = await prisma.adoptionPlacement.findMany({
    where: {
      successStoryApprovedAt: { not: null },
      status: { in: GALLERY_STATUSES },
    },
    orderBy: { successStoryApprovedAt: "desc" },
    include: {
      listing: { select: { name: true, species: true, photos: true } },
      application: { select: { city: true, country: true } },
      rescueOrg: { select: { name: true, slug: true, location: true } },
    },
  });

  return rows.map((r) => {
    const beforePhoto = r.listing.photos[0] ?? null;
    const afterPhoto = r.successStoryPhotos[0] ?? null;
    const origin =
      r.rescueOrg.location?.trim() ||
      "Cyprus";
    const adoptedAt =
      r.arrivalDate ?? r.successStoryApprovedAt ?? r.updatedAt;
    const text = r.successStoryText?.trim() ?? "";
    return {
      placementId: r.id,
      animalName: r.listing.name,
      species: r.listing.species,
      beforePhoto,
      afterPhoto,
      originLabel: origin,
      destinationLabel: formatDestination(r.application.city, r.application.country),
      quote: text.length > 0 ? text : null,
      adoptedAt,
      rescueName: r.rescueOrg.name,
      rescueSlug: r.rescueOrg.slug,
    };
  });
}
