import slugify from "slugify";
import { prisma } from "@/lib/prisma";

/** Unique slug for rescue org URLs (shared by admin create and self-registration). */
export async function ensureUniqueOrgSlug(baseName: string): Promise<string> {
  const baseSlug = slugify(baseName, { lower: true, strict: true }) || "rescue-org";
  const rows = await prisma.rescueOrg.findMany({
    where: { slug: { startsWith: baseSlug } },
    select: { slug: true },
  });
  const used = new Set(rows.map((r) => r.slug));
  if (!used.has(baseSlug)) return baseSlug;
  let n = 1;
  while (used.has(`${baseSlug}-${n}`)) n += 1;
  return `${baseSlug}-${n}`;
}
