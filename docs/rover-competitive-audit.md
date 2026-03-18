Rover.com Competitive Audit for Tinies.app
Prepared: March 2026
Sources: Web search (Claude) + direct site browsing (Perplexity)
Purpose: Inform Tinies feature decisions, pricing strategy, and competitive positioning

1. Company Overview
Rover was founded in 2011 in Seattle. It is the largest pet care marketplace in the US and Canada, with over 100,000 pet sitters and dog walkers. The company went public via SPAC in 2021 and was taken private by Blackstone in February 2024 for $2.3 billion. In 2024, Rover also acquired Cat in a Flat, a London-based cat-sitting marketplace, signaling European expansion.
Key stats (confirmed via direct browsing):

80+ million pet care services booked
4.1+ million dogs have boarded through Rover
18.6 million miles walked by sitters with dogs
7.15 million reviews, 97% are 5-star
Active in 16 countries: US, CA, UK, DE, ES, FR, IT, NL, NO, SE, DK, IE, PL, CH, FI, AT, BE
30,000+ Trustpilot reviews (badge shown on homepage)
International URLs use path-based localization under rover.com (e.g., rover.com/uk/, rover.com/de/)


2. Service Categories
Rover offers six service types (Tinies currently plans five). The homepage splits them into two groups:
"For When You're Away": Boarding, House Sitting, Drop-In Visits
"For When You're At Work": Doggy Day Care, Dog Walking
ServiceRoverTinies (Planned)NotesDog Walking✅ 30-min and 60-min options✅Rover offers time-based options; Tinies plans per-walk pricingHouse Sitting✅ Sitter stays in owner's home overnight✅ (called "Pet Sitting")Same conceptBoarding✅ Pet stays at sitter's home overnight✅Rover confirms this is the highest earner for sitters (2x more than non-boarding)Drop-In Visits✅ 30-min visits for feeding/check-ins✅Tinies plans this as critical for cat ownersDoggy Day Care✅ Daytime care at sitter's home✅Same conceptDog Training✅ (credentialed trainers only)❌ Not plannedRestricted to qualified trainers on Rover. Potential future add for Tinies
Additional linked services from Rover's boarding page: Cat Boarding, Cat Sitting, Dog Kennel Alternative, Long Term Dog Boarding, Overnight Dog Boarding, Puppy Boarding, Puppy Training, and a Lemonade pet insurance partnership (linked from service pages).
Key Takeaway for Tinies: The Lemonade insurance partnership is worth noting for Tinies' planned Month 6+ pet insurance affiliate stream. Rover already does this. The "For When You're Away" / "For When You're At Work" framing is smart UX — Tinies should consider a similar service grouping on the homepage.

3. Fee Structure & Commission
Rover's fee model is significantly more expensive than Tinies' planned 12% commission. This is a major competitive advantage for Tinies.
Rover's Fees (US)
FeeWho PaysAmountSitter service feeProvider20% of booking (15% for pre-March 2016 accounts)Owner booking feePet owner11% of booking total (capped at $50)RoverGO feeProvider (California)25% of bookingNew sitter profile reviewProvider (one-time)$49 (not mentioned on current become-a-sitter page)
Effective total take rate: ~31% (20% from sitter + 11% from owner)
Rover's Fees (UK)
FeeWho PaysAmountStandard sitter feeProvider15% of bookingRecurring weekly careProvider5% of booking (reduced rate)
Tinies' Planned Fees
FeeWho PaysAmountPlatform commissionProvider (deducted from payout)12% of bookingOwner feePet ownerNone
Tinies competitive advantage: Tinies takes 12% total vs. Rover's effective 31%. Provider recruitment message: "Keep 88% of what you earn vs. 80% on Rover — and your clients pay no extra fees."
Payout Speed
PlatformPayout TimingRover2 business days after service completionTinies (planned)Weekly (every Monday), minimum EUR 20
Recommendation: Rover's faster payouts are a plus for providers. Tinies should consider adding a faster payout option as a P2 feature.

