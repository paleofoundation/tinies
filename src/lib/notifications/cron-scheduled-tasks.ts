/**
 * Scheduled notification jobs — invoke from Vercel Cron (`/api/cron/*`).
 */

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import BookingReminderEmail from "@/lib/email/templates/booking-reminder";
import ReviewPromptEmail from "@/lib/email/templates/review-prompt";
import { sendSMS, buildBookingReminderSMS, buildBookingExpiredSMS } from "@/lib/sms";
import { sendPostAdoptionCheckinEmail } from "@/app/[locale]/dashboard/admin/adoptions/actions";
import { sendMonthlyGivingReceiptEmail } from "@/lib/giving/actions";
import { DonationSource } from "@prisma/client";
import type { PostAdoptionPhase } from "@/lib/email/templates/post-adoption-checkin";
import { getStripeServer } from "@/lib/stripe";
import BookingExpiredEmail from "@/lib/email/templates/booking-expired";
import MeetAndGreetOwnerUpdateEmail from "@/lib/email/templates/meet-and-greet-owner-update";
import { cancelRecurringBookingIfPendingSetup } from "@/lib/recurring-bookings/cancel-setup";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export type CronBatchResult = { processed: number; errors: number };

const SERVICE_LABELS: Record<string, string> = {
  walking: "Dog walking",
  sitting: "Pet sitting",
  boarding: "Overnight boarding",
  drop_in: "Drop-in visit",
  daycare: "Daycare",
};

const MS_HOUR = 60 * 60 * 1000;
const MS_DAY = 24 * MS_HOUR;
const PENDING_BOOKING_RESPONSE_HOURS = 4;
const MEET_GREET_REQUEST_TTL_HOURS = 24;

function formatMeetCronDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Bookings starting within the next 24h; claim `reminder24hSentAt` before sending to avoid duplicates. */
export async function runBookingReminderCron(): Promise<CronBatchResult> {
  const now = new Date();
  const dayAhead = new Date(Date.now() + MS_DAY);
  let processed = 0;
  let errors = 0;

  const bookings = await prisma.booking.findMany({
    where: {
      status: "accepted",
      reminder24hSentAt: null,
      startDatetime: { gt: now, lte: dayAhead },
    },
    include: {
      owner: { select: { email: true, phone: true, phoneVerified: true, name: true } },
      provider: { select: { email: true, phone: true, phoneVerified: true, name: true } },
    },
  });

  for (const b of bookings) {
    const claim = await prisma.booking.updateMany({
      where: {
        id: b.id,
        status: "accepted",
        reminder24hSentAt: null,
        startDatetime: { gt: now, lte: dayAhead },
      },
      data: { reminder24hSentAt: new Date() },
    });
    if (claim.count === 0) continue;

    processed++;
    const serviceLabel = SERVICE_LABELS[b.serviceType] ?? b.serviceType;
    const timeStr = new Date(b.startDatetime).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (b.owner.email) {
      try {
        await sendEmail({
          to: b.owner.email,
          subject: `Reminder: ${serviceLabel} tomorrow at ${timeStr}`,
          react: BookingReminderEmail({
            serviceType: serviceLabel,
            time: timeStr,
            otherPartyName: b.provider.name,
          }),
        });
      } catch (e) {
        errors++;
        console.error("runBookingReminderCron owner email", b.id, e);
      }
    }
    if (b.provider.email) {
      try {
        await sendEmail({
          to: b.provider.email,
          subject: `Reminder: ${serviceLabel} tomorrow at ${timeStr}`,
          react: BookingReminderEmail({
            serviceType: serviceLabel,
            time: timeStr,
            otherPartyName: b.owner.name,
          }),
        });
      } catch (e) {
        errors++;
        console.error("runBookingReminderCron provider email", b.id, e);
      }
    }
    if (b.owner.phoneVerified && b.owner.phone) {
      try {
        await sendSMS({
          to: b.owner.phone,
          body: buildBookingReminderSMS({
            serviceType: serviceLabel,
            time: timeStr,
            otherPartyName: b.provider.name,
          }),
        });
      } catch (e) {
        errors++;
        console.error("runBookingReminderCron owner SMS", b.id, e);
      }
    }
    if (b.provider.phoneVerified && b.provider.phone) {
      try {
        await sendSMS({
          to: b.provider.phone,
          body: buildBookingReminderSMS({
            serviceType: serviceLabel,
            time: timeStr,
            otherPartyName: b.owner.name,
          }),
        });
      } catch (e) {
        errors++;
        console.error("runBookingReminderCron provider SMS", b.id, e);
      }
    }
  }

  return { processed, errors };
}

