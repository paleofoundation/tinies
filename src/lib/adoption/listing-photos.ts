/** Max photos per listing (enforced in forms and server actions). */
export const MAX_LISTING_PHOTOS = 10;

export function normalizeListingPhotoUrls(urls: string[] | undefined): string[] {
  return (urls ?? [])
    .map((u) => (typeof u === "string" ? u.trim() : ""))
    .filter(Boolean)
    .slice(0, MAX_LISTING_PHOTOS);
}

/** Pad/truncate to MAX_LISTING_PHOTOS empty string slots for controlled inputs. */
export function photoUrlFormSlots(stored: string[]): string[] {
  const filled = stored.filter(Boolean).slice(0, MAX_LISTING_PHOTOS);
  const pad = MAX_LISTING_PHOTOS - filled.length;
  return pad > 0 ? [...filled, ...Array.from({ length: pad }, () => "")] : filled;
}
