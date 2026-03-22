/** Stored on AdoptionListing.goodWith — human-readable tags for filters and UI. */
export const ADOPTION_GOOD_WITH_TAGS = [
  "other cats",
  "dogs",
  "children",
  "children over 10",
  "seniors",
  "single people",
  "first-time owners",
  "active households",
] as const;

/** Stored on AdoptionListing.notGoodWith */
export const ADOPTION_NOT_GOOD_WITH_TAGS = [
  "small children",
  "very young children",
  "other cats",
  "dogs",
] as const;

export type AdoptionGoodWithTag = (typeof ADOPTION_GOOD_WITH_TAGS)[number];
export type AdoptionNotGoodWithTag = (typeof ADOPTION_NOT_GOOD_WITH_TAGS)[number];

const goodSet = new Set<string>(ADOPTION_GOOD_WITH_TAGS);
const notGoodSet = new Set<string>(ADOPTION_NOT_GOOD_WITH_TAGS);

export function filterGoodWithTags(values: string[]): string[] {
  return values.filter((v) => goodSet.has(v));
}

export function filterNotGoodWithTags(values: string[]): string[] {
  return values.filter((v) => notGoodSet.has(v));
}
