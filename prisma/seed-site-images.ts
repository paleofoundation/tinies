import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { randomUUID } from "crypto";
import type { PrismaClient } from "@prisma/client";

const CONTENT_DIR = path.join(process.cwd(), "content/blog");

const HOMEPAGE_HERO =
  "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/hero_cats_v2.jpg";
const HOMEPAGE_SANCTUARY =
  "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/hero_garden_cat.jpg";
const ABOUT_GARDENS = HOMEPAGE_HERO;

type SeedRow = {
  imageKey: string;
  category: string;
  label: string;
  url: string;
  alt: string;
};

async function upsertImage(prisma: PrismaClient, row: SeedRow): Promise<void> {
  await prisma.siteImage.upsert({
    where: { imageKey: row.imageKey },
    create: {
      id: randomUUID(),
      imageKey: row.imageKey,
      category: row.category,
      label: row.label,
      url: row.url,
      alt: row.alt,
    },
    update: {
      category: row.category,
      label: row.label,
      alt: row.alt,
    },
  });
}

/**
 * Registers SiteImage rows for admin overrides. Re-running seed updates label/category/alt only — not `url` (preserves admin uploads).
 */
export async function seedSiteImages(prisma: PrismaClient): Promise<void> {
  const rows: SeedRow[] = [];

  rows.push({
    imageKey: "logo",
    category: "branding",
    label: "Header logo",
    url: "",
    alt: "Tinies",
  });
  rows.push({
    imageKey: "favicon",
    category: "branding",
    label: "Favicon (reference — site uses /favicon.ico)",
    url: "/favicon.png",
    alt: "",
  });
  rows.push({
    imageKey: "og-default",
    category: "branding",
    label: "Default Open Graph image",
    url: HOMEPAGE_HERO,
    alt: "Tinies — trusted pet care and rescue adoption in Cyprus",
  });

  rows.push({
    imageKey: "page-homepage-hero",
    category: "page",
    label: "Homepage hero image",
    url: HOMEPAGE_HERO,
    alt: "Rescue cats at Gardens of St Gertrude sanctuary, Cyprus",
  });
  rows.push({
    imageKey: "page-homepage-sanctuary",
    category: "page",
    label: "Homepage sanctuary story image",
    url: HOMEPAGE_SANCTUARY,
    alt: "Cat in the sanctuary garden",
  });
  rows.push({
    imageKey: "page-about-hero",
    category: "page",
    label: "About page — Gardens of St Gertrude section",
    url: ABOUT_GARDENS,
    alt: "Rescue cats at Gardens of St Gertrude sanctuary",
  });
  rows.push({
    imageKey: "page-for-providers-hero",
    category: "page",
    label: "For providers page hero (reserved)",
    url: "",
    alt: "",
  });

  if (fs.existsSync(CONTENT_DIR)) {
    const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
      const { data } = matter(raw);
      const record = data as Record<string, unknown>;
      const slug = String(record.slug ?? path.basename(file, ".md")).trim();
      if (!slug) continue;
      const title = String(record.title ?? slug).trim();
      const image = String(record.image ?? "").trim();
      rows.push({
        imageKey: `blog-${slug}`,
        category: "blog",
        label: `Blog: ${title}`,
        url: image,
        alt: title,
      });
    }
  }

  const providers = await prisma.providerProfile.findMany({
    select: {
      slug: true,
      user: { select: { name: true, avatarUrl: true } },
    },
  });
  for (const p of providers) {
    rows.push({
      imageKey: `provider-${p.slug}`,
      category: "provider",
      label: `Provider: ${p.user.name}`,
      url: (p.user.avatarUrl ?? "").trim(),
      alt: `${p.user.name} profile photo`,
    });
  }

  const rescues = await prisma.rescueOrg.findMany({
    select: { slug: true, name: true, coverPhotoUrl: true },
  });
  for (const r of rescues) {
    rows.push({
      imageKey: `rescue-cover-${r.slug}`,
      category: "rescue",
      label: `Rescue: ${r.name} cover photo`,
      url: (r.coverPhotoUrl ?? "").trim(),
      alt: `${r.name} cover photo`,
    });
  }

  const listings = await prisma.adoptionListing.findMany({
    select: { slug: true, name: true, photos: true },
  });
  for (const L of listings) {
    const photos = Array.isArray(L.photos)
      ? L.photos.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      : [];
    photos.forEach((photoUrl, i) => {
      rows.push({
        imageKey: `adoption-${L.slug}-${i + 1}`,
        category: "adoption",
        label: `Adoption: ${L.name} photo ${i + 1}`,
        url: photoUrl.trim(),
        alt: `${L.name} — adoption photo ${i + 1}`,
      });
    });
  }

  for (const row of rows) {
    await upsertImage(prisma, row);
  }

  console.log(`Registered ${rows.length} site image key(s) for admin overrides.`);
}
