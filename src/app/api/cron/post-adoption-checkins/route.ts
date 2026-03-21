import { createCronGetHandler } from "@/lib/cron/route-handler";
import { runPostAdoptionReminderCron } from "@/lib/notifications/cron-scheduled-tasks";

export const dynamic = "force-dynamic";

export const GET = createCronGetHandler("post-adoption-checkins", runPostAdoptionReminderCron);
