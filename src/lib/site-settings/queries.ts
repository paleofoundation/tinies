import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type SiteSocialUrls = {
  linkedIn: string | null;
  facebook: string | null;
  x: string | null;
  instagram: string | null;
};

export const SITE_SETTINGS_CACHE_TAG = "site-settings";

/**
 * Public read for footer social links. Cached; invalidated when admin updates settings.
 */
export const getSiteSocialUrls = unstable_cache(
  async (): Promise<SiteSocialUrls> => {
    const row = await prisma.siteSettings.findUnique({
      where: { id: "default" },
      select: {
        socialLinkedInUrl: true,
        socialFacebookUrl: true,
        socialXUrl: true,
        socialInstagramUrl: true,
      },
    });
    const trim = (s: string | null | undefined) => {
      const v = s?.trim();
      return v && v.length > 0 ? v : null;
    };
    return {
      linkedIn: trim(row?.socialLinkedInUrl),
      facebook: trim(row?.socialFacebookUrl),
      x: trim(row?.socialXUrl),
      instagram: trim(row?.socialInstagramUrl),
    };
  },
  ["site-social-urls-v1"],
  { tags: [SITE_SETTINGS_CACHE_TAG] }
);
