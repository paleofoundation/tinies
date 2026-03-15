Tinies - Addendum A: Trust, Safety & Edge Cases (Developer Reference)
A1. Tinies Guarantee
Coverage
TypeCapReporting WindowPet injury during bookingEUR 2,000 per incident48 hours after booking endProperty damage at provider's homeEUR 500 per incident72 hoursProvider no-showFull refund + EUR 20 creditImmediateOwner no-showProvider gets 50%, owner gets 50% backImmediate
NOT Covered

Pre-existing undisclosed conditions
Owner negligence
Incidents outside booking window
Third-party injury (pet bites stranger)
Lost pets where provider followed protocols

Claims Process

Incident report filed via booking detail page (type, description min 100 chars, photos required)
Other party notified, 48hr to respond
Admin review (target: 72hr resolution)
Ruling: approved full/partial or denied
Payout via Stripe within 5 business days (requires vet invoice or repair receipt)
One appeal within 7 days, reviewed by different admin, final

Funding

Months 1-6: Self-funded from commission revenue (budget EUR 200/month reserve)
Month 6+: Partner with Cyprus insurer for group policy

A2. Cancellation Policies
Three Tiers (Provider chooses one)
Flexible (default):

24+ hours before: full refund
Under 24 hours: 50% refund
No-show: no refund

Moderate:

7+ days before: full refund
2-6 days before: 50% refund
Under 48 hours: no refund

Strict:

14+ days before: full refund
7-13 days before: 50% refund
Under 7 days: no refund

Provider Cancellations

Owner ALWAYS gets full refund regardless of timing
Provider cancellation rate tracked and displayed on profile
Above 10%: warning. Above 20%: review + potential suspension

Stripe Logic

Booking created → PaymentIntent with capture_method: manual (funds held)
Provider accepts → payment captured
Provider doesn't respond in 4hr → PaymentIntent cancelled (auto, needs cron job every 15 min)
Owner cancels before capture → PaymentIntent cancelled (full release)
Owner cancels after capture → refund calculated per policy tier + time remaining
5-minute grace period: cancellation within 5 min of capture AND before service starts = full refund regardless of policy

A3. Meet-and-Greet
Priority: P1 (within 30 days of launch)
Flow

Owner requests from provider profile ("Request a Meet-and-Greet" button alongside "Book Now")
Selects preferred date/time and location type (owner_home | provider_home | neutral | video)
Provider responds within 24hr: accept with time/place, suggest alternative, or decline
Meeting happens off-platform
Post-meet follow-up to both: "Ready to book?" Owner can proceed to booking (pre-populated) or walk away
Provider can flag pet concerns (noted on pet profile for future providers)

Free for both parties. Always.
Database: meet_and_greets table
id, owner_id, provider_id, pet_ids (array), requested_datetime, confirmed_datetime, location_type, location_notes, status (requested|confirmed|completed|cancelled|expired), owner_notes_after, provider_notes_after, led_to_booking (boolean), booking_id (nullable)
A4. GPS Walk Tracking
Priority: P1 (within 30 days of launch)
How It Works

Provider taps "Start Walk" on active booking → browser Geolocation API (navigator.geolocation.watchPosition)
Location recorded every 30 seconds → sent to server via WebSocket or periodic POST
Owner views live map (Google Maps polyline, updated every 15 sec via WebSocket/polling)
Provider taps "End Walk" → tracking stops
Walk summary generated: route map (Google Static Maps API), distance, duration, start/end times
Summary attached to booking record, visible in booking history

Technical Notes

Browser-based, no native app needed
~100 bytes per location update, 60-min walk = ~12KB total
Warn provider about battery usage

Database additions to bookings table
walk_started_at, walk_ended_at, walk_route (jsonb: array of {lat, lng, timestamp}), walk_distance_km (float), walk_duration_minutes (int), walk_summary_map_url
A5. Additional Service Categories
Drop-In Visits (P0 — launch)

20-30 min visit to owner's home to feed/water/check on pet
Primary service for cat owners
Pricing: flat rate per visit (EUR 10-20 typical)
Booking: owner specifies date range + visits per day (1 or 2)
Each visit logged individually (arrival, departure, notes, photos)

Daycare (P1 — within 30 days)

Pet at provider's home during day (7am-7pm typical), returned in evening
Pricing: daily rate (EUR 15-30 typical)
Booking: select dates (specific or recurring weekly), drop-off/pick-up windows
Provider sets max capacity per day

Service type enum update
walking | sitting | boarding | drop_in | daycare
A6. Dispute Resolution
Priority: P0 (must exist at launch)
Dispute Types

service_quality — service not as described
pet_welfare — pet not properly cared for
communication — provider/owner unresponsive or unprofessional
payment — overcharge or underpayment

Process

Encourage direct resolution via messaging first (banner on booking page)
Either party opens dispute within 7 days of booking completion (type, description min 100 chars, photos)
Other party notified, 48hr to respond
Admin reviews all evidence + messaging history + GPS data + booking details + platform history
Ruling: no_action | warning | partial_refund | full_refund | provider_suspended | owner_restricted
Written explanation to both parties

Consequences

3+ upheld disputes in 12 months (provider) → permanent suspension
3+ unfounded disputes in 12 months (owner) → lose dispute privileges

Database: disputes table
id, booking_id, opened_by, dispute_type, description, evidence_photos (array), respondent_id, respondent_response, respondent_photos (array), admin_id, ruling, ruling_notes, refund_amount, status (opened|awaiting_response|under_review|resolved), created_at, resolved_at
A7. Provider Onboarding Wizard
Priority: P0 (built in Week 2)
Steps

