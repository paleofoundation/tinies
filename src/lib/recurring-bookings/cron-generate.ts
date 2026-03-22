import type { Prisma } from "@prisma/client";
import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getStripeServer } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";
import RecurringSessionProviderEmail from "@/lib/email/templates/recurring-session-provider";
import RecurringSessionOwnerEmail from "@/lib/email/templates/recurring-session-owner";
import RecurringChargeFailedOwnerEmail from "@/lib/email/templates/recurring-charge-failed-owner";
import {
  nextOccurrenceUtc,
  parseTimeSlot,
  isTimeBlockedByAvailability,
} from "@/lib/recurring-bookings/schedule";

const SERVICE_LABELS: Record<string, string> = {
  walking: "Dog walking",
  sitting: "Pet sitting",
  boarding: "Overnight boarding",
  drop_in: "Drop-in visit",
  daycare: "Daycare",
};

const COMMISSION_RATE = 0.12;

async function rollNextUntilFuture(
  rec: {
    id: string;
    daysOfWeek: number[];
    timeSlot: string;
    endDate: Date | null;
    nextBookingDate: Date | null;
  }
): Promise<Date | null> {
  let nextAt = rec.nextBookingDate;
  if (!nextAt) return null;
  const { h, m } = parseTimeSlot(rec.timeSlot);
  const now = new Date();
  while (nextAt <= now) {
    const n = nextOccurrenceUtc(nextAt, rec.daysOfWeek, h, m, rec.endDate);
    if (!n) {
      await prisma.recurringBooking.update({
        where: { id: rec.id },
        data: { status: "cancelled", nextBookingDate: null },
      });
      return null;
    }
    nextAt = n;
  }
  await prisma.recurringBooking.update({
    where: { id: rec.id },
    data: { nextBookingDate: nextAt },
  });
  return nextAt;
}

