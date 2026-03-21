/**
 * Scheduled notification jobs — invoke from Vercel Cron, GitHub Actions, or similar.
 *
 * Suggested schedules:
 * - runBookingReminderCron: every hour
 * - runReviewPromptCron: every hour
 * - runPostAdoptionReminderCron: daily
 * - runMonthlyGivingReceiptCron: 1st of month 08:00 UTC
 */

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import BookingReminderEmail from "@/lib/email/templates/booking-reminder";
import ReviewPromptEmail from "@/lib/email/templates/review-prompt";
import { sendSMS, buildBookingReminderSMS } from "@/lib/sms";
import { sendPostAdoptionCheckinEmail } from "@/app/[locale]/dashboard/admin/adoptions/actions";
import { sendMonthlyGivingReceiptEmail } from "@/lib/giving/actions";
import { DonationSource } from "@prisma/client";
import type { PostAdoptionPhase } from "@/lib/email/templates/post-adoption-checkin";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

const SERVICE_LABELS: Record<string, string> = {
  walking: "Dog walking",
  sitting: "Pet sitting",
  boarding: "Overnight boarding",
  drop_in: "Drop-in visit",
  daycare: "Daycare",
};

/** ~24 hours before start; run hourly to hit the window once. */
export async function runBookingReminderCron(): Promise<{ sent: number }> {
  const from = new Date(Date.now() + 23 * 60 * 60 * 1000);
  const to = new Date(Date.now() + 25 * 60 * 60 * 1000);
  let sent = 0;
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: "accepted",
        startDatetime: { gte: from, lte: to },
      },
      include: {
        owner: { select: { email: true, phone: true, phoneVerified: true, name: true } },
        provider: { select: { email: true, phone: true, phoneVerified: true, name: true } },
      },
    });
    for (const b of bookings) {
      const serviceLabel = SERVICE_LABELS[b.serviceType] ?? b.serviceType;
      const timeStr = new Date(b.startDatetime).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
      if (b.owner.email) {
        await sendEmail({
          to: b.owner.email,
          subject: `Reminder: ${serviceLabel} tomorrow at ${timeStr}`,
          react: BookingReminderEmail({
            serviceType: serviceLabel,
            time: timeStr,
            otherPartyName: b.provider.name,
          }),
        });
        sent++;
      }
      if (b.provider.email) {
        await sendEmail({
          to: b.provider.email,
          subject: `Reminder: ${serviceLabel} tomorrow at ${timeStr}`,
          react: BookingReminderEmail({
            serviceType: serviceLabel,
            time: timeStr,
            otherPartyName: b.owner.name,
          }),
        });
        sent++;
      }
      if (b.owner.phoneVerified && b.owner.phone) {
        await sendSMS({
          to: b.owner.phone,
          body: buildBookingReminderSMS({
            serviceType: serviceLabel,
            time: timeStr,
            otherPartyName: b.provider.name,
          }),
        });
        sent++;
      }
      if (b.provider.phoneVerified && b.provider.phone) {
        await sendSMS({
          to: b.provider.phone,
          body: buildBookingReminderSMS({
            serviceType: serviceLabel,
            time: timeStr,
            otherPartyName: b.owner.name,
          }),
        });
        sent++;
      }
    }
  } catch (e) {
    console.error("runBookingReminderCron", e);
  }
  return { sent };
}

/** ~24h after completion; bookings still without a review. */
export async function runReviewPromptCron(): Promise<{ sent: number }> {
  const low = new Date(Date.now() - 25 * 60 * 60 * 1000);
  const high = new Date(Date.now() - 23 * 60 * 60 * 1000);
  let sent = 0;
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: "completed",
        updatedAt: { gte: low, lte: high },
        reviews: { none: {} },
      },
      include: {
        owner: { select: { email: true } },
        provider: { select: { name: true } },
      },
    });
    for (const b of bookings) {
      const petIds = b.petIds ?? [];
      const pets =
        petIds.length > 0
          ? await prisma.pet.findMany({ where: { id: { in: petIds } }, select: { name: true } })
          : [];
      const petName = pets.map((p) => p.name).join(", ") || "your pet";
      if (!b.owner.email) continue;
      await sendEmail({
        to: b.owner.email,
        subject: `How was ${petName}'s experience?`,
        react: ReviewPromptEmail({
          petName,
          providerName: b.provider.name,
          reviewUrl: `${APP_URL}/dashboard/owner`,
        }),
      });
      sent++;
    }
  } catch (e) {
    console.error("runReviewPromptCron", e);
  }
  return { sent };
}

