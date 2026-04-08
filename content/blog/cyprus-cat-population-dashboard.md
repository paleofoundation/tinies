---
title: "A Million Cats and No Map: Why Cyprus Needs a Real-Time Feline Population Dashboard"
slug: "cyprus-cat-population-dashboard-citizen-science"
date: "2026-03-24"
author: "Tinies"
category: "Solutions"
categories: ["Solutions", "Technology", "Cyprus Cat Crisis"]
excerpt: "Cyprus is managing a million-cat crisis with no census, no colony map, and no way to measure whether any intervention is working. Computer vision and citizen science could change that in months."
image: "/images/blog/cat-population-dashboard.jpg"
---

The government of Cyprus estimates that the island has approximately one million stray cats. Activists say the number is closer to 1.5 or even 2 million. The International Cat Care report published in 2025 acknowledged that no effective, replicable, scalable, or measurable approach to cat population management has been implemented on the island.

That phrase — "no measurable approach" — deserves attention. It does not mean that no one is trying. It means that no one is measuring. There is no census. There is no colony map. There is no mechanism for tracking whether the sterilization programs funded at €300,000 per year are producing any change in the population. The government is spending money on a problem it cannot quantify, targeting an outcome it cannot track, using a strategy it cannot evaluate.

This is not an animal welfare problem. It is a data problem. And data problems have solutions.

## What Does Not Exist

Consider what any competent public health intervention requires: a baseline count, a geographic distribution map, a mechanism for tracking change over time, and defined metrics for success.

For the Cyprus cat crisis, none of these exist. No one knows how many cats live in any given municipality. No one knows the ratio of sterilized to unsterilized cats in any colony. No one knows whether colonies are growing, shrinking, or stable. No one knows where new cats are entering the stray population from — whether through abandonment, migration, or reproduction in untreated areas.

The €300,000 sterilization budget is allocated based on reports from local authorities about areas with high concentrations of cats. These reports are subjective, inconsistent, and unverifiable. Resources are distributed based on political relationships and complaint volume, not epidemiological data.

This is the equivalent of fighting a pandemic without testing. You can vaccinate people, but if you do not know where the virus is spreading, how fast, and in whom, your vaccination campaign operates on instinct rather than information.

## What a Population Dashboard Would Look Like

The technology required to build a real-time cat population monitoring system already exists and is largely free or inexpensive.

The foundation layer is a citizen science reporting app. Residents and volunteers photograph cat colonies using a smartphone app that geotags each sighting with GPS coordinates, timestamps the photo, and allows the reporter to note observed conditions — approximate colony size, presence of ear-tipped cats, visible health issues, food sources nearby.

The data layer aggregates these reports into a geographic information system. Colony locations are plotted on a map. Report frequency and colony size estimates generate density heat maps by district and municipality. Temporal trends show which areas are growing and which are stable or declining.

The analysis layer applies computer vision to the photographic data. Machine learning models trained on cat images can estimate colony sizes from photographs with reasonable accuracy. Ear-tip detection algorithms — which identify the universally used marker for sterilized feral cats — can estimate the sterilization coverage of a photographed colony. Individual cat re-identification models, while still evolving, can track specific animals across multiple sightings and estimate turnover rates.

The output is a dashboard accessible to Veterinary Services, municipalities, volunteer organizations, and the public. For the first time, decision-makers would be able to see where the cats are, how many there are, whether they are sterilized, and whether the population is changing.

## The Citizen Science Model

