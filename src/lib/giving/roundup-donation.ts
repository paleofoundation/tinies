/**
 * Round-up donation persistence for Stripe webhooks.
 * No "use server" — safe to import from Route Handlers.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { DonationSource } from "@prisma/client";

/**
 * Record a booking round-up. If `charityId` is omitted, uses the user’s preferred charity
 * from UserGivingPreference; explicit `null` forces Tinies Giving Fund.
 */
export async function recordRoundUpDonation(params: {
  userId: string;
  bookingId: string;
  roundUpAmountCents: number;
  charityId?: string | null;
  stripePaymentIntentId?: string | null;
}): Promise<void> {
  if (params.roundUpAmountCents <= 0) return;
  const existing = await prisma.donation.findFirst({
    where: { bookingId: params.bookingId, source: DonationSource.roundup },
    select: { id: true },
  });
  if (existing) return;
  let charityId: string | null;
  if (params.charityId === undefined) {
    const prefs = await prisma.userGivingPreference.findUnique({
      where: { userId: params.userId },
      select: { preferredCharityId: true },
    });
    charityId = prefs?.preferredCharityId ?? null;
  } else {
    charityId = params.charityId;
  }
  const addEur = params.roundUpAmountCents / 100;
  await prisma.$transaction(async (tx) => {
    await tx.donation.create({
      data: {
        userId: params.userId,
        charityId,
        source: DonationSource.roundup,
        amount: params.roundUpAmountCents,
        bookingId: params.bookingId,
        stripePaymentIntentId: params.stripePaymentIntentId ?? undefined,
      },
    });
    const userRow = await tx.user.findUnique({
      where: { id: params.userId },
      select: { totalDonated: true },
    });
    await tx.user.update({
      where: { id: params.userId },
      data: { totalDonated: (userRow?.totalDonated ?? 0) + addEur },
    });
  });
  revalidatePath("/giving");
  revalidatePath("/dashboard/owner/giving");
}
