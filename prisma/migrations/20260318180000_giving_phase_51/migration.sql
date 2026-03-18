-- AlterEnum: add one_time to DonationSource
ALTER TYPE "DonationSource" ADD VALUE 'one_time';

-- AlterTable: add stripe_customer_id to users (nullable, unique)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_customer_id" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "users_stripe_customer_id_key" ON "users"("stripe_customer_id");
