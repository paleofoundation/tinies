-- GivingFundDistribution: optional approval; payout_status as string; donation idempotency index

ALTER TABLE "giving_fund_distributions" DROP CONSTRAINT IF EXISTS "giving_fund_distributions_approved_by_fkey";

ALTER TABLE "giving_fund_distributions" ALTER COLUMN "approved_by" DROP NOT NULL;
ALTER TABLE "giving_fund_distributions" ALTER COLUMN "approved_at" DROP NOT NULL;

ALTER TABLE "giving_fund_distributions" ALTER COLUMN "payout_status" DROP DEFAULT;
ALTER TABLE "giving_fund_distributions" ALTER COLUMN "payout_status" SET DATA TYPE TEXT USING ("payout_status"::text);
ALTER TABLE "giving_fund_distributions" ALTER COLUMN "payout_status" SET DEFAULT 'pending';

ALTER TABLE "giving_fund_distributions" ADD CONSTRAINT "giving_fund_distributions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "donations_booking_id_source_idx" ON "donations"("booking_id", "source");