const MS_DAY = 24 * 60 * 60 * 1000;

type PhaseCfg = { key: PostAdoptionPhase; days: number };

const POST_ADOPTION_PHASES: PhaseCfg[] = [
  { key: "1w", days: 7 },
  { key: "1m", days: 30 },
  { key: "3m", days: 90 },
];

/** Uses adoption_placements.postAdoptionReminderKeys for idempotency. */
export async function runPostAdoptionReminderCron(): Promise<{ sent: number }> {
  let sent = 0;
  try {
    const placements = await prisma.adoptionPlacement.findMany({
      where: {
        status: { in: ["delivered", "follow_up", "completed"] },
        arrivalDate: { not: null },
      },
      include: {
        listing: { select: { name: true } },
        adopter: { select: { email: true } },
      },
    });
    const now = Date.now();
    for (const p of placements) {
      const arrival = p.arrivalDate!.getTime();
      const email = p.adopter.email;
      if (!email) continue;
      let keys = [...p.postAdoptionReminderKeys];
      for (const { key, days } of POST_ADOPTION_PHASES) {
        if (keys.includes(key)) continue;
        if (now < arrival + days * MS_DAY) continue;
        await sendPostAdoptionCheckinEmail({
          to: email,
          animalName: p.listing.name,
          placementId: p.id,
          phase: key,
        });
        keys = [...keys, key];
        await prisma.adoptionPlacement.update({
          where: { id: p.id },
          data: { postAdoptionReminderKeys: keys },
        });
        sent++;
      }
    }
  } catch (e) {
    console.error("runPostAdoptionReminderCron", e);
  }
  return { sent };
}

/**
 * Aggregate prior calendar month per user; send one email per donor with activity.
 * Expensive at scale — consider batching or queue.
 */
export async function runMonthlyGivingReceiptCron(referenceDate = new Date()): Promise<{ sent: number }> {
  let sent = 0;
  try {
    const year = referenceDate.getUTCFullYear();
    const month = referenceDate.getUTCMonth();
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    const monthLabel = start.toLocaleString("en-GB", { month: "long", year: "numeric" });

    const donations = await prisma.donation.findMany({
      where: {
        createdAt: { gte: start, lt: end },
        source: { in: [DonationSource.roundup, DonationSource.guardian, DonationSource.one_time, DonationSource.signup] },
        userId: { not: null },
      },
      include: { charity: { select: { name: true } } },
    });
    const byUser = new Map<
      string,
      { roundups: number; guardian: number; otherCents: number; charities: Set<string> }
    >();
    for (const d of donations) {
      if (!d.userId) continue;
      let row = byUser.get(d.userId);
      if (!row) {
        row = { roundups: 0, guardian: 0, otherCents: 0, charities: new Set<string>() };
        byUser.set(d.userId, row);
      }
      if (d.source === DonationSource.guardian) row.guardian += d.amount;
      else if (d.source === DonationSource.roundup) row.roundups += d.amount;
      else row.otherCents += d.amount;
      if (d.charity?.name) row.charities.add(d.charity.name);
    }
    for (const [userId, agg] of byUser) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      if (!user?.email) continue;
      const total = agg.roundups + agg.guardian + agg.otherCents;
      if (total <= 0) continue;
      await sendMonthlyGivingReceiptEmail({
        to: user.email,
        month: monthLabel,
        roundUpsEur: (agg.roundups / 100).toFixed(2),
        guardianEur: (agg.guardian / 100).toFixed(2),
        totalEur: (total / 100).toFixed(2),
        charityNames: [...agg.charities],
      });
      sent++;
    }
  } catch (e) {
    console.error("runMonthlyGivingReceiptCron", e);
  }
  return { sent };
}
