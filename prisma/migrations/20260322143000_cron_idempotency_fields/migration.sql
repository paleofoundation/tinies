-- Cron idempotency: booking reminders, review prompts, monthly giving receipts
ALTER TABLE "bookings" ADD COLUMN "reminder_24h_sent_at" TIMESTAMP(3),
ADD COLUMN "review_prompt_sent_at" TIMESTAMP(3);

ALTER TABLE "users" ADD COLUMN "giving_summary_period_end_sent" TIMESTAMP(3);