4. Trust & Safety Features
Background Checks
FeatureRoverTinies (Planned)Background check requiredYes (for new sitters in US/Canada)Yes (government ID verification)Third-party check providerFirst Advantage / CheckrManual ops reviewCheck typesNational criminal database, sex offender registry, county court recordsGovernment ID upload + manual verificationEnhanced check availableYes (county records, shown as separate badge)Not at launchCost to providerIncludedFree
The Rover Guarantee vs. Tinies Guarantee
FeatureRover GuaranteeTinies GuaranteeVet cost coverageUp to $25,000 per incidentUp to EUR 2,000 per incidentProperty damageCovered (owner's home by sitter)Up to EUR 500 (provider's property by pet)Third-party injurySome coverage for non-family third partiesNot coveredProvider/owner injuryNOT coveredNot coveredPre-existing conditionsNOT coveredNOT coveredReporting windowWithin 48 hours of service endWithin 48 hours (injury) / 72 hours (damage)Minimum contribution$250 USD / £50 / €50 (owner pays first)No deductible mentionedIs it insurance?Explicitly NOT insurance — reimbursement programSelf-funded reserve, insurer partnership at Month 6+Provider no-show protectionReservation protection: full refund + help rebookingFull refund + EUR 20 credit24/7 supportYesEmergency line 8am-10pm Cyprus timeVet advice hotlineYes (during bookings)Emergency vet referral service
Key Takeaway: Rover's $25,000 coverage looks impressive in marketing but requires a $250 deductible and kicks in only after all other options are exhausted. Tinies should still emphasize "every booking protected" — the simplicity and no-deductible approach is actually more user-friendly at launch scale.
Badges & Trust Signals
SignalRoverTinies (Planned)Background check badge✅ Blue badge (Basic or Enhanced)✅ "Verified" badge after ID checkStar Sitter badge✅ Prominent on profiles and in search results❌ Not at launchProfile completeness indicatorNot prominent✅ Completeness score (%) with badge at 100%Repeat client count✅ Shown on profile and in search cardsNot explicitly plannedResponse rate / response time✅ Shown on profile✅ Response rate on profilePhoto update rate✅ Shown in Communication section of profileNot plannedReview count✅ Shown in search cards and profiles✅ Shown on profileAvailability freshness✅ "Updated X days ago" in search resultsNot plannedTinies Guardian badgeN/A✅ For monthly donors (visible on profile)

5. Search & Discovery UX (from Perplexity direct browsing)
This section provides granular UX details for Tinies' search implementation.
Homepage Search
The Rover homepage search bar has 4 fields in a row:

Service type (dropdown — selects one service)
Location (address text field)
Dates (date pickers — drop-off / pick-up)
Pets (number/type selector)

On landing, a modal asks "What are you searching for?" with clickable service type cards, an address field, and date pickers before results load.
Search Results Layout
Split layout: Scrollable sitter list on left, interactive map with numbered pins on right.
Each sitter card in results shows:

Rank number
Name
Star Sitter badge (if applicable)
Tagline / bio excerpt
Neighborhood + zip code
Star rating + review count
Repeat client count
A featured review snippet (not just a rating — an actual quote)
Availability freshness ("updated 6 days ago" / "updated today")
Price per night
Heart/favorite button

Pricing context at bottom of results: "Sitters with 4+ stars typically range from $54-$73 per night for a dog in this area." This helps owners set expectations and prevents sticker shock.
Filter Panel (scrollable modal, all filters visible at once)
Filter CategoryOptionsRate per night$1-$250 sliderStar SitterToggle: "Only show Star Sitters"Housing conditionsHas house (excludes apartments), Has fenced yard, + MorePets in the homeDoesn't own a dog, Doesn't own a cat, Accepts only one client at a time, + MoreChildren in the homeHas no children, + MoreOtherAccepts unspayed female dogs, Accepts non-neutered male dogs, Bathing/Grooming, Dog first-aid/CPR
Key Takeaways for Tinies:

The featured review snippet in search cards is brilliant — it gives social proof without requiring the owner to click into the profile. Tinies should include this.
Availability freshness ("updated today") is a trust signal — it shows the sitter is actively managing their calendar. Tinies should add this.
The pricing context range at bottom of results is excellent UX. Tinies should show "Providers in [district] typically charge EUR X-Y for [service]."
Rover's filters around housing conditions (fenced yard, house vs. apartment) and household composition (other pets, children) are highly relevant for boarding/daycare. Tinies should implement these, especially for the Cyprus market where boarding in homes with gardens is a big differentiator.


