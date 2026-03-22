-- CreateEnum
CREATE TYPE "RecurringBookingStatus" AS ENUM ('pending_setup', 'active', 'paused', 'cancelled');

-- CreateTable
CREATE TABLE "recurring_bookings" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "pet_ids" TEXT[],
    "service_type" "ServiceType" NOT NULL,
    "days_of_week" INTEGER[] NOT NULL,
    "time_slot" TEXT NOT NULL,
    "duration_minutes" INTEGER,
    "special_instructions" TEXT,
    "price_per_session_cents" INTEGER NOT NULL,
    "additional_pet_count" INTEGER NOT NULL DEFAULT 0,
    "status" "RecurringBookingStatus" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "next_booking_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_bookings_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "recurring_booking_id" TEXT;

-- AddForeignKey
ALTER TABLE "recurring_bookings" ADD CONSTRAINT "recurring_bookings_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "recurring_bookings" ADD CONSTRAINT "recurring_bookings_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_recurring_booking_id_fkey" FOREIGN KEY ("recurring_booking_id") REFERENCES "recurring_bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "recurring_bookings_owner_id_idx" ON "recurring_bookings"("owner_id");

CREATE INDEX "recurring_bookings_provider_id_idx" ON "recurring_bookings"("provider_id");

CREATE INDEX "recurring_bookings_status_next_booking_date_idx" ON "recurring_bookings"("status", "next_booking_date");

CREATE INDEX "bookings_recurring_booking_id_idx" ON "bookings"("recurring_booking_id");