Profile Photo — clear photo of the person (not pet). Required.
Bio — 2-3 paragraphs. Min 200 chars, max 1000. Show example.
Services & Pricing — select services, set rates. Show area average pricing.
Photos — 5-15 photos of home, garden, walking area, with animals. Min 3 required.
Availability — weekly calendar with draggable time blocks. Default: weekdays 8am-6pm.
Pet Preferences — types accepted, size restrictions, max pets at once.
Identity Verification — upload government ID. Explain secure storage, 24-48hr review.
Cancellation Policy — choose Flexible/Moderate/Strict. Default: Flexible.

Profile Completeness Score

Photo (10%), Bio (10%), 5+ gallery photos (15%), Services set (15%), Availability (15%), Pet prefs (10%), ID verified (15%), Cancellation policy (10%)
Below 80%: prompt to complete
100%: "Complete Profile" badge
Score used as search ranking factor

A8. Multi-Pet Pricing
Provider Config
Each service has: base_price + additional_pet_price (must be < base_price, default 50% of base)
Booking Calculation
Total = base_price + (additional_pet_count × additional_pet_price)
UI
Price updates dynamically as pets added/removed. Breakdown shown:
"1x Dog Walking (Bella): EUR 15. 1x additional pet (Max): EUR 8. Total: EUR 23."
Provider max_pets limit enforced in booking flow.
services_offered jsonb structure
json[{
  "type": "walking",
  "base_price": 1500,
  "additional_pet_price": 800,
  "price_unit": "per_walk",
  "max_pets": 3
}]
(All prices in cents internally)
A9. Notification Templates
TriggerChannelTemplateOwner creates bookingEmail+SMS to provider"New booking request from {owner_name} for {service_type} on {date}. {pet_name} ({species}, {breed}). Respond within 4 hours. View: {link}"Provider acceptsEmail+SMS to owner"Great news! {provider_name} accepted your booking for {pet_name} on {date}. EUR {amount} confirmed. View: {link}"Provider declinesEmail to owner"{provider_name} can't accept your booking for {date}. Payment released. Browse others: {link}"4hr timeoutEmail+SMS to owner"Request expired — {provider_name} didn't respond. Payment released. Browse: {link}"24hr reminderEmail+SMS to both"Reminder: {service_type} with {other_party} tomorrow at {time}. Details: {link}"Booking startsSMS to owner"{provider_name} started {service_type} for {pet_name}. Follow along: {link}"Walk tracking startedSMS to owner"{provider_name} is walking {pet_name}. Track live: {link}"Booking completedEmail to bothOwner: "Leave a review for {provider_name}: {link}" / Provider: "Earnings EUR {net} in next payout"Review prompt (24hr after)Email to owner"How was {pet_name}'s experience? Leave a review: {link}"Review receivedEmail to provider"{owner_name} left a {rating}-star review! Read: {link}"Payment receiptEmail to owner"EUR {amount} confirmed for {service_type} with {provider_name}. ID: {stripe_id}"Payout processedEmail to provider"EUR {net} sent to your bank. Arrives in 2-3 days. View: {link}"Owner cancelsEmail+SMS to provider"{owner_name} cancelled booking for {date}. {refund_note}. Schedule: {link}"Provider cancelsEmail+SMS to owner"{provider_name} cancelled for {date}. Full refund EUR {amount} initiated. Find another: {link}"New messageSMS (first per conversation per 24hr)"New message from {sender_name}. Reply: {link}"Adoption application receivedEmail to rescue"New inquiry for {animal_name} from {applicant_name} in {country}. Review: {link}"Adoption status updateEmail to applicant"Update on {animal_name}: {status_message}. Details: {link}"Adoption logistics milestoneEmail to adopter"{animal_name}: {milestone}. Track: {link}"Check-in 1 weekEmail to adopter"One week with {animal_name}! Share a photo: {link}"Check-in 1 monthEmail to adopter"One month! How is {animal_name}? Update: {link}"Check-in 3 monthsEmail to adopter"Three months! Share for Happy Tails: {link}"Guarantee claim filedEmail to other party"Claim filed on booking #{id}. Respond within 48hr: {link}"Dispute openedEmail to other party"Dispute on booking #{id}. Respond within 48hr: {link}"Dispute/claim resolvedEmail to both"Resolved: {ruling_summary}. Details: {link}"
A10. Payment Edge Cases
ScenarioHandlingOwner books, provider acceptsPaymentIntent manual capture → capture on accept. Commission held. Net queued for weekly payout.Provider doesn't respond 4hrPaymentIntent auto-cancelled. Cron job every 15 min checks pending bookings past window.Provider declinesPaymentIntent cancelled immediately.Owner cancels before acceptPaymentIntent cancelled. Full release.Owner cancels after acceptRefund per cancellation policy tier. Stripe Refund API. Provider gets non-refunded portion minus commission.Provider cancels after acceptFull refund to owner. Provider gets nothing. Cancellation counter +1.Normal completionBooking marked complete. 12% retained. 88% to provider payout queue. Weekly payout (Mondays). Min EUR 20.Card declinedPaymentIntent fails. Error message. Booking not created.Cancel within 5 min of capture + before serviceFull refund regardless of policy (accidental booking grace).International adoption paymentSingle PaymentIntent for full fee. Captured immediately. Vet costs → rescue org. Transport → provider. Coordination fee → Tinies.Payout failsStripe transfer fails. Provider notified. Retry after 3 days. 2 retries then admin notified.Webhook dedupprocessed_webhook_events table. Idempotent handlers. Stripe retries 72hr. Daily reconciliation as safety net.CurrencyAll EUR. No multi-currency. International adopters pay in EUR (Stripe handles conversion).