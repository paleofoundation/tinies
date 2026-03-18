"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import MeetAndGreetRequestEmail from "@/lib/email/templates/meet-and-greet-request";
import type { LocationType } from "@prisma/client";
import { MeetAndGreetStatus } from "@prisma/client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

/** Get current user's pets (id, name) for meet & greet request form. */
export async function getOwnerPetsForMeetAndGreet(): Promise<{
  pets: { id: string; name: string }[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { pets: [], error: "Not signed in." };
  const pets = await prisma.pet.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  });
  return { pets };
}

export type RequestMeetAndGreetInput = {
  providerSlug: string;
  petIds: string[];
  requestedDatetime: string; // ISO
  locationType: LocationType;
  locationNotes?: string | null;
};

export async function requestMeetAndGreet(
  data: RequestMeetAndGreetInput
): Promise<{ meetAndGreetId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to request a meet & greet." };
  if (!data.petIds?.length) return { error: "Select at least one pet." });

  const profile = await prisma.providerProfile.findUnique({
    where: { slug: data.providerSlug },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!profile) return { error: "Provider not found." };
  const providerId = profile.userId;

  const pets = await prisma.pet.findMany({
    where: { id: { in: data.petIds }, ownerId: user.id },
    select: { id: true, name: true },
  });
  if (pets.length !== data.petIds.length) return { error: "Invalid pet selection." };

  const requestedDatetime = new Date(data.requestedDatetime);
  if (Number.isNaN(requestedDatetime.getTime())) return { error: "Invalid date/time." };

  try {
    const meet = await prisma.meetAndGreet.create({
      data: {
        ownerId: user.id,
        providerId,
        petIds: data.petIds,
        requestedDatetime,
        locationType: data.locationType,
        locationNotes: data.locationNotes?.trim() || null,
        status: "requested",
      },
    });

    const ownerName = (user.user_metadata?.name as string) ?? user.email ?? "A pet owner";
    const dateStr = requestedDatetime.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const locationLabel = locationTypeLabel(data.locationType);
    const dashboardUrl = `${APP_URL}/dashboard/provider`;

    if (profile.user.email) {
      await sendEmail({
        to: profile.user.email,
        subject: `Meet & Greet request from ${ownerName}`,
        react: MeetAndGreetRequestEmail({
          ownerName,
          petNames: pets.map((p) => p.name),
          requestedDate: dateStr,
          locationType: locationLabel,
          notes: data.locationNotes?.trim() || undefined,
          dashboardUrl,
        }),
      });
    }

    revalidatePath("/dashboard/provider");
    revalidatePath("/dashboard/owner");
    return { meetAndGreetId: meet.id };
  } catch (e) {
    console.error("requestMeetAndGreet", e);
    return { error: e instanceof Error ? e.message : "Failed to send request." };
  }
}

export type MeetAndGreetResponseAction = "accept" | "suggest" | "decline";

export type RespondToMeetAndGreetInput = {
  action: MeetAndGreetResponseAction;
  suggestedDatetime?: string | null; // ISO, for suggest
  message?: string | null; // for suggest or decline
};

export async function respondToMeetAndGreet(
  meetAndGreetId: string,
  input: RespondToMeetAndGreetInput
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const meet = await prisma.meetAndGreet.findFirst({
    where: { id: meetAndGreetId, providerId: user.id, status: "requested" },
  });
  if (!meet) return { error: "Request not found or already responded." };

  if (input.action === "accept") {
    await prisma.meetAndGreet.update({
      where: { id: meetAndGreetId },
      data: { status: "confirmed", confirmedDatetime: meet.requestedDatetime },
    });
  } else if (input.action === "suggest") {
    const suggested = input.suggestedDatetime ? new Date(input.suggestedDatetime) : null;
    if (!suggested || Number.isNaN(suggested.getTime()))
      return { error: "Please provide a valid date and time." };
    await prisma.meetAndGreet.update({
      where: { id: meetAndGreetId },
      data: {
        providerSuggestedDatetime: suggested,
        providerMessage: input.message?.trim() || null,
      },
    });
  } else {
    await prisma.meetAndGreet.update({
      where: { id: meetAndGreetId },
      data: {
        status: "cancelled",
        providerMessage: input.message?.trim() || null,
      },
    });
  }

  revalidatePath("/dashboard/provider");
  revalidatePath("/dashboard/owner");
  return {};
}

/** Owner accepts the provider's suggested date/time. */
export async function acceptMeetAndGreetSuggestion(meetAndGreetId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const meet = await prisma.meetAndGreet.findFirst({
    where: { id: meetAndGreetId, ownerId: user.id, status: "requested" },
  });
  if (!meet) return { error: "Request not found." };
  if (!meet.providerSuggestedDatetime) return { error: "No suggested time to accept." };

  await prisma.meetAndGreet.update({
    where: { id: meetAndGreetId },
    data: { status: "confirmed", confirmedDatetime: meet.providerSuggestedDatetime },
  });
  revalidatePath("/dashboard/provider");
  revalidatePath("/dashboard/owner");
  return {};
}

