Tinies - Business Plan (Developer Reference)
What This Is
Tinies (tinies.app) is a pet services marketplace + international animal adoption platform for Cyprus. Two business lines under one brand:

Tinies Services — Rover-style local pet care marketplace (walking, sitting, boarding, drop-ins, daycare)
Tinies Adopt — Professional international adoption coordination (Cyprus rescue animals → UK/EU homes)

User Types
RoleDescriptionPet OwnerBooks local pet care. Creates pet profiles. Leaves reviews. Browses adoptions.Service ProviderOffers walking/sitting/boarding/drop-ins/daycare. Gets verified via ID upload. Receives bookings + payouts.Rescue OrganizationPosts adoption listings. Manages local + international inquiries. Coordinates logistics.International AdopterBased outside Cyprus. Browses animals. Submits applications. Pays adoption coordination fee.AdminVerification queue, disputes, adoption pipeline, giving fund, content moderation.
Service Types

walking — Dog walking (highest frequency, builds habit)
sitting — Pet sitting at owner's home (provider visits)
boarding — Overnight stay at provider's home (highest value)
drop_in — 20-30 min home visit to feed/check on pet (critical for cat owners)
daycare — Pet at provider's home during the day, returned in evening

Local Services Flow

Owner searches by location, service type, dates, filters
Results ranked by distance, rating, reviews, response rate
Owner views provider profile (photos, bio, prices, calendar, reviews)
Owner messages provider (free) or books directly
Booking captures: pet(s), dates/times, special instructions, payment via Stripe
Provider has 4 hours to accept/decline
If accepted: payment captured, both notified
If no response in 4hr: auto-cancel, full refund
During service: provider sends photo/video updates via messaging
After completion: owner prompted to review (1-5 stars + text)

International Adoption Flow

Adopter browses listings on /adopt, filters by species, age, destination country
Clicks "Adopt This Tiny" → structured application form
Form captures: country, city, living situation, garden, other pets, children, experience, vet reference
Destination-specific requirements auto-surfaced
Application routed to rescue org → review → approve/decline
If approved: Tinies creates placement record, initiates logistics checklist
Logistics pipeline: vet prep → vaccinations → microchip → rabies titer (if UK) → EU pet passport → transport booked → departure → arrival
Adopter pays all-inclusive fee: vet costs + transport costs + coordination fee (EUR 80-150)
Adopter gets tracking dashboard for each step
Post-arrival check-ins at 1 week, 1 month, 3 months → feeds Happy Tails gallery

