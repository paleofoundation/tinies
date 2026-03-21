"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { PlacementStatus } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import AdoptionStatusUpdateEmail from "@/lib/email/templates/adoption-status-update";
import PostAdoptionCheckinEmail from "@/lib/email/templates/post-adoption-checkin";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

const PLACEMENT_STATUS_LABELS: Record<PlacementStatus, string> = {
  preparing: "Preparation in progress",
  vet_complete: "Vet prep complete",
  transport_booked: "Transport booked",
  in_transit: "In transit",
  delivered: "Delivered",
  follow_up: "Follow-up",
  completed: "Completed",
};

/** Send post-adoption check-in email to adopter. Call from cron when timeframe (1 week, 1 month, 3 months) is reached after arrival. Does not throw. */
export async function sendPostAdoptionCheckinEmail(params: {
  to: string;
  animalName: string;
  timeframe: string;
  placementId: string;
}): Promise<void> {
  try {
    const shareUpdateUrl = `${APP_URL}/adopt/tinies-who-made-it/share?placement=${encodeURIComponent(params.placementId)}`;
    await sendEmail({
      to: params.to,
      subject: `It's been ${params.timeframe} since ${params.animalName} arrived!`,
      react: PostAdoptionCheckinEmail({
        animalName: params.animalName,
        timeframe: params.timeframe,
        shareUpdateUrl,
      }),
    });
  } catch (e) {
    console.error("sendPostAdoptionCheckinEmail failed", e);
  }
}

export type PlacementRow = {
  id: string;
  status: string;
  destinationCountry: string;
  createdAt: Date;
  daysSinceCreated: number;
  listingName: string;
  adopterName: string;
};

export async function getAllPlacements(statusFilter?: string): Promise<{
  placements: PlacementRow[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { placements: [], error: "You must be signed in." };

  try {
    const where = statusFilter && statusFilter !== "all" ? { status: statusFilter as PlacementStatus } : {};
    const rows = await prisma.adoptionPlacement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        listing: { select: { name: true } },
        adopter: { select: { name: true } },
      },
    });
    const now = Date.now();
    return {
      placements: rows.map((r) => ({
        id: r.id,
        status: r.status,
        destinationCountry: r.destinationCountry,
        createdAt: r.createdAt,
        daysSinceCreated: Math.floor((now - new Date(r.createdAt).getTime()) / (24 * 60 * 60 * 1000)),
        listingName: r.listing.name,
        adopterName: r.adopter.name,
      })),
    };
  } catch (e) {
    console.error("getAllPlacements failed:", e);
    return { placements: [], error: "Failed to load placements." };
  }
}

export type PlacementDetail = {
  id: string;
  status: string;
  destinationCountry: string;
  vetPrepStatus: unknown;
  transportMethod: string | null;
  transportProviderId: string | null;
  transportBookedDate: Date | null;
  departureDate: Date | null;
  arrivalDate: Date | null;
  vetCost: number | null;
  transportCost: number | null;
  coordinationFee: number | null;
  totalFee: number;
  checkin1w: Date | null;
  checkin1m: Date | null;
  checkin3m: Date | null;
  successStoryText: string | null;
  successStoryPhotos: string[];
  successStoryApprovedAt: Date | null;
  createdAt: Date;
  listing: { name: string; species: string; breed: string | null; estimatedAge: string | null };
  adopter: { name: string; email: string };
  rescueOrg: { name: string };
};

export async function getPlacementById(id: string): Promise<PlacementDetail | null> {
  const placement = await prisma.adoptionPlacement.findUnique({
    where: { id },
    include: {
      listing: { select: { name: true, species: true, breed: true, estimatedAge: true } },
      adopter: { select: { name: true, email: true } },
      rescueOrg: { select: { name: true } },
    },
  });
  if (!placement) return null;
  return {
    id: placement.id,
    status: placement.status,
    destinationCountry: placement.destinationCountry,
    vetPrepStatus: placement.vetPrepStatus,
    transportMethod: placement.transportMethod,
    transportProviderId: placement.transportProviderId,
    transportBookedDate: placement.transportBookedDate,
    departureDate: placement.departureDate,
    arrivalDate: placement.arrivalDate,
    vetCost: placement.vetCost,
    transportCost: placement.transportCost,
    coordinationFee: placement.coordinationFee,
    totalFee: placement.totalFee,
    checkin1w: placement.checkin1w,
    checkin1m: placement.checkin1m,
    checkin3m: placement.checkin3m,
    successStoryText: placement.successStoryText,
    successStoryPhotos: placement.successStoryPhotos,
    successStoryApprovedAt: placement.successStoryApprovedAt,
    createdAt: placement.createdAt,
    listing: placement.listing,
    adopter: placement.adopter,
    rescueOrg: placement.rescueOrg,
  };
}

export type UpdatePlacementData = {
  vetPrepStatus?: Record<string, unknown>;
  transportMethod?: string | null;
  transportProviderId?: string | null;
  transportBookedDate?: string | null;
  departureDate?: string | null;
  arrivalDate?: string | null;
  vetCost?: number | null;
  transportCost?: number | null;
  coordinationFee?: number | null;
  status?: PlacementStatus;
};

