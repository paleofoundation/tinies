/**
 * SEO landing page slugs and labels for district service pages and country adoption pages.
 */

import {
  ADOPTION_COUNTRY_SLUGS,
  ADOPTION_COUNTRY_SEO,
} from "@/lib/adoption/country-requirements";

export const SERVICE_TYPE_SLUGS = [
  "dog-walking",
  "pet-sitting",
  "boarding",
  "drop-in-visits",
  "daycare",
] as const;

export const DISTRICT_SLUGS = [
  "limassol",
  "nicosia",
  "paphos",
  "larnaca",
  "famagusta",
  "kyrenia",
] as const;

/** Map URL slug -> internal service type for getSearchProviders */
export const SERVICE_SLUG_TO_TYPE: Record<string, string> = {
  "dog-walking": "walking",
  "pet-sitting": "sitting",
  boarding: "boarding",
  "drop-in-visits": "drop_in",
  daycare: "daycare",
};

/** Map URL slug -> display name for district (matches User.district / filter value) */
export const DISTRICT_SLUG_TO_NAME: Record<string, string> = {
  limassol: "Limassol",
  nicosia: "Nicosia",
  paphos: "Paphos",
  larnaca: "Larnaca",
  famagusta: "Famagusta",
  kyrenia: "Kyrenia",
};

/** Map internal service type -> display label */
export const SERVICE_TYPE_TO_LABEL: Record<string, string> = {
  walking: "Dog Walking",
  sitting: "Pet Sitting",
  boarding: "Overnight Boarding",
  drop_in: "Drop-In Visits",
  daycare: "Daycare",
};

/** Country adoption SEO pages: /adopt/from-cyprus-to-[slug] */
export const COUNTRY_SLUGS = ADOPTION_COUNTRY_SLUGS;

/** Map country URL slug -> display name (hero / sentences) */
export const COUNTRY_SLUG_TO_NAME: Record<string, string> = Object.fromEntries(
  ADOPTION_COUNTRY_SLUGS.map((slug) => [slug, ADOPTION_COUNTRY_SEO[slug].heroCountryPhrase])
) as Record<string, string>;

/** Map country slug -> value stored in AdoptionListing.destinationCountries (for filtering) */
export const COUNTRY_SLUG_TO_DESTINATION: Record<string, string[]> = Object.fromEntries(
  ADOPTION_COUNTRY_SLUGS.map((slug) => [slug, ADOPTION_COUNTRY_SEO[slug].listingDestinationValues])
) as Record<string, string[]>;
