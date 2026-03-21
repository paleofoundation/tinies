-- One Guardian subscription per user; optional Stripe customer id on row.
ALTER TABLE "guardian_subscriptions" ADD COLUMN IF NOT EXISTS "stripe_customer_id" TEXT;

-- Remove duplicate rows per user_id (keep earliest created).
DELETE FROM "guardian_subscriptions" a
  USING "guardian_subscriptions" b
 WHERE a."user_id" = b."user_id"
   AND a."created_at" > b."created_at";

CREATE UNIQUE INDEX IF NOT EXISTS "guardian_subscriptions_user_id_key" ON "guardian_subscriptions"("user_id");
