-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('owner', 'provider', 'rescue', 'adopter', 'admin');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('walking', 'sitting', 'boarding', 'drop_in', 'daycare');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'accepted', 'declined', 'active', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "CancellationPolicy" AS ENUM ('flexible', 'moderate', 'strict');

-- CreateEnum
CREATE TYPE "ClaimType" AS ENUM ('pet_injury', 'property_damage', 'provider_no_show', 'owner_no_show');

-- CreateEnum
CREATE TYPE "DisputeType" AS ENUM ('service_quality', 'pet_welfare', 'communication', 'payment');

-- CreateEnum
CREATE TYPE "DisputeRuling" AS ENUM ('no_action', 'warning', 'partial_refund', 'full_refund', 'provider_suspended', 'owner_restricted');

-- CreateEnum
CREATE TYPE "AdoptionListingStatus" AS ENUM ('available', 'application_pending', 'matched', 'in_transit', 'adopted');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('new', 'under_review', 'approved', 'declined', 'withdrawn');

-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('preparing', 'vet_complete', 'transport_booked', 'in_transit', 'delivered', 'follow_up');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "DonationSource" AS ENUM ('roundup', 'signup', 'guardian', 'platform_commission');

-- CreateEnum
CREATE TYPE "GuardianTier" AS ENUM ('friend', 'guardian', 'champion', 'custom');

-- CreateEnum
CREATE TYPE "GuardianStatus" AS ENUM ('active', 'paused', 'cancelled');

