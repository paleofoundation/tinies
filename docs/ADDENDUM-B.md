Tinies - Addendum B: Tinies Giving (Developer Reference)
Core Promise
"10% of Tinies' proceeds directly support cat and dog sanctuaries and rescue organizations in Cyprus."
This means 10% of the PLATFORM'S commission revenue (not 10% of booking price). It costs the user nothing. It is structural and permanent.
Revenue Flow Example (EUR 50 booking)
LineAmountBooking price (owner pays)EUR 50.00Tinies commission (12%)EUR 6.00Provider payout (88%)EUR 44.00Giving allocation (10% of commission)EUR 0.60Tinies retained (90% of commission)EUR 5.40Round-up (optional, if enabled)EUR 0.50Total to charity from this bookingEUR 1.10
Three User Giving Mechanisms
1. Round-Up at Booking (P0 — built in Week 4)

At final checkout step, before payment confirm
"Round up to EUR {rounded}? EUR {roundup_amount} goes to {charity_name}."
Toggle ON by default, clearly visible, easy to turn off
Rounds to nearest whole euro. If already whole, rounds up EUR 1.00
If user opts out, preference remembered for next booking
NOT offered on international adoption payments
Goes to user's preferred charity, or Tinies Giving Fund if none selected

2. One-Time Donation at Signup (P1 — within 30 days)

Welcome screen after registration completes
Shows rotating real rescue animal photo with name + story
Three presets: EUR 5, EUR 10, EUR 25, plus custom amount
"Skip for now" link clearly visible
User picks from 3-4 featured charities or general fund
Separate Stripe PaymentIntent (not tied to bookings)
Card details saved for future bookings (reduces friction)
If skipped, not asked again during signup

3. Tinies Guardian Monthly Subscription (P1 — within 30 days)
Tiers:

Friend: EUR 3/month
Guardian: EUR 5/month
Champion: EUR 10/month
Custom: min EUR 1/month

Benefits:

Badge on profile (visible to providers and rescue orgs)
Monthly impact email
24-hour early access to new adoption listings

Management: start, pause, change amount, change charity, cancel — all from account settings. No lock-in.
Stripe: Subscriptions API. Product "Tinies Guardian" with Price objects per tier. Webhook invoice.paid → donation record.
Charity Registration
Flow

Apply: org name, registration number, mission (500 chars), website, social links, logo, contact person, bank IBAN, how funds used (300 chars)
Verify: ops checks against Cyprus Commissioner for Voluntarism/NGOs registry (5 business days)
Profile created: /giving/[charity-slug] — logo, name, mission, photos, total received, supporters, "Donate" button
Monthly payouts of all donations allocated. Monthly report: total, donors, breakdown by source.
Annual update required (2-3 sentences on fund usage), published on profile.

Featured Charities

3-5 at any time, prominent on homepage, signup screen, giving page
Rotated quarterly based on: impact, engagement, need
Admin manages in dashboard

Gardens of St Gertrude

Founding featured charity (cat sanctuary in Parekklisia, 92 cats)
Full disclosure of founder connection on charity profile
Connection is a strength (mission is personal, not performative)

Tinies Giving Fund
What flows in

10% of platform commission (automatic, always)
Round-ups from users who haven't selected a specific charity
Signup donations directed to general fund

Distribution

Monthly to all verified charities
Launch: equal split
Month 6+: weighted by animals in care, platform engagement, geographic coverage
Admin reviews and approves distribution before payout

Transparency

/giving page (public, no login)
Total donated to date, this month
Number of donors, charities supported
Per-charity breakdown
Real-time updates
This is the #1 trust signal for the giving program

UI Touchpoints
LocationImplementationHomepageSmall banner: "10% of our proceeds support animal rescue in Cyprus." Links to /giving.Signup welcomeFeatured charity + donation prompt (EUR 5/10/25/custom). Skip option. Real animal photo.Booking checkoutRound-up toggle. Shows exact amount and charity. On by default.Post-booking confirmation"Your booking generated EUR {amount} for animal rescue. Thank you!" (one line, subtle)Account settingsGiving tab: preferred charity, round-up toggle, Guardian management, donation historyProvider dashboard"Your bookings have generated EUR {total} for animal rescue."/givingFull transparency dashboard/giving/[slug]Charity profile with donate buttonHappy Tails"This adoption was supported by Tinies Giving and our Tinies Guardians."Monthly emailGiving summary: amounts, charities, impact snippetFooter (every page)"10% of proceeds support animal rescue. Learn more."
Database Tables
charities
id, name, registration_number, mission, website, social_links (jsonb), logo_url, photos (array), primary_contact_name, primary_contact_email, bank_iban, how_funds_used, verified, verified_at, featured, featured_since, animals_in_care, district, total_received (cached float), supporter_count (cached int), annual_update_text, annual_update_date, slug, active, created_at, updated_at
user_giving_preferences
id, user_id (FK), preferred_charity_id (FK nullable), roundup_enabled (boolean default true), guardian_subscription_id (FK nullable), created_at, updated_at
guardian_subscriptions
id, user_id (FK), charity_id (FK nullable), stripe_subscription_id, amount_monthly, tier (friend|guardian|champion|custom), status (active|paused|cancelled), started_at, paused_at, cancelled_at, created_at, updated_at
donations
id, user_id (FK nullable — null for platform giving), charity_id (FK nullable — null for Giving Fund), source (roundup|signup|guardian|platform_commission), amount (int, cents), booking_id (FK nullable), stripe_payment_intent_id (nullable), stripe_invoice_id (nullable), created_at
giving_fund_distributions
id, month (date), total_fund_amount, distribution_method (equal|weighted), per_charity_amounts (jsonb: [{charity_id, amount}]), approved_by (FK users admin), approved_at, payout_status (pending|processing|completed), stripe_transfer_ids (jsonb), created_at, updated_at
users table additions
total_donated (float cached), guardian_badge (boolean computed from active subscription)
Giving Notifications
TriggerChannelTemplateSignup donationEmail"Thank you for EUR {amount} to {charity}! Impact: tinies.app/giving"Guardian startedEmail"Welcome, Guardian! EUR {amount}/month to {charity}. Badge now on your profile."Guardian monthly chargeEmail"EUR {amount} to {charity} processed for {month}. Tinies Giving supported {animals} animals this month."Guardian pausedEmail"Subscription paused. Resume anytime. Total given so far: EUR {total}."Guardian cancelledEmail"Cancelled. Thank you for EUR {total} total. The tinies remember."Monthly receipt (all donors)Email (1st of month)"Your {month} summary: Round-ups EUR {x}. Guardian EUR {y}. Total EUR {z}. Charities: {names}."Charity payoutEmail to charity"{charity}: EUR {amount} payout for {month}. {donor_count} supporters. Arrives in 5 days. Please provide annual update: {link}"
Build Priority
FeaturePriorityWeekPlatform 10% messaging (copy in footer, homepage)P0Week 1Round-up at bookingP0Week 4Donations ledger (donations table, recording from day 1)P0Week 4Charity registration + verificationP0Week 6/giving transparency pageP1+30 daysSignup donation promptP1+30 daysTinies Guardian subscriptionsP1+30 daysCharity profile pagesP1+30 daysMonthly distribution + payoutsP1End of Month 1Monthly donor receipt emailsP2+60 daysGuardian badge on profilesP2+60 days