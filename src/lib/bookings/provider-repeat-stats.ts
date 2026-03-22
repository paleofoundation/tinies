import { prisma } from "@/lib/prisma";

/** Count unique owners with 2+ completed bookings for this provider; set repeatClientCount on ProviderProfile. */
export async function updateProviderRepeatClientCount(providerId: string): Promise<void> {
  const completed = await prisma.booking.findMany({
    where: { providerId, status: "completed" },
    select: { ownerId: true },
  });
  const ownerCounts = new Map<string, number>();
  for (const b of completed) {
    ownerCounts.set(b.ownerId, (ownerCounts.get(b.ownerId) ?? 0) + 1);
  }
  const repeatCount = [...ownerCounts.values()].filter((c) => c >= 2).length;
  const uniqueOwners = ownerCounts.size;
  const repeatClientRate =
    uniqueOwners > 0 ? Math.round((repeatCount / uniqueOwners) * 1000) / 10 : null;
  const profile = await prisma.providerProfile.findUnique({
    where: { userId: providerId },
    select: { id: true },
  });
  if (profile) {
    await prisma.providerProfile.update({
      where: { id: profile.id },
      data: {
        repeatClientCount: repeatCount,
        repeatClientRate,
      },
    });
  }
}
