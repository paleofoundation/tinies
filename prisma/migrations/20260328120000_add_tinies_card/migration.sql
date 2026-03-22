-- CreateTable
CREATE TABLE "tinies_cards" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "pet_ids" TEXT[],
    "service_type" "ServiceType" NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "walk_distance_km" DOUBLE PRECISION,
    "walk_route_json" JSONB,
    "walk_map_image_url" TEXT,
    "activities" JSONB NOT NULL,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "personal_note" VARCHAR(500) NOT NULL,
    "mood" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tinies_cards_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tinies_cards_booking_id_key" ON "tinies_cards"("booking_id");
CREATE INDEX "tinies_cards_owner_id_idx" ON "tinies_cards"("owner_id");
CREATE INDEX "tinies_cards_provider_id_idx" ON "tinies_cards"("provider_id");

ALTER TABLE "tinies_cards" ADD CONSTRAINT "tinies_cards_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tinies_cards" ADD CONSTRAINT "tinies_cards_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tinies_cards" ADD CONSTRAINT "tinies_cards_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
