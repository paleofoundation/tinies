-- AlterEnum
ALTER TYPE "PlacementStatus" ADD VALUE 'completed';

-- AlterTable
ALTER TABLE "adoption_placements" ADD COLUMN "success_story_text" TEXT,
ADD COLUMN "success_story_photos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "success_story_approved_at" TIMESTAMP(3);

CREATE INDEX "adoption_placements_success_story_approved_at_idx" ON "adoption_placements"("success_story_approved_at");