/** Mark confirmed meet & greets as completed when meeting time has passed. */
async function completeExpiredMeetAndGreets() {
  const now = new Date();
  await prisma.meetAndGreet.updateMany({
    where: {
      status: "confirmed",
      OR: [
        { confirmedDatetime: { lt: now } },
        { confirmedDatetime: { equals: null }, requestedDatetime: { lt: now } },
      ],
    },
    data: { status: "completed" },
  });
}

export type ProviderMeetAndGreetCard = {
  id: string;
  ownerName: string;
  petNames: string[];
  requestedDatetime: Date;
  confirmedDatetime: Date | null;
  locationType: string;
  locationNotes: string | null;
  status: string;
  providerSuggestedDatetime: Date | null;
  providerMessage: string | null;
  createdAt: Date;
  providerSlug: string;
};

export async function getProviderMeetAndGreets(): Promise<{
  requested: ProviderMeetAndGreetCard[];
  confirmed: ProviderMeetAndGreetCard[];
  completed: ProviderMeetAndGreetCard[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { requested: [], confirmed: [], completed: [], error: "Not signed in." };

  await completeExpiredMeetAndGreets();

  const profile = await prisma.providerProfile.findUnique({
    where: { userId: user.id },
    select: { slug: true },
  });
  const slug = profile?.slug ?? "";

  const rows = await prisma.meetAndGreet.findMany({
    where: { providerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { name: true } } },
  });

  const allPetIds = rows.flatMap((r) => r.petIds);
  const pets =
    allPetIds.length > 0
      ? await prisma.pet.findMany({
          where: { id: { in: allPetIds } },
          select: { id: true, name: true },
        })
      : [];
  const petNameById = new Map(pets.map((p) => [p.id, p.name]));

  const mapRow = (r: (typeof rows)[0]): ProviderMeetAndGreetCard => ({
    id: r.id,
    ownerName: r.owner.name,
    petNames: r.petIds.map((id) => petNameById.get(id) ?? "Pet"),
    requestedDatetime: r.requestedDatetime,
    confirmedDatetime: r.confirmedDatetime,
    locationType: locationTypeLabel(r.locationType),
    locationNotes: r.locationNotes,
    status: r.status,
    providerSuggestedDatetime: r.providerSuggestedDatetime,
    providerMessage: r.providerMessage,
    createdAt: r.createdAt,
    providerSlug: slug,
  });

  const requested = rows.filter((r) => r.status === "requested").map(mapRow);
  const confirmed = rows.filter((r) => r.status === "confirmed").map(mapRow);
  const completed = rows.filter((r) => ["completed", "cancelled", "expired"].includes(r.status)).map(mapRow);

  return { requested, confirmed, completed };
}

export type OwnerMeetAndGreetCard = {
  id: string;
  providerName: string;
  providerSlug: string;
  petNames: string[];
  requestedDatetime: Date;
  confirmedDatetime: Date | null;
  locationType: string;
  locationNotes: string | null;
  status: string;
  providerSuggestedDatetime: Date | null;
  providerMessage: string | null;
  createdAt: Date;
  ledToBooking: boolean;
  bookingId: string | null;
};

export async function getOwnerMeetAndGreets(): Promise<{
  meetAndGreets: OwnerMeetAndGreetCard[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { meetAndGreets: [], error: "Not signed in." };

  await completeExpiredMeetAndGreets();

  const rows = await prisma.meetAndGreet.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { provider: { select: { name: true } } },
  });

  const profileSlugs = await prisma.providerProfile.findMany({
    where: { userId: { in: rows.map((r) => r.providerId) } },
    select: { userId: true, slug: true },
  });
  const slugByProviderId = new Map(profileSlugs.map((p) => [p.userId, p.slug]));

  const allPetIds = rows.flatMap((r) => r.petIds);
  const pets =
    allPetIds.length > 0
      ? await prisma.pet.findMany({
          where: { id: { in: allPetIds } },
          select: { id: true, name: true },
        })
      : [];
  const petNameById = new Map(pets.map((p) => [p.id, p.name]));

  const meetAndGreets: OwnerMeetAndGreetCard[] = rows.map((r) => ({
    id: r.id,
    providerName: r.provider.name,
    providerSlug: slugByProviderId.get(r.providerId) ?? "",
    petNames: r.petIds.map((id) => petNameById.get(id) ?? "Pet"),
    requestedDatetime: r.requestedDatetime,
    confirmedDatetime: r.confirmedDatetime,
    locationType: locationTypeLabel(r.locationType),
    locationNotes: r.locationNotes,
    status: r.status,
    providerSuggestedDatetime: r.providerSuggestedDatetime,
    providerMessage: r.providerMessage,
    createdAt: r.createdAt,
    ledToBooking: r.ledToBooking,
    bookingId: r.bookingId,
  }));

  return { meetAndGreets };
}

function locationTypeLabel(type: LocationType | string): string {
  const labels: Record<string, string> = {
    owner_home: "At my home",
    provider_home: "At provider's home",
    neutral: "Neutral location",
    video: "Video call",
  };
  return labels[type] ?? type;
}
