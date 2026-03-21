import { createCronGetHandler } from "@/lib/cron/route-handler";
import { runReviewPromptCron } from "@/lib/notifications/cron-scheduled-tasks";

export const dynamic = "force-dynamic";

export const GET = createCronGetHandler("review-prompts", runReviewPromptCron);
