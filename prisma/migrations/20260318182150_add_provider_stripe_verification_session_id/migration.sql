-- AlterTable
ALTER TABLE "provider_profiles" ADD COLUMN     "stripe_verification_session_id" TEXT;

-- CreateIndex
CREATE INDEX "charities_user_id_idx" ON "charities"("user_id");
