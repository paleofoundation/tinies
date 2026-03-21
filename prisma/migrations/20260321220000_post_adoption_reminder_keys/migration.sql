ALTER TABLE "adoption_placements" ADD COLUMN "post_adoption_reminder_keys" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
