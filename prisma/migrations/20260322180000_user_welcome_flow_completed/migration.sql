-- AlterTable
ALTER TABLE "users" ADD COLUMN "welcome_flow_completed_at" TIMESTAMP(3);

-- Existing accounts: do not show the new welcome donation prompt
UPDATE "users" SET "welcome_flow_completed_at" = NOW() WHERE "welcome_flow_completed_at" IS NULL;
