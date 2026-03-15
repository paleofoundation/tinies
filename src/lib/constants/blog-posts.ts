export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  author: string;
  readTime: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "she-built-a-tech-company-to-feed-92-cats",
    title: "She Built a Tech Company to Feed 92 Cats",
    excerpt: "The story behind Tinies, the Cyprus pet marketplace where 90% of revenue goes to animal rescue.",
    category: "Our Story",
    date: "March 15, 2026",
    author: "Tinies Team",
    readTime: "8 min read",
    content: `There is a woman in Parekklisia, a quiet village on the southern coast of Cyprus between Limassol and the British military base at Akrotiri, who feeds 92 cats every day.

Her name is Karen Pendergrass. She runs a cat sanctuary called Gardens of St Gertrude out of her home. Some of the cats arrived as kittens, dropped at the edge of her property in cardboard boxes. Some were found sick on the side of the road, brought to her by neighbors who had heard she was "the cat lady." Some wandered in and never left. Ninety-two cats, at last count. The number goes up more often than it goes down.

The sanctuary has never accepted a single donation. Not one euro. Karen and her family have funded everything — food, litter, vet bills, medications, spay and neuter surgeries, emergency treatments — entirely out of pocket, supported by her work running the Paleo Foundation, a food certification organization she founded over a decade ago.

But 92 cats eat a lot of food. And the number keeps growing. And the vet bills never stop. And at some point, paying for everything yourself stops being sustainable and starts being a slow crisis.

So Karen did something unusual. Instead of starting a GoFundMe or launching a donation campaign, she built a tech company.

## The Problem Nobody Was Solving

Cyprus has one of the highest stray animal populations in Europe. The island's mild climate and historically relaxed approach to animal control have created a situation where tens of thousands of stray cats and dogs roam villages, cities, and the countryside. Rescue organizations — mostly volunteer-run, mostly underfunded — do what they can. But the scale of the problem outpaces the resources available.

Meanwhile, Cyprus has no centralized platform for pet services. If you need a dog walker in Limassol, you ask in a Facebook group and hope someone reliable responds. If you need a pet sitter while you travel, you ask friends or take your chances. There are no verified profiles, no reviews, no payment protection, no accountability.

And if you are a rescue organization trying to place a cat or dog in a home in the UK or Germany — where demand for rescue animals far exceeds local supply — you navigate a labyrinth of veterinary requirements, EU pet passport regulations, transport logistics, and customs paperwork. Most rescues coordinate this with WhatsApp messages and spreadsheets.

Karen saw two broken systems that could fix each other.

## How Tinies Works

Tinies — named for what Karen has always called animals, all animals, regardless of size ("An elephant is a tiny. A bug is a tiny. A Great Dane is a tiny too.") — is a pet services marketplace and international animal adoption platform.

The marketplace side works like this: pet owners in Cyprus search for verified, reviewed service providers offering dog walking, pet sitting, overnight boarding, drop-in visits, and daycare. Providers list their services for free. When a booking happens, Tinies takes a 12% commission.

Here is the part that makes Tinies different from every other pet marketplace on earth: approximately 90% of that commission goes directly to Gardens of St Gertrude and other animal sanctuaries in Cyprus. The remaining 10% covers the platform's operating costs — hosting, payment processing, and little else. There are no salaries. There are no investors expecting returns. There is no plan to sell the company for billions.

The adoption side goes further. Rescue organizations list animals available for adoption, and transport providers offer their logistics services. Adopters browse, apply, and connect — all through Tinies. The platform provides the infrastructure. The rescues and transport providers do the work.

Every booking confirmation tells the pet owner exactly what their commission funded. Not in vague terms. In specific ones: "Your EUR 50 dog walking booking generated EUR 5.40 for rescue animal care. That is approximately 2kg of cat food — enough to feed 10 cats for a day."

## Not a Tech Company. A Feeding Schedule.

The distinction matters. Rover, the largest pet services marketplace in the world, was acquired by Blackstone in 2024 for $2.3 billion. Wag!, its competitor, went public and then nearly collapsed. These are companies built to generate returns for investors.

Tinies is built to generate kibble for cats.

"The whole point of this platform is to fund Gardens of St Gertrude," Karen says. "My mom and I have been paying for everything out of pocket. We have never taken a single donation. But 92 cats need to eat every day, and vet bills do not care about your budget. So instead of asking for help, I built something useful. People need dog walkers. People need pet sitters. And rescue animals need homes. The platform connects all of that, and the money feeds the cats."

The giving model extends beyond the commission. Users can round up their booking total to donate the change. They can make one-time donations at signup. And they can become "Tinies Guardians" — monthly subscribers starting at EUR 3/month — with every cent going directly to the sanctuary of their choice. Tinies takes no cut from any user donation. The platform's transparency page shows, in real time, exactly how much has been raised and exactly where it went.

## 92 Cats and Counting

Gardens of St Gertrude — named for the patron saint of cats — is not a facility. It is a home. The cats live in the house, in the garden, on the walls, in the trees. They have names. Winona P. Franklin. Ninety others. They are fed on a schedule. They are taken to the vet when they are sick. They are spayed and neutered. They are loved.

But love does not buy cat food. And the reality of running an unfunded sanctuary in Cyprus — where vet costs are rising, where new strays arrive every month, where the infrastructure for animal welfare is stretched thin — is that every week is a financial negotiation between what the cats need and what the budget allows.

Tinies is Karen's answer to that negotiation. Not a plea for charity. Not a desperate appeal. A platform that generates value for people and directs that value to animals. A marketplace where the act of booking a dog walker is, quietly and automatically, an act of rescue.

"An elephant is a tiny," Karen says. "A bug is a tiny. A kitten found in a ditch is a tiny. No matter the size. That is what we believe. And that is what we are building."

---

*Tinies is launching in 2026 at [tinies.app](https://tinies.app). Gardens of St Gertrude is a cat sanctuary in Parekklisia, Cyprus. To learn more about supporting their work, visit the [giving page](/giving).*`,
  },
  {
    slug: "how-to-adopt-a-rescue-cat-from-cyprus-to-uk",
    title: "How to Adopt a Rescue Cat from Cyprus to the UK: The Complete 2026 Guide",
    excerpt: "Everything you need to know about bringing a rescue cat from Cyprus to the United Kingdom — requirements, costs, timeline, and how to do it.",
    category: "Adoption Guides",
    date: "March 15, 2026",
    author: "Tinies Team",
    readTime: "12 min read",
    content: `Cyprus has thousands of rescue cats waiting for homes. The UK has thousands of people who want to adopt a rescue cat. The 3,200 kilometres between them should not be an obstacle — and increasingly, it is not.

Every year, hundreds of cats make the journey from Cyprus to the UK, finding families in London, Manchester, Edinburgh, Bristol, and everywhere in between. The process is entirely legal, well-established, and has become significantly more streamlined in recent years. But it does involve paperwork, veterinary requirements, transport logistics, and a timeline that requires patience.

This guide walks through every step.

## Why Adopt from Cyprus?

Cyprus has one of the highest stray cat populations in Europe relative to its size. The island's warm climate, historical culture around outdoor cats, and limited municipal animal control infrastructure have created a situation where rescue organisations care for far more cats than can be placed locally. Many of these cats are healthy, socialised, and desperate for permanent homes — but the local adoption market simply cannot absorb them all.

Meanwhile, the UK's "adopt don't shop" movement has created strong demand for rescue animals. Breed-specific rescues often have long waiting lists. Shelter cats are frequently adopted within days of listing. The supply of adoptable cats in the UK does not match the demand from people wanting to give a rescue cat a home.

Cyprus rescue cats are not feral strays. The vast majority have been rescued as kittens or young adults, socialised by foster carers, vaccinated, and often spayed or neutered before adoption. Many have lived in home environments and are comfortable with people, children, and other animals.

## The Legal Requirements (Post-Brexit)

Since Brexit, the UK is no longer part of the EU pet travel scheme. This means the requirements for bringing a cat from Cyprus to the UK are slightly more involved than EU-to-EU travel. Here is exactly what is needed:

### Microchip

The cat must be microchipped with an ISO 11784/11785 compliant 15-digit microchip. This must be done before or on the same day as the rabies vaccination. The microchip number is the cat's permanent identifier and appears on all subsequent documentation.

### Rabies Vaccination

The cat must receive a rabies vaccination after being microchipped. The vaccine must be administered by an authorised veterinarian in Cyprus. The cat must be at least 12 weeks old at the time of vaccination.

### Rabies Antibody Titre Test

This is the step that makes UK adoption take longer than EU adoption. A blood sample must be taken at least 30 days after the rabies vaccination and sent to an EU-approved laboratory for a rabies antibody titre test. The test must show a titre level of at least 0.5 IU/ml.

The results typically take 2-3 weeks to come back. The cat cannot travel to the UK until the titre test result is available and satisfactory. There is no waiting period after receiving a satisfactory result — the cat can travel as soon as the result is confirmed.

This test is not required for travel between EU member states, which is why UK adoption takes longer than, say, adoption to Germany or the Netherlands.

### EU Pet Passport or Animal Health Certificate

The cat needs an EU pet passport issued by an authorised veterinarian in Cyprus. This document contains the microchip number, vaccination records, and titre test results. Alternatively, an official animal health certificate (AHC) can be used, issued within 10 days of travel.

### Tapeworm Treatment (Dogs Only)

This requirement applies only to dogs, not cats. Cats do not need tapeworm treatment for UK entry.

### No Quarantine

If all requirements are met — microchip, rabies vaccine, satisfactory titre test, valid health documentation — the cat enters the UK with no quarantine period. The cat goes directly to its new home.

## The Timeline

From the decision to adopt to the cat arriving at your door, expect approximately 2-4 months. Here is a typical timeline:

**Week 1-2:** You find a cat on a rescue platform, submit an adoption application, and are matched with the cat by the rescue organisation.

**Week 2-3:** The rescue arranges veterinary preparation. The cat is health-checked, vaccinated (if not already), microchipped (if not already), and receives the rabies vaccination.

**Week 5-6:** Blood is drawn for the rabies titre test (must be at least 30 days after the rabies vaccination).

**Week 7-9:** Titre test results return from the laboratory.

**Week 9-11:** Transport is arranged. An animal health certificate or EU pet passport is finalised. A pre-travel health check is conducted within 10 days of departure.

**Week 10-12:** The cat travels to the UK and arrives at your home.

The longest single step is the rabies titre test waiting period. If the cat has already been vaccinated for rabies and has a valid titre test on file (some rescues do this proactively), the timeline can be significantly shorter.

## Transport Options

There are three main ways to get a cat from Cyprus to the UK:

### Commercial Pet Courier (Most Common)

Professional pet transport companies operate regular routes between Cyprus and the UK. They handle all logistics — pickup from the rescue, airport transport, flight booking, customs clearance, and delivery to your door or a local collection point. Costs typically range from EUR 250-500 depending on the service level and whether it is door-to-door or airport-to-airport.

This is the most reliable and stress-free option. Reputable couriers include companies that specialise in Mediterranean pet transport routes.

### Cargo Flight

The cat travels as live cargo on a commercial airline. The rescue or a transport agent arranges the booking. The cat flies in a climate-controlled, pressurised cargo hold in an airline-approved carrier. You collect the cat at the destination airport's cargo facility. Costs are typically EUR 200-400.

### Volunteer Flight Escort

Occasionally, people travelling from Cyprus to the UK will volunteer to accompany a rescue animal as in-cabin or checked baggage. The animal travels on the volunteer's booking. This is the cheapest option but the least predictable, as it depends on finding a volunteer whose travel dates align with the cat's readiness.

Some rescue organisations maintain networks of regular volunteer escorts. This option works best when the timeline is flexible.

## Costs

The total cost of adopting a rescue cat from Cyprus to the UK typically breaks down as follows:

| Item | Approximate Cost |
|------|-----------------|
| Adoption fee (to the rescue) | EUR 50-150 |
| Veterinary preparation (vaccines, microchip, spay/neuter, health check) | EUR 100-200 |
| Rabies titre test | EUR 50-80 |
| EU pet passport / health certificate | EUR 20-40 |
| Transport to UK (commercial courier) | EUR 250-500 |
| **Total** | **EUR 470-970** |

Some rescue organisations include veterinary preparation in their adoption fee. Others charge separately. Always ask for a clear breakdown before committing.

## How to Find a Rescue Cat in Cyprus

Several rescue organisations in Cyprus actively place cats internationally:

- **Gardens of St Gertrude** (Parekklisia) — Cat sanctuary with 92 cats, many available for international adoption
- **Malcolm's Cat Sanctuary** — Established rescue with regular UK placements
- **Patch of Heaven** — Cat and dog rescue with international adoption program
- Various smaller rescues across all districts

The platform **Tinies** ([tinies.app](https://tinies.app)) connects Cyprus rescue organisations with international adopters, providing a centralised place to browse available animals and submit adoption applications.

## What to Prepare at Home

Before your rescue cat arrives, you will need:

**Essential supplies:** Litter tray, litter, food bowls, water bowls, age-appropriate food (ask the rescue what the cat has been eating), a carrier for vet visits, a scratching post.

**A safe room:** Set up one quiet room where the cat will spend its first few days. Moving 3,200km is stressful. The cat needs time to decompress in a small, safe space before exploring the rest of the home. Include the litter tray, food, water, a hiding spot (a box with a blanket works), and something that smells like the rescue (ask the rescue to send a blanket or towel with the cat).

**A local vet appointment:** Book a registration appointment with a local vet within the first week. Bring all the cat's documentation — passport, vaccination records, titre test results. Your UK vet will want to review everything and set up the cat's ongoing care schedule.

**Patience:** A rescue cat from Cyprus may take days, weeks, or even months to fully settle. Some cats are confident from day one. Others hide under the bed for a week. Both are normal. Let the cat set the pace.

## Post-Arrival: Registration

Within the UK, there is no mandatory registration requirement for pet cats (unlike dogs, which must be microchipped and registered). However, it is strongly recommended to:

- Register the microchip with a UK database (the Cyprus microchip will already be in the cat, but registering it with a UK service like Petlog ensures the cat can be traced if it goes missing)
- Register with a local veterinary practice
- Consider pet insurance (especially in the first year, as settling stress can sometimes trigger health issues)

## The Emotional Part

Somewhere in Cyprus right now, there is a cat sitting in a sanctuary or a foster home. It has a name. It has a personality. It has a favourite spot to sleep and a specific way it likes to be scratched. And it is waiting for someone to decide that it belongs to them.

The paperwork is manageable. The cost is reasonable. The timeline requires patience. But the result — a living creature that was abandoned or born homeless, now curled up on your sofa in the UK, purring — is the kind of outcome that makes all of it worthwhile.

No matter the size. Every tiny deserves a home.

---

*Tinies ([tinies.app](https://tinies.app)) connects Cyprus rescue organisations with adopters across Europe. Browse adoptable animals at [tinies.app/adopt](/adopt).*`,
  },
  {
    slug: "the-stray-cat-crisis-in-cyprus",
    title: "The Stray Cat Crisis in Cyprus: What Is Happening and What You Can Do",
    excerpt: "An island of one million people. An estimated one million stray cats. And the volunteers trying to hold it all together.",
    category: "Animal Welfare",
    date: "March 15, 2026",
    author: "Tinies Team",
    readTime: "10 min read",
    content: `Drive through any village in Cyprus — Parekklisia, Xylotymbou, Tala, Sotira, any of them — and you will see them. Cats on walls. Cats under cars. Cats in doorways. Cats crossing the road with that unhurried confidence that suggests they have been here longer than the pavement. Kittens in clusters, playing in the dust. Older cats, scarred and cautious, watching from the shadows.

Cyprus has a cat situation. Depending on who you ask, it is a charming cultural feature, an ecological crisis, an animal welfare emergency, or all three at once.

## The Numbers

There is no official census of stray cats in Cyprus. Estimates vary widely, but the most commonly cited figure — repeated by veterinary organisations, animal welfare groups, and government officials — is that the stray cat population roughly equals the human population. One million people. Approximately one million stray cats.

Even if the real number is half that, it represents one of the highest per-capita stray animal populations in Europe.

The reasons are straightforward: Cyprus has a warm climate year-round, which means cats survive outdoors more easily than in northern Europe. Spay and neuter programmes exist but are not universal. Abandonment — people acquiring kittens and then surrendering or dumping them when they grow — remains common. And while attitudes are improving, Cyprus has historically had a culture where outdoor cats are tolerated but not necessarily cared for. They exist in a grey zone between "community animals" and "nobody's responsibility."

## What the Rescue Organisations Face

Across the island, an informal network of rescue organisations, shelters, foster carers, and individual volunteers does what the government largely does not: they catch, treat, spay, neuter, feed, shelter, and rehome stray cats and dogs.

These organisations operate on shoestring budgets. Many are unregistered charities, funded entirely by the personal savings of their founders. They run out of homes, garages, and rented properties. They coordinate via WhatsApp groups and Facebook posts. They rely on donations that arrive inconsistently and on volunteers who burn out regularly.

The work is relentless. A typical rescue founder's week might include: trapping a feral cat colony for spay/neuter, driving two hours to a specialist vet because the local one cannot handle a particular surgery, fostering four kittens who are too young to survive without bottle-feeding every three hours, coordinating the transport of an adopted cat to a family in Germany, fundraising on social media to cover a EUR 800 emergency vet bill, and answering the phone call from a stranger who says "I found a kitten, can you take it?" — knowing that the answer should be "I have no space" but somehow always ends up being "bring it over."

Gardens of St Gertrude, a sanctuary in Parekklisia, cares for 92 cats. Its founder, Karen Pendergrass, has funded the entire operation out of pocket since it opened. No external donations. No government support. Just a woman, her family, and 92 cats who need to eat every day.

Malcolm's Cat Sanctuary, Patch of Heaven, and dozens of other organisations across the island do similar work in similar conditions. Some have a few dozen animals. Some have hundreds.

None of them have enough money. All of them have too many animals.

## The Government Response

The Cyprus government has taken steps to address animal welfare. The 2020 animal welfare law strengthened protections and penalties for animal cruelty and abandonment. Municipal governments are responsible for stray animal control in their jurisdictions, and some have implemented trap-neuter-return (TNR) programmes.

But the scale of the problem outpaces the government's response. TNR programmes exist but are not funded at a level that would meaningfully reduce the stray population island-wide. Enforcement of animal welfare laws is inconsistent. And the infrastructure for a comprehensive, government-run animal control system — the kind that exists in most Western European countries — simply does not exist in Cyprus at the scale needed.

The result is that the actual work of animal rescue falls primarily to private individuals and volunteer organisations. The government provides a legal framework. The volunteers provide the labour, the money, and the heartbreak.

## The Poisoning Problem

In some parts of Cyprus, particularly rural areas, stray cats are seen as pests. Poisoning — typically with antifreeze or pesticide-laced food left in areas where cats congregate — occurs with disturbing regularity. Rescue organisations report poisoning incidents throughout the year, with seasonal spikes that sometimes coincide with agricultural cycles.

Poisoning is illegal under Cyprus law and carries penalties including imprisonment. But prosecutions are rare, and the perpetrators are almost never identified. The cats simply appear dead, sometimes in groups, and the rescue community absorbs the grief and moves on to the next crisis.

This is the reality that rescue workers live with. It is not picturesque. It is not the version of Cyprus that appears in travel brochures. But it is real, and it shapes every decision that every rescue organisation on the island makes.

## What Is Working

Despite the challenges, there are reasons for cautious optimism.

**International adoption is growing.** Countries like the UK, Germany, the Netherlands, and Scandinavia have strong "adopt don't shop" cultures and more demand for rescue animals than their domestic shelters can supply. Cyprus rescue organisations have developed networks and expertise in placing animals internationally, and the number of cross-border adoptions is increasing year over year.

**Technology is helping.** Platforms that connect rescue organisations with international adopters, coordinate veterinary logistics, and handle transport paperwork are making international adoption more accessible and more professional. What used to require weeks of WhatsApp coordination can increasingly be managed through structured digital tools.

**Community feeding programmes are stabilising populations.** In many areas, organised community feeding — where volunteers maintain feeding stations and monitor cat colonies — combined with TNR, is beginning to stabilise local populations. The cats are healthier, the reproduction rate drops, and the colonies shrink gradually over time.

**Awareness is growing.** Both within Cyprus and internationally, awareness of the stray animal situation is increasing. Social media has made the work of rescue organisations visible to audiences far beyond the island. International donors, volunteers, and adopters are engaging with Cyprus animal welfare in numbers that would have been unimaginable a decade ago.

## What You Can Do

Whether you live in Cyprus, in Europe, or anywhere else, there are concrete actions you can take.

### If You Live in Cyprus

**Spay and neuter your own animals.** This is the single most impactful thing any individual can do. Every unspayed cat or dog contributes to the population problem. The cost is modest relative to the impact.

**Feed responsibly.** If you feed community cats, do so at consistent times and locations, and work with local TNR groups to ensure the cats you feed are sterilised. Feeding without sterilising increases the population.

**Report animal cruelty.** If you witness abuse, abandonment, or poisoning, report it to the police and to local animal welfare organisations. Documentation (photos, video, dates, locations) helps build cases.

**Volunteer.** Rescue organisations always need help: fostering, transport, feeding station maintenance, fundraising, social media management, event organisation. Even a few hours a month makes a difference.

**Adopt, do not buy.** If you want a pet, adopt from a rescue. There are thousands of wonderful animals waiting.

### If You Live Outside Cyprus

**Adopt a rescue from Cyprus.** International adoption is well-established and the process, while it requires patience, is straightforward. Your adoption fee and the care you provide to that animal directly reduces the burden on rescue organisations.

**Donate to a Cyprus rescue organisation.** Even small amounts matter when budgets are measured in hundreds rather than thousands. Direct donations to organisations like Gardens of St Gertrude, Malcolm's Cat Sanctuary, or Patch of Heaven go directly to animal care.

**Become a Tinies Guardian.** The platform Tinies ([tinies.app](https://tinies.app)) is launching a monthly giving programme where subscribers from EUR 3/month support Cyprus animal sanctuaries directly, with full transparency on how funds are used.

**Foster awareness.** Share rescue animals' stories on social media. Talk about Cyprus's stray situation with friends who are considering getting a pet. The more people know, the more animals find homes.

**Volunteer as a flight escort.** If you travel between Cyprus and Northern Europe, you can volunteer to accompany a rescue animal on your flight. Rescue organisations maintain lists of animals waiting for transport, and the process is simpler than most people expect.

## The Bigger Picture

The stray cat crisis in Cyprus is not a problem that will be solved by any single organisation, any single platform, or any single policy change. It is a systemic issue that requires sustained effort across multiple fronts: government investment in TNR infrastructure, cultural change in attitudes toward animal sterilisation and abandonment, international cooperation on adoption and transport, and continued support for the volunteer organisations doing the daily work.

But systemic problems are solved by people who refuse to wait for systemic solutions. Every cat that is spayed is one fewer litter of kittens born homeless. Every cat that is adopted internationally is one fewer mouth for an overstretched rescue to feed. Every euro donated to a sanctuary is a bag of food, a vet visit, a life extended.

Ninety-two cats sit in a garden in Parekklisia, fed by a woman who decided that waiting for someone else to fix the problem was not an option. That is not a complete solution. But it is 92 cats who are alive and cared for, and that is not nothing.

No matter the size. Every tiny matters.

---

*Tinies ([tinies.app](https://tinies.app)) is a pet services marketplace and international animal adoption platform where approximately 90% of commission revenue goes directly to animal sanctuaries in Cyprus. Browse adoptable animals at [tinies.app/adopt](/adopt) or support the mission at [tinies.app/giving](/giving).*`,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts;
}
