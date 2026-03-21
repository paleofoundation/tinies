import { createCronGetHandler } from "@/lib/cron/route-handler";
import { runExpirePendingBookingsCron } from "@/lib/notifications/cron-scheduled-tasks";

export const dynamic = "force-dynamic";

export const GET = createCronGetHandler("expire-pending-bookings", runExpirePendingBookingsCron);
