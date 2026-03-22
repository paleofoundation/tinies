-- Rich adoption profile: story, compatibility, media
ALTER TABLE "adoption_listings" ADD COLUMN "backstory" TEXT;
ALTER TABLE "adoption_listings" ADD COLUMN "personality" TEXT;
ALTER TABLE "adoption_listings" ADD COLUMN "ideal_home" TEXT;
ALTER TABLE "adoption_listings" ADD COLUMN "good_with" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "adoption_listings" ADD COLUMN "not_good_with" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "adoption_listings" ADD COLUMN "video_url" TEXT;
ALTER TABLE "adoption_listings" ADD COLUMN "foster_location" TEXT;
