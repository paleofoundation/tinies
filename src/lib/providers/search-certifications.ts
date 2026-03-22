import { prisma } from "@/lib/prisma";
import { badgeColorVar } from "@/lib/training/badge-styles";

export type SearchCertificationDot = {
  slug: string;
  label: string;
  colorVar: string;
};

/**
 * Passed certifications for search / favourite cards (max 5 dots per provider).
 */
export async function fetchCertificationDotsByProviderUserIds(
  userIds: string[]
): Promise<Map<string, SearchCertificationDot[]>> {
  if (userIds.length === 0) return new Map();
  const unique = [...new Set(userIds)];
  const rows = await prisma.providerCertification.findMany({
    where: {
      providerId: { in: unique },
      passed: true,
    },
    include: {
      course: { select: { slug: true, badgeLabel: true, badgeColor: true } },
    },
    orderBy: { completedAt: "asc" },
  });
  const map = new Map<string, SearchCertificationDot[]>();
  for (const r of rows) {
    const list = map.get(r.providerId) ?? [];
    if (list.length >= 5) continue;
    list.push({
      slug: r.course.slug,
      label: r.course.badgeLabel,
      colorVar: badgeColorVar(r.course.badgeColor),
    });
    map.set(r.providerId, list);
  }
  return map;
}
