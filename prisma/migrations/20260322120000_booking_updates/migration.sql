-- CreateTable
CREATE TABLE "booking_updates" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "text" TEXT,
    "photos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "video_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_updates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_updates_booking_id_idx" ON "booking_updates"("booking_id");

-- CreateIndex
CREATE INDEX "booking_updates_created_at_idx" ON "booking_updates"("created_at");

-- AddForeignKey
ALTER TABLE "booking_updates" ADD CONSTRAINT "booking_updates_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_updates" ADD CONSTRAINT "booking_updates_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
