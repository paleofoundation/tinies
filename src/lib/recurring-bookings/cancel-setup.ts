import { prisma } from "@/lib/prisma";

/** If the first booking never went live, drop the recurring template. */
export async function cancelRecurringBookingIfPendingSetup(recurringBookingId: string | null | undefined): Promise<void> {
  if (!recurringBookingId) return;
  await prisma.recurringBooking.updateMany({
    where: { id: recurringBookingId, status: "pending_setup" },
    data: { status: "cancelled", nextBookingDate: null },
  });
}
