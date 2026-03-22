-- Alternate names, name story, family / lineage
ALTER TABLE "adoption_listings" ADD COLUMN "alternate_names" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "adoption_listings" ADD COLUMN "name_story" TEXT;
ALTER TABLE "adoption_listings" ADD COLUMN "lineage_title" TEXT;
ALTER TABLE "adoption_listings" ADD COLUMN "mother_id" TEXT;
ALTER TABLE "adoption_listings" ADD COLUMN "father_id" TEXT;
ALTER TABLE "adoption_listings" ADD COLUMN "mother_name" TEXT;
ALTER TABLE "adoption_listings" ADD COLUMN "father_name" TEXT;
ALTER TABLE "adoption_listings" ADD COLUMN "sibling_ids" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "adoption_listings" ADD COLUMN "family_notes" TEXT;

ALTER TABLE "adoption_listings" ADD CONSTRAINT "adoption_listings_mother_id_fkey" FOREIGN KEY ("mother_id") REFERENCES "adoption_listings" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "adoption_listings" ADD CONSTRAINT "adoption_listings_father_id_fkey" FOREIGN KEY ("father_id") REFERENCES "adoption_listings" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "adoption_listings_mother_id_idx" ON "adoption_listings"("mother_id");
CREATE INDEX "adoption_listings_father_id_idx" ON "adoption_listings"("father_id");
