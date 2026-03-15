# Tinies - Addendum C: Transparency & Impact Tracking System (Developer Reference)

This addendum specifies the **transparency and impact tracking system** for Tinies Giving. Use it alongside **PLAN.md**, **ADDENDUM-A.md**, and **ADDENDUM-B.md** for all future giving and transparency features.

---

*[Paste the full transparency and impact tracking system specification below. The content you paste will replace this placeholder.]*
Tinies — Addendum C: Transparency & Impact Tracking System (Developer Reference)
Why This Exists
Tinies is not a tech company. It is a cat sanctuary that built a marketplace to fund itself. Approximately 90% of all commission revenue goes to animal sanctuaries — primarily Gardens of St Gertrude (92 cats, Parekklisia, Cyprus), plus Malcolm's Cat Sanctuary, Patch of Heaven, and others.
The transparency system is the soul of the platform. People do not donate to platforms. They donate to causes they can see. Every euro must be traceable from the booking that generated it, to the sanctuary that received it, to the specific thing it paid for. This is the Charity Water model applied to animal rescue.
The Three Layers
Layer 1: Live Dashboard (Build First)
Real-time /giving page pulling live data from the database. Sanctuary admin page where sanctuary operators log what money was spent on, with photos.
Layer 2: Automatic Donation Recording (Build with Payments)
Every completed booking automatically creates a donation record (90% of commission). Round-up donations at checkout. Post-booking impact message.
Layer 3: Subscriptions & Reporting (Build Later)
Tinies Guardian subscriptions via Stripe. Monthly impact emails. Donor personal dashboards.

Layer 1 Specification (Build Now)
1.1 Live /giving Page
The public /giving page (no login required) must show:
Hero Section:

"Every booking helps a tiny."
Large real-time counter: "EUR {exact_total} has gone to rescue animal care through Tinies"
Not rounded, not estimated. Exact to the cent. Pulled from SUM of donations table.

Impact Numbers Row:

Total donated (all time) — SUM(donations.amount) / 100 (stored in cents)
Sanctuaries supported — COUNT(DISTINCT donations.charity_id) where charity_id is not null
Active Tinies Guardians — COUNT(guardian_subscriptions) where status = 'active'
Animals in care — SUM(charities.animals_in_care) across all active charities

Per-Sanctuary Breakdown:
For each active charity, show:

Charity name and logo
Total received: SUM(donations.amount) where charity_id = this charity
Percentage of total giving
Number of supporters: COUNT(DISTINCT donations.user_id) where charity_id = this charity
Latest impact update (see 1.2 below)
"Support this sanctuary" button

How It Works Section:
Three cards explaining the giving model:

"We give ~90% of every commission to animal rescue. Automatically. Always. No salaries, no investors, no profit."
"Round up your booking to donate the change. 100% goes to the sanctuary you choose."
"Become a Tinies Guardian. Give monthly from EUR 3. See exactly where every euro goes."

Live Activity Feed:
A scrolling feed showing recent giving activity (anonymized):

"A pet sitting booking generated EUR 5.40 for Gardens of St Gertrude"
"A pet owner rounded up EUR 0.73 to Patch of Heaven"
"A new Tinies Guardian subscribed at EUR 5/month to Malcolm's Cat Sanctuary"
Pull from donations table, last 20 entries, show relative time ("2 hours ago")
Auto-refresh every 60 seconds or use real-time subscription

Monthly Breakdown Table:
Expandable section showing the last 12 months:

Month, total donated, breakdown by source (platform commission, round-ups, Guardian subscriptions, one-time donations), number of charities paid
Exact figures, no rounding

Become a Guardian CTA:
Bottom section with tier cards (Friend EUR 3, Guardian EUR 5, Champion EUR 10, Custom) and signup flow.
1.2 Sanctuary Impact Updates
Sanctuaries need a way to report what the money paid for. This is the critical transparency piece that makes the giving page trustworthy.
New database table: sanctuary_updates
id                  String    @id @default(uuid())
charity_id          String    (FK charities)
title               String    (e.g. "March 2026 Update")
content             String    (markdown text, e.g. "This month we spent EUR 450 on vet visits for 6 cats, EUR 300 on food, EUR 120 on medications...")
photos              String[]  (URLs of photos showing the impact)
amount_covered      Int       (total EUR in cents that this update accounts for)
period_start        DateTime  (start of period this covers)
period_end          DateTime  (end of period)
items               Json      (structured breakdown: [{category: "Food", amount: 30000, description: "280kg of cat food"}, {category: "Vet Visits", amount: 45000, description: "6 checkups, 2 emergency treatments"}, ...])
published           Boolean   (default false, true when visible on /giving)
created_at          DateTime
updated_at          DateTime
Impact categories (for the items JSON):

Food (cat food, dog food, treats)
Vet Visits (checkups, consultations)
Medications (flea treatment, antibiotics, chronic conditions)
Surgeries (spay/neuter, emergency, dental)
Shelter (repairs, bedding, litter, cleaning supplies)
Transport (getting animals to/from vet)
Other

Display on /giving page:
Under each sanctuary's card, show the latest published update:

"Last update: March 2026"
Summary: "EUR 870 spent on: 280kg food, 6 vet visits, 2 emergency surgeries, medications for 8 cats"
Photos from the update
"See full update" expandable section with detailed breakdown
Historical updates accessible via "Previous updates" link

