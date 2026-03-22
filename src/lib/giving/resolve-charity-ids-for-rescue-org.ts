import { prisma } from "@/lib/prisma";

/** Charity rows tied to this rescue org: explicit link, same user, or same slug. */
export async function resolveCharityIdsForRescueOrg(rescueOrgId: string): Promise<string[]> {
  const org = await prisma.rescueOrg.findUnique({
    where: { id: rescueOrgId },
    select: { userId: true, slug: true },
  });
  if (!org) return [];

  const [byLink, byUser, bySlug] = await Promise.all([
    prisma.charity.findMany({
      where: { rescueOrgId },
      select: { id: true },
    }),
    prisma.charity.findMany({
      where: { userId: org.userId },
      select: { id: true },
    }),
    prisma.charity.findMany({
      where: { slug: org.slug },
      select: { id: true },
    }),
  ]);

  return [...new Set([...byLink, ...byUser, ...bySlug].map((c) => c.id))];
}
