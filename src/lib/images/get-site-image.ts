import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/** Invalidate via `revalidateTag(SITE_IMAGES_CACHE_TAG)` after admin image updates. */
export const SITE_IMAGES_CACHE_TAG = "site-images";

async function fetchSiteImageUrl(imageKey: string): Promise<string | null> {
  const safeKey = imageKey.trim();
  if (!safeKey) return null;
  const row = await prisma.siteImage.findUnique({
    where: { imageKey: safeKey },
    select: { url: true },
  });
  const u = row?.url?.trim();
  return u && u.length > 0 ? u : null;
}

/**
 * Public URL for a registered site image, or null if missing / empty URL.
 * Cached ~60s; tag `site-images` for revalidation.
 */
export async function getSiteImage(imageKey: string): Promise<string | null> {
  const safeKey = imageKey.trim();
  if (!safeKey) return null;
  return unstable_cache(
    () => fetchSiteImageUrl(safeKey),
    ["site-image", safeKey],
    { revalidate: 60, tags: [SITE_IMAGES_CACHE_TAG] }
  )();
}

export async function getSiteImageWithFallback(imageKey: string, fallback: string): Promise<string> {
  const url = await getSiteImage(imageKey);
  if (url) return url;
  return fallback.trim().length > 0 ? fallback : "";
}

/** Batch lookup for list pages (e.g. search). Not individually cached. */
export async function getSiteImageUrlsForKeys(
  imageKeys: string[]
): Promise<Map<string, string>> {
  const unique = [...new Set(imageKeys.map((k) => k.trim()).filter(Boolean))];
  if (unique.length === 0) return new Map();
  const rows = await prisma.siteImage.findMany({
    where: { imageKey: { in: unique } },
    select: { imageKey: true, url: true },
  });
  const map = new Map<string, string>();
  for (const r of rows) {
    const u = r.url?.trim();
    if (u) map.set(r.imageKey, u);
  }
  return map;
}