/**
 * ~24h after completion (by `updatedAt` window), no review yet; claim `reviewPromptSentAt` before send.
 */
export async function runReviewPromptCron(): Promise<CronBatchResult> {
  const low = new Date(Date.now() - 25 * MS_HOUR);
  const high = new Date(Date.now() - 23 * MS_HOUR);
  let processed = 0;
  let errors = 0;

  const bookings = await prisma.booking.findMany({
    where: {
      status: "completed",
      reviewPromptSentAt: null,
      updatedAt: { gte: low, lte: high },
      reviews: { none: {} },
    },
    include: {
      owner: { select: { email: true } },
      provider: { select: { name: true } },
    },
  });

  for (const b of bookings) {
    if (!b.owner.email) continue;

    const claim = await prisma.booking.updateMany({
      where: {
        id: b.id,
        status: "completed",
        reviewPromptSentAt: null,
        updatedAt: { gte: low, lte: high },
        reviews: { none: {} },
      },
      data: { reviewPromptSentAt: new Date() },
    });
    if (claim.count === 0) continue;

    processed++;
    try {
      const petIds = b.petIds ?? [];
      const pets =
        petIds.length > 0
          ? await prisma.pet.findMany({ where: { id: { in: petIds } }, select: { name: true } })
          : [];
      const petName = pets.map((p) => p.name).join(", ") || "your pet";
      await sendEmail({
        to: b.owner.email,
        subject: `How was ${petName}'s experience?`,
        react: ReviewPromptEmail({
          petName,
          providerName: b.provider.name,
          reviewUrl: `${APP_URL}/dashboard/owner`,
        }),
      });
    } catch (e) {
      errors++;
      console.error("runReviewPromptCron email", b.id, e);
    }
  }

  return { processed, errors };
}

type PhaseCfg = { key: PostAdoptionPhase; days: number; field: "checkin1w" | "checkin1m" | "checkin3m" };

const POST_ADOPTION_PHASES: PhaseCfg[] = [
  { key: "1w", days: 7, field: "checkin1w" },
  { key: "1m", days: 30, field: "checkin1m" },
  { key: "3m", days: 90, field: "checkin3m" },
];

function phaseAlreadyDone(
  p: {
    checkin1w: Date | null;
    checkin1m: Date | null;
    checkin3m: Date | null;
    postAdoptionReminderKeys: string[];
  },
  cfg: PhaseCfg
): boolean {
  if (p.postAdoptionReminderKeys.includes(cfg.key)) return true;
  if (cfg.field === "checkin1w" && p.checkin1w) return true;
  if (cfg.field === "checkin1m" && p.checkin1m) return true;
  if (cfg.field === "checkin3m" && p.checkin3m) return true;
  return false;
}

