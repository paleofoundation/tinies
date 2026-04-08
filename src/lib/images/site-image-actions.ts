"use server";

import { randomUUID } from "crypto";
import { revalidateTag } from "next/cache";
import { getBlogPostSummaries } from "@/lib/blog/load-posts";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { SITE_IMAGES_CACHE_TAG } from "@/lib/images/get-site-image";

const BUCKET = "site-images";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

function extForMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "bin";
}

function storagePath(category: string, imageKey: string, mime: string): string {
  const safeCat = category.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 64) || "misc";
  const safeKey = imageKey.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 200);
  return `${safeCat}/${safeKey}.${extForMime(mime)}`;
}

async function requireAdminUserId(): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  const u = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (u?.role !== "admin") return { ok: false, error: "Admin only." };
  return { ok: true, userId: user.id };
}

export type SiteImageAdminRow = {
  id: string;
  imageKey: string;
  category: string;
  label: string;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
  updatedAt: Date;
};

/**
 * Blog covers live in markdown (`image` in frontmatter), not in a Prisma `BlogPost` table.
 * `site_images` rows are optional overrides (seeded or created on first admin upload).
 * Merge markdown posts so every blog cover appears in admin even when no DB row exists yet.
 */
function mergeBlogMarkdownIntoSiteImageRows(
  prismaRows: SiteImageAdminRow[],
  blogSummaries: ReturnType<typeof getBlogPostSummaries>
): SiteImageAdminRow[] {
  const prismaKeys = new Set(prismaRows.map((r) => r.imageKey));
  const postBySlug = new Map(blogSummaries.map((p) => [p.slug, p]));

  const fromPrisma = prismaRows.map((r) => {
    if (!r.imageKey.startsWith("blog-")) return r;
    const slug = r.imageKey.slice("blog-".length);
    const post = postBySlug.get(slug);
    if (!post) return r;
    return { ...r, label: `Blog: ${post.title}` };
  });

  const synthetic: SiteImageAdminRow[] = [];
  for (const p of blogSummaries) {
    const imageKey = `blog-${p.slug}`;
    if (prismaKeys.has(imageKey)) continue;
    const d = Date.parse(p.dateISO);
    synthetic.push({
      id: `markdown:${p.slug}`,
      imageKey,
      category: "blog",
      label: `Blog: ${p.title}`,
      url: p.image.trim(),
      alt: p.title.trim(),
      width: null,
      height: null,
      updatedAt: Number.isNaN(d) ? new Date(0) : new Date(d),
    });
  }

  return [...fromPrisma, ...synthetic].sort(
    (a, b) => a.category.localeCompare(b.category) || a.label.localeCompare(b.label)
  );
}

export async function adminListSiteImages(): Promise<SiteImageAdminRow[] | { error: string }> {
  const gate = await requireAdminUserId();
  if (!gate.ok) return { error: gate.error };
  try {
    const rows = await prisma.siteImage.findMany({
      orderBy: [{ category: "asc" }, { label: "asc" }],
    });
    const mapped = rows.map((r) => ({
      id: r.id,
      imageKey: r.imageKey,
      category: r.category,
      label: r.label,
      url: r.url,
      alt: r.alt,
      width: r.width,
      height: r.height,
      updatedAt: r.updatedAt,
    }));
    const blogPosts = getBlogPostSummaries();
    return mergeBlogMarkdownIntoSiteImageRows(mapped, blogPosts);
  } catch (e) {
    console.error("adminListSiteImages", e);
    return { error: "Could not load images." };
  }
}

export async function adminUpdateSiteImageMeta(input: {
  imageKey: string;
  alt: string;
  /** Used when creating a new site_images row (e.g. markdown-only blog cover). */
  category?: string;
  label?: string;
}): Promise<{ ok: true } | { error: string }> {
  const gate = await requireAdminUserId();
  if (!gate.ok) return { error: gate.error };
  try {
    const alt = input.alt.trim();
    const category = (input.category ?? "blog").trim().slice(0, 64) || "blog";
    const label = (input.label ?? input.imageKey).trim().slice(0, 500) || input.imageKey;
    await prisma.siteImage.upsert({
      where: { imageKey: input.imageKey },
      create: {
        id: randomUUID(),
        imageKey: input.imageKey,
        category,
        label,
        url: "",
        alt,
      },
      update: { alt },
    });
    revalidateTag(SITE_IMAGES_CACHE_TAG);
    return { ok: true };
  } catch (e) {
    console.error("adminUpdateSiteImageMeta", e);
    return { error: "Could not update." };
  }
}

