/** Max photos per listing (enforced in forms and server actions). */
export const MAX_LISTING_PHOTOS = 10;

export function normalizeListingPhotoUrls(urls: string[] | undefined): string[] {
  return (urls ?? [])
    .map((u) => (typeof u === "string" ? u.trim() : ""))
    .filter(Boolean)
    .slice(0, MAX_LISTING_PHOTOS);
}

/** One trailing empty row when under max, so users can add more without 10 empty inputs. */
export function photoUrlSlotsForForm(stored: string[]): string[] {
  const filled = stored.filter(Boolean).slice(0, MAX_LISTING_PHOTOS);
  if (filled.length === 0) return [""];
  if (filled.length < MAX_LISTING_PHOTOS) return [...filled, ""];
  return filled;
}