-- CreateEnum
CREATE TYPE "MeetAndGreetStatus" AS ENUM ('requested', 'confirmed', 'completed', 'cancelled', 'expired');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('owner_home', 'provider_home', 'neutral', 'video');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "country" TEXT,
    "district" TEXT,
    "avatar_url" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "language_preference" TEXT,
    "total_donated" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pets" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT,
    "age_years" DOUBLE PRECISION,
    "weight_kg" DOUBLE PRECISION,
    "sex" TEXT,
    "spayed_neutered" BOOLEAN,
    "temperament" TEXT,
    "medical_notes" TEXT,
    "dietary_needs" TEXT,
    "vet_name" TEXT,
    "vet_phone" TEXT,
    "photos" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bio" TEXT,
    "years_experience" INTEGER,
    "services_offered" JSONB NOT NULL,
    "service_area_lat" DOUBLE PRECISION,
    "service_area_lng" DOUBLE PRECISION,
    "service_area_radius_km" DOUBLE PRECISION,
    "max_pets" INTEGER,
    "pet_types_accepted" TEXT,
    "availability" JSONB,
    "id_document_url" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "response_rate" DOUBLE PRECISION,
    "avg_rating" DOUBLE PRECISION,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "cancellation_policy" "CancellationPolicy" NOT NULL DEFAULT 'flexible',
    "cancellation_rate" DOUBLE PRECISION,
    "photos" TEXT[],
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "pet_ids" TEXT[],
    "service_type" "ServiceType" NOT NULL,
    "start_datetime" TIMESTAMP(3) NOT NULL,
    "end_datetime" TIMESTAMP(3) NOT NULL,
    "special_instructions" TEXT,
    "status" "BookingStatus" NOT NULL,
    "total_price" INTEGER NOT NULL,
    "commission_amount" INTEGER NOT NULL,
    "price_breakdown" JSONB,
    "stripe_payment_intent_id" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "cancelled_by" TEXT,
    "cancellation_reason" TEXT,
    "refund_amount" INTEGER,
    "refund_stripe_id" TEXT,
    "refund_status" TEXT,
    "has_guarantee_claim" BOOLEAN NOT NULL DEFAULT false,
    "has_dispute" BOOLEAN NOT NULL DEFAULT false,
    "walk_started_at" TIMESTAMP(3),
    "walk_ended_at" TIMESTAMP(3),
    "walk_route" JSONB,
    "walk_distance_km" DOUBLE PRECISION,
    "walk_duration_minutes" INTEGER,
    "walk_summary_map_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "photos" TEXT[],
    "provider_response" TEXT,
    "response_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "booking_id" TEXT,
    "adoption_application_id" TEXT,
    "content" TEXT NOT NULL,
    "photos" TEXT[],
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rescue_orgs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mission" TEXT,
    "location" TEXT,
    "charity_registration" TEXT,
    "website" TEXT,
    "social_links" JSONB,
    "logo_url" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rescue_orgs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adoption_listings" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT,
    "estimated_age" TEXT,
    "sex" TEXT,
    "spayed_neutered" BOOLEAN,
    "temperament" TEXT,
    "medical_history" TEXT,
    "special_needs" TEXT,
    "local_adoption_fee" INTEGER,
    "international_eligible" BOOLEAN NOT NULL DEFAULT false,
    "destination_countries" TEXT[],
    "photos" TEXT[],
    "status" "AdoptionListingStatus" NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adoption_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adoption_applications" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "applicant_id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "living_situation" TEXT,
    "has_garden" BOOLEAN,
    "other_pets" TEXT,
    "children_ages" TEXT,
    "experience" TEXT,
    "reason" TEXT,
    "vet_reference" TEXT,
    "status" "ApplicationStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adoption_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adoption_placements" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "rescue_org_id" TEXT NOT NULL,
    "adopter_id" TEXT NOT NULL,
    "destination_country" TEXT NOT NULL,
    "vet_prep_status" JSONB,
    "transport_method" TEXT,
    "transport_provider_id" TEXT,
    "transport_booked_date" TIMESTAMP(3),
    "departure_date" TIMESTAMP(3),
    "arrival_date" TIMESTAMP(3),
    "total_fee" INTEGER NOT NULL,
    "vet_cost" INTEGER,
    "transport_cost" INTEGER,
    "coordination_fee" INTEGER,
    "stripe_payment_intent_id" TEXT,
    "status" "PlacementStatus" NOT NULL,
    "checkin_1w" TIMESTAMP(3),
    "checkin_1m" TIMESTAMP(3),
    "checkin_3m" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adoption_placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_providers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "countries_served" TEXT[],
    "contact_info" TEXT,
    "pricing_notes" TEXT,
    "rating" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transport_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "commission" INTEGER NOT NULL,
    "net_amount" INTEGER NOT NULL,
    "stripe_transfer_id" TEXT,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "status" "PayoutStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registration_number" TEXT,
    "mission" TEXT,
    "website" TEXT,
    "social_links" JSONB,
    "logo_url" TEXT,
    "photos" TEXT[],
    "primary_contact_name" TEXT,
    "primary_contact_email" TEXT,
    "bank_iban" TEXT,
    "how_funds_used" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "featured_since" TIMESTAMP(3),
    "animals_in_care" INTEGER,
    "district" TEXT,
    "total_received" DOUBLE PRECISION,
    "supporter_count" INTEGER,
    "annual_update_text" TEXT,
    "annual_update_date" TIMESTAMP(3),
    "slug" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "charity_id" TEXT,
    "source" "DonationSource" NOT NULL,
    "amount" INTEGER NOT NULL,
    "booking_id" TEXT,
    "stripe_payment_intent_id" TEXT,
    "stripe_invoice_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardian_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "charity_id" TEXT,
    "stripe_subscription_id" TEXT,
    "amount_monthly" INTEGER NOT NULL,
    "tier" "GuardianTier" NOT NULL,
    "status" "GuardianStatus" NOT NULL,
    "started_at" TIMESTAMP(3),
    "paused_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guardian_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_giving_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "preferred_charity_id" TEXT,
    "roundup_enabled" BOOLEAN NOT NULL DEFAULT true,
    "guardian_subscription_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_giving_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guarantee_claims" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "claim_type" "ClaimType" NOT NULL,
    "description" TEXT NOT NULL,
    "photos" TEXT[],
    "other_party_response" TEXT,
    "other_party_photos" TEXT[],
    "admin_id" TEXT,
    "ruling" TEXT,
    "ruling_notes" TEXT,
    "payout_amount" INTEGER,
    "payout_recipient_id" TEXT,
    "payout_stripe_transfer_id" TEXT,
    "status" TEXT NOT NULL,
    "appeal_notes" TEXT,
    "appeal_ruling" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guarantee_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "opened_by" TEXT NOT NULL,
    "dispute_type" "DisputeType" NOT NULL,
    "description" TEXT NOT NULL,
    "evidence_photos" TEXT[],
    "respondent_id" TEXT NOT NULL,
    "respondent_response" TEXT,
    "respondent_photos" TEXT[],
    "admin_id" TEXT,
    "ruling" "DisputeRuling",
    "ruling_notes" TEXT,
    "refund_amount" INTEGER,
    "status" TEXT NOT NULL,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meet_and_greets" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "pet_ids" TEXT[],
    "requested_datetime" TIMESTAMP(3) NOT NULL,
    "confirmed_datetime" TIMESTAMP(3),
    "location_type" "LocationType" NOT NULL,
    "location_notes" TEXT,
    "status" "MeetAndGreetStatus" NOT NULL,
    "owner_notes_after" TEXT,
    "provider_notes_after" TEXT,
    "led_to_booking" BOOLEAN NOT NULL DEFAULT false,
    "booking_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meet_and_greets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "giving_fund_distributions" (
    "id" TEXT NOT NULL,
    "month" DATE NOT NULL,
    "total_fund_amount" INTEGER NOT NULL,
    "distribution_method" TEXT NOT NULL,
    "per_charity_amounts" JSONB NOT NULL,
    "approved_by" TEXT NOT NULL,
    "approved_at" TIMESTAMP(3) NOT NULL,
    "payout_status" "PayoutStatus" NOT NULL,
    "stripe_transfer_ids" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "giving_fund_distributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processed_webhook_events" (
    "id" TEXT NOT NULL,
    "stripe_event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "processed_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_district_idx" ON "users"("district");

-- CreateIndex
CREATE INDEX "pets_owner_id_idx" ON "pets"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_profiles_user_id_key" ON "provider_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_profiles_slug_key" ON "provider_profiles"("slug");

-- CreateIndex
CREATE INDEX "provider_profiles_user_id_idx" ON "provider_profiles"("user_id");

-- CreateIndex
CREATE INDEX "provider_profiles_verified_idx" ON "provider_profiles"("verified");

-- CreateIndex
CREATE INDEX "provider_profiles_slug_idx" ON "provider_profiles"("slug");

-- CreateIndex
CREATE INDEX "provider_profiles_service_area_lat_service_area_lng_idx" ON "provider_profiles"("service_area_lat", "service_area_lng");

-- CreateIndex
CREATE INDEX "bookings_owner_id_idx" ON "bookings"("owner_id");

-- CreateIndex
CREATE INDEX "bookings_provider_id_idx" ON "bookings"("provider_id");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_start_datetime_idx" ON "bookings"("start_datetime");

-- CreateIndex
CREATE INDEX "bookings_created_at_idx" ON "bookings"("created_at");

-- CreateIndex
CREATE INDEX "reviews_booking_id_idx" ON "reviews"("booking_id");

-- CreateIndex
CREATE INDEX "reviews_reviewer_id_idx" ON "reviews"("reviewer_id");

-- CreateIndex
CREATE INDEX "reviews_provider_id_idx" ON "reviews"("provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_booking_id_key" ON "reviews"("booking_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_idx" ON "messages"("conversation_id");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "messages_recipient_id_idx" ON "messages"("recipient_id");

-- CreateIndex
CREATE INDEX "messages_booking_id_idx" ON "messages"("booking_id");

-- CreateIndex
CREATE INDEX "messages_adoption_application_id_idx" ON "messages"("adoption_application_id");

-- CreateIndex
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "rescue_orgs_user_id_key" ON "rescue_orgs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "rescue_orgs_slug_key" ON "rescue_orgs"("slug");

-- CreateIndex
CREATE INDEX "rescue_orgs_user_id_idx" ON "rescue_orgs"("user_id");

-- CreateIndex
CREATE INDEX "rescue_orgs_verified_idx" ON "rescue_orgs"("verified");

-- CreateIndex
CREATE INDEX "rescue_orgs_slug_idx" ON "rescue_orgs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "adoption_listings_slug_key" ON "adoption_listings"("slug");

-- CreateIndex
CREATE INDEX "adoption_listings_org_id_idx" ON "adoption_listings"("org_id");

-- CreateIndex
CREATE INDEX "adoption_listings_status_idx" ON "adoption_listings"("status");

-- CreateIndex
CREATE INDEX "adoption_listings_species_idx" ON "adoption_listings"("species");

-- CreateIndex
CREATE INDEX "adoption_listings_slug_idx" ON "adoption_listings"("slug");

-- CreateIndex
CREATE INDEX "adoption_applications_listing_id_idx" ON "adoption_applications"("listing_id");

-- CreateIndex
CREATE INDEX "adoption_applications_applicant_id_idx" ON "adoption_applications"("applicant_id");

-- CreateIndex
CREATE INDEX "adoption_applications_status_idx" ON "adoption_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "adoption_placements_application_id_key" ON "adoption_placements"("application_id");

-- CreateIndex
CREATE INDEX "adoption_placements_listing_id_idx" ON "adoption_placements"("listing_id");

-- CreateIndex
CREATE INDEX "adoption_placements_application_id_idx" ON "adoption_placements"("application_id");

-- CreateIndex
CREATE INDEX "adoption_placements_rescue_org_id_idx" ON "adoption_placements"("rescue_org_id");

-- CreateIndex
CREATE INDEX "adoption_placements_adopter_id_idx" ON "adoption_placements"("adopter_id");

-- CreateIndex
CREATE INDEX "adoption_placements_transport_provider_id_idx" ON "adoption_placements"("transport_provider_id");

-- CreateIndex
CREATE INDEX "adoption_placements_status_idx" ON "adoption_placements"("status");

-- CreateIndex
CREATE INDEX "transport_providers_active_idx" ON "transport_providers"("active");

-- CreateIndex
CREATE INDEX "payouts_provider_id_idx" ON "payouts"("provider_id");

-- CreateIndex
CREATE INDEX "payouts_status_idx" ON "payouts"("status");

-- CreateIndex
CREATE INDEX "payouts_period_start_period_end_idx" ON "payouts"("period_start", "period_end");

-- CreateIndex
CREATE UNIQUE INDEX "charities_slug_key" ON "charities"("slug");

-- CreateIndex
CREATE INDEX "charities_verified_idx" ON "charities"("verified");

-- CreateIndex
CREATE INDEX "charities_featured_idx" ON "charities"("featured");

-- CreateIndex
CREATE INDEX "charities_slug_idx" ON "charities"("slug");

-- CreateIndex
CREATE INDEX "charities_active_idx" ON "charities"("active");

-- CreateIndex
CREATE INDEX "donations_user_id_idx" ON "donations"("user_id");

-- CreateIndex
CREATE INDEX "donations_charity_id_idx" ON "donations"("charity_id");

-- CreateIndex
CREATE INDEX "donations_booking_id_idx" ON "donations"("booking_id");

-- CreateIndex
CREATE INDEX "donations_source_idx" ON "donations"("source");

-- CreateIndex
CREATE INDEX "donations_created_at_idx" ON "donations"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "guardian_subscriptions_stripe_subscription_id_key" ON "guardian_subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "guardian_subscriptions_user_id_idx" ON "guardian_subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "guardian_subscriptions_charity_id_idx" ON "guardian_subscriptions"("charity_id");

-- CreateIndex
CREATE INDEX "guardian_subscriptions_status_idx" ON "guardian_subscriptions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "user_giving_preferences_user_id_key" ON "user_giving_preferences"("user_id");

-- CreateIndex
CREATE INDEX "user_giving_preferences_user_id_idx" ON "user_giving_preferences"("user_id");

-- CreateIndex
CREATE INDEX "user_giving_preferences_preferred_charity_id_idx" ON "user_giving_preferences"("preferred_charity_id");

-- CreateIndex
CREATE INDEX "guarantee_claims_booking_id_idx" ON "guarantee_claims"("booking_id");

-- CreateIndex
CREATE INDEX "guarantee_claims_reporter_id_idx" ON "guarantee_claims"("reporter_id");

-- CreateIndex
CREATE INDEX "guarantee_claims_admin_id_idx" ON "guarantee_claims"("admin_id");

-- CreateIndex
CREATE INDEX "guarantee_claims_status_idx" ON "guarantee_claims"("status");

-- CreateIndex
CREATE INDEX "disputes_booking_id_idx" ON "disputes"("booking_id");

-- CreateIndex
CREATE INDEX "disputes_opened_by_idx" ON "disputes"("opened_by");

-- CreateIndex
CREATE INDEX "disputes_respondent_id_idx" ON "disputes"("respondent_id");

-- CreateIndex
CREATE INDEX "disputes_admin_id_idx" ON "disputes"("admin_id");

-- CreateIndex
CREATE INDEX "disputes_status_idx" ON "disputes"("status");

-- CreateIndex
CREATE INDEX "meet_and_greets_owner_id_idx" ON "meet_and_greets"("owner_id");

-- CreateIndex
CREATE INDEX "meet_and_greets_provider_id_idx" ON "meet_and_greets"("provider_id");

-- CreateIndex
CREATE INDEX "meet_and_greets_booking_id_idx" ON "meet_and_greets"("booking_id");

-- CreateIndex
CREATE INDEX "meet_and_greets_status_idx" ON "meet_and_greets"("status");

-- CreateIndex
CREATE INDEX "meet_and_greets_requested_datetime_idx" ON "meet_and_greets"("requested_datetime");

-- CreateIndex
CREATE INDEX "giving_fund_distributions_month_idx" ON "giving_fund_distributions"("month");

-- CreateIndex
CREATE INDEX "giving_fund_distributions_approved_by_idx" ON "giving_fund_distributions"("approved_by");

-- CreateIndex
CREATE INDEX "giving_fund_distributions_payout_status_idx" ON "giving_fund_distributions"("payout_status");

-- CreateIndex
CREATE UNIQUE INDEX "processed_webhook_events_stripe_event_id_key" ON "processed_webhook_events"("stripe_event_id");

-- CreateIndex
CREATE INDEX "processed_webhook_events_stripe_event_id_idx" ON "processed_webhook_events"("stripe_event_id");

-- CreateIndex
CREATE INDEX "processed_webhook_events_event_type_idx" ON "processed_webhook_events"("event_type");

-- CreateIndex
CREATE INDEX "processed_webhook_events_processed_at_idx" ON "processed_webhook_events"("processed_at");

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_profiles" ADD CONSTRAINT "provider_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "provider_profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_adoption_application_id_fkey" FOREIGN KEY ("adoption_application_id") REFERENCES "adoption_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rescue_orgs" ADD CONSTRAINT "rescue_orgs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_listings" ADD CONSTRAINT "adoption_listings_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "rescue_orgs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_applications" ADD CONSTRAINT "adoption_applications_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "adoption_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_applications" ADD CONSTRAINT "adoption_applications_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_placements" ADD CONSTRAINT "adoption_placements_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "adoption_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_placements" ADD CONSTRAINT "adoption_placements_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "adoption_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_placements" ADD CONSTRAINT "adoption_placements_rescue_org_id_fkey" FOREIGN KEY ("rescue_org_id") REFERENCES "rescue_orgs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_placements" ADD CONSTRAINT "adoption_placements_adopter_id_fkey" FOREIGN KEY ("adopter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_placements" ADD CONSTRAINT "adoption_placements_transport_provider_id_fkey" FOREIGN KEY ("transport_provider_id") REFERENCES "transport_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "provider_profiles"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_charity_id_fkey" FOREIGN KEY ("charity_id") REFERENCES "charities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardian_subscriptions" ADD CONSTRAINT "guardian_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardian_subscriptions" ADD CONSTRAINT "guardian_subscriptions_charity_id_fkey" FOREIGN KEY ("charity_id") REFERENCES "charities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_giving_preferences" ADD CONSTRAINT "user_giving_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_giving_preferences" ADD CONSTRAINT "user_giving_preferences_preferred_charity_id_fkey" FOREIGN KEY ("preferred_charity_id") REFERENCES "charities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_giving_preferences" ADD CONSTRAINT "user_giving_preferences_guardian_subscription_id_fkey" FOREIGN KEY ("guardian_subscription_id") REFERENCES "guardian_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guarantee_claims" ADD CONSTRAINT "guarantee_claims_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guarantee_claims" ADD CONSTRAINT "guarantee_claims_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guarantee_claims" ADD CONSTRAINT "guarantee_claims_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guarantee_claims" ADD CONSTRAINT "guarantee_claims_payout_recipient_id_fkey" FOREIGN KEY ("payout_recipient_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_opened_by_fkey" FOREIGN KEY ("opened_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_respondent_id_fkey" FOREIGN KEY ("respondent_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meet_and_greets" ADD CONSTRAINT "meet_and_greets_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meet_and_greets" ADD CONSTRAINT "meet_and_greets_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meet_and_greets" ADD CONSTRAINT "meet_and_greets_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "giving_fund_distributions" ADD CONSTRAINT "giving_fund_distributions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