Citizen science — enlisting the public to collect scientific data — has proven effective in far more complex monitoring scenarios than counting cats. [BirdLife Cyprus already operates a citizen science program for monitoring bird populations on the island](https://birdlifecyprus.org/). The [eBird platform, run by the Cornell Lab of Ornithology](https://www.birds.cornell.edu/citizenscience/), collects over 100 million bird observations per year from volunteers worldwide and has become one of the most valuable ecological datasets on earth.

Cat monitoring is in many ways easier than bird monitoring. Cats are less mobile, more visible, and concentrated in predictable locations near food sources. They do not migrate. They are large enough to photograph clearly with any modern smartphone.

The Cyprus Veterinary Association has already proposed a smartphone app to identify areas with large feral cat concentrations. This proposal has not been implemented. It should be, and it should be expanded beyond simple location reporting to include the photographic and analytical capabilities described above. A similar data-driven approach is essential, as discussed in [Eradicate by District](/blog/eradicate-by-district-cyprus-cat-strategy).

## What Computer Vision Enables

The most important application of computer vision to this problem is sterilization coverage estimation. Currently, the only way to know whether a colony has been sterilized is to physically trap and inspect every cat — a labor-intensive process that is rarely done.

Ear-tipping is a visual marker specifically designed to be identifiable from a distance. A machine learning model trained on images of ear-tipped cats can analyze a photograph of a colony and estimate the percentage of sterilized animals without any physical contact. This means that a volunteer walking past a colony and taking a photo with their phone contributes a data point on sterilization coverage for that location.

Aggregated over thousands of photos across hundreds of colonies, this produces a sterilization coverage map of the entire island — the single most important metric for evaluating whether the government's €300,000 investment is achieving anything.

Individual cat re-identification — distinguishing one cat from another based on coat pattern — is more technically challenging but advancing rapidly. Several research groups have demonstrated re-identification accuracy above 90 percent for domestic cats in controlled settings. Applied to the citizen science dataset, this capability would enable population size estimation through mark-recapture statistics, the same methodology used to estimate wildlife populations in ecological research. This measurement infrastructure is foundational to the [district eradication strategy](/blog/eradicate-by-district-cyprus-cat-strategy).

## The Accountability Layer

Data creates accountability. When every municipality has a measurable cat density score and a sterilization coverage percentage, it becomes possible to rank municipalities by performance, allocate resources to the areas with the worst outcomes, and hold local authorities responsible for trends in their jurisdiction.

Currently, there is no accountability because there is no measurement. A municipality could have a cat population that doubles over five years and no one would know, because no one is counting.

A public dashboard changes this dynamic entirely. If Limassol's sterilization coverage is 40 percent and Paphos is at 65 percent, the question of why becomes politically salient. If a municipality receives sterilization funding and its coverage does not increase, the follow-up question writes itself.

The dashboard also enables the public to hold the government accountable for its stated goals. The government has announced a four-year plan to control the cat population. Without a measurement system, there is no way to evaluate whether the plan is working. With a dashboard, the evaluation is automatic and continuous.

## Implementation Path

The fastest path to implementation is not through the government. It is through the existing network of volunteer organizations and sanctuaries.

A coalition of organizations could jointly launch a reporting app, recruit volunteers, and begin building the dataset independently. The app development cost is minimal — similar platforms have been built on open-source frameworks for under €10,000. Volunteer recruitment leverages the same networks already engaged in feeding and TNR activities.

Once the dataset reaches critical mass — likely within six to twelve months of launch — it becomes the authoritative source of population data for the island. At that point, the government either adopts it as the official monitoring system or continues operating blind while a publicly accessible dashboard demonstrates the gap between official claims and observable reality.

Either outcome advances the cause.

## Why This Matters More Than Another €100,000

The instinct when facing a crisis is to spend money on action: more surgeries, more traps, more volunteer hours. But action without measurement is motion without direction.

If Cyprus doubled its sterilization budget to €600,000 per year without knowing where the unsterilized cats are, what the current coverage is, or whether last year's spending produced any result, the additional €300,000 would produce the same outcome as the first: unmeasurable.

A population dashboard costs a fraction of the sterilization budget and multiplies the effectiveness of every euro spent on sterilization by directing it to where it is needed most. Measurement systems are equally critical to the broader [tourism potential](/blog/cyprus-cat-crisis-tourism-industry) and [waste management interventions](/blog/cyprus-cat-crisis-waste-management).

You cannot manage what you cannot measure. Cyprus has been trying to manage a million-cat crisis with no measurement system for decades. The result is what you would expect.

This is the sixth article in our Solutions Series. Read the others: [The Single Injection That Could End the Cyprus Cat Crisis](/blog/single-injection-end-cyprus-cat-crisis), [Cyprus Could Turn Its Cat Crisis Into a €100 Million Tourism Industry](/blog/cyprus-cat-crisis-tourism-industry), [The Cyprus Cat Crisis Will Never Be Solved Without Fixing the Bins](/blog/cyprus-cat-crisis-waste-management), [What If Every Cat in Cyprus Had an Identity?](/blog/national-feline-registry-cyprus), and [Eradicate by District](/blog/eradicate-by-district-cyprus-cat-strategy).

For more on the scale of the problem, see [Cyprus Government Stray Animal Spending](/blog/cyprus-government-stray-animal-spending) and [The Stray Cat Crisis in Cyprus](/blog/the-stray-cat-crisis-in-cyprus).

---

*Tinies believes in measurement and transparency. Approximately 90 percent of marketplace booking commissions flow to Gardens of St. Gertrude and other sanctuaries, and every euro is tracked. [Browse adoptable animals](/adopt), [find trusted pet care](/services), or [see how your support helps](/giving).*
