"use server";

import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { RESCUE_ORG_PHOTOS_BUCKET } from "@/lib/rescue/rescue-org-photos-bucket";

const MAX_BYTES = 1 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function assertCanUploadRescueOrgPhoto(
  userId: string,
  role: string,
  orgId: string
): Promise<{ ok: true; slug: string } | { error: string }> {
  if (role === "admin") {
    const org = await prisma.rescueOrg.findUnique({
      where: { id: orgId },
      select: { slug: true },
    });
    if (!org) return { error: "Organisation not found." };
    return { ok: true, slug: org.slug };
  }
  if (role !== "rescue") {
    return { error: "Only admin or rescue users can upload organisation photos." };
  }
  const org = await prisma.rescueOrg.findFirst({
    where: { id: orgId, userId },
    select: { slug: true },
  });
  if (!org) return { error: "You can only upload photos for your own organisation." };
  return { ok: true, slug: org.slug };
}

/**
 * Upload one image to `rescue-org-photos/{orgSlug}/{uuid}.{ext}`.
 */
export async function uploadRescueOrgPhoto(
  orgId: string,
  file: File
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

  const gate = await assertCanUploadRescueOrgPhoto(user.id, dbUser.role, orgId);
  if ("error" in gate) return { error: gate.error };

  const mime = file.type.toLowerCase();
  if (!MIME_TO_EXT[mime]) {
    return { error: "Please upload a JPG, PNG, or WebP image." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Each photo must be 1MB or smaller." };
  }

  const ext = MIME_TO_EXT[mime];
  const path = `${gate.slug}/${randomUUID()}.${ext}`;

  try {
    const { error } = await supabase.storage.from(RESCUE_ORG_PHOTOS_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) return { error: error.message };
    const { data } = supabase.storage.from(RESCUE_ORG_PHOTOS_BUCKET).getPublicUrl(path);
    return { url: data.publicUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed." };
  }
}
