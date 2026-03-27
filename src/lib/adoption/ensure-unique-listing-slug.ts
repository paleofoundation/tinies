import { prisma } from "@/lib/prisma";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Resolves a globally unique adoption listing slug (case-insensitive).
 * Reserved sequence: `base`, then `base-1`, `base-2`, … (numeric suffix only).
 */
export async function ensureUniqueAdoptionListingSlug(baseSlug: string): Promise<string> {
  const normalized = baseSlug.trim().toLowerCase();
  if (!normalized) return "listing";

  const related = await prisma.adoptionListing.findMany({
    where: {
      OR: [
        { slug: { equals: normalized, mode: "insensitive" } },
        { slug: { startsWith: `${normalized}-`, mode: "insensitive" } },
      ],
    },
    select: { slug: true },
  });

  const numericSuffix = new RegExp(`^${escapeRegExp(normalized)}-(\\d+)$`, "i");
  const takenNumeric = new Set<number>();
  let exactTaken = false;

  for (const { slug } of related) {
    if (slug.toLowerCase() === normalized) exactTaken = true;
    const m = numericSuffix.exec(slug);
    if (m) takenNumeric.add(parseInt(m[1], 10));
  }

  if (!exactTaken) return normalized;

  let n = 1;
  while (takenNumeric.has(n)) n += 1;
  return `${normalized}-${n}`;
}