1.3 Sanctuary Admin Dashboard
Sanctuary operators (users with rescue org role whose org is also a registered charity) need a page to submit impact updates.
Route: /dashboard/rescue/impact-updates
Features:

List of all past updates with status (draft/published)
"New Update" button
Form: title, period (start/end dates), content (textarea with markdown), photo upload (URLs for now), structured items (add rows: category dropdown, amount in EUR, description)
Save as draft or publish
Edit existing updates
The structured items auto-calculate total and display a visual breakdown

1.4 Post-Booking Impact Message
After every completed booking, the confirmation page and confirmation email include:
"Your booking generated EUR {commission_amount} for rescue animal care at {primary_sanctuary_name}."
With an equivalence line:

If amount >= EUR 10: "That covers approximately one vet checkup for a rescue animal."
If amount >= EUR 5: "That's roughly 2kg of cat food — enough to feed 10 cats for a day."
If amount >= EUR 3: "That covers a day of litter and cleaning supplies for the sanctuary."
If amount >= EUR 1: "That helps buy medication for cats in need."
Below EUR 1: "Every cent helps. Thank you."

These are approximate and meant to create emotional connection, not accounting precision.
1.5 Booking-to-Impact Connection
Every completed booking creates a donation record automatically:
When booking.status changes to "completed":
  1. Calculate commission: booking.total_price * 0.12
  2. Calculate sanctuary share: commission * 0.90
  3. Create donation record:
     - user_id: booking.owner_id
     - charity_id: primary sanctuary (Gardens of St Gertrude by default, or configurable)
     - source: "platform_commission"
     - amount: sanctuary_share (in cents)
     - booking_id: booking.id
  4. Update charity.total_received (cached field)
  5. Update user.total_donated (cached field)
The remaining 10% of commission stays in the platform operating account and is not recorded as a donation.

Layer 2 Specification (Build with Stripe)
2.1 Round-Up at Checkout
At the final step of booking checkout, before payment confirmation:
"Round up to EUR {rounded_total}? EUR {roundup_amount} goes to {sanctuary_name}."
Toggle ON by default. Easy to turn off. The round-up amount is:

If total is EUR 47.30, round-up is EUR 0.70 (to EUR 48.00)
If total is EUR 50.00 (already whole), round-up is EUR 1.00 (to EUR 51.00)

The round-up amount is added to the Stripe PaymentIntent as a separate line item. When captured, it creates a donation record:

user_id: owner
charity_id: user's preferred charity (from user_giving_preferences) or default sanctuary
source: "roundup"
amount: roundup amount in cents
booking_id: the booking

100% of round-up goes to the charity. Tinies takes zero cut from user donations.
2.2 Signup Donation
After account creation, welcome screen shows:

A real rescue animal photo with name and story
"Start your Tinies journey by helping a tiny in need."
Preset buttons: EUR 5, EUR 10, EUR 25, custom
Charity selection (3-4 featured charities)
"Skip for now" link

Separate Stripe PaymentIntent. Creates donation record with source: "signup".
2.3 Stripe Webhook → Donation Recording
When payment_intent.succeeded webhook fires for a booking:

Look up the booking
If booking status is being set to completed, create the platform_commission donation
If a round-up was included, create the roundup donation
Update cached totals


Layer 3 Specification (Build Later)
3.1 Tinies Guardian Subscriptions
Stripe Subscriptions API. Product: "Tinies Guardian". Price tiers: EUR 3, 5, 10, custom.
On invoice.paid webhook:

Create donation record with source: "guardian"
Update cached totals

3.2 Monthly Impact Email
Sent on the 1st of each month to all donors (anyone with a donation record in the previous month):
Subject: "Your Tinies impact in {month}"
Content:

"Here's what your support did last month."
Personal total: "You contributed EUR {user_total} to rescue animal care."
Platform total: "Together, the Tinies community raised EUR {month_total}."
Per-sanctuary breakdown with latest photos
Specific items funded: "Last month across all sanctuaries: {total_food}kg of food, {total_vet} vet visits, {total_surgeries} surgeries..."
Featured animal story (one rescue animal helped by the funds)
CTA: "Become a Tinies Guardian" or "Upgrade your Guardian tier"

3.3 Donor Personal Dashboard
Route: /dashboard/giving (accessible to any logged-in user)
Shows:

Personal total donated (all time)
Monthly giving history chart
Breakdown by source (round-ups, Guardian, one-time)
Which sanctuaries received their donations
Their Guardian subscription status and management
Round-up preference toggle
Preferred charity selection


Database Tables Summary
Existing tables (already in schema):

charities (add: total_received cached field if not present)
donations (source, amount, charity_id, user_id, booking_id)
guardian_subscriptions
user_giving_preferences
giving_fund_distributions

New table needed:

sanctuary_updates (id, charity_id, title, content, photos, amount_covered, period_start, period_end, items as JSON, published, created_at, updated_at)

Cached fields to maintain:

charities.total_received — updated on every donation insert
charities.supporter_count — COUNT(DISTINCT user_id) from donations for this charity
users.total_donated — SUM of all donations by this user


The Emotional Design Principle
The /giving page is not a dashboard. It is a story.
Every number is a bowl of food. Every chart is a vet visit. Every photo is a cat that survived because someone booked a dog walker.
The person viewing this page should feel: "My EUR 50 dog walking booking turned into a vet checkup for a rescue cat in Cyprus. I can see the cat. I can see the vet bill. I can see exactly where my money went. And I want to do it again."
That is the design principle. Everything else is implementation.
