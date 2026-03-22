import { prisma } from "@/lib/prisma";
import { DonationSource } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import SignupDonationThankYouEmail from "@/lib/email/templates/signup-donation-thank-you";

/**
 * Idempotent: skips if a donation with this PaymentIntent id already exists.
 * Returns true if a new row was created (and thank-you email attempted).
 */
export async function recordSignupDonationIfNew(params: {
  userId: string;
  charityId: string | null;
  amountCents: number;
  stripePaymentIntentId: string;
  showOnLeaderboard: boolean;
}): Promise<boolean> {
  if (!params.userId || params.amountCents < 1 || !params.stripePaymentIntentId) {
    return false;
  }

  const existing = await prisma.donation.findFirst({
    where: { stripePaymentIntentId: params.stripePaymentIntentId },
  });
  if (existing) return false;

  await prisma.donation.create({
    data: {
      userId: params.userId,
      charityId: params.charityId ?? undefined,
      source: DonationSource.signup,
      amount: params.amountCents,
      stripePaymentIntentId: params.stripePaymentIntentId,
    },
  });

  await prisma.userGivingPreference.upsert({
    where: { userId: params.userId },
    create: { userId: params.userId, showOnLeaderboard: params.showOnLeaderboard },
    update: { showOnLeaderboard: params.showOnLeaderboard },
  });

  try {
    const [userRow, charityRow] = await Promise.all([
      prisma.user.findUnique({
        where: { id: params.userId },
        select: { email: true },
      }),
      params.charityId
        ? prisma.charity.findUnique({
            where: { id: params.charityId },
            select: { name: true },
          })
        : Promise.resolve(null),
    ]);
    const charityName = charityRow?.name ?? "our charity partners";
    const amountEur = (params.amountCents / 100).toFixed(2);
    if (userRow?.email) {
      await sendEmail({
        to: userRow.email,
        subject: `Thank you for EUR ${amountEur} to ${charityName}`,
        react: SignupDonationThankYouEmail({
          amountEur,
          charityName,
        }),
      });
    }
  } catch (thankErr) {
    console.error("signup donation thank-you email failed", thankErr);
  }

  return true;
}
