import type { AdoptAgeBand } from "./parse-estimated-age";

export type AdoptBrowseSpecies = "dog" | "cat";

export type AdoptBrowseDistrictSlug =
  | "nicosia"
  | "limassol"
  | "larnaca"
  | "paphos"
  | "famagusta"
  | "kyrenia";

export type AdoptBrowseQuery = {
  species?: AdoptBrowseSpecies;
  district?: AdoptBrowseDistrictSlug;
  age?: AdoptAgeBand;
  /** When true, only internationally eligible listings with at least one destination. */
  international?: boolean;
  /** Filter to listings from this verified rescue org (public slug). */
  rescueOrgSlug?: string;
};

const SPECIES_VALUES: AdoptBrowseSpecies[] = ["dog", "cat"];
const DISTRICT_VALUES: AdoptBrowseDistrictSlug[] = [
  "nicosia",
  "limassol",
  "larnaca",
  "paphos",
  "famagusta",
  "kyrenia",
];
const AGE_VALUES: AdoptAgeBand[] = ["kitten", "young", "adult", "senior"];

function firstParam(
  value: string | string[] | undefined
): string | undefined {
  if (value == null) return undefined;
  const s = Array.isArray(value) ? value[0] : value;
  return typeof s === "string" && s.trim() ? s.trim() : undefined;
}

export function parseAdoptBrowseQuery(
  raw: Record<string, string | string[] | undefined>
): AdoptBrowseQuery {
  const speciesRaw = firstParam(raw.species)?.toLowerCase();
  const species = SPECIES_VALUES.find((s) => s === speciesRaw);

  const districtRaw = firstParam(raw.district)?.toLowerCase();
  const district = DISTRICT_VALUES.find((d) => d === districtRaw);

  const ageRaw = firstParam(raw.age)?.toLowerCase();
  const age = AGE_VALUES.find((a) => a === ageRaw);

  const intlRaw = firstParam(raw.international)?.toLowerCase();
  const international = intlRaw === "true" || intlRaw === "1" || intlRaw === "yes";

  const rescueRaw = firstParam(raw.rescue)?.toLowerCase();
  const rescueOrgSlug =
    rescueRaw && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rescueRaw) ? rescueRaw : undefined;

  const out: AdoptBrowseQuery = {};
  if (species) out.species = species;
  if (district) out.district = district;
  if (age) out.age = age;
  if (international) out.international = true;
  if (rescueOrgSlug) out.rescueOrgSlug = rescueOrgSlug;
  return out;
}

export function adoptBrowseQueryHasFilters(q: AdoptBrowseQuery): boolean {
  return !!(q.species || q.district || q.age || q.international || q.rescueOrgSlug);
}

/** Substring matched case-insensitively against rescue org `location`. */
export function districtSlugToLocationToken(slug: AdoptBrowseDistrictSlug): string {
  return slug;
}

export function buildAdoptBrowseSearchParams(
  q: AdoptBrowseQuery
): URLSearchParams {
  const params = new URLSearchParams();
  if (q.species) params.set("species", q.species);
  if (q.district) params.set("district", q.district);
  if (q.age) params.set("age", q.age);
  if (q.international) params.set("international", "true");
  if (q.rescueOrgSlug) params.set("rescue", q.rescueOrgSlug);
  return params;
}

export const ADOPT_DISTRICT_OPTIONS: { slug: AdoptBrowseDistrictSlug; label: string }[] = [
  { slug: "nicosia", label: "Nicosia" },
  { slug: "limassol", label: "Limassol" },
  { slug: "larnaca", label: "Larnaca" },
  { slug: "paphos", label: "Paphos" },
  { slug: "famagusta", label: "Famagusta" },
  { slug: "kyrenia", label: "Kyrenia" },
];

export const ADOPT_AGE_OPTIONS: { value: AdoptAgeBand; label: string }[] = [
  { value: "kitten", label: "Under 1 year" },
  { value: "young", label: "1–3 years" },
  { value: "adult", label: "3–7 years" },
  { value: "senior", label: "7+ years" },
];
