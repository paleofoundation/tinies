/**
 * One-off: fix case-insensitive duplicate adoption_listings.slug values (keeper = oldest row).
 * Run: npx tsx scripts/dedupe-adoption-listing-slugs.ts
 *
 * Requires DATABASE_URL. Safe to re-run when no duplicates remain (no-op).
 */

import { PrismaClient } from "@prisma/client";
import { ensureUniqueAdoptionListingSlug } from "../src/lib/adoption/ensure-unique-listing-slug";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.adoptionListing.findMany({
    select: { id: true, slug: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const byLower = new Map<string, typeof rows>();
  for (const r of rows) {
    const k = r.slug.trim().toLowerCase();
    if (!byLower.has(k)) byLower.set(k, []);
    byLower.get(k)!.push(r);
  }

  let updated = 0;
  for (const [, group] of byLower) {
    if (group.length < 2) continue;
    const [, ...dups] = group;
    for (const dup of dups) {
      const next = await ensureUniqueAdoptionListingSlug(dup.slug);
      if (next === dup.slug) {
        console.warn("Could not resolve slug for", dup.id, dup.slug);
        continue;
      }
      await prisma.adoptionListing.update({
        where: { id: dup.id },
        data: { slug: next },
      });
      console.log(`Renamed ${dup.id}: "${dup.slug}" → "${next}"`);
      updated += 1;
    }
  }

  console.log(updated === 0 ? "No duplicate slugs found." : `Updated ${updated} listing(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
