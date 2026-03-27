import type { MetadataRoute } from "next";
import { getCanonicalSiteOrigin } from "@/lib/constants/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getCanonicalSiteOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/api/",
        "/editorial-preview",
        "/en/editorial-preview",
        "/el/editorial-preview",
        "/ru/editorial-preview",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