/**
 * Upload bytes to Supabase `site-images` and set SiteImage.url (+ optional alt).
 */
export async function adminUploadSiteImage(input: {
  imageKey: string;
  category: string;
  base64: string;
  mimeType: string;
  alt?: string;
  /** Required when the row does not exist yet (e.g. blog cover only in markdown). */
  label?: string;
}): Promise<{ ok: true; publicUrl: string } | { error: string }> {
  const gate = await requireAdminUserId();
  if (!gate.ok) return { error: gate.error };

  const mime = input.mimeType.toLowerCase();
  if (!ALLOWED.has(mime)) {
    return { error: "Only JPEG, PNG, or WebP images are allowed." };
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(input.base64, "base64");
  } catch {
    return { error: "Invalid file data." };
  }
  if (buffer.length > MAX_BYTES) {
    return { error: "Image must be 5MB or smaller." };
  }
  if (buffer.length === 0) {
    return { error: "Empty file." };
  }

  const category = input.category.trim().slice(0, 64) || "blog";
  const label =
    (input.label ?? input.imageKey).trim().slice(0, 500) || input.imageKey;
  let row = await prisma.siteImage.findUnique({
    where: { imageKey: input.imageKey },
    select: { id: true },
  });
  if (!row) {
    await prisma.siteImage.create({
      data: {
        id: randomUUID(),
        imageKey: input.imageKey,
        category,
        label,
        url: "",
        alt: (input.alt ?? "").trim(),
      },
    });
    row = await prisma.siteImage.findUnique({
      where: { imageKey: input.imageKey },
      select: { id: true },
    });
  }
  if (!row) {
    return { error: "Could not register image key." };
  }

  const path = storagePath(category, input.imageKey, mime);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return {
      error:
        "Image upload is not configured on the server. Set SUPABASE_SERVICE_ROLE_KEY (and NEXT_PUBLIC_SUPABASE_URL) in your environment — the anon key cannot upload to Storage.",
    };
  }

  try {
    const admin = createSupabaseAdmin();
    const { error: upErr } = await admin.storage.from(BUCKET).upload(path, buffer, {
      contentType: mime,
      upsert: true,
      cacheControl: "0",
    });
    if (upErr) {
      console.error("adminUploadSiteImage storage", upErr);
      return {
        error:
          upErr.message?.includes("Bucket not found") || upErr.message?.includes("not found")
            ? `Storage bucket "${BUCKET}" is missing. Create it in Supabase (public read) and retry.`
            : "Upload failed. Check Supabase Storage and policies.",
      };
    }

    const {
      data: { publicUrl },
    } = admin.storage.from(BUCKET).getPublicUrl(path);

    const bustUrl = `${publicUrl}?v=${Date.now()}`;

    await prisma.siteImage.update({
      where: { imageKey: input.imageKey },
      data: {
        url: bustUrl,
        ...(input.alt !== undefined ? { alt: input.alt.trim() } : {}),
        ...(input.label !== undefined ? { label: input.label.trim().slice(0, 500) } : {}),
      },
    });

    revalidateTag(SITE_IMAGES_CACHE_TAG);
    return { ok: true, publicUrl: bustUrl };
  } catch (e) {
    console.error("adminUploadSiteImage", e);
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("SUPABASE_SERVICE_ROLE_KEY") || msg.includes("NEXT_PUBLIC_SUPABASE_URL")) {
      return {
        error:
          "Supabase admin client could not start. Confirm SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL are set on the server.",
      };
    }
    return { error: msg.length > 0 && msg.length < 200 ? msg : "Upload failed." };
  }
}
