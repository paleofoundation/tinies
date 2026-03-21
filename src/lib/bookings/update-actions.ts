"use server";

import * as React from "react";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import BookingUpdateEmail from "@/lib/email/templates/booking-update";
import { sendSMS, buildBookingUpdateSMS } from "@/lib/sms";
import {
  sendBookingUpdateInputSchema,
  MAX_BOOKING_UPDATE_PHOTOS,
  MAX_BOOKING_UPDATE_PHOTO_BYTES,
} from "@/lib/validations/booking-update";
import type { BookingUpdateFeedItem } from "@/lib/bookings/booking-update-types";

const BUCKET = "booking-updates";
const ALLOWED_IMAGE_PREFIX = "image/";

async function assertCanAccessBookingUpdates(
  userId: string,
  bookingId: string
): Promise<boolean> {
  const b = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      OR: [{ ownerId: userId }, { providerId: userId }],
    },
    select: { id: true },
  });
  return b != null;
}

/** Upload one image for a booking update (active booking, provider only). Max 1MB. */
export async function uploadBookingUpdatePhoto(
  bookingId: string,
  file: File
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, providerId: user.id, status: "active" },
    select: { id: true },
  });
  if (!booking) return { error: "Booking not found or not in progress." };

  if (!file.type.startsWith(ALLOWED_IMAGE_PREFIX)) {
    return { error: "Please upload an image file." };
  }
  if (file.size > MAX_BOOKING_UPDATE_PHOTO_BYTES) {
    return { error: "Each photo must be 1MB or smaller." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  const safeExt =
    ext && ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
  const path = `updates/${bookingId}/${randomUUID()}.${safeExt}`;

  try {
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) return { error: error.message };
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { url: data.publicUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed." };
  }
}

function normalizeVideoUrl(raw: string | null | undefined): string | null {
  const t = raw?.trim();
  if (!t) return null;
  if (!/^https?:\/\//i.test(t)) return null;
  return t.slice(0, 2000);
}

export async function sendBookingUpdate(
  bookingId: string,
  input: {
    text?: string | null;
    photoUrls?: string[];
    videoUrl?: string | null;
  }
): Promise<{ ok?: true; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const videoNorm = normalizeVideoUrl(input.videoUrl);
  const parsed = sendBookingUpdateInputSchema.safeParse({
    text: input.text?.trim() || null,
    photoUrls: input.photoUrls ?? [],
    videoUrl: videoNorm,
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors.join(" ") || "Invalid input." };
  }

  const { text, photoUrls, videoUrl } = parsed.data;

  if (!text && photoUrls.length === 0 && !videoUrl) {
    return { error: "Add a note, at least one photo, or a video link." };
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, providerId: user.id, status: "active" },
    include: {
      owner: {
        select: {
          email: true,
          phone: true,
          phoneVerified: true,
          name: true,
        },
      },
      provider: { select: { name: true } },
    },
  });
  if (!booking) return { error: "Booking not found or not in progress." };

  if (photoUrls.length > MAX_BOOKING_UPDATE_PHOTOS) {
    return { error: `Maximum ${MAX_BOOKING_UPDATE_PHOTOS} photos per update.` };
  }

  try {
    await prisma.bookingUpdate.create({
      data: {
        bookingId,
        providerId: user.id,
        text: text || null,
        photos: photoUrls,
        videoUrl: videoUrl ?? null,
      },
    });
  } catch (e) {
    console.error("sendBookingUpdate", e);
    return { error: "Failed to save update." };
  }

  const petIds = booking.petIds ?? [];
  const pets =
    petIds.length > 0
      ? await prisma.pet.findMany({
          where: { id: { in: petIds } },
          select: { name: true },
        })
      : [];
  const petNames = pets.map((p) => p.name).join(", ") || "your pet";
  const ownerName = booking.owner.name?.trim() || "there";
  const providerName = booking.provider.name;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";
  const dashboardUrl = `${baseUrl}/dashboard/owner?tab=bookings#owner-booking-${bookingId}`;

  if (booking.owner.email?.trim()) {
    try {
      await sendEmail({
        to: booking.owner.email.trim(),
        subject: `${providerName} sent an update for ${petNames}`,
        react: React.createElement(BookingUpdateEmail, {
          ownerName,
          providerName,
          petNames,
          dashboardUrl,
        }),
      });
    } catch (emailErr) {
      console.error("sendBookingUpdate: email failed", emailErr);
    }
  }

  if (booking.owner.phoneVerified && booking.owner.phone) {
    try {
      await sendSMS({
        to: booking.owner.phone,
        body: buildBookingUpdateSMS({
          providerName,
          petName: petNames,
          bookingId,
        }),
      });
    } catch (smsErr) {
      console.error("sendBookingUpdate: SMS failed", smsErr);
    }
  }

  revalidatePath("/dashboard/provider");
  revalidatePath("/dashboard/owner");
  return { ok: true };
}

export async function getBookingUpdates(
  bookingId: string
): Promise<{ updates: BookingUpdateFeedItem[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { updates: [], error: "Not signed in." };

  const allowed = await assertCanAccessBookingUpdates(user.id, bookingId);
  if (!allowed) return { updates: [], error: "Not allowed." };

  try {
    const rows = await prisma.bookingUpdate.findMany({
      where: { bookingId },
      orderBy: { createdAt: "asc" },
      include: {
        provider: { select: { name: true, avatarUrl: true } },
      },
    });
    const updates: BookingUpdateFeedItem[] = rows.map((r) => ({
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      text: r.text,
      photos: r.photos,
      videoUrl: r.videoUrl,
      providerName: r.provider.name,
      providerAvatarUrl: r.provider.avatarUrl,
    }));
    return { updates };
  } catch (e) {
    console.error("getBookingUpdates", e);
    return { updates: [], error: "Failed to load updates." };
  }
}
