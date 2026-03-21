"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { PlacementStatus, UserRole } from "@prisma/client";
import {
  MAX_SUCCESS_STORY_PHOTOS,
  successStorySubmitSchema,
  validateSuccessStoryHasBody,
} from "@/lib/validations/success-story";

const SUCCESS_STORIES_BUCKET = "success-stories";
const MAX_PHOTO_BYTES = 1024 * 1024;

const ADOPTER_SHAREABLE_STATUSES: PlacementStatus[] = [
  PlacementStatus.delivered,
  PlacementStatus.follow_up,
  PlacementStatus.completed,
];

function getSuccessStoryPhotoFiles(formData: FormData): File[] {
  const files: File[] = [];
  for (const [key, value] of formData.entries()) {
    if (value instanceof File && value.size > 0 && value.type.startsWith("image/")) {
      if (key === "photos" || key.startsWith("photos[")) {
        files.push(value);
      }
    }
  }
  return files;
}

async function uploadSuccessStoryPhoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  placementId: string,
  file: File,
  index: number
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 80);
  const path = `${userId}/${placementId}/${Date.now()}-${index}-${safeName}`;

  const { error } = await supabase.storage.from(SUCCESS_STORIES_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });

  if (error) throw new Error(`Photo upload failed: ${error.message}`);

  const { data } = supabase.storage.from(SUCCESS_STORIES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function getEligibleSuccessStoryPlacements(): Promise<{
  placements: { id: string; listingName: string; awaitingGalleryApproval: boolean }[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { placements: [], error: "You must be signed in." };

  try {
    const rows = await prisma.adoptionPlacement.findMany({
      where: {
        adopterId: user.id,
        status: { in: ADOPTER_SHAREABLE_STATUSES },
      },
      orderBy: { createdAt: "desc" },
      include: {
        listing: { select: { name: true } },
      },
    });

    return {
      placements: rows.map((r) => {
        const hasBody =
          (r.successStoryText?.trim().length ?? 0) > 0 || r.successStoryPhotos.length > 0;
        return {
          id: r.id,
          listingName: r.listing.name,
          awaitingGalleryApproval: hasBody && !r.successStoryApprovedAt,
        };
      }),
    };
  } catch (e) {
    console.error("getEligibleSuccessStoryPlacements", e);
    return { placements: [], error: "Failed to load placements." };
  }
}

export async function submitAdoptionSuccessStory(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const rawPlacement = formData.get("placementId");
  const rawText = formData.get("storyText");
  const parsed = successStorySubmitSchema.safeParse({
    placementId: typeof rawPlacement === "string" ? rawPlacement : "",
    storyText: typeof rawText === "string" ? rawText : "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((e) => e.message).join(" ") };
  }

  const { placementId, storyText } = parsed.data;
  const photoFiles = getSuccessStoryPhotoFiles(formData);
  if (photoFiles.length > MAX_SUCCESS_STORY_PHOTOS) {
    return { error: `You can upload up to ${MAX_SUCCESS_STORY_PHOTOS} photos.` };
  }

  for (const f of photoFiles) {
    if (f.size > MAX_PHOTO_BYTES) {
      return { error: "Each photo must be 1MB or smaller." };
    }
  }

  try {
    const placement = await prisma.adoptionPlacement.findFirst({
      where: {
        id: placementId,
        adopterId: user.id,
        status: { in: ADOPTER_SHAREABLE_STATUSES },
      },
    });
    if (!placement) {
      return { error: "This placement is not available for a success story, or it does not belong to your account." };
    }

    let photoUrls: string[] = [];
    if (photoFiles.length > 0) {
      for (let i = 0; i < photoFiles.length; i++) {
        const url = await uploadSuccessStoryPhoto(supabase, user.id, placementId, photoFiles[i], i);
        photoUrls.push(url);
      }
    } else {
      photoUrls = [...placement.successStoryPhotos];
    }

    if (photoUrls.length > MAX_SUCCESS_STORY_PHOTOS) {
      photoUrls = photoUrls.slice(0, MAX_SUCCESS_STORY_PHOTOS);
    }

    if (!validateSuccessStoryHasBody(storyText, photoUrls.length)) {
      return { error: "Please write at least 20 characters or add a photo from their new home." };
    }

    await prisma.adoptionPlacement.update({
      where: { id: placementId },
      data: {
        successStoryText: storyText.length > 0 ? storyText : null,
        successStoryPhotos: photoUrls,
        successStoryApprovedAt: null,
      },
    });

    revalidatePath("/adopt/tinies-who-made-it");
    revalidatePath("/adopt/tinies-who-made-it/share");
    revalidatePath("/dashboard/rescue");
    revalidatePath("/dashboard/admin");
    return {};
  } catch (e) {
    console.error("submitAdoptionSuccessStory", e);
    return { error: e instanceof Error ? e.message : "Could not save your story." };
  }
}

export async function approveAdoptionSuccessStory(placementId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { rescueOrg: true },
  });
  if (!dbUser) return { error: "User not found." };

  const placement = await prisma.adoptionPlacement.findUnique({
    where: { id: placementId },
    select: {
      rescueOrgId: true,
      successStoryText: true,
      successStoryPhotos: true,
    },
  });
  if (!placement) return { error: "Placement not found." };

  const isAdmin = dbUser.role === UserRole.admin;
  const isRescueForPlacement = dbUser.rescueOrg?.id === placement.rescueOrgId;
  if (!isAdmin && !isRescueForPlacement) {
    return { error: "You are not allowed to approve this story." };
  }

  const hasContent =
    (placement.successStoryText?.trim().length ?? 0) > 0 || placement.successStoryPhotos.length > 0;
  if (!hasContent) {
    return { error: "The adopter has not submitted a story yet." };
  }

  try {
    await prisma.adoptionPlacement.update({
      where: { id: placementId },
      data: { successStoryApprovedAt: new Date() },
    });
    revalidatePath("/adopt/tinies-who-made-it");
    revalidatePath("/dashboard/admin");
    revalidatePath(`/dashboard/admin/adoptions/placements/${placementId}`);
    revalidatePath("/dashboard/rescue");
    return {};
  } catch (e) {
    console.error("approveAdoptionSuccessStory", e);
    return { error: "Failed to approve story." };
  }
}
