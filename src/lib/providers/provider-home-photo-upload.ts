"use server";

import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { PROVIDER_PHOTOS_BUCKET } from "@/lib/providers/provider-photos-bucket";

const MAX_BYTES = 1 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function uploadProviderHomePhoto(file: File): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!dbUser || dbUser.role !== "provider") {
    return { error: "Only providers can upload home photos." };
  }

  const profile = await prisma.providerProfile.findUnique({
    where: { userId: user.id },
    select: { slug: true },
  });
  if (!profile) return { error: "Provider profile not found." };

  const mime = file.type.toLowerCase();
  if (!MIME_TO_EXT[mime]) {
    return { error: "Please upload a JPG, PNG, or WebP image." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Each photo must be 1MB or smaller." };
  }

  const ext = MIME_TO_EXT[mime];
  const path = `${profile.slug}/${randomUUID()}.${ext}`;

  try {
    const { error } = await supabase.storage.from(PROVIDER_PHOTOS_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) return { error: error.message };
    const { data } = supabase.storage.from(PROVIDER_PHOTOS_BUCKET).getPublicUrl(path);
    return { url: data.publicUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed." };
  }
}
