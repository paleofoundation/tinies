import { BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ProviderImpactStats = {
  completedBookingsCount: number;
  repeatClientsCount: number;
  totalEarnedCents: number;
  rescueFundedCents: number;
};

/** Real booking aggregates for the public profile impact card. Returns null when there are no completed bookings. */
export async function getProviderImpactStats(providerUserId: string): Promise<ProviderImpactStats | null> {
  try {
    const completedBookingsCount = await prisma.booking.count({
      where: { providerId: providerUserId, status: BookingStatus.completed },
    });
    if (completedBookingsCount === 0) return null;

    const bookings = await prisma.booking.findMany({
      where: { providerId: providerUserId, status: BookingStatus.completed },
      select: { ownerId: true, totalPrice: true, commissionAmount: true },
    });

    const ownerCounts = new Map<string, number>();
    let totalEarnedCents = 0;
    for (const b of bookings) {
      ownerCounts.set(b.ownerId, (ownerCounts.get(b.ownerId) ?? 0) + 1);
      totalEarnedCents += Math.max(0, b.totalPrice - b.commissionAmount);
    }

    const repeatClientsCount = [...ownerCounts.values()].filter((c) => c >= 2).length;
    const rescueFundedCents = Math.round(totalEarnedCents * 0.12 * 0.9);

    return {
      completedBookingsCount,
      repeatClientsCount,
      totalEarnedCents,
      rescueFundedCents,
    };
  } catch (e) {
    console.error("getProviderImpactStats", e);
    return null;
  }
}