/** 1w / 1m / 3m after arrival; idempotent via check-in timestamps (and legacy `postAdoptionReminderKeys`). */
export async function runPostAdoptionReminderCron(): Promise<CronBatchResult> {
  let processed = 0;
  let errors = 0;
  const now = Date.now();

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

  for (const p of placements) {
    const arrival = p.arrivalDate!.getTime();
    const email = p.adopter.email;
    if (!email) continue;

    for (const cfg of POST_ADOPTION_PHASES) {
      if (phaseAlreadyDone(p, cfg)) continue;
      if (now < arrival + cfg.days * MS_DAY) continue;

      const nextKeys = [...new Set([...p.postAdoptionReminderKeys, cfg.key])];
      const sentAt = new Date();
      let claim: { count: number };
      if (cfg.field === "checkin1w") {
        claim = await prisma.adoptionPlacement.updateMany({
          where: { id: p.id, checkin1w: null },
          data: { checkin1w: sentAt, postAdoptionReminderKeys: nextKeys },
        });
      } else if (cfg.field === "checkin1m") {
        claim = await prisma.adoptionPlacement.updateMany({
          where: { id: p.id, checkin1m: null },
          data: { checkin1m: sentAt, postAdoptionReminderKeys: nextKeys },
        });
      } else {
        claim = await prisma.adoptionPlacement.updateMany({
          where: { id: p.id, checkin3m: null },
          data: { checkin3m: sentAt, postAdoptionReminderKeys: nextKeys },
        });
      }
      if (claim.count === 0) {
        const refreshed = await prisma.adoptionPlacement.findUnique({
          where: { id: p.id },
          select: { postAdoptionReminderKeys: true, checkin1w: true, checkin1m: true, checkin3m: true },
        });
        if (refreshed) {
          p.postAdoptionReminderKeys = refreshed.postAdoptionReminderKeys;
          p.checkin1w = refreshed.checkin1w;
          p.checkin1m = refreshed.checkin1m;
          p.checkin3m = refreshed.checkin3m;
        }
        continue;
      }

      p.postAdoptionReminderKeys = nextKeys;
      if (cfg.field === "checkin1w") p.checkin1w = sentAt;
      if (cfg.field === "checkin1m") p.checkin1m = sentAt;
      if (cfg.field === "checkin3m") p.checkin3m = sentAt;

      processed++;
      try {
        await sendPostAdoptionCheckinEmail({
          to: email,
          animalName: p.listing.name,
          placementId: p.id,
          phase: cfg.key,
        });
      } catch (e) {
        errors++;
        console.error("runPostAdoptionReminderCron email", p.id, cfg.key, e);
      }
    }
  }

  return { processed, errors };
}

/**
 * Prior calendar month per user; idempotent via `User.givingSummaryPeriodEndSent` (exclusive period end).
 */
export async function runMonthlyGivingReceiptCron(referenceDate = new Date()): Promise<CronBatchResult> {
  let processed = 0;
  let errors = 0;
  const year = referenceDate.getUTCFullYear();
  const month = referenceDate.getUTCMonth();
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  const monthLabel = start.toLocaleString("en-GB", { month: "long", year: "numeric" });

  const donations = await prisma.donation.findMany({
    where: {
      createdAt: { gte: start, lt: end },
      source: {
        in: [
          DonationSource.roundup,
          DonationSource.guardian,
          DonationSource.one_time,
          DonationSource.signup,
        ],
      },
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
      select: { email: true, givingSummaryPeriodEndSent: true },
    });
    if (!user?.email) continue;
    if (user.givingSummaryPeriodEndSent && user.givingSummaryPeriodEndSent >= end) continue;

    const total = agg.roundups + agg.guardian + agg.otherCents;
    if (total <= 0) continue;

    try {
      await sendMonthlyGivingReceiptEmail({
        to: user.email,
        month: monthLabel,
        roundUpsEur: (agg.roundups / 100).toFixed(2),
        guardianEur: (agg.guardian / 100).toFixed(2),
        totalEur: (total / 100).toFixed(2),
        charityNames: [...agg.charities],
      });
      await prisma.user.update({
        where: { id: userId },
        data: { givingSummaryPeriodEndSent: end },
      });
      processed++;
    } catch (e) {
      errors++;
      console.error("runMonthlyGivingReceiptCron user", userId, e);
    }
  }

  return { processed, errors };
}

