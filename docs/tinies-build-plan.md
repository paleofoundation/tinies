Tinies.app — Master Build Plan
Version: 1.0 | March 2026
Status: Active development — some features built, core transaction flow not yet implemented
How to use this document: This is the single source of truth for what to build and in what order. Feed specific phases to Cursor when you're ready to build them. Reference the business plan, addendums, and competitive audit for deeper context on any feature.

Current State Assessment
What's Built and Working

Auth: Login, signup, OAuth callback (Supabase Auth)
Layout: Header, footer, responsive shell
Homepage: Hero, search bar, featured sections (~218 lines)
Provider system: Public profile page, provider dashboard, profile editor (~950 lines combined)
Services: Landing page with category cards, search results page with filters
Adoption: Listings browse page, admin listing creation + edit forms
Admin: Dashboard with adoption management and server actions
Giving: Public giving page
Content pages: About, How It Works, For Providers, For Rescues, Blog (with markdown posts)
Database: Full Prisma schema with all models, enums, indexes, and relations
Infra: Supabase client/server setup, Prisma client, middleware

What's NOT Built (In Priority Order)

Booking & payment flow — No way to actually book or pay. This is the revenue engine.
Stripe integration — No payment processing, no provider payouts
Messaging — No owner-provider communication
Pet profiles — Owners can't add their pets
Owner dashboard — 25-line stub
Review system — No post-booking reviews
Email/SMS notifications — Templates and sending not implemented
Maps integration — No geocoding, no map views in search
Adoption application flow — No apply form, no adopter dashboard, no rescue dashboard
Adoption logistics pipeline — No tracking dashboard
GPS walk tracking — Schema fields exist but no frontend or tracking logic
Giving mechanics — Page exists but no round-up, no Guardian subscription, no donation processing
Meet & Greet — Schema exists but no UI
Disputes/Guarantee claims — Schema exists but no UI
Provider verification queue — May be partially in admin
SEO landing pages — No district or country dynamic pages


Build Phases
The plan is organized into 6 phases. Each phase produces working functionality. Do not skip ahead — later phases depend on earlier ones.

PHASE 1: The Transaction Core
Goal: A pet owner can find a provider, book a service, and pay. A provider can accept and get paid. This is the minimum viable business.
Duration: ~2 weeks
Why first: Nothing else matters until money can flow through the platform.
1.1 Pet Profile Management
What: Owner can create, edit, and delete pet profiles from their dashboard.
Build on: Owner dashboard stub (src/app/dashboard/owner/page.tsx), Pet model in schema.
Spec:

Dashboard page at /dashboard/owner with tabs: My Pets, My Bookings (empty for now), Messages (empty for now)
"Add Pet" button opens a form (can be a modal or separate page)
Form fields match Pet model: name, species (dog/cat/other dropdown), breed, age, weight, sex, spayed/neutered, temperament (text), medical notes, dietary needs, vet name, vet phone, photos (up to 5, upload to Supabase Storage)
Pet cards display in a grid showing photo, name, species, breed, age
Edit and delete functionality
Server Actions for create/update/delete (src/app/dashboard/owner/actions.ts)
Zod validation schema for pet data

1.2 Stripe Setup
What: Initialize Stripe for payment processing and provider payouts.
Build on: lib/stripe/index.ts (currently empty or minimal).
Spec:

Install Stripe SDK: npm install stripe @stripe/stripe-js
Create lib/stripe/index.ts with server-side Stripe client (using STRIPE_SECRET_KEY)
Create a Stripe webhook endpoint at src/app/api/webhooks/stripe/route.ts
Webhook handler must be idempotent — check ProcessedWebhookEvent table before processing
Handle these events initially: payment_intent.succeeded, payment_intent.canceled, charge.refunded
Add Stripe Connect setup for provider payouts (providers need a connected account)
Provider dashboard should show a "Set Up Payouts" button that creates a Stripe Connect onboarding link
Store stripe_connect_account_id on ProviderProfile (NOTE: this field needs to be added to the schema)

Schema change needed:
prisma// Add to ProviderProfile model:
stripeConnectAccountId String? @map("stripe_connect_account_id")
1.3 Booking Flow
What: Owner selects a provider, chooses service/dates/pets, and pays.
Build on: Provider profile page (src/app/services/provider/[slug]/page.tsx), Booking model.
Spec:

On the provider profile page, add two CTAs: "Message [Name]" (primary) and "Book Now" (secondary). This follows the Rover pattern — messaging first builds trust, especially in Cyprus.
"Book Now" links to /services/book/[provider-slug]
Booking page (new file: src/app/services/book/[slug]/page.tsx) has these steps, all on one page as sections (not a multi-page wizard):

Step 1 — Service: Select service type from provider's offered services. Show base price and additional pet price. Show cancellation policy.
Step 2 — Dates & Times: Date picker for start/end. For walking: single date + time. For sitting/boarding: date range. For drop-in: date range + visits per day. For daycare: select specific dates.
Step 3 — Pets: Select from owner's pet profiles (checkboxes). Price updates dynamically as pets are added/removed. Show breakdown: "1x dog walking (Bella): EUR 15. 1x additional pet (Max): EUR 8. Total: EUR 23." If provider has max_pets limit, enforce it.
Step 4 — Details: Special instructions textarea. Confirm cancellation policy display.
Step 5 — Payment: Show total with breakdown. Round-up donation toggle (on by default): "Round up to EUR {rounded} and donate EUR {roundup_amount} to animal rescue?" Stripe Payment Element for card input. "Confirm Booking" button.
Backend logic:

