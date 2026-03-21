import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import {
  SERVICE_TYPE_SLUGS,
  DISTRICT_SLUGS,
  COUNTRY_SLUGS,
} from "@/lib/constants/seo-landings";
import { blogPosts } from "@/lib/constants/blog-posts";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/how-it-works`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/services/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/adopt`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/giving`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/giving/become-a-guardian`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/for-providers`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/for-rescues`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  const districtPages: MetadataRoute.Sitemap = [];
  for (const serviceType of SERVICE_TYPE_SLUGS) {
    for (const district of DISTRICT_SLUGS) {
      districtPages.push({
        url: `${BASE_URL}/${serviceType}/${district}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      });
    }
  }

  const countryPages: MetadataRoute.Sitemap = COUNTRY_SLUGS.map((country) => ({
    url: `${BASE_URL}/adopt/from-cyprus-to-${country}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const [providerSlugs, listingSlugs, charitySlugs] = await Promise.all([
    prisma.providerProfile.findMany({ where: { verified: true }, select: { slug: true } }),
    prisma.adoptionListing.findMany({
      where: { status: "available", active: true, org: { verified: true } },
      select: { slug: true },
    }),
    prisma.charity.findMany({
      where: { active: true },
      select: { slug: true },
    }),
  ]);

  const providerPages: MetadataRoute.Sitemap = providerSlugs.map((p) => ({
    url: `${BASE_URL}/services/provider/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const adoptionListingPages: MetadataRoute.Sitemap = listingSlugs.map((l) => ({
    url: `${BASE_URL}/adopt/${l.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const charityPages: MetadataRoute.Sitemap = charitySlugs.map((c) => ({
    url: `${BASE_URL}/giving/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...districtPages,
    ...countryPages,
    ...providerPages,
    ...adoptionListingPages,
    ...charityPages,
    ...blogPages,
  ];
}