export async function runGenerateRecurringBookingsCron(): Promise<{ processed: number; errors: number }> {
  let processed = 0;
  let errors = 0;
  const horizon = addDays(new Date(), 7);
  const stripe = getStripeServer();

  const rows = await prisma.recurringBooking.findMany({
    where: {
      status: "active",
      nextBookingDate: { not: null, lte: horizon },
    },
    include: {
      owner: { select: { id: true, email: true, name: true, stripeCustomerId: true } },
      provider: { select: { id: true, email: true, name: true } },
    },
  });

  for (const rec of rows) {
    try {
      const nextReady = await rollNextUntilFuture({
        id: rec.id,
        daysOfWeek: rec.daysOfWeek,
        timeSlot: rec.timeSlot,
        endDate: rec.endDate,
        nextBookingDate: rec.nextBookingDate,
      });
      if (!nextReady) {
        processed++;
        continue;
      }
      if (nextReady > horizon) {
        processed++;
        continue;
      }

      const profile = await prisma.providerProfile.findUnique({
        where: { userId: rec.providerId },
        select: { availability: true },
      });
      const avail = profile?.availability as Record<string, boolean> | null | undefined;
      if (isTimeBlockedByAvailability(avail, nextReady)) {
        const { h, m } = parseTimeSlot(rec.timeSlot);
        const following = nextOccurrenceUtc(nextReady, rec.daysOfWeek, h, m, rec.endDate);
        await prisma.recurringBooking.update({
          where: { id: rec.id },
          data: { nextBookingDate: following },
        });
        processed++;
        continue;
      }

      const dup = await prisma.booking.findFirst({
        where: { recurringBookingId: rec.id, startDatetime: nextReady },
        select: { id: true },
      });
      if (dup) {
        const { h, m } = parseTimeSlot(rec.timeSlot);
        const following = nextOccurrenceUtc(nextReady, rec.daysOfWeek, h, m, rec.endDate);
        await prisma.recurringBooking.update({
          where: { id: rec.id },
          data: { nextBookingDate: following },
        });
        processed++;
        continue;
      }

      if (!rec.owner.stripeCustomerId) {
        await prisma.recurringBooking.update({
          where: { id: rec.id },
          data: { status: "paused" },
        });
        errors++;
        processed++;
        continue;
      }

      const pms = await stripe.paymentMethods.list({
        customer: rec.owner.stripeCustomerId,
        type: "card",
      });
      const pm = pms.data[0];
      if (!pm) {
        await prisma.recurringBooking.update({
          where: { id: rec.id },
          data: { status: "paused" },
        });
        if (rec.owner.email) {
          await sendEmail({
            to: rec.owner.email,
            subject: `Recurring visits with ${rec.provider.name} paused`,
            react: RecurringChargeFailedOwnerEmail({
              providerName: rec.provider.name,
              reason: "No saved card on file.",
            }),
          });
        }
        processed++;
        continue;
      }

      const dur = rec.durationMinutes ?? 60;
      const endAt = new Date(nextReady.getTime() + dur * 60 * 1000);
      const commissionAmount = Math.round(rec.pricePerSessionCents * COMMISSION_RATE);

      let pi: Awaited<ReturnType<typeof stripe.paymentIntents.create>>;
      try {
        pi = await stripe.paymentIntents.create({
          amount: rec.pricePerSessionCents,
          currency: "eur",
          customer: rec.owner.stripeCustomerId,
          payment_method: pm.id,
          off_session: true,
          confirm: true,
          metadata: {
            type: "recurring_booking",
            recurringBookingId: rec.id,
            ownerId: rec.ownerId,
          },
        });
      } catch (e) {
        await prisma.recurringBooking.update({
          where: { id: rec.id },
          data: { status: "paused" },
        });
        if (rec.owner.email) {
          await sendEmail({
            to: rec.owner.email,
            subject: `Recurring visits with ${rec.provider.name} paused`,
            react: RecurringChargeFailedOwnerEmail({
              providerName: rec.provider.name,
              reason: e instanceof Error ? e.message : "Payment was declined.",
            }),
          });
        }
        errors++;
        processed++;
        continue;
      }

      if (pi.status !== "succeeded") {
        await prisma.recurringBooking.update({
          where: { id: rec.id },
          data: { status: "paused" },
        });
        errors++;
        processed++;
        continue;
      }

      await prisma.booking.create({
        data: {
          ownerId: rec.ownerId,
          providerId: rec.providerId,
          petIds: rec.petIds,
          serviceType: rec.serviceType,
          startDatetime: nextReady,
          endDatetime: endAt,
          specialInstructions: rec.specialInstructions,
          status: "accepted",
          totalPrice: rec.pricePerSessionCents,
          commissionAmount,
          priceBreakdown: { source: "recurring", recurringBookingId: rec.id } as Prisma.InputJsonValue,
          stripePaymentIntentId: pi.id,
          recurringBookingId: rec.id,
        },
      });

      const { h, m } = parseTimeSlot(rec.timeSlot);
      const following = nextOccurrenceUtc(nextReady, rec.daysOfWeek, h, m, rec.endDate);
      await prisma.recurringBooking.update({
        where: { id: rec.id },
        data: { nextBookingDate: following },
      });

      const dateLabel = nextReady.toLocaleDateString("en-GB", {
        timeZone: "Asia/Nicosia",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const serviceLabel = SERVICE_LABELS[rec.serviceType] ?? rec.serviceType;
      const ownerName = rec.owner.name?.trim() || "Pet owner";

      if (rec.provider.email) {
        await sendEmail({
          to: rec.provider.email,
          subject: `Recurring booking from ${ownerName}`,
          react: RecurringSessionProviderEmail({
            ownerName,
            dateLabel,
            serviceTypeLabel: serviceLabel,
          }),
        });
      }
      if (rec.owner.email) {
        await sendEmail({
          to: rec.owner.email,
          subject: `Confirmed: recurring ${serviceLabel} with ${rec.provider.name}`,
          react: RecurringSessionOwnerEmail({
            providerName: rec.provider.name,
            dateLabel,
            serviceTypeLabel: serviceLabel,
          }),
        });
      }

      processed++;
    } catch (e) {
      console.error("runGenerateRecurringBookingsCron row", rec.id, e);
      errors++;
    }
  }

  return { processed, errors };
}
