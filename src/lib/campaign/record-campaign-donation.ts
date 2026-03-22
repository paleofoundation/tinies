import { DonationSource } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Idempotent: same Stripe PaymentIntent only records once (Checkout + PI paths).
 */
export async function recordCampaignDonationIfNew(params: {
  campaignId: string;
  paymentIntentId: string;
  amountCents: number;
  userId: string | null;
  charityId: string | null;
  donorName: string | null;
  message: string | null;
}): Promise<{ created: boolean }> {
  const existing = await prisma.donation.findFirst({
    where: { stripePaymentIntentId: params.paymentIntentId },
    select: { id: true },
  });
  if (existing) return { created: false };

  const campaign = await prisma.campaign.findFirst({
    where: { id: params.campaignId, status: "active" },
    select: { id: true },
  });
  if (!campaign) return { created: false };

  await prisma.$transaction(async (tx) => {
    const donation = await tx.donation.create({
      data: {
        userId: params.userId ?? undefined,
        charityId: params.charityId,
        source: DonationSource.campaign,
        amount: params.amountCents,
        stripePaymentIntentId: params.paymentIntentId,
      },
    });
    await tx.campaignDonation.create({
      data: {
        campaignId: params.campaignId,
        donationId: donation.id,
        donorName: params.donorName,
        message: params.message,
      },
    });
    await tx.campaign.update({
      where: { id: params.campaignId },
      data: {
        raisedAmountCents: { increment: params.amountCents },
        donorCount: { increment: 1 },
      },
    });
  });

  const paths = await prisma.campaign.findUnique({
    where: { id: params.campaignId },
    select: { slug: true, rescueOrg: { select: { slug: true } } },
  });
  if (paths) {
    revalidatePath(`/rescue/${paths.rescueOrg.slug}/campaign/${paths.slug}`);
    revalidatePath(`/rescue/${paths.rescueOrg.slug}`);
    revalidatePath("/giving");
    revalidatePath("/");
  }

  return { created: true };
}
