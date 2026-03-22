import { prisma } from "@/lib/prisma";
import type { ServiceType } from "@prisma/client";

export type TiniesCardActivityRow = {
  type: string;
  time: string;
  notes: string;
};

export type TiniesCardPublicPayload = {
  id: string;
  petNames: string[];
  providerName: string;
  serviceType: ServiceType;
  startedAt: Date;
  endedAt: Date;
  durationMinutes: number;
  walkDistanceKm: number | null;
  walkRouteJson: unknown;
  walkMapImageUrl: string | null;
  activities: TiniesCardActivityRow[];
  photos: string[];
  personalNote: string;
  mood: string;
  createdAt: Date;
};

function parseActivities(raw: unknown): TiniesCardActivityRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const o = row as Record<string, unknown>;
      const type = typeof o.type === "string" ? o.type : "other";
      const time = typeof o.time === "string" ? o.time : "";
      const notes = typeof o.notes === "string" ? o.notes : "";
      return { type, time, notes };
    })
    .filter((x): x is TiniesCardActivityRow => x != null);
}

export async function getTiniesCardPublicById(
  cardId: string
): Promise<TiniesCardPublicPayload | null> {
  const id = cardId.trim();
  if (!id) return null;
  try {
    const row = await prisma.tiniesCard.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            provider: { select: { name: true } },
          },
        },
      },
    });
    if (!row) return null;
    const petIds = row.petIds ?? [];
    const pets =
      petIds.length > 0
        ? await prisma.pet.findMany({
            where: { id: { in: petIds } },
            select: { name: true },
          })
        : [];
    const petNames = pets.map((p) => p.name);
    return {
      id: row.id,
      petNames: petNames.length > 0 ? petNames : ["your pet"],
      providerName: row.booking.provider.name,
      serviceType: row.serviceType,
      startedAt: row.startedAt,
      endedAt: row.endedAt,
      durationMinutes: row.durationMinutes,
      walkDistanceKm: row.walkDistanceKm,
      walkRouteJson: row.walkRouteJson,
      walkMapImageUrl: row.walkMapImageUrl,
      activities: parseActivities(row.activities),
      photos: row.photos ?? [],
      personalNote: row.personalNote,
      mood: row.mood,
      createdAt: row.createdAt,
    };
  } catch (e) {
    console.error("getTiniesCardPublicById", e);
    return null;
  }
}

export async function getTiniesCardForOwnerBooking(
  bookingId: string,
  ownerUserId: string
): Promise<TiniesCardPublicPayload | null> {
  try {
    const row = await prisma.tiniesCard.findFirst({
      where: { bookingId, ownerId: ownerUserId },
      include: {
        booking: {
          include: {
            provider: { select: { name: true } },
          },
        },
      },
    });
    if (!row) return null;
    const petIds = row.petIds ?? [];
    const pets =
      petIds.length > 0
        ? await prisma.pet.findMany({
            where: { id: { in: petIds } },
            select: { name: true },
          })
        : [];
    const petNames = pets.map((p) => p.name);
    return {
      id: row.id,
      petNames: petNames.length > 0 ? petNames : ["your pet"],
      providerName: row.booking.provider.name,
      serviceType: row.serviceType,
      startedAt: row.startedAt,
      endedAt: row.endedAt,
      durationMinutes: row.durationMinutes,
      walkDistanceKm: row.walkDistanceKm,
      walkRouteJson: row.walkRouteJson,
      walkMapImageUrl: row.walkMapImageUrl,
      activities: parseActivities(row.activities),
      photos: row.photos ?? [],
      personalNote: row.personalNote,
      mood: row.mood,
      createdAt: row.createdAt,
    };
  } catch (e) {
    console.error("getTiniesCardForOwnerBooking", e);
    return null;
  }
}
