import { createCronGetHandler } from "@/lib/cron/route-handler";
import { runExpireMeetAndGreetsCron } from "@/lib/notifications/cron-scheduled-tasks";

export const dynamic = "force-dynamic";

export const GET = createCronGetHandler("expire-meet-and-greets", runExpireMeetAndGreetsCron);
