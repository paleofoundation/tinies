-- AlterTable (Booking)
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "walk_activities" JSONB,
ADD COLUMN IF NOT EXISTS "service_report" JSONB,
ADD COLUMN IF NOT EXISTS "tip_amount" INTEGER,
ADD COLUMN IF NOT EXISTS "tip_stripe_payment_intent_id" TEXT;

-- AlterTable (ProviderProfile)
ALTER TABLE "provider_profiles" ADD COLUMN IF NOT EXISTS "repeat_client_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "confirmed_holidays" TEXT[] DEFAULT ARRAY[]::TEXT[];