Revenue Model
StreamDetailsBooking commission12% of completed bookings, deducted from provider payoutAdoption coordination feeEUR 80-150 per international placementPlatform giving10% of commission → Tinies Giving Fund for charitiesPromoted listings (Month 4+)EUR 15-30/month for priority search placementVet clinic directory (Month 6+)EUR 50-100/month for enhanced profilesPet insurance affiliate (Month 6+)EUR 20-40 per policy referralTransport referral (Month 6+)EUR 10-20 per booking routed through Tinies
Database Schema
users
email, phone, password_hash, name, role (owner|provider|rescue|adopter|admin), country, district, avatar_url, email_verified, phone_verified, language_preference
pets
owner_id (FK users), name, species (dog|cat|other), breed, age_years, weight_kg, sex, spayed_neutered, temperament, medical_notes, dietary_needs, vet_name, vet_phone, photos (array)
provider_profiles
user_id (FK users), bio, years_experience, services_offered (jsonb: [{type, base_price, additional_pet_price, price_unit, max_pets}]), service_area_lat, service_area_lng, service_area_radius_km, max_pets, pet_types_accepted, availability (jsonb weekly schedule), id_document_url, verified, verified_at, response_rate, avg_rating, review_count, cancellation_policy (flexible|moderate|strict), cancellation_rate, photos (array), slug
bookings
owner_id, provider_id, pet_ids (array), service_type, start_datetime, end_datetime, special_instructions, status (pending|accepted|declined|active|completed|cancelled), total_price, commission_amount, price_breakdown (jsonb), stripe_payment_intent_id, cancelled_at, cancelled_by, cancellation_reason, refund_amount, refund_stripe_id, refund_status, has_guarantee_claim, has_dispute, walk_started_at, walk_ended_at, walk_route (jsonb), walk_distance_km, walk_duration_minutes, walk_summary_map_url
reviews
booking_id, reviewer_id, provider_id, rating (1-5), text, photos (array), provider_response, response_at
messages
conversation_id, sender_id, recipient_id, booking_id (nullable), adoption_id (nullable), content, photos (array), read_at
rescue_orgs
user_id (FK users), name, mission, location, charity_registration, website, social_links (jsonb), logo_url, verified, slug
adoption_listings
org_id (FK rescue_orgs), name, species, breed, estimated_age, sex, spayed_neutered, temperament, medical_history, special_needs, local_adoption_fee, international_eligible (boolean), destination_countries (array), photos (array), status (available|application_pending|matched|in_transit|adopted), slug
adoption_applications
listing_id, applicant_id (FK users), country, city, living_situation, has_garden, other_pets, children_ages, experience, reason, vet_reference, status (new|under_review|approved|declined|withdrawn)
adoption_placements
listing_id, application_id, rescue_org_id, adopter_id, destination_country, vet_prep_status (jsonb), transport_method, transport_provider, transport_booked_date, departure_date, arrival_date, total_fee, vet_cost, transport_cost, coordination_fee, stripe_payment_intent_id, status (preparing|vet_complete|transport_booked|in_transit|delivered|follow_up), checkin_1w, checkin_1m, checkin_3m
transport_providers
name, type (courier|cargo|volunteer), countries_served (array), contact_info, pricing_notes, rating, active
payouts
provider_id, amount, commission, net_amount, stripe_transfer_id, period_start, period_end, status (pending|processing|completed|failed)
charities
name, registration_number, mission, website, social_links (jsonb), logo_url, photos (array), primary_contact_name, primary_contact_email, bank_iban, how_funds_used, verified, featured, animals_in_care, district, total_received, supporter_count, slug, active
donations
user_id (nullable), charity_id (nullable), source (roundup|signup|guardian|platform_commission), amount, booking_id (nullable), stripe_payment_intent_id (nullable), stripe_invoice_id (nullable)
guardian_subscriptions
user_id, charity_id (nullable), stripe_subscription_id, amount_monthly, tier (friend|guardian|champion|custom), status (active|paused|cancelled)
user_giving_preferences
user_id, preferred_charity_id (nullable), roundup_enabled (boolean default true), guardian_subscription_id (nullable)
guarantee_claims
booking_id, reporter_id, claim_type (pet_injury|property_damage|provider_no_show|owner_no_show), description, photos (array), other_party_response, other_party_photos (array), admin_id, ruling, ruling_notes, payout_amount, payout_recipient_id, payout_stripe_transfer_id, status (submitted|under_review|awaiting_response|resolved|appealed|appeal_resolved), appeal_notes, appeal_ruling
disputes
booking_id, opened_by, dispute_type (service_quality|pet_welfare|communication|payment), description, evidence_photos (array), respondent_id, respondent_response, respondent_photos (array), admin_id, ruling, ruling_notes, refund_amount, status (opened|awaiting_response|under_review|resolved)
meet_and_greets
owner_id, provider_id, pet_ids (array), requested_datetime, confirmed_datetime, location_type (owner_home|provider_home|neutral|video), location_notes, status (requested|confirmed|completed|cancelled|expired), owner_notes_after, provider_notes_after, led_to_booking, booking_id (nullable)
giving_fund_distributions
month (date), total_fund_amount, distribution_method (equal|weighted), per_charity_amounts (jsonb), approved_by, approved_at, payout_status, stripe_transfer_ids (jsonb)
processed_webhook_events
stripe_event_id, event_type, processed_at
Page Routes
/                                   Homepage
/services                           Services landing
/services/search                    Search results
/services/provider/[slug]           Provider profile
/services/book/[provider-slug]      Booking flow
/adopt                              Adoption landing
/adopt/[listing-slug]               Animal profile
/adopt/apply/[listing-slug]         Adoption application
/adopt/from-cyprus-to-[country]     Country SEO pages
/adopt/happy-tails                  Adopted animals gallery
/giving                             Transparency dashboard
/giving/[charity-slug]              Charity profile
/giving/become-a-guardian           Guardian signup
/dashboard/owner                    Owner dashboard
/dashboard/provider                 Provider dashboard
/dashboard/rescue                   Rescue org dashboard
/dashboard/adopter                  Adopter dashboard
/dashboard/admin                    Admin dashboard
/[service-type]/[district]          District SEO pages
/how-it-works                       Explainer
/for-providers                      Provider recruitment
/for-rescues                        Rescue org recruitment
/blog                               Content hub
/about                              Mission and team

