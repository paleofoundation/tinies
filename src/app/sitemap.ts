import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import {
  SERVICE_TYPE_SLUGS,
  DISTRICT_SLUGS,
  COUNTRY_SLUGS,
} from "@/lib/constants/seo-landings";
import { blogPosts, type BlogPost } from "@/lib/constants/blog-posts";

export const dynamic = "force-dynamic";

/** Canonical site origin for sitemap URLs (www per product SEO). */
const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.tinies.app").replace(/\/$/, "");

function blogPostLastModified(post: BlogPost): Date {
  const parsed = Date.parse(post.date);
  return Number.isNaN(parsed) ? new Date() : new Date(parsed);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticNow = new Date();

  const [
    providers,
    listings,
    rescues,
    charities,
  ] = await Promise.all([
    prisma.providerProfile.findMany({
      where: { verified: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.adoptionListing.findMany({
      where: {
        status: "available",
        active: true,
        org: { verified: true },
      },
      select: { slug: true, updatedAt: true },
    }),
    prisma.rescueOrg.findMany({
      where: { verified: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.charity.findMany({
      where: { active: true, verified: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: staticNow, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/services`, lastModified: staticNow, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/services/search`, lastModified: staticNow, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/adopt`, lastModified: staticNow, changeFrequency: "daily", priority: 0.9 },
    {
      url: `${BASE_URL}/adopt/tinies-who-made-it`,
      lastModified: staticNow,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    { url: `${BASE_URL}/giving`, lastModified: staticNow, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/giving/become-a-guardian`, lastModified: staticNow, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/how-it-works`, lastModified: staticNow, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/for-providers`, lastModified: staticNow, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/for-rescues`, lastModified: staticNow, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: staticNow, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/terms`, lastModified: staticNow, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: staticNow, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/blog`, lastModified: staticNow, changeFrequency: "weekly", priority: 0.8 },
  ];

  const districtPages: MetadataRoute.Sitemap = [];
  for (const serviceType of SERVICE_TYPE_SLUGS) {
    for (const district of DISTRICT_SLUGS) {
      districtPages.push({
        url: `${BASE_URL}/${serviceType}/${district}`,
        lastModified: staticNow,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  const countryPages: MetadataRoute.Sitemap = COUNTRY_SLUGS.map((country) => ({
    url: `${BASE_URL}/adopt/from-cyprus-to-${country}`,
    lastModified: staticNow,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const providerPages: MetadataRoute.Sitemap = providers.map((p) => ({
    url: `${BASE_URL}/services/provider/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const adoptionListingPages: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${BASE_URL}/adopt/${l.slug}`,
    lastModified: l.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const rescuePages: MetadataRoute.Sitemap = rescues.map((r) => ({
    url: `${BASE_URL}/rescue/${r.slug}`,
    lastModified: r.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const charityPages: MetadataRoute.Sitemap = charities.map((c) => ({
    url: `${BASE_URL}/giving/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: blogPostLastModified(post),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...districtPages,
    ...countryPages,
    ...providerPages,
    ...adoptionListingPages,
    ...rescuePages,
    ...charityPages,
    ...blogPages,
  ];
}
