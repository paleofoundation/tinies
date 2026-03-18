/**
 * SEO landing page slugs and labels for district service pages and country adoption pages.
 */

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

export const COUNTRY_SLUGS = ["uk", "germany", "netherlands", "sweden", "other-eu"] as const;

/** Map country URL slug -> display name */
export const COUNTRY_SLUG_TO_NAME: Record<string, string> = {
  uk: "the UK",
  germany: "Germany",
  netherlands: "the Netherlands",
  sweden: "Sweden",
  "other-eu": "Other EU countries",
};

/** Map country slug -> value stored in AdoptionListing.destinationCountries (for filtering) */
export const COUNTRY_SLUG_TO_DESTINATION: Record<string, string[]> = {
  uk: ["UK", "United Kingdom"],
  germany: ["Germany"],
  netherlands: ["Netherlands"],
  sweden: ["Sweden"],
  "other-eu": ["EU", "Other EU", "France", "Italy", "Spain", "Austria", "Belgium", "Ireland", "Portugal", "Other"],
};
