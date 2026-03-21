import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import {
  BookingCompletedOwnerEmail,
  BookingCompletedProviderEmail,
} from "@/lib/email/templates/booking-completed";

const SERVICE_LABELS: Record<string, string> = {
  walking: "Dog walking",
  sitting: "Pet sitting",
  boarding: "Overnight boarding",
  drop_in: "Drop-in visit",
  daycare: "Daycare",
};

/**
 * After a booking is marked completed (walk ended or non-walk complete).
 * Registry: NotificationTrigger.BOOKING_COMPLETED
 */
export async function sendBookingCompletedNotifications(bookingId: string): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        owner: { select: { email: true } },
        provider: { select: { email: true, name: true } },
      },
    });
    if (!booking) return;
    const serviceLabel = SERVICE_LABELS[booking.serviceType] ?? booking.serviceType;
    const petIds = booking.petIds ?? [];
    const pets =
      petIds.length > 0
        ? await prisma.pet.findMany({
            where: { id: { in: petIds } },
            select: { name: true },
          })
        : [];
    const petName = pets.map((p) => p.name).join(", ") || "your pet";

    if (booking.owner.email) {
      await sendEmail({
        to: booking.owner.email,
        subject: `How was ${petName}'s ${serviceLabel.toLowerCase()}?`,
        react: BookingCompletedOwnerEmail({
          serviceType: serviceLabel,
          providerName: booking.provider.name,
        }),
      });
    }
    if (booking.provider.email) {
      await sendEmail({
        to: booking.provider.email,
        subject: `Booking complete — great work on ${serviceLabel.toLowerCase()}`,
        react: BookingCompletedProviderEmail({ serviceType: serviceLabel }),
      });
    }
  } catch (e) {
    console.error("sendBookingCompletedNotifications", e);
  }
}
