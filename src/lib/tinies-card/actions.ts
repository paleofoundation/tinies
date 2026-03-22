"use server";

import { randomUUID } from "crypto";
import * as React from "react";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { recordPlatformCommissionDonation } from "@/lib/giving/actions";
import { sendBookingCompletedNotifications } from "@/lib/notifications/booking-notifications";
import TiniesCardOwnerEmail from "@/lib/email/templates/tinies-card-owner";
import {
  MAX_TINIES_CARD_PHOTO_BYTES,
  submitTiniesCardInputSchema,
} from "@/lib/validations/tinies-card";
import { updateProviderRepeatClientCount } from "@/lib/bookings/provider-repeat-stats";

const BUCKET = "booking-updates";

const SERVICE_LABELS: Record<string, string> = {
  walking: "Dog walking",
  sitting: "Pet sitting",
  boarding: "Overnight boarding",
  drop_in: "Drop-in visit",
  daycare: "Daycare",
};

async function sumGivingDonationsForBookingCents(bookingId: string): Promise<number> {
  const agg = await prisma.donation.aggregate({
    where: { bookingId },
    _sum: { amount: true },
  });
  return agg._sum.amount ?? 0;
}

export async function uploadTiniesCardPhoto(
  bookingId: string,
  file: File
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      providerId: user.id,
      status: "active",
    },
    select: { id: true },
  });
  if (!booking) return { error: "Booking not found or not in progress." };

  if (!file.type.startsWith("image/")) {
    return { error: "Please upload an image file." };
  }
  if (file.size > MAX_TINIES_CARD_PHOTO_BYTES) {
    return { error: "Each photo must be 1MB or smaller." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  const safeExt =
    ext && ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
  const path = `tinies-cards/${bookingId}/${randomUUID()}.${safeExt}`;

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

export async function submitTiniesCard(
  bookingId: string,
  raw: unknown
): Promise<{ ok?: true; error?: string; cardId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const parsed = submitTiniesCardInputSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.flatten().formErrors[0] ?? parsed.error.issues[0]?.message ?? "Invalid input.";
    return { error: msg };
  }
  const input = parsed.data;

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      providerId: user.id,
      tiniesCard: { is: null },
      OR: [
        {
          status: { in: ["accepted", "active"] },
          serviceType: { not: "walking" },
        },
        {
          status: "active",
          serviceType: "walking",
          walkEndedAt: { not: null },
        },
      ],
    },
    select: {
      id: true,
      ownerId: true,
      providerId: true,
      petIds: true,
      serviceType: true,
      startDatetime: true,
      endDatetime: true,
      commissionAmount: true,
      walkStartedAt: true,
      walkEndedAt: true,
      walkRoute: true,
      walkDistanceKm: true,
      walkDurationMinutes: true,
      walkSummaryMapUrl: true,
    },
  });

  if (!booking) {
    return { error: "Booking not found, already completed, or finish the walk first." };
  }

  if (booking.serviceType === "walking") {
    if (!booking.walkEndedAt || !booking.walkStartedAt) {
      return { error: "End the walk before submitting your Tinies Card." };
    }
  }

  const existingCard = await prisma.tiniesCard.findUnique({
    where: { bookingId },
    select: { id: true },
  });
  if (existingCard) return { error: "A Tinies Card already exists for this booking." };

  const isWalk = booking.serviceType === "walking";
  const startedAt = isWalk
    ? booking.walkStartedAt!
    : booking.startDatetime;
  const endedAt = isWalk ? booking.walkEndedAt! : booking.endDatetime;
  const durationMinutes = isWalk
    ? (booking.walkDurationMinutes ??
      Math.max(1, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000)))
    : Math.max(
        1,
        Math.round((booking.endDatetime.getTime() - booking.startDatetime.getTime()) / 60000)
      );

  const walkRouteJson = isWalk ? booking.walkRoute : null;
  const walkDistanceKm = isWalk ? booking.walkDistanceKm : null;
  const walkMapImageUrl = isWalk ? booking.walkSummaryMapUrl : null;

  const activitiesJson = input.activities.map((a) => ({
    type: a.type,
    time: a.time.trim(),
    notes: a.notes?.trim() ?? "",
  }));

  let cardId: string;
  try {
    const card = await prisma.$transaction(async (tx) => {
      const c = await tx.tiniesCard.create({
        data: {
          bookingId: booking.id,
          providerId: booking.providerId,
          ownerId: booking.ownerId,
          petIds: booking.petIds,
          serviceType: booking.serviceType,
          startedAt,
          endedAt,
          durationMinutes,
          walkDistanceKm,
          walkRouteJson: walkRouteJson === null ? undefined : walkRouteJson,
          walkMapImageUrl,
          activities: activitiesJson,
          photos: input.photos,
          personalNote: input.personalNote.trim(),
          mood: input.mood,
        },
      });
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: "completed" },
      });
      return c;
    });
    cardId = card.id;
  } catch (e) {
    console.error("submitTiniesCard transaction", e);
    return { error: e instanceof Error ? e.message : "Failed to save Tinies Card." };
  }

  await recordPlatformCommissionDonation(booking.id, booking.commissionAmount);
  await updateProviderRepeatClientCount(user.id);

  const givingCents = await sumGivingDonationsForBookingCents(booking.id);
  const givingEur = (givingCents / 100).toFixed(2);

  const owner = await prisma.user.findUnique({
    where: { id: booking.ownerId },
    select: { email: true, name: true },
  });
  const provider = await prisma.user.findUnique({
    where: { id: booking.providerId },
    select: { name: true },
  });
  const petIds = booking.petIds ?? [];
  const pets =
    petIds.length > 0
      ? await prisma.pet.findMany({
          where: { id: { in: petIds } },
          select: { name: true },
        })
      : [];
  const petName = pets.map((p) => p.name).join(", ") || "your pet";
  const serviceLabel = SERVICE_LABELS[booking.serviceType] ?? booking.serviceType;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app").replace(/\/$/, "");
  const cardUrl = `${appUrl}/card/${cardId}`;
  const dashboardCardUrl = `${appUrl}/dashboard/owner/bookings/${booking.id}/card`;

  if (owner?.email && provider) {
    try {
      await sendEmail({
        to: owner.email,
        subject: `${petName}'s Tinies Card from ${provider.name}`,
        react: React.createElement(TiniesCardOwnerEmail, {
          ownerFirstName: owner.name.split(/\s+/)[0] ?? "there",
          petName,
          providerName: provider.name,
          serviceType: serviceLabel,
          mood: input.mood,
          activities: activitiesJson,
          personalNote: input.personalNote.trim(),
          photoUrls: input.photos.slice(0, 4),
          walkDistanceKm: walkDistanceKm ?? undefined,
          walkDurationMinutes: isWalk ? durationMinutes : undefined,
          walkMapImageUrl: walkMapImageUrl ?? undefined,
          cardUrl,
          dashboardUrl: dashboardCardUrl,
          givingAmountEur: givingEur,
          tippingUrl: dashboardCardUrl,
        }),
      });
    } catch (emailErr) {
      console.error("submitTiniesCard: owner email failed", emailErr);
    }
  }

  await sendBookingCompletedNotifications(booking.id, { skipOwnerEmail: true });

  revalidatePath("/dashboard/provider");
  revalidatePath("/dashboard/owner");
  return { ok: true, cardId };
}