/** All providers: pending >4h, cancel PaymentIntent, cancel booking, notify owner (matches dashboard `expireStaleBookings`). */
export async function runExpirePendingBookingsCron(): Promise<CronBatchResult> {
  const cutoff = new Date(Date.now() - PENDING_BOOKING_RESPONSE_HOURS * MS_HOUR);
  let processed = 0;
  let errors = 0;
  const stripe = getStripeServer();

  const stale = await prisma.booking.findMany({
    where: {
      status: "pending",
      createdAt: { lt: cutoff },
    },
    select: {
      id: true,
      stripePaymentIntentId: true,
      recurringBookingId: true,
      owner: { select: { email: true, phone: true, phoneVerified: true } },
      provider: { select: { name: true } },
    },
  });

  for (const b of stale) {
    try {
      const stillPending = await prisma.booking.findFirst({
        where: { id: b.id, status: "pending", createdAt: { lt: cutoff } },
        select: { id: true },
      });
      if (!stillPending) continue;

      if (b.stripePaymentIntentId) {
        try {
          await stripe.paymentIntents.cancel(b.stripePaymentIntentId);
        } catch (stripeErr) {
          errors++;
          console.warn("runExpirePendingBookingsCron: Stripe cancel failed", b.id, stripeErr);
        }
      }
      const updated = await prisma.booking.updateMany({
        where: { id: b.id, status: "pending", createdAt: { lt: cutoff } },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
          cancelledBy: "system",
        },
      });
      if (updated.count === 0) continue;

      await cancelRecurringBookingIfPendingSetup(b.recurringBookingId);

      processed++;
      try {
        if (b.owner?.email) {
          await sendEmail({
            to: b.owner.email,
            subject: "Your booking request expired",
            react: BookingExpiredEmail({ providerName: b.provider.name }),
          });
        }
        if (b.owner?.phoneVerified && b.owner?.phone) {
          await sendSMS({
            to: b.owner.phone,
            body: buildBookingExpiredSMS({ providerName: b.provider.name }),
          });
        }
      } catch (emailErr) {
        errors++;
        console.error("runExpirePendingBookingsCron notify owner", b.id, emailErr);
      }
    } catch (e) {
      errors++;
      console.error("runExpirePendingBookingsCron booking", b.id, e);
    }
  }

  return { processed, errors };
}

/** Meet & greets stuck in `requested` for 24h+ (by `createdAt`). */
export async function runExpireMeetAndGreetsCron(): Promise<CronBatchResult> {
  const cutoff = new Date(Date.now() - MEET_GREET_REQUEST_TTL_HOURS * MS_HOUR);
  let processed = 0;
  let errors = 0;

  const rows = await prisma.meetAndGreet.findMany({
    where: { status: "requested", createdAt: { lt: cutoff } },
    include: {
      owner: { select: { email: true } },
      provider: { select: { name: true } },
    },
  });

  for (const row of rows) {
    const claim = await prisma.meetAndGreet.updateMany({
      where: { id: row.id, status: "requested", createdAt: { lt: cutoff } },
      data: { status: "expired" },
    });
    if (claim.count === 0) continue;

    processed++;
    if (!row.owner.email) continue;

    const pets =
      row.petIds.length > 0
        ? await prisma.pet.findMany({
            where: { id: { in: row.petIds }, ownerId: row.ownerId },
            select: { name: true },
          })
        : [];
    const petNames = pets.map((p) => p.name);
    const originalRequested = formatMeetCronDate(row.requestedDatetime);
    const dashboardUrl = `${APP_URL}/dashboard/owner`;

    try {
      await sendEmail({
        to: row.owner.email,
        subject: "Meet & Greet request expired",
        react: MeetAndGreetOwnerUpdateEmail({
          providerName: row.provider.name,
          variant: "expired",
          petNames: petNames.length ? petNames : ["Your pet"],
          originalRequested,
          dashboardUrl,
        }),
      });
    } catch (e) {
      errors++;
      console.error("runExpireMeetAndGreetsCron email", row.id, e);
    }
  }

  return { processed, errors };
}
