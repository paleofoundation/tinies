/**
 * SEO country adoption landings: /adopt/from-cyprus-to-[slug]
 * Single source for copy, DB filter tokens, and success-story matching.
 */

export const ADOPTION_COUNTRY_SLUGS = [
  "uk",
  "germany",
  "netherlands",
  "sweden",
  "austria",
  "switzerland",
] as const;

export type AdoptionCountrySlug = (typeof ADOPTION_COUNTRY_SLUGS)[number];

export function isAdoptionCountrySlug(value: string): value is AdoptionCountrySlug {
  return (ADOPTION_COUNTRY_SLUGS as readonly string[]).includes(value);
}

/** Checkbox labels stored on AdoptionListing.destinationCountries (admin / rescue forms). */
export const LISTING_DESTINATION_COUNTRY_OPTIONS = [
  "UK",
  "Germany",
  "Netherlands",
  "Sweden",
  "Austria",
  "Switzerland",
  "Other EU",
] as const;

export type CountryAdoptionSeo = {
  slug: AdoptionCountrySlug;
  /** Used in hero and steps, e.g. "the UK", "Germany". */
  heroCountryPhrase: string;
  /** Fragment for meta title, e.g. "the UK", "Germany". */
  seoTitleCountry: string;
  /** Values for Prisma `destinationCountries: { hasSome: [...] }`. */
  listingDestinationValues: string[];
  /** Match AdoptionPlacement.destinationCountry or AdoptionApplication.country (case-insensitive). */
  successStoryCountryMatchers: string[];
  /** Key import / travel requirements (plain language; not legal advice). */
  requirements: string[];
  /** Short note on routing / carriers for this destination. */
  transportNotes: string;
  /** Shown in fee section; same range at launch for all destinations. */
  typicalTotalNarrative: string;
};

export const ADOPTION_COUNTRY_SEO: Record<AdoptionCountrySlug, CountryAdoptionSeo> = {
  uk: {
    slug: "uk",
    heroCountryPhrase: "the UK",
    seoTitleCountry: "the UK",
    listingDestinationValues: ["UK", "United Kingdom"],
    successStoryCountryMatchers: ["UK", "United Kingdom", "Great Britain", "GB", "England", "Scotland", "Wales"],
    requirements: [
      "Rabies titer test (30+ days post-vaccination)",
      "ISO microchip before rabies vaccination",
      "Tapeworm treatment for dogs 24–120 hours before arrival",
      "Transport via an approved pet courier or cargo as required by UK rules",
    ],
    transportNotes:
      "We coordinate with registered pet couriers and cargo routes that meet UK import requirements. Timelines depend on titer test scheduling and carrier availability.",
    typicalTotalNarrative: "Typical total: EUR 350–600 depending on transport method.",
  },
  germany: {
    slug: "germany",
    heroCountryPhrase: "Germany",
    seoTitleCountry: "Germany",
    listingDestinationValues: ["Germany"],
    successStoryCountryMatchers: ["Germany", "Deutschland"],
    requirements: [
      "EU pet passport",
      "ISO microchip",
      "Rabies vaccination (21+ days before travel where applicable)",
      "Breed restrictions in some states (e.g. Pitbull, Staffordshire, Bull Terrier types) — we flag risks per listing",
      "Local dog registration within about 2 weeks of arrival where required",
    ],
    transportNotes:
      "Road and air options into Germany are common from Cyprus; exact routing depends on the animal, season, and carrier slots.",
    typicalTotalNarrative: "Typical total: EUR 350–600 depending on transport method.",
  },
  netherlands: {
    slug: "netherlands",
    heroCountryPhrase: "the Netherlands",
    seoTitleCountry: "the Netherlands",
    listingDestinationValues: ["Netherlands"],
    successStoryCountryMatchers: ["Netherlands", "Holland", "The Netherlands"],
    requirements: [
      "EU pet passport",
      "ISO microchip",
      "Rabies vaccination (21+ days before travel where applicable)",
      "Some high-risk dog breeds may need a behaviour assessment",
      "Dog tax / municipal registration may apply",
    ],
    transportNotes:
      "Most animals travel via EU-compliant road or air routing; we align paperwork with Dutch entry rules.",
    typicalTotalNarrative: "Typical total: EUR 350–600 depending on transport method.",
  },
  sweden: {
    slug: "sweden",
    heroCountryPhrase: "Sweden",
    seoTitleCountry: "Sweden",
    listingDestinationValues: ["Sweden"],
    successStoryCountryMatchers: ["Sweden", "Sverige"],
    requirements: [
      "EU pet passport",
      "ISO microchip",
      "Rabies vaccination (21+ days before travel where applicable)",
      "Echinococcus tapeworm treatment for dogs 24–120 hours before entry",
    ],
    transportNotes:
      "Planning includes tapeworm treatment windows for dogs so Swedish border rules are met.",
    typicalTotalNarrative: "Typical total: EUR 350–600 depending on transport method.",
  },
  austria: {
    slug: "austria",
    heroCountryPhrase: "Austria",
    seoTitleCountry: "Austria",
    listingDestinationValues: ["Austria"],
    successStoryCountryMatchers: ["Austria", "Österreich", "Osterreich"],
    requirements: [
      "EU pet passport",
      "ISO microchip",
      "Rabies vaccination (21+ days before travel where applicable)",
      "Breed and import rules vary by province — we confirm details for your case",
    ],
    transportNotes:
      "EU routing into Austria is straightforward once passport and health steps are complete; provincial rules may affect certain breeds.",
    typicalTotalNarrative: "Typical total: EUR 350–600 depending on transport method.",
  },
  switzerland: {
    slug: "switzerland",
    heroCountryPhrase: "Switzerland",
    seoTitleCountry: "Switzerland",
    listingDestinationValues: ["Switzerland"],
    successStoryCountryMatchers: ["Switzerland", "Swiss", "Schweiz", "Suisse"],
    requirements: [
      "EU pet passport",
      "ISO microchip",
      "Valid rabies vaccination",
      "Import permit may be required for certain breeds or categories — we check per animal",
    ],
    transportNotes:
      "Non-EU rules apply for Switzerland; permits and paperwork can add time — we build that into your timeline.",
    typicalTotalNarrative: "Typical total: EUR 350–600 depending on transport method.",
  },
};

export function getCountryAdoptionSeo(slug: string): CountryAdoptionSeo | null {
  if (!isAdoptionCountrySlug(slug)) return null;
  return ADOPTION_COUNTRY_SEO[slug];
}