Create booking with status: pending
Create Stripe PaymentIntent with capture_method: manual (authorize, don't capture yet)
Include round-up amount as separate line if enabled
Record round-up as donation in donations table
After provider accepts → capture payment
After provider declines or 4-hour timeout → cancel PaymentIntent

1.4 Provider Booking Management
What: Provider sees incoming booking requests and can accept/decline.
Build on: Provider dashboard (src/app/dashboard/provider/page.tsx).
Spec:

Add "Booking Requests" section to provider dashboard showing pending bookings
Each pending booking card shows: owner name, pet name(s), service type, dates, total price, special instructions, time remaining to respond (countdown from 4 hours)
Accept button → captures Stripe payment, changes booking status to accepted, sends notification to owner
Decline button → cancels PaymentIntent, changes status to declined, sends notification to owner
Also show: Active bookings, Completed bookings (tabs or sections)
Cron job / scheduled function needed: check for pending bookings older than 4 hours and auto-expire them (cancel PaymentIntent, notify owner). This can be a Vercel cron or a server action triggered on page load that checks stale bookings.

1.5 Owner Booking Dashboard
What: Owner sees their bookings with status.
Build on: Owner dashboard.
Spec:

"My Bookings" tab shows bookings grouped by status: Upcoming (pending + accepted), Active, Completed, Cancelled
Each booking card: provider name + photo, service type, dates, pet names, price, status badge
Pending bookings show "Waiting for [provider] to accept..."
Accepted bookings show provider contact info and booking details
Completed bookings show "Leave a Review" button (review system built in Phase 2)
Cancel button on pending and accepted bookings (refund calculated per provider's cancellation policy)


PHASE 2: Trust & Communication
Goal: Owners and providers can message each other, leave reviews, and receive notifications. The platform feels alive and trustworthy.
Duration: ~2 weeks
Why second: Once bookings work, users need to communicate and build trust through reviews.
2.1 Messaging System
What: Direct messaging between owners and providers, both pre-booking and during bookings.
Spec:

New pages: /dashboard/messages (shared by all roles), /dashboard/messages/[conversationId]
Conversation list: shows all conversations with most recent message preview, unread indicator, other party's name + avatar
Conversation view: chat-style message thread, text input + photo upload, messages marked as read on view
Pre-booking: owner can message provider from their profile page ("Message [Name]" button)
During booking: messages are linked to the booking via bookingId
Server Actions for sending messages, marking as read
Real-time: use Supabase Realtime subscriptions on the messages table for live updates (or poll every 10 seconds as a simpler first implementation)

2.2 Review System
What: After a booking is completed, the owner is prompted to leave a review.
Spec:

After booking status changes to completed, show "Leave a Review" prompt on the owner's booking card and in a follow-up email (email in Phase 3)
Review form: 1-5 star rating (clickable stars), text (min 20 chars), optional photo upload
Reviews display on provider profile page (already has a reviews section — wire it to real data)
Provider can respond once (text only, from their dashboard)
Owner can edit their review within 48 hours
Update provider's avgRating and reviewCount on ProviderProfile when review is created/updated
Show a featured review snippet on provider cards in search results (from competitive audit — high conversion impact)

2.3 Email Notifications (Core Set)
What: Transactional emails for the most critical events.
Build on: lib/email/index.ts.
Spec:

Install and configure Resend: npm install resend
Use React Email for templates: npm install @react-email/components
Create email templates in src/lib/email/templates/:

booking-request.tsx (to provider: new booking request)
booking-accepted.tsx (to owner: booking confirmed)
booking-declined.tsx (to owner: provider declined)
booking-expired.tsx (to owner: provider didn't respond)
booking-reminder.tsx (to both: 24 hours before booking)
booking-completed.tsx (to both: service complete, review prompt to owner)
review-received.tsx (to provider: new review)


Send emails from Server Actions when these events occur
Every email includes the Tinies footer: "10% of proceeds support animal rescue. tinies.app/giving"

2.4 SMS Notifications (Critical Only)
What: SMS for time-sensitive events only.
Build on: lib/sms/index.ts.
Spec:

Install and configure Twilio: npm install twilio
SMS only for: new booking request (to provider), booking accepted (to owner), booking reminder 24hr (to both), booking started (to owner)
Keep messages short. Example: "New booking request from {owner_name} for {service_type} on {date}. Respond within 4 hours: {link}"
Only send to users with verified phone numbers


PHASE 3: Search, Maps & Discovery
Goal: Search actually works with location, maps show providers on a map, and the platform is discoverable via SEO.
Duration: ~1.5 weeks
Why third: The booking flow works, but users need to actually find providers effectively.
3.1 Maps Integration
What: Google Maps on search results, provider profiles, and service area configuration.
Build on: components/maps/index.ts (empty barrel file).
Spec:

Install: npm install @vis.gl/react-google-maps (or use Google Maps JavaScript API directly)
Search results page: split layout — provider list on left, interactive map on right with numbered pins (matching the Rover pattern confirmed by the competitive audit)
Provider profile: static map showing approximate service area (circle overlay on map)
Provider edit profile: map picker for service area center + radius slider
Geocoding: when owner enters location in search, convert to lat/lng using Google Geocoding API

3.2 Enhanced Search
What: Location-based search with proper filtering and sorting.
Build on: Search page (src/app/services/search/page.tsx, ~241 lines).
Spec:

Search parameters: service type, location (lat/lng from geocoding), dates, pet type
Filters (from competitive audit): price range slider, cancellation policy, pet size accepted, provider has yard/garden, provider rating minimum
Sort by: distance, rating, price (low to high), review count
Results show provider cards with: photo, name, rating + review count, a featured review snippet, neighborhood/district, price, cancellation policy, availability freshness ("calendar updated today")
Pricing context at bottom of results: "Providers in {district} typically charge EUR {range} for {service}"
Use PostGIS for distance calculations (requires the PostGIS extension enabled in Supabase — check if it's enabled, enable if not)

3.3 SEO Landing Pages
What: Auto-generated district and country pages for organic search traffic.
Spec:

District service pages: /dog-walking/limassol, /pet-sitting/nicosia, /boarding/paphos, etc.
Generate these as dynamic routes: src/app/[serviceType]/[district]/page.tsx
Each page: H1 "{Service} in {District}", district description, search results for that district, FAQ section with Schema.org structured data (FAQPage)
Country adoption pages: /adopt/from-cyprus-to-uk, /adopt/from-cyprus-to-germany, etc.
src/app/adopt/from-cyprus-to-[country]/page.tsx
Each page: guide content for adopting from Cyprus to that country, eligible listings, country-specific requirements
Generate dynamic sitemap.xml from all public routes


PHASE 4: Adoption Pipeline
Goal: The full international adoption flow works end-to-end — from browsing to application to logistics tracking.
Duration: ~2 weeks
Why fourth: The adoption arm is the differentiator that drives international traffic, but the local services marketplace must work first.
4.1 Adoption Application Form
What: Adopter can apply to adopt an animal.
Spec:

New page: src/app/adopt/apply/[listing-slug]/page.tsx
Form matches AdoptionApplication model: country, city, living situation, garden, other pets, children's ages, experience, reason for adopting, vet reference
Auto-surface destination-specific requirements based on selected country (UK needs rabies titer test, Germany has breed restrictions, etc.)
On submit: create application with status "new", send notification to rescue org
Redirect to /dashboard/adopter showing application status

4.2 Rescue Org Dashboard
What: Rescue organizations manage their listings and review applications.
Spec:

New page: src/app/dashboard/rescue/page.tsx
Tabs: Active Listings, Adoption Inquiries, Placement Pipeline, Messages, Org Profile
Active Listings: grid of their animals with status badges, edit/deactivate buttons
Adoption Inquiries: list of applications grouped by status (new, under review, approved, declined)
Each application card: applicant info, their answers, messaging thread, approve/decline buttons
Org Profile: edit organization details, logo, mission

4.3 Adopter Dashboard
What: International adopters track their application and placement progress.
Spec:

New page: src/app/dashboard/adopter/page.tsx
Shows all applications with current status
For approved applications with active placements: logistics tracking dashboard
Tracking shows checklist-style pipeline: Application Approved → Vet Preparation → Vaccinations Complete → Microchip → Rabies Titer Test (if required) → EU Pet Passport → Transport Booked → Departure Confirmed → In Transit → Delivered → Follow-Up
Each step shows status (pending/in progress/complete) with dates
Messages tab for communicating with rescue org through the platform

4.4 Adoption Logistics Dashboard (Admin)
What: Admin manages the logistics pipeline for each placement.
Build on: Admin dashboard.
Spec:

Add "Adoption Pipeline" section to admin dashboard
List of all active placements with status filters
Click into a placement to update each step: mark vet prep items complete, upload documents, select transport provider, enter departure/arrival dates
Transport provider database management (CRUD for TransportProvider model)
Fee calculator: auto-generate breakdown based on destination country (vet costs + transport costs + coordination fee)


PHASE 5: Giving, GPS & Trust Features
Goal: The giving system processes real money, GPS walk tracking works, and trust infrastructure (disputes, guarantee claims, meet & greets) is in place.
Duration: ~2 weeks
5.1 Giving Mechanics
What: Round-up at booking processes real donations, Guardian subscriptions work, giving page shows live data.
Build on: Giving page (src/app/giving/page.tsx, ~207 lines), all giving schema models.
Spec:

Round-up at booking: already designed into Phase 1 booking flow. Ensure the donation record is created in the donations table when payment is captured.
Platform 10% commission allocation: when a booking completes, calculate 10% of commission and record as a platform_commission donation
Signup donation prompt: after successful registration, show a welcome screen with featured charities and donation buttons (EUR 5/10/25/custom). Process via Stripe PaymentIntent.
Guardian subscription: /giving/become-a-guardian page with tier selection (EUR 3/5/10/custom), charity selection, Stripe Subscription creation
Giving page: replace static content with live data from donations and charities tables — total donated, charities funded, monthly breakdown
Charity profile pages: /giving/[charity-slug] with public charity info, total received, supporter count, "Donate" button
Account settings: preferred charity selection, round-up toggle, Guardian management

5.1b Community of Givers (Cialdini-Informed Social Proof)
What: A public-facing supporter recognition system on the /giving page that uses social proof, unity, and commitment/consistency to encourage more giving — without creating comparison anxiety or turning donations into advertising.
Build on: Giving page from 5.1, donations and guardian_subscriptions tables.
Spec:
"/giving" page additions — "Our Community of Givers" section:

Live community counter at the top: "Together, our community has donated EUR {total} to {count} sanctuaries" — the big number is the collective total, never individual amounts.
Recent donor grid: cards showing first name + last initial, country (with flag emoji), tier badge (Guardian/Champion/Hero), and the charity they support. No exact amounts. No company links. Example: "Karen P. — Cyprus — Tinies Champion — Gardens of St Gertrude"
Scrolling live ticker of recent donations: "Karen P. just donated EUR 10 to Gardens of St Gertrude" / "A Tinies Guardian subscription was just started" — updates from the donations table, most recent first. Shows individual donation amounts only for recent activity (not lifetime totals).
"Join {count} supporters" CTA linking to /giving/become-a-guardian.

Tier system (recognition, not financial rank):

Tinies Friend: Active Guardian subscriber at EUR 3/mo tier, OR has donated 1-3 times
Tinies Guardian: Active Guardian subscriber at EUR 5/mo tier, OR has donated 4-10 times
Tinies Champion: Active Guardian subscriber at EUR 10+/mo tier, OR has donated 10+ times, OR lifetime giving > EUR 100
Tinies Hero: Lifetime giving > EUR 500
Badge is shown on the user's profile (visible to providers and rescue orgs) and on the Community of Givers grid. Computed from donations table + guardian_subscriptions.

Opt-in visibility:

When making a donation (round-up, one-time, or Guardian signup), show a checkbox: "Show my name on the Tinies supporters page?" Default OFF. Respectful of privacy. Stored as a boolean on UserGivingPreference (new field: showOnLeaderboard).
Anonymous donors shown as "A generous supporter — {country}" in the grid and ticker.

Why this works (Cialdini principles applied):

Social proof: Real names and real activity from real people normalize giving.
Commitment/consistency: Once your name is public, you're more likely to maintain or increase your giving.
Unity: Country flags create an "international community" identity — people in Cyprus, UK, Germany, all giving together.
No "drop in the bucket" effect: Collective total is the hero number, not individual rankings. A EUR 5 donor and a EUR 500 donor both appear as supporters.
No advertising: First name + country only, no company links. Organizational sponsors get a separate "Partners" section if needed later.

Schema addition:
prisma// Add to UserGivingPreference:
showOnLeaderboard Boolean @default(false) @map("show_on_leaderboard")
New files:
src/components/giving/CommunityOfGivers.tsx    (grid of donor cards)
src/components/giving/DonationTicker.tsx        (scrolling recent activity)
src/components/giving/GivingTierBadge.tsx       (tier badge component)
5.2 GPS Walk Tracking
What: Provider starts a walk, owner watches live on a map, walk summary saved to booking.
Spec:

Provider active booking view: "Start Walk" button. Uses browser Geolocation API (navigator.geolocation.watchPosition) to record coordinates every 30 seconds.
Send coordinates to server via POST request every 30 seconds (store in walkRoute jsonb on booking)
Owner can view live walk: map page showing moving pin + polyline route, distance covered, elapsed time (poll server every 15 seconds for new coordinates, or use Supabase Realtime)
"End Walk" button: stop tracking, calculate total distance and duration, generate static map image URL (Google Static Maps API), save walkSummaryMapUrl to booking
Battery warning to provider before starting

5.3 Meet & Greet
What: Structured scheduling for owner-provider meetings before booking.
Spec:

"Request a Meet & Greet" button on provider profile page (alongside Message and Book)
Request form: preferred date/time, location type (owner's home, provider's home, neutral, video call)
Provider receives notification, can accept/suggest alternative/decline
After meeting, both parties get follow-up: "How did it go? Ready to book?"
Track whether meet & greets convert to bookings (ledToBooking field)

5.4 Disputes & Guarantee Claims UI
What: Users can report problems and file claims through the platform.
Spec:

"Report a Problem" button on every completed booking detail page
Dispute form: type selection, description (min 100 chars), photo upload
Other party notified with 48-hour response window
Admin review interface in admin dashboard
Guarantee claim flow: similar but specifically for injury/damage/no-show with financial payout tracking
Keep this simple at launch — the forms and admin review are enough. The mere existence of the system builds trust.

5.5 Charity / Sanctuary Dashboard
What: Registered charities and rescue sanctuaries can log in and see their donation activity, supporter stats, expected payouts, and manage their public profile — all in real time, not just via a monthly email.
Build on: Charity model in schema, charity profile pages from 5.1.
Spec:

New page: src/app/dashboard/charity/page.tsx
A charity is a separate entity from a rescue org (per Addendum B: "A charity that only receives donations but does not list animals for adoption is welcome. A rescue org that lists animals for adoption and also receives donations is also welcome. The two functions are independent."). This means a charity needs its own user account or be linkable to an existing user. The simplest approach: add a userId field to the Charity model so a charity contact person can log in and see their dashboard.

Dashboard tabs:
Overview:

Total received through Tinies (all time)
Total received this month
Number of active supporters (unique donors)
Next expected payout amount and date
Trend line or bar chart: monthly donations received over last 12 months

Donation Activity:

Table of all donations received, sorted by most recent
Each row: date, amount, source (round-up / one-time / Guardian subscription / Giving Fund distribution), anonymous or donor first name only
Filters: by source type, by date range
Exportable as CSV (for charity's own accounting)

Supporters:

Count of: round-up donors, one-time donors, active Guardian subscribers
No personally identifiable information shown (privacy) — just counts and aggregates

Payouts:

History of all monthly payouts received from Tinies
Each row: month, total amount, breakdown by source, payout status (pending / processing / completed), expected arrival date
If a payout is pending admin approval, show "Pending review — expected by [date]"

Profile Management:

Edit public profile: name, mission, logo, photos, "how funds are used" description, annual update text
Preview of how their /giving/[slug] page looks to the public

Schema change needed:
prisma// Add to Charity model:
userId String? @unique @map("user_id")
user   User?   @relation(fields: [userId], references: [id], onDelete: SetNull)
prisma// Add to User model relations:
charity Charity?
Auth/role approach: The charity contact person signs up as a regular user. Admin links their user account to the charity record (sets userId on Charity). When that user logs in, the system detects they have a linked charity and shows the charity dashboard option in their navigation. This avoids adding a new UserRole — the charity dashboard is accessed by checking if the logged-in user has a linked Charity record, not by role.
Charity Invitation Flow (admin-initiated onboarding):
Instead of making charity contacts figure things out alone, the admin pre-loads their info and sends a personalized invite:

Admin dashboard: "Invite Charity" button opens a form where admin enters: charity name, mission, contact person name, contact email, logo URL, any photos or info already available.
On submit: creates the Charity record in the database (pre-filled), generates a unique invite token (stored on the Charity record), and sends an email to the contact person.
Email: "Hi {name}, {admin_name} from Tinies has set up {charity_name} on tinies.app to start receiving donations from pet owners across Cyprus. Click here to finish setting up your account." Links to /invite/charity/[token].
Invite page (src/app/invite/charity/[token]/page.tsx): looks up the charity by token. If the contact person already has a Tinies account, they log in and the charity is linked to their account. If they don't, they create an account (name, email, password) and the charity is automatically linked. Either way, they land on /dashboard/charity with their profile half-filled-out, ready to add photos, update their mission, and see incoming donations.
Schema addition: inviteToken String? @unique @map("invite_token") on Charity model.

5.6 Quick Donate — Mobile-Optimized Public Donation Page
What: A fast, mobile-first donation page that supports Apple Pay and Google Pay, designed to be used in person via QR code or short link. Supports both one-time gifts and monthly subscriptions. Monthly donors automatically become Tinies Guardians. You walk up to someone at an event or a café, show them a QR code, they tap, Apple Pay, done. 15 seconds from "want to help?" to receipt.
Build on: Stripe Payment Element (already supports Apple Pay/Google Pay automatically), charity profile pages from 5.1, Guardian subscription logic from 5.1.
Spec:
Quick donate page: /give (or /donate)

src/app/give/page.tsx — mobile-optimized, minimal UI, fast-loading
Large heading: "Help rescue animals in Cyprus"
Giving type toggle at the top: "One time" | "Monthly" — two big tap-friendly buttons, visually prominent. Default: One time.
Amount selection: big tap-friendly buttons. One-time: EUR 5, EUR 10, EUR 25, EUR 50, EUR 100 + custom. Monthly: EUR 3, EUR 5, EUR 10, EUR 25 + custom (min EUR 1).
When "Monthly" is selected, show a subtle benefit line below the amounts: "Monthly donors become Tinies Guardians with a profile badge and impact reports." Show the tier they'll receive based on selected amount (EUR 3 = Friend, EUR 5 = Guardian, EUR 10+ = Champion).
Charity selector: dropdown or card selector showing featured charities with logos. Default: "Tinies Giving Fund (distributed to all sanctuaries)"
Optional: donor name and email (for receipt). Email required for monthly (needed for Stripe Customer). Not required for one-time.
Stripe Payment Element — Apple Pay and Google Pay appear automatically on supported devices as the primary payment option (above card entry). This is built into Stripe's Payment Element, no extra code needed.
One-time flow: Creates a Stripe PaymentIntent, records Donation with source one_time.
Monthly flow: Creates a Stripe Customer (using email), creates a Stripe Subscription, records GuardianSubscription with the appropriate tier, updates UserGivingPreference. If the donor is logged in, links to their account. If not logged in, the subscription is created with just their email — they can claim it later by signing up with the same email.
On success for one-time: "Thank you! Your donation of EUR {amount} is on its way to {charity_name}." Share button.
On success for monthly: "Welcome, Tinies {tier}! Your EUR {amount}/month donation to {charity_name} starts today. You'll receive monthly impact reports." Share button. If not logged in: "Create a Tinies account to see your Guardian badge and giving history."
Community of Givers opt-in checkbox (from 5.1b)

Per-charity quick donate: /give/[charity-slug]

Same page but pre-selects the charity. No dropdown needed.
URL example: tinies.app/give/gardens-of-st-gertrude
Perfect for QR codes on printed materials, stickers, business cards

QR Code generation (admin):

In the charity dashboard and admin dashboard: "Generate QR Code" button for each charity
Generates a QR code image pointing to /give/[charity-slug]
Downloadable as PNG for printing on cards, stickers, posters, event materials
Also generate a QR code for the general /give page

In-person use case:

You're at an event, someone asks about the sanctuary
You show them a QR code on your phone (saved as an image) or hand them a printed card
They scan it, the donation page opens, they pick one-time or monthly, tap Apple Pay
Done in 15 seconds. Stripe sends them a receipt. The donation appears on the giving page ticker immediately.
One-time: "Karen P. just donated EUR 100 to Gardens of St Gertrude" scrolls across the ticker
Monthly: "A new Tinies Champion just started supporting Gardens of St Gertrude" scrolls across the ticker

Technical notes:

Apple Pay and Google Pay work automatically through Stripe's Payment Element when the site is served over HTTPS (which tinies.app is via Vercel). No additional Stripe configuration needed for test mode. For production, you'll need to verify your domain in the Stripe dashboard under Apple Pay settings.
QR code generation: use a simple library like qrcode (npm install qrcode) to generate PNG images from URLs.
Monthly subscriptions for non-logged-in donors: create a Stripe Customer with email only. If they later sign up with that email, match and link the subscription to their account via a background check on login.

New files:
src/app/give/page.tsx                    (new — general quick donate)
src/app/give/[slug]/page.tsx             (new — per-charity quick donate)
src/components/giving/QRCodeGenerator.tsx (new — QR code component)

PHASE 6: Polish, Scale & Launch Prep
Goal: Everything works, looks professional, and is ready for real users.
Duration: ~1.5 weeks
6.1 Provider Onboarding Wizard
What: Guided setup for new providers instead of a blank dashboard.
Build on: Provider edit profile page.
Spec:

When a new provider first visits their dashboard, show a step-by-step wizard instead of the normal dashboard
Steps: Profile Photo → Bio → Services & Pricing (show area averages) → Photos (min 3) → Availability → Pet Preferences → ID Verification Upload → Cancellation Policy
Profile completeness score displayed on dashboard (percentage)
Profiles below 80% show a prompt. 100% shows a "Complete Profile" badge visible to owners.

6.2 Admin Provider Verification (with Stripe Identity)
What: Automated ID verification via Stripe Identity — providers verified in minutes, not days. Manual admin queue as fallback for edge cases.
Build on: Admin dashboard, provider onboarding wizard, Stripe integration.
Spec:

Primary flow: Stripe Identity VerificationSession (document + selfie). Provider uploads ID and takes selfie through Stripe-hosted modal. Stripe verifies document is real, extracts info, compares selfie to ID photo. Result in ~60 seconds.
Webhook handles identity.verification_session.verified (auto-approve) and identity.verification_session.requires_input (flag for manual review)
Fallback: Admin verification queue for providers where Stripe Identity failed or wasn't used
Verification queue: list of providers awaiting review with ID document image and profile summary
Approve/reject buttons with email notifications
Unverified providers hidden from search results
Schema addition: stripeVerificationSessionId on ProviderProfile

6.3 Home Details on Provider Profile
What: Structured fields for housing info critical for boarding/daycare decisions.
Spec (from competitive audit):

Add to ProviderProfile schema and edit form:

homeType: house | apartment
hasYard: boolean
yardFenced: boolean
smokingHome: boolean
petsInHome: string (description of provider's own pets)
childrenInHome: string
dogsOnFurniture: boolean
pottyBreakFrequency: string
typicalDay: string (free text — "A typical day with me" section)
infoWantedAboutPet: string (free text — "What I'd like to know about your pet")


Display these on the public provider profile page in a structured "Home & Environment" section

6.4 Notification Polish
What: Complete the remaining email and SMS templates from the Addendum A9 notification spec.
Spec:

Add remaining email templates: payment receipt, payout processed, owner/provider cancellation, new message (first per conversation per 24hr), adoption application received, adoption status update, adoption milestones, post-adoption check-ins (1wk, 1mo, 3mo), guarantee claim filed, dispute opened/resolved
Add monthly giving receipt email (all donors)
Add charity payout notification email

6.5 Performance, Testing & Launch
What: Everything works reliably on mobile and desktop.
Spec:

Mobile responsiveness audit: every page must work on a 375px screen
Image optimization: verify all images use Next.js Image component with Supabase as configured remote pattern
Error handling: verify all server actions have try/catch, user-facing errors show as toasts
Loading states: verify all pages have loading.tsx or skeleton states
Meta tags: verify every public page has unique title, description, OG tags
Schema.org structured data on: provider profiles (LocalBusiness), adoption listings (Product), giving page (DonateAction)
Test Stripe webhook handling in staging with Stripe CLI
Verify all environment variables are set in Vercel
Deploy to production

6.6 Rover-Inspired Feature Additions
What: Five high-impact features identified from the Rover competitive audit that address common user complaints and improve the experience. These are the features Rover users actively request but don't have, or that Rover does well and we should match.
Build on: Existing walk tracking (Phase 5.2), review system (Phase 2.2), provider profiles, booking flow.
6.6a — Walk Activity Icons (Pee/Poo/Food/Water Tracking)
The single most requested "nice touch" by pet owners on Rover. Four simple tap-buttons during walks and drop-in visits.

Update the ActiveWalkCard.tsx (provider walk UI): Add four icon buttons below the map during an active walk: 🐾 Pee, 💩 Poo, 🍽️ Food, 💧 Water
Each tap records an activity event with timestamp and current GPS coordinates
Store as a JSON array on the booking: walkActivities: [{ type: "pee"|"poo"|"food"|"water", lat, lng, timestamp }]
Show activity icons on the WalkTracker map (small markers at the locations where each event occurred)
Include activity summary in the walk summary after the walk ends: "During this walk: 2 pee breaks, 1 poo, water provided"
Owner sees the activity icons on their live walk view AND in the completed walk summary
Schema addition: walkActivities Json? @map("walk_activities") on Booking model

6.6b — Post-Service Report Cards (All Service Types)
Rover requires these for recurring walks. Tinies should have them for every service type — not just walks.

After ANY booking is marked as completed (not just walking), prompt the provider to submit a "Service Report"
Report form on the provider dashboard (completed booking cards): arrival time, departure time, notes about the visit/stay, up to 5 photos, activity checkboxes (fed, watered, walked, played, medication given — relevant ones shown based on service type)
Create a new model or JSON field for service reports: serviceReport Json? @map("service_report") on Booking
Report structure: { arrivalTime, departureTime, notes, photos[], activities: string[], submittedAt }
Owner sees the service report on their booking card and in booking history
For walk bookings: the walk tracking data IS the report (already built). The report card adds notes and photos on top.
For boarding/sitting/daycare/drop-in: this is the primary accountability mechanism

6.6c — Tipping
Rover allows tipping and providers keep 100%. Simple, increases provider satisfaction and retention.

On completed booking cards in the owner dashboard, add a "Tip [Provider Name]" button
Tip form: preset amounts (EUR 2, EUR 5, EUR 10) + custom amount
Process via Stripe PaymentIntent as a separate charge (not linked to the original booking payment)
100% goes to the provider — Tinies takes zero cut from tips
Record as a separate field on the booking: tipAmount Int? @map("tip_amount") and tipStripePaymentIntentId String? @map("tip_stripe_payment_intent_id")
Provider sees tips in their earnings dashboard
Show a "Thank you for the tip!" notification to provider via email
Schema additions: tipAmount Int? and tipStripePaymentIntentId String? on Booking

6.6d — Repeat Client Count on Profiles
Cheap trust signal. Shows social proof that owners come back.

Calculate for each provider: number of unique owners who have booked more than once
Display on provider profile page: "{X} repeat clients" near the rating/review count
Display on provider cards in search results
Computed from bookings table (COUNT DISTINCT ownerId WHERE status = completed, GROUP BY ownerId HAVING COUNT > 1)
Can be a computed field updated when bookings complete, or calculated on the fly
Add to ProviderProfile: repeatClientCount Int @default(0) @map("repeat_client_count")

6.6e — Holiday Availability Confirmation
Rover lets sitters confirm they're available for specific holidays, which shows a badge. Useful for peak-demand periods.

Provider edit profile: new section "Holiday Availability" with checkboxes for upcoming holidays (Christmas, New Year, Easter, Summer — configurable list)
When a provider confirms availability for a holiday, their profile shows a small badge: "Available for Christmas 2026"
Search results: owners can filter for providers with confirmed holiday availability
Simple implementation: confirmedHolidays String[] @map("confirmed_holidays") on ProviderProfile (array of holiday identifiers like "christmas-2026", "easter-2027")
Display as tags/badges on profile and search cards

Schema additions for 6.6:
prisma// Add to Booking:
walkActivities              Json?    @map("walk_activities")
serviceReport               Json?    @map("service_report")
tipAmount                   Int?     @map("tip_amount")
tipStripePaymentIntentId    String?  @map("tip_stripe_payment_intent_id")

// Add to ProviderProfile:
repeatClientCount           Int      @default(0) @map("repeat_client_count")
confirmedHolidays           String[] @map("confirmed_holidays")

Schema Changes Summary
These changes need to be applied to prisma/schema.prisma before or during the relevant phase:
prisma// Phase 1 — Add to ProviderProfile:
stripeConnectAccountId String? @map("stripe_connect_account_id")

// Phase 5 — Add to Charity model (for charity dashboard login):
userId String? @unique @map("user_id")
user   User?   @relation(fields: [userId], references: [id], onDelete: SetNull)
// And add to User model relations:
// charity Charity?

// Phase 5 — Add to UserGivingPreference (for community of givers opt-in):
showOnLeaderboard Boolean @default(false) @map("show_on_leaderboard")

// Phase 5 — Add to Charity model (for invite flow):
inviteToken String? @unique @map("invite_token")

// Phase 6 — Add to ProviderProfile:
homeType               String?  @map("home_type")       // house | apartment
hasYard                Boolean? @map("has_yard")
yardFenced             Boolean? @map("yard_fenced")
smokingHome            Boolean? @map("smoking_home")
petsInHome             String?  @map("pets_in_home")
childrenInHome         String?  @map("children_in_home")
dogsOnFurniture        Boolean? @map("dogs_on_furniture")
pottyBreakFrequency    String?  @map("potty_break_frequency")
typicalDay             String?  @map("typical_day")
infoWantedAboutPet     String?  @map("info_wanted_about_pet")

// Phase 6.2 — Add to ProviderProfile (Stripe Identity):
stripeVerificationSessionId String? @map("stripe_verification_session_id")

// Phase 6.6 — Add to Booking (walk activities, service reports, tipping):
walkActivities              Json?    @map("walk_activities")
serviceReport               Json?    @map("service_report")
tipAmount                   Int?     @map("tip_amount")
tipStripePaymentIntentId    String?  @map("tip_stripe_payment_intent_id")

// Phase 6.6 — Add to ProviderProfile (repeat clients, holidays):
repeatClientCount           Int      @default(0) @map("repeat_client_count")
confirmedHolidays           String[] @map("confirmed_holidays")
After any schema change, run:
bashnpx prisma migrate dev --name description_of_change
npx prisma generate

How to Use This Plan With Cursor
For each sub-section (e.g., 1.1, 1.2, etc.):

Open Cursor's chat (Cmd+L or the chat panel)
Tell Cursor what to build by referencing this plan. Example prompt:


"Build Phase 1.1 — Pet Profile Management. The spec is in the build plan. Create the owner dashboard at /dashboard/owner with pet CRUD, form validation with Zod, Server Actions, and Supabase Storage photo upload. Follow the existing code patterns in the provider edit profile page."


Review what Cursor generates. Test it locally (npm run dev, visit localhost:3000).
If something breaks, paste the error into Cursor and say "fix this error" — it's usually faster than explaining the problem.
Move to the next sub-section.

Tips:

Always tell Cursor to "follow the existing code patterns" — this keeps the codebase consistent.
If Cursor generates a component that looks wrong stylistically, tell it "match the design of [existing page that looks good]."
For Stripe integration, give Cursor the exact webhook events to handle. Don't let it guess.
After each phase, run npx prisma migrate dev if you changed the schema.
Test the happy path manually before moving on. Book a service. Accept it. Complete it. Leave a review. If any step fails, fix it before building the next phase.


Files That Will Be Created (By Phase)
Phase 1
src/app/dashboard/owner/page.tsx          (rebuild from stub)
src/app/dashboard/owner/actions.ts        (new — pet + booking server actions)
src/app/services/book/[slug]/page.tsx     (new — booking flow)
src/app/api/webhooks/stripe/route.ts      (new — Stripe webhooks)
src/lib/stripe/index.ts                   (rebuild — Stripe client + helpers)
Phase 2
src/app/dashboard/messages/page.tsx           (new)
src/app/dashboard/messages/[id]/page.tsx      (new)
src/lib/email/templates/booking-request.tsx   (new)
src/lib/email/templates/booking-accepted.tsx  (new)
src/lib/email/templates/booking-declined.tsx  (new)
src/lib/email/templates/booking-expired.tsx   (new)
src/lib/email/templates/booking-reminder.tsx  (new)
src/lib/email/templates/booking-completed.tsx (new)
src/lib/email/templates/review-received.tsx   (new)
src/lib/sms/index.ts                         (rebuild — Twilio client + send functions)
Phase 3
src/components/maps/SearchMap.tsx              (new)
src/components/maps/ProviderLocationMap.tsx    (new)
src/components/maps/ServiceAreaPicker.tsx      (new)
src/app/[serviceType]/[district]/page.tsx     (new — SEO pages)
src/app/adopt/from-cyprus-to-[country]/page.tsx (new — SEO pages)
src/app/sitemap.ts                            (new)
Phase 4
src/app/adopt/apply/[slug]/page.tsx           (new)
src/app/dashboard/rescue/page.tsx             (new)
src/app/dashboard/adopter/page.tsx            (new)
Phase 5
src/app/giving/[slug]/page.tsx                (new — charity profiles)
src/app/giving/become-a-guardian/page.tsx      (new)
src/app/dashboard/charity/page.tsx            (new — charity/sanctuary dashboard)
src/app/invite/charity/[token]/page.tsx       (new — charity invite acceptance)
src/app/give/page.tsx                         (new — quick donate, Apple Pay)
src/app/give/[slug]/page.tsx                  (new — per-charity quick donate)
src/components/giving/QRCodeGenerator.tsx      (new — QR code for print/share)
src/components/maps/WalkTracker.tsx            (new)
src/components/giving/CommunityOfGivers.tsx    (new — donor card grid)
src/components/giving/DonationTicker.tsx        (new — scrolling recent activity)
src/components/giving/GivingTierBadge.tsx       (new — tier badge component)

Reference Documents
These files should all be in Cursor's project knowledge:
DocumentPurposetinies-business-plan.docxCore business logic, user flows, revenue model, feature specstinies-addendum.docxTrust/safety, cancellation policies, disputes, notifications, payment edge casestinies-addendum-b-giving.docxGiving model, charity integration, donation mechanicstinies-cursorrules.mdTech stack, coding patterns, file conventions, design tokenstinies-marketing-concepts.mdBrand voice, campaign concepts, taglinesrover-competitive-audit-final.mdCompetitor analysis, feature gaps, UX patterns to replicatetinies-build-plan.mdTHIS DOCUMENT — the build sequence