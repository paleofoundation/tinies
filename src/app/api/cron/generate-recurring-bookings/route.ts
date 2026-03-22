import { createCronGetHandler } from "@/lib/cron/route-handler";
import { runGenerateRecurringBookingsCron } from "@/lib/recurring-bookings/cron-generate";

export const dynamic = "force-dynamic";

export const GET = createCronGetHandler("generate-recurring-bookings", runGenerateRecurringBookingsCron);
