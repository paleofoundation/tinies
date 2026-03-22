"use server";

import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { ADOPTION_PHOTOS_BUCKET } from "@/lib/adoption/adoption-photos-bucket";

const MAX_BYTES = 1 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function assertCanUploadListingPhoto(
  userId: string,
  role: "owner" | "provider" | "rescue" | "adopter" | "admin",
  listingSlugSegment: string
): Promise<{ ok: true } | { error: string }> {
  if (role === "admin") return { ok: true };
  if (role !== "rescue") return { error: "Only admin or rescue users can upload adoption photos." };

  const org = await prisma.rescueOrg.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!org) return { error: "No rescue organisation linked to your account." };

  if (listingSlugSegment === "new") return { ok: true };

  const listing = await prisma.adoptionListing.findUnique({
    where: { slug: listingSlugSegment },
    select: { orgId: true },
  });
  if (!listing) return { error: "Listing not found." };
  if (listing.orgId !== org.id) {
    return { error: "You can only upload photos for your organisation's listings." };
  }
  return { ok: true };
}

/**
 * Upload one image to `adoption-photos/{listingSlugOrNew}/{uuid}.{ext}`.
 * @param listingSlug - Existing listing slug, or omit/`undefined` for `new` (create flow).
 */
export async function uploadAdoptionListingPhoto(
  file: File,
  listingSlug?: string
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!dbUser) return { error: "User not found." };

  const segment = listingSlug?.trim() || "new";
  const gate = await assertCanUploadListingPhoto(user.id, dbUser.role, segment);
  if ("error" in gate) return { error: gate.error };

  const mime = file.type.toLowerCase();
  if (!MIME_TO_EXT[mime]) {
    return { error: "Please upload a JPG, PNG, or WebP image." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Each photo must be 1MB or smaller." };
  }

  const ext = MIME_TO_EXT[mime];
  const path = `${segment}/${randomUUID()}.${ext}`;

  try {
    const { error } = await supabase.storage.from(ADOPTION_PHOTOS_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) return { error: error.message };
    const { data } = supabase.storage.from(ADOPTION_PHOTOS_BUCKET).getPublicUrl(path);
    return { url: data.publicUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed." };
  }
}
