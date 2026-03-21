"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@prisma/client";
import {
  mapProfileToSearchProviderCard,
  type ProfileRowForSearchCard,
} from "@/lib/providers/search-provider-card-map";
import type { SearchProviderCard } from "@/lib/utils/search-helpers";
import type { FavoriteViewerKind } from "@/lib/providers/favorite-actions-types";

const profileInclude = {
  user: { select: { name: true, avatarUrl: true, district: true } as const },
  reviews: {
    where: { rating: 5 },
    orderBy: { createdAt: "desc" as const },
    take: 1,
    select: { text: true },
  },
} as const;

export async function getFavoriteViewerState(): Promise<{
  kind: FavoriteViewerKind;
  favoritedProviderUserIds: string[];
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { kind: "guest", favoritedProviderUserIds: [] };
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!dbUser) {
    return { kind: "guest", favoritedProviderUserIds: [] };
  }
  if (dbUser.role !== UserRole.owner) {
    return { kind: "authenticated_non_owner", favoritedProviderUserIds: [] };
  }
  const rows = await prisma.providerFavorite.findMany({
    where: { ownerId: user.id },
    select: { providerId: true },
  });
  return {
    kind: "owner",
    favoritedProviderUserIds: rows.map((r) => r.providerId),
  };
}

export async function toggleProviderFavorite(
  providerUserId: string
): Promise<{ favorited?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be signed in." };
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!dbUser || dbUser.role !== UserRole.owner) {
    return { error: "Only pet owners can save favorites." };
  }
  if (user.id === providerUserId) {
    return { error: "You cannot favorite your own profile." };
  }
  const profile = await prisma.providerProfile.findFirst({
    where: { userId: providerUserId, verified: true },
    select: { slug: true },
  });
  if (!profile) {
    return { error: "Provider not found." };
  }

  const existing = await prisma.providerFavorite.findUnique({
    where: {
      ownerId_providerId: { ownerId: user.id, providerId: providerUserId },
    },
    select: { id: true },
  });

  try {
    if (existing) {
      await prisma.providerFavorite.delete({ where: { id: existing.id } });
      revalidatePath("/services/search");
      revalidatePath("/dashboard/owner");
      revalidatePath(`/services/provider/${profile.slug}`);
      return { favorited: false };
    }
    await prisma.providerFavorite.create({
      data: { ownerId: user.id, providerId: providerUserId },
    });
    revalidatePath("/services/search");
    revalidatePath("/dashboard/owner");
    revalidatePath(`/services/provider/${profile.slug}`);
    return { favorited: true };
  } catch (e) {
    console.error("toggleProviderFavorite", e);
    return { error: "Could not update favorite. Try again." };
  }
}

export async function getOwnerFavoriteProviderCards(): Promise<SearchProviderCard[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!dbUser || dbUser.role !== UserRole.owner) return [];

  const favorites = await prisma.providerFavorite.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      provider: {
        include: {
          providerProfile: {
            include: profileInclude,
          },
        },
      },
    },
  });

  const cards: SearchProviderCard[] = [];
  for (const fav of favorites) {
    const prof = fav.provider.providerProfile;
    if (!prof || !prof.verified) continue;
    const row: ProfileRowForSearchCard = {
      slug: prof.slug,
      userId: prof.userId,
      bio: prof.bio,
      servicesOffered: prof.servicesOffered,
      serviceAreaLat: prof.serviceAreaLat,
      serviceAreaLng: prof.serviceAreaLng,
      avgRating: prof.avgRating,
      reviewCount: prof.reviewCount,
      repeatClientCount: prof.repeatClientCount,
      cancellationPolicy: prof.cancellationPolicy,
      updatedAt: prof.updatedAt,
      confirmedHolidays: prof.confirmedHolidays,
      user: prof.user,
      reviews: prof.reviews,
    };
    cards.push(
      mapProfileToSearchProviderCard(row, {
        serviceType: undefined,
        searchLat: null,
        searchLng: null,
      })
    );
  }
  return cards;
}
