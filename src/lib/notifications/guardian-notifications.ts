import { prisma } from "@/lib/prisma";
import { DonationSource } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import GuardianWelcomeEmail from "@/lib/email/templates/guardian-welcome";
import GuardianMonthlyChargeEmail from "@/lib/email/templates/guardian-monthly-charge";
import GuardianPausedEmail from "@/lib/email/templates/guardian-paused";
import GuardianCancelledEmail from "@/lib/email/templates/guardian-cancelled";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

/** After Stripe Checkout completes for Guardian subscription. */
export async function notifyGuardianSubscriptionStarted(params: {
  userId: string;
  amountMonthlyCents: number;
}): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { email: true, name: true },
    });
    if (!user?.email) return;
    const amountEur = (params.amountMonthlyCents / 100).toFixed(2);
    await sendEmail({
      to: user.email,
      subject: "Welcome, Tinies Guardian!",
      react: GuardianWelcomeEmail({
        firstName: user.name.split(/\s+/)[0] || user.name,
        amountMonthlyEur: amountEur,
        givingUrl: `${APP_URL}/dashboard/owner/giving`,
      }),
    });
  } catch (e) {
    console.error("notifyGuardianSubscriptionStarted", e);
  }
}

/** After each paid Guardian invoice (including first period if invoice fires). */
export async function notifyGuardianInvoicePaid(params: {
  userId: string;
  amountCents: number;
  monthLabel: string;
}): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { email: true, name: true },
    });
    if (!user?.email) return;
    const amountEur = (params.amountCents / 100).toFixed(2);
    await sendEmail({
      to: user.email,
      subject: `Guardian donation processed — ${params.monthLabel}`,
      react: GuardianMonthlyChargeEmail({
        amountEur,
        monthLabel: params.monthLabel,
        givingUrl: `${APP_URL}/dashboard/owner/giving`,
      }),
    });
  } catch (e) {
    console.error("notifyGuardianInvoicePaid", e);
  }
}

export async function notifyGuardianPaused(params: { userId: string; totalDonatedEur: string }): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { email: true, name: true },
    });
    if (!user?.email) return;
    await sendEmail({
      to: user.email,
      subject: "Your Guardian subscription is paused",
      react: GuardianPausedEmail({
        totalDonatedEur: params.totalDonatedEur,
        givingUrl: `${APP_URL}/dashboard/owner/giving`,
      }),
    });
  } catch (e) {
    console.error("notifyGuardianPaused", e);
  }
}

export async function notifyGuardianCancelled(params: { userId: string; totalDonatedEur: string }): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { email: true, name: true },
    });
    if (!user?.email) return;
    await sendEmail({
      to: user.email,
      subject: "Your Guardian subscription has ended — thank you",
      react: GuardianCancelledEmail({
        totalDonatedEur: params.totalDonatedEur,
        givingUrl: `${APP_URL}/giving`,
      }),
    });
  } catch (e) {
    console.error("notifyGuardianCancelled", e);
  }
}

/** Sum recorded Guardian donations (EUR, approximate from cents). */
export async function getUserGuardianTotalDonatedEur(userId: string): Promise<string> {
  const agg = await prisma.donation.aggregate({
    where: { userId, source: DonationSource.guardian },
    _sum: { amount: true },
  });
  const cents = agg._sum.amount ?? 0;
  return (cents / 100).toFixed(2);
}
