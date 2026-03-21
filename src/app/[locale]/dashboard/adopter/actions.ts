"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type AdopterApplicationSummary = {
  id: string;
  status: string;
  createdAt: Date;
  listing: {
    name: string;
    species: string;
    slug: string;
  };
  /** When application is approved, the active placement with full tracking fields. */
  placement?: {
    id: string;
    status: string;
    destinationCountry: string;
    vetPrepStatus: unknown;
    transportMethod: string | null;
    transportProviderName: string | null;
    transportBookedDate: Date | null;
    departureDate: Date | null;
    arrivalDate: Date | null;
    checkin1w: Date | null;
    checkin1m: Date | null;
    checkin3m: Date | null;
    createdAt: Date;
  };
};

export async function getAdopterApplications(): Promise<{
  applications: AdopterApplicationSummary[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { applications: [], error: "You must be signed in." };
  }

  try {
    const applications = await prisma.adoptionApplication.findMany({
      where: { applicantId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        createdAt: true,
        listing: {
          select: {
            name: true,
            species: true,
            slug: true,
          },
        },
        placement: {
          select: {
            id: true,
            status: true,
            destinationCountry: true,
            vetPrepStatus: true,
            transportMethod: true,
            transportProviderId: true,
            transportBookedDate: true,
            departureDate: true,
            arrivalDate: true,
            checkin1w: true,
            checkin1m: true,
            checkin3m: true,
            createdAt: true,
          },
        },
      },
    });

    const placementIds = applications
      .map((a) => a.placement?.id)
      .filter((id): id is string => !!id);
    const providerMap = new Map<string, string>();
    if (placementIds.length > 0) {
      const placementsWithProvider = await prisma.adoptionPlacement.findMany({
        where: { id: { in: placementIds }, transportProviderId: { not: null } },
        select: { id: true, transportProvider: { select: { name: true } } },
      });
      for (const p of placementsWithProvider) {
        if (p.transportProvider?.name) {
          providerMap.set(p.id, p.transportProvider.name);
        }
      }
    }

    return {
      applications: applications.map((a) => ({
        id: a.id,
        status: a.status,
        createdAt: a.createdAt,
        listing: a.listing,
        placement: a.placement
          ? {
              id: a.placement.id,
              status: a.placement.status,
              destinationCountry: a.placement.destinationCountry,
              vetPrepStatus: a.placement.vetPrepStatus,
              transportMethod: a.placement.transportMethod,
              transportProviderName: a.placement.transportProviderId
                ? providerMap.get(a.placement.id) ?? null
                : null,
              transportBookedDate: a.placement.transportBookedDate,
              departureDate: a.placement.departureDate,
              arrivalDate: a.placement.arrivalDate,
              checkin1w: a.placement.checkin1w,
              checkin1m: a.placement.checkin1m,
              checkin3m: a.placement.checkin3m,
              createdAt: a.placement.createdAt,
            }
          : undefined,
      })),
    };
  } catch (e) {
    console.error("getAdopterApplications failed:", e);
    return { applications: [], error: "Failed to load applications." };
  }
}
