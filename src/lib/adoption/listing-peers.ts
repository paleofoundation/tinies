import { prisma } from "@/lib/prisma";
import type { AdoptionListingPeerOption } from "@/app/[locale]/dashboard/admin/adoption-listing-types";

type PeerQuery = {
  excludeListingId?: string;
  /** When set (rescue dashboard), only this org's listings appear. */
  orgId?: string;
};

export async function getAdoptionListingPeerOptions(query: PeerQuery = {}): Promise<AdoptionListingPeerOption[]> {
  const rows = await prisma.adoptionListing.findMany({
    where: {
      ...(query.excludeListingId ? { id: { not: query.excludeListingId } } : {}),
      ...(query.orgId ? { orgId: query.orgId } : {}),
    },
    select: { id: true, slug: true, name: true, photos: true },
    orderBy: { name: "asc" },
    take: 500,
  });
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    photo: r.photos[0] ?? null,
  }));
}