export async function updatePlacement(id: string, data: UpdatePlacementData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  try {
    const placement = await prisma.adoptionPlacement.findUnique({ where: { id } });
    if (!placement) return { error: "Placement not found." };

    const updateData: Parameters<typeof prisma.adoptionPlacement.update>[0]["data"] = {};
    if (data.vetPrepStatus !== undefined) updateData.vetPrepStatus = data.vetPrepStatus;
    if (data.transportMethod !== undefined) updateData.transportMethod = data.transportMethod;
    if (data.transportProviderId !== undefined) updateData.transportProviderId = data.transportProviderId || null;
    if (data.transportBookedDate !== undefined) updateData.transportBookedDate = data.transportBookedDate ? new Date(data.transportBookedDate) : null;
    if (data.departureDate !== undefined) updateData.departureDate = data.departureDate ? new Date(data.departureDate) : null;
    if (data.arrivalDate !== undefined) updateData.arrivalDate = data.arrivalDate ? new Date(data.arrivalDate) : null;
    if (data.status !== undefined) updateData.status = data.status;

    let vetCostCents = placement.vetCost;
    let transportCostCents = placement.transportCost;
    let coordinationFeeCents = placement.coordinationFee;
    if (data.vetCost !== undefined) {
      vetCostCents = data.vetCost == null ? null : Math.round(data.vetCost * 100);
      updateData.vetCost = vetCostCents;
    }
    if (data.transportCost !== undefined) {
      transportCostCents = data.transportCost == null ? null : Math.round(data.transportCost * 100);
      updateData.transportCost = transportCostCents;
    }
    if (data.coordinationFee !== undefined) {
      coordinationFeeCents = data.coordinationFee == null ? null : Math.round(data.coordinationFee * 100);
      updateData.coordinationFee = coordinationFeeCents;
    }
    updateData.totalFee = (vetCostCents ?? 0) + (transportCostCents ?? 0) + (coordinationFeeCents ?? 0);

    await prisma.adoptionPlacement.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/dashboard/admin");
    revalidatePath(`/dashboard/admin/adoptions/placements/${id}`);
    return {};
  } catch (e) {
    console.error("updatePlacement failed:", e);
    return { error: e instanceof Error ? e.message : "Failed to update placement." };
  }
}

export async function advancePlacementStatus(id: string, nextStatus: PlacementStatus): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  try {
    await prisma.adoptionPlacement.update({
      where: { id },
      data: { status: nextStatus },
    });
    try {
      const placement = await prisma.adoptionPlacement.findUnique({
        where: { id },
        include: {
          listing: { select: { name: true } },
          adopter: { select: { email: true } },
        },
      });
      if (placement?.adopter?.email && placement.listing?.name) {
        const statusMessage = PLACEMENT_STATUS_LABELS[nextStatus] ?? nextStatus;
        await sendEmail({
          to: placement.adopter.email,
          subject: `Update on ${placement.listing.name}`,
          react: AdoptionStatusUpdateEmail({
            animalName: placement.listing.name,
            statusMessage,
          }),
        });
      }
    } catch (emailErr) {
      console.error("advancePlacementStatus: adoption status/milestone email failed", emailErr);
    }
    revalidatePath("/dashboard/admin");
    revalidatePath(`/dashboard/admin/adoptions/placements/${id}`);
    return {};
  } catch (e) {
    console.error("advancePlacementStatus failed:", e);
    return { error: e instanceof Error ? e.message : "Failed to update status." };
  }
}

export type TransportProviderRow = {
  id: string;
  name: string;
  type: string;
  countriesServed: string[];
  contactInfo: string | null;
  pricingNotes: string | null;
  rating: number | null;
  active: boolean;
};

export async function getTransportProviders(): Promise<{ providers: TransportProviderRow[]; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { providers: [], error: "You must be signed in." };

  try {
    const rows = await prisma.transportProvider.findMany({
      orderBy: { name: "asc" },
    });
    return {
      providers: rows.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        countriesServed: r.countriesServed,
        contactInfo: r.contactInfo,
        pricingNotes: r.pricingNotes,
        rating: r.rating,
        active: r.active,
      })),
    };
  } catch (e) {
    console.error("getTransportProviders failed:", e);
    return { providers: [], error: "Failed to load providers." };
  }
}

export type TransportProviderInput = {
  name: string;
  type: string;
  countriesServed: string[];
  contactInfo?: string | null;
  pricingNotes?: string | null;
  rating?: number | null;
  active: boolean;
};

export async function createTransportProvider(data: TransportProviderInput): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  try {
    await prisma.transportProvider.create({
      data: {
        name: data.name.trim(),
        type: data.type,
        countriesServed: data.countriesServed ?? [],
        contactInfo: data.contactInfo?.trim() || null,
        pricingNotes: data.pricingNotes?.trim() || null,
        rating: data.rating ?? null,
        active: data.active ?? true,
      },
    });
    revalidatePath("/dashboard/admin/transport");
    revalidatePath("/dashboard/admin");
    return {};
  } catch (e) {
    console.error("createTransportProvider failed:", e);
    return { error: e instanceof Error ? e.message : "Failed to create provider." };
  }
}

export async function updateTransportProvider(id: string, data: TransportProviderInput): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  try {
    await prisma.transportProvider.update({
      where: { id },
      data: {
        name: data.name.trim(),
        type: data.type,
        countriesServed: data.countriesServed ?? [],
        contactInfo: data.contactInfo?.trim() || null,
        pricingNotes: data.pricingNotes?.trim() || null,
        rating: data.rating ?? null,
        active: data.active ?? true,
      },
    });
    revalidatePath("/dashboard/admin/transport");
    revalidatePath("/dashboard/admin");
    return {};
  } catch (e) {
    console.error("updateTransportProvider failed:", e);
    return { error: e instanceof Error ? e.message : "Failed to update provider." };
  }
}

export async function deleteTransportProvider(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  try {
    await prisma.transportProvider.delete({ where: { id } });
    revalidatePath("/dashboard/admin/transport");
    revalidatePath("/dashboard/admin");
    return {};
  } catch (e) {
    console.error("deleteTransportProvider failed:", e);
    return { error: e instanceof Error ? e.message : "Failed to delete provider." };
  }
}
