import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Temporary: diagnose /adopt/[slug] vs DB in production.
 * Remove after debugging. Set ADOPT_SLUG_DEBUG=1 on Vercel to enable in production.
 */
export async function GET(request: Request) {
  const enabled =
    process.env.NODE_ENV !== "production" || process.env.ADOPT_SLUG_DEBUG === "1";
  if (!enabled) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") || "splotch";

  const { getPublicAdoptionListingBySlug } = await import("@/lib/adoption/public-listing");
  const listing = await getPublicAdoptionListingBySlug(slug);

  const rawRow = await prisma.adoptionListing.findFirst({
    where: { slug: { equals: slug.trim(), mode: "insensitive" } },
    select: {
      slug: true,
      name: true,
      status: true,
      active: true,
      orgId: true,
      org: { select: { name: true, slug: true, verified: true } },
    },
  });

  return NextResponse.json({
    slug,
    found: !!listing,
    listingName: listing?.name ?? null,
    listingSlug: listing?.slug ?? null,
    rawRow,
    hint:
      "If rawRow exists but found=false, status/active filters exclude the row. If rawRow is null, slug/DB mismatch or wrong DATABASE_URL.",
  });
}

export const dynamic = "force-dynamic";
