import { createCronGetHandler } from "@/lib/cron/route-handler";
import { runMonthlyGivingReceiptCron } from "@/lib/notifications/cron-scheduled-tasks";

export const dynamic = "force-dynamic";

export const GET = createCronGetHandler("monthly-giving-receipt", () =>
  runMonthlyGivingReceiptCron()
);
