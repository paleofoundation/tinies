"use server";

import { revalidateTag } from "next/cache";
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

export async function adminListSiteImages(): Promise<SiteImageAdminRow[] | { error: string }> {
  const gate = await requireAdminUserId();
  if (!gate.ok) return { error: gate.error };
  try {
    const rows = await prisma.siteImage.findMany({
      orderBy: [{ category: "asc" }, { label: "asc" }],
    });
    return rows.map((r) => ({
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
  } catch (e) {
    console.error("adminListSiteImages", e);
    return { error: "Could not load images." };
  }
}

export async function adminUpdateSiteImageMeta(input: {
  imageKey: string;
  alt: string;
}): Promise<{ ok: true } | { error: string }> {
  const gate = await requireAdminUserId();
  if (!gate.ok) return { error: gate.error };
  try {
    await prisma.siteImage.update({
      where: { imageKey: input.imageKey },
      data: { alt: input.alt.trim() },
    });
    revalidateTag(SITE_IMAGES_CACHE_TAG, "max");
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

  const row = await prisma.siteImage.findUnique({
    where: { imageKey: input.imageKey },
    select: { id: true },
  });
  if (!row) {
    return { error: "Unknown image key." };
  }

  const path = storagePath(input.category, input.imageKey, mime);

  try {
    const admin = createSupabaseAdmin();
    const { error: upErr } = await admin.storage.from(BUCKET).upload(path, buffer, {
      contentType: mime,
      upsert: true,
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

    await prisma.siteImage.update({
      where: { imageKey: input.imageKey },
      data: {
        url: publicUrl,
        ...(input.alt !== undefined ? { alt: input.alt.trim() } : {}),
      },
    });

    revalidateTag(SITE_IMAGES_CACHE_TAG, "max");
    return { ok: true, publicUrl };
  } catch (e) {
    console.error("adminUploadSiteImage", e);
    return { error: "Upload failed." };
  }
}
