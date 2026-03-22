-- AlterEnum
ALTER TYPE "AdoptionListingStatus" ADD VALUE 'memorial';

-- AlterEnum
ALTER TYPE "DonationSource" ADD VALUE 'campaign';

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "rescue_org_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT NOT NULL,
    "cover_photo_url" TEXT,
    "goal_amount_cents" INTEGER,
    "raised_amount_cents" INTEGER NOT NULL DEFAULT 0,
    "donor_count" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "milestones" JSONB,
    "updates" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_donations" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "donation_id" TEXT NOT NULL,
    "donor_name" TEXT,
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_donations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_slug_key" ON "campaigns"("slug");

-- CreateIndex
CREATE INDEX "campaigns_rescue_org_id_idx" ON "campaigns"("rescue_org_id");

-- CreateIndex
CREATE INDEX "campaigns_status_idx" ON "campaigns"("status");

-- CreateIndex
CREATE INDEX "campaigns_featured_idx" ON "campaigns"("featured");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_donations_donation_id_key" ON "campaign_donations"("donation_id");

-- CreateIndex
CREATE INDEX "campaign_donations_campaign_id_idx" ON "campaign_donations"("campaign_id");

-- CreateIndex
CREATE INDEX "campaign_donations_created_at_idx" ON "campaign_donations"("created_at");

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_rescue_org_id_fkey" FOREIGN KEY ("rescue_org_id") REFERENCES "rescue_orgs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_donations" ADD CONSTRAINT "campaign_donations_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_donations" ADD CONSTRAINT "campaign_donations_donation_id_fkey" FOREIGN KEY ("donation_id") REFERENCES "donations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
