import { createCronGetHandler } from "@/lib/cron/route-handler";
import { runBookingReminderCron } from "@/lib/notifications/cron-scheduled-tasks";

export const dynamic = "force-dynamic";

export const GET = createCronGetHandler("booking-reminders", runBookingReminderCron);