6. Provider Profile Structure (from Perplexity — Celeste B.'s live profile)
This is the most detailed section and directly informs Tinies' provider profile page design.
Profile Header

Large profile photo
Name + Star Sitter badge
Location (neighborhood)
Rating + review count
Primary CTA: "Contact [Name]" — NOT "Book Now"
"See more sitters" link
Heart/favorite button

Key Insight: Rover's primary CTA is "Contact" not "Book." This encourages messaging first, which builds trust before payment. Tinies should consider this pattern — especially in Cyprus where personal connection matters more.
Photo Gallery

Grid layout: 1 large hero image + 3 smaller thumbnails
Expandable to view all

Services Section

Dropdown selector to switch between services the sitter offers (Boarding, Drop-In Visits, Dog Walking)
Per-service details: pet size/weight ranges accepted, special conditions ("No females in heat", "Takes only 1 client at a time")

Availability Section

Interactive calendar (month view) with color-coded Available/Not Available days
Last updated timestamp
Max pets per night displayed
Cancellation policy shown (e.g., "three day")

Profile Detail Sections
"About" with subsections:
SubsectionFieldsCommunicationRepeat clients count, Response rate, Response time, Photo update rate, Rover Cards usageSkillsYears experience, Oral medication, Senior dog experience, Daily exerciseSafety/Trust/Environment(Details about care practices)Home DetailsApartment/house, Yard (yes/no), Smoking (yes/no), Pets in home, Children in home, Dogs allowed on bed/furniture, Potty break frequency
Additional sections:

"Pet care experience" (free-form bio text)
"A typical day" (describes what a stay/walk looks like)
"Information [sitter] would like to know about your pet" (custom questions)
Reviews with reviewer name, service type, and date
Star Sitter explanation box (explains the program)
Cancellation policy details
"Report this profile" link
Location map showing neighborhood

Tinies Provider Profile Recommendations Based on This
Rover FeatureTinies Should Add?Priority"Contact" as primary CTA (over "Book Now")✅ Yes — messaging first fits Cyprus cultureP0Service selector dropdown (switch between services)✅ Yes — cleaner than showing all at onceP0"A typical day" free-text section✅ Yes — builds trust for boarding/daycareP0 (add to profile builder)Home details (yard, smoking, pets, children, bed/furniture)✅ Yes — critical for boarding decisionsP0Communication stats (response rate, response time)✅ Yes — already plannedP0Photo update rateConsider for P1 — shows engagement levelP1"Info I'd like to know about your pet" custom section✅ Yes — helps providers screen bookingsP1Repeat client count✅ Yes — cheap trust signalP1Cancellation policy on profile (not just at checkout)✅ Yes — transparency builds trustP0Potty break frequencyConsider for P2 — specific to boardingP2"Report this profile" link✅ Yes — safety/moderation featureP0

7. Booking Flow
Rover's Flow (confirmed via browsing)

Search: Enter service, location, dates, pets
Results: Browse sitter cards with map
Profile: Click sitter → full profile page
Contact: Primary CTA is "Contact [Name]" — messaging before booking is encouraged
Meet & Greet: Strongly recommended (not required)
Book: "Book It Now" in app or on web (requires login)
Payment: Authorized at booking, captured on provider acceptance
During service: Photo/video updates, Rover Cards (walk reports)
After service: Review prompt, tipping option

No "Book Now" visible on profile before login. This means Rover gates the direct booking behind authentication, further encouraging the contact-first flow.
Tinies' Planned Flow Comparison
StepRoverTiniesSearch4-field bar (service, location, dates, pets)Same approachResultsList + map split viewSame approachContact before bookingEncouraged (primary CTA)Available (alongside Book)Meet & GreetRecommended, unstructuredStructured feature with scheduling (P1)Booking acceptance windowNot strictly enforced4 hours (auto-cancel if no response)During-service updatesRover Cards (photos, walk map, activity icons)GPS live tracking + photosPost-serviceReview + tipReview (tipping not at launch)

8. Rover Cards vs. Tinies Service Reports
This is one of the most important feature comparisons.
FeatureRover CardsTinies (Planned)Walk route map✅ GPS map sent post-walk✅ Real-time live tracking during walk + saved summaryWalk duration/distance✅✅Pee/poo/food/water tracking✅ Tap icons during service❌ Not plannedPhoto during service✅ Required for payment on recurring walks✅ Provider can add photos after walkReal-time live GPS tracking❌ NOT available (confirmed: map sent only after walk)✅ Owner watches walk in real-timeReport cards for all service types✅ Walks, drop-ins, daycareNot explicitly planned for non-walk servicesRequired for payment✅ Required for recurring/weekly servicesNot specifiedArrival/departure time logging✅ Clock in/outNot explicitly planned
Critical Recommendations:

Add pee/poo/food/water activity icons — dead simple (4 tap buttons), huge owner satisfaction. P1.
Add report cards for ALL service types — boarding, sitting, daycare, drop-ins should all have check-in/check-out logging with photos. P1.
Require at least one photo per service — Rover requires this for recurring walks; it's a great accountability feature.
Add clock-in/clock-out for drop-in visits — owners want to know when the provider arrived and left.


9. Features Tinies Has That Rover Does NOT
These are Tinies' genuine competitive advantages — no overlap with Rover:
FeatureDetailsInternational adoption coordinationEnd-to-end cross-border rescue animal placement with logistics pipeline, tracking dashboard, vet prep, transport booking. Rover does none of this.Real-time live GPS walk trackingOwner watches the walk as it happens. Rover only sends a post-walk map. Confirmed by direct browsing.Charitable giving built into platform10% of commission to animal rescue. Round-up donations. Tinies Guardian subscription. Rover has zero charitable component.Lower commission (12% vs ~31%)Dramatically cheaper for both providers and owners.No owner feesRover charges owners 11% on top of the sitter's rate. Tinies charges nothing extra.Meet & Greet as structured featureRover recommends but provides no scheduling tool or tracking. Tinies builds it into the platform with data on conversion rates.Multi-species rescue focusDeep cat + dog support from day one. Rover was dog-first and only added cat care formally in 2019.Cyprus-specific market knowledgeDistricts, local rescue orgs, multilingual (EN/GR/RU), local regulatory compliance.Transparency dashboard (/giving page)Public, real-time view of all charitable donations. Nothing comparable on Rover.Provider onboarding wizard with completeness scoreGuided 8-step setup. Rover's onboarding is profile submission → wait for review (10-20 business days).

10. Features Rover Has That Tinies Should Consider Adding
High Priority (P1)
FeatureEffortImpactNotesPee/poo/food/water activity iconsLowHigh4 tap buttons during walks/drop-ins. Owners love it.Post-service report cards (all types)MediumHighCheck-in/out + photo + notes for boarding, sitting, daycare, drop-insRepeat client count on profilesLowMediumSimple counter. Cheap trust signal in search results and profiles.Featured review snippet in search cardsLowHighShow a real review quote on each provider card in results. Huge for conversion.Availability freshness indicatorLowMedium"Calendar updated today" — shows active providers.Pricing context in search resultsLowMedium"Providers in Limassol typically charge EUR X-Y for dog walking"Home details on provider profileMediumHighYard, house/apartment, smoking, pets in home, children, bed/furniture rules"A typical day" bio sectionLowMediumFree-text section describing what a stay/walk looks like"Info I'd like to know about your pet"LowMediumCustom provider questions for booking screening"Contact" as primary CTA (alongside Book)LowHighMessaging-first flow suits Cyprus market cultureCancellation policy visible on profileLowHighNot just at checkout — show it upfront
Medium Priority (P2)
FeatureEffortImpactNotesTippingMediumMedium100% goes to provider. Increases satisfaction and loyalty.Recurring weekly bookingsHighHighRetention engine for dog walking. Currently P2 in Tinies plan.Star Sitter / "Top Provider" badge programMediumHighQuality tier based on ratings, response rate, repeat clients, cancellation rateHousing condition filters (fenced yard, house)LowMediumImportant for boarding/daycare searchesHousehold composition filters (pets, children)LowMediumImportant for anxious ownersHoliday availability confirmation badgeLowLowUseful for peak demand (Christmas, Easter)Booking modifications (change dates/services)HighMediumWithout canceling and rebooking
Lower Priority (P3+)
FeatureNotesDog Training as a serviceRestricted to credentialed trainers on Rover. Consider post-MVP.Pet insurance affiliate (Lemonade-style)Already in Tinies roadmap for Month 6+. Rover partners with Lemonade.24/7 support lineTinies starts at 8am-10pm. Expand as volume grows.

11. Rover's Weaknesses (from community feedback + direct observation)
These are opportunities for Tinies to exploit in messaging and positioning.

Fee frustration (biggest pain point): 20% sitter fee + 11% owner fee = ~31% total take. The #1 complaint in every forum and app review. Providers feel it's excessive. Owners resent the hidden service fee at checkout.
Guarantee has a deductible: The $250 minimum contribution means small claims are effectively not covered. Tinies' no-deductible approach is simpler and more generous for typical incidents.
Sitter injuries not covered at all: Rover explicitly excludes coverage for provider injuries. This is a gap Tinies could eventually address.
Shotgun booking encouragement: Rover prompts owners to "contact 3 more sitters" after each message, wasting provider time. Tinies should NOT do this.
Off-platform booking temptation: High fees drive both parties to move off-platform after initial connection. Tinies' 12% commission reduces this incentive significantly.
No real-time walk tracking (confirmed): Rover only provides post-walk maps via Rover Cards. No live GPS. This is Tinies' most visually compelling differentiator.
Slow profile review (10-20 business days): New sitters wait weeks to get approved. Tinies targets 24-48 hours for ID verification.
No charitable giving component: Rover has zero social impact story. Tinies' giving model is unique and emotionally powerful.
App reliability issues: Frequent complaints about crashes, photo upload failures, profile changes not saving.
Fee opacity: Many sitters don't know owners also pay 11%, and vice versa. Tinies should be radically transparent about its single 12% fee.


12. Strategic Positioning Summary
Tinies' Three-Pronged Message vs. Rover
For Providers:
"Keep 88% of what you earn. No owner fees to scare away customers. Verified in 24-48 hours, not weeks. Plus, every booking you complete helps rescue animals."
For Pet Owners:
"No hidden fees. Live GPS tracking on every walk. Every booking supports animal rescue in Cyprus. And if you're looking to adopt, we're the only platform coordinating international rescue adoptions."
For the Market:
"The only platform that combines trusted pet care with professional international adoption coordination. 10% of our proceeds go directly to animal rescue. No matter the size."
Feature Priority Adjustments Based on Full Audit
FeatureCurrent Tinies PriorityRecommended ChangeReasonPee/poo/food/water activity iconsNot plannedAdd to P1Simple, high impact, addresses Rover gapPost-service reports (all types)Not plannedAdd to P1Accountability for all services, not just walksFeatured review snippet in search cardsNot plannedAdd to P0Massive conversion impact, simple to implementHome details on provider profilePartially in bio/photosFormalize as structured fields, P0Critical for boarding decisions"Contact" as primary CTA"Book" is primaryMake "Message" primary, "Book" secondary, P0Matches Cyprus culture + Rover's proven patternRepeat client countNot plannedAdd to P1Cheap trust signalAvailability freshnessNot plannedAdd to P1Shows active providersPricing context in searchNot plannedAdd to P1Sets expectations, reduces sticker shockTippingNot plannedAdd to P2Provider retention, 100% to providerRecurring weekly bookingsP2Consider P1Retention engine for walking"Top Provider" quality badgeNot plannedAdd to P2Drives quality behavior

13. Remaining Gaps (Require Logged-In Access)
The following could not be verified by either source and would require creating test accounts:

Sitter dashboard layout (earnings view, calendar management)
Owner dashboard (pet profile management, booking history)
Actual checkout/payment screens (step-by-step)
Messaging system internals (read receipts, auto-responses)
Mobile app-only features (push notifications, camera)
Search ranking algorithm specifics
Rover's Cat in a Flat integration details


End of Audit. This document should be stored in the Tinies project knowledge for ongoing reference during development.