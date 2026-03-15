"use server";

import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { AdoptionListingStatus } from "@prisma/client";

const GARDENS_ORG_SLUG = "gardens-of-st-gertrude";
const GARDENS_ORG_NAME = "Gardens of St Gertrude";

function ensureUniqueSlug(baseSlug: string): Promise<string> {
  return prisma.adoptionListing
    .findMany({ where: { slug: { startsWith: baseSlug } }, select: { slug: true } })
    .then((rows) => {
      const used = new Set(rows.map((r) => r.slug));
      if (!used.has(baseSlug)) return baseSlug;
      let suffix = 1;
      while (used.has(`${baseSlug}-${suffix}`)) suffix++;
      return `${baseSlug}-${suffix}`;
    });
}

export async function getOrCreateGardensRescueOrg(userId: string, userEmail: string, userName: string) {
  let org = await prisma.rescueOrg.findFirst({ where: { slug: GARDENS_ORG_SLUG } });
  if (org) return org;

  await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email: userEmail,
      name: userName || "Admin",
      passwordHash: "supabase-auth-placeholder",
      role: "rescue",
    },
    update: {},
  });

  const baseSlug = GARDENS_ORG_SLUG;
  const existing = await prisma.rescueOrg.findUnique({ where: { slug: baseSlug } });
  if (existing) return existing;

  org = await prisma.rescueOrg.create({
    data: {
      userId,
      name: GARDENS_ORG_NAME,
      slug: baseSlug,
    },
  });
  return org;
}

export type CreateListingInput = {
  name: string;
  species: string;
  breed?: string;
  estimatedAge?: string;
  sex?: string;
  spayedNeutered: boolean;
  temperament?: string;
  medicalHistory?: string;
  specialNeeds?: string;
  localAdoptionFeeEur?: number;
  internationalEligible: boolean;
  destinationCountries: string[];
  photoUrls: string[];
  status: string;
};

const STATUS_MAP: Record<string, AdoptionListingStatus> = {
  available: AdoptionListingStatus.available,
  application_pending: AdoptionListingStatus.application_pending,
  matched: AdoptionListingStatus.matched,
  in_transit: AdoptionListingStatus.in_transit,
  adopted: AdoptionListingStatus.adopted,
};

export async function createAdoptionListing(input: CreateListingInput): Promise<{ error?: string }> {
  // TODO: enforce admin role – e.g. check session user.role === 'admin' or app_metadata.role
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to create a listing." };

  try {
    const org = await getOrCreateGardensRescueOrg(
      user.id,
      user.email ?? "",
      (user.user_metadata?.name as string) ?? user.email ?? "Admin"
    );

    const baseSlug = slugify(input.name, { lower: true, strict: true }) || "listing";
    const slug = await ensureUniqueSlug(baseSlug);

    const feeCents = input.localAdoptionFeeEur != null ? Math.round(input.localAdoptionFeeEur * 100) : null;
    const status = STATUS_MAP[input.status] ?? AdoptionListingStatus.available;

    await prisma.adoptionListing.create({
      data: {
        orgId: org.id,
        name: input.name.trim(),
        species: input.species,
        breed: input.breed?.trim() || null,
        estimatedAge: input.estimatedAge?.trim() || null,
        sex: input.sex || null,
        spayedNeutered: input.spayedNeutered,
        temperament: input.temperament?.trim() || null,
        medicalHistory: input.medicalHistory?.trim() || null,
        specialNeeds: input.specialNeeds?.trim() || null,
        localAdoptionFee: feeCents,
        internationalEligible: input.internationalEligible,
        destinationCountries: input.destinationCountries ?? [],
        photos: (input.photoUrls ?? []).filter(Boolean),
        status,
        slug,
      },
    });
    revalidatePath("/dashboard/admin");
    return {};
  } catch (e) {
    console.error(e);
    return { error: e instanceof Error ? e.message : "Failed to create listing." };
  }
}

export type UpdateListingInput = CreateListingInput;

export async function updateAdoptionListing(
  id: string,
  input: UpdateListingInput
): Promise<{ error?: string }> {
  // TODO: enforce admin role
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to update a listing." };

  try {
    const feeCents = input.localAdoptionFeeEur != null ? Math.round(input.localAdoptionFeeEur * 100) : null;
    const status = STATUS_MAP[input.status] ?? AdoptionListingStatus.available;

    await prisma.adoptionListing.update({
      where: { id },
      data: {
        name: input.name.trim(),
        species: input.species,
        breed: input.breed?.trim() || null,
        estimatedAge: input.estimatedAge?.trim() || null,
        sex: input.sex || null,
        spayedNeutered: input.spayedNeutered,
        temperament: input.temperament?.trim() || null,
        medicalHistory: input.medicalHistory?.trim() || null,
        specialNeeds: input.specialNeeds?.trim() || null,
        localAdoptionFee: feeCents,
        internationalEligible: input.internationalEligible,
        destinationCountries: input.destinationCountries ?? [],
        photos: (input.photoUrls ?? []).filter(Boolean),
        status,
      },
    });
    revalidatePath("/dashboard/admin");
    revalidatePath(`/dashboard/admin/adoptions/${id}/edit`);
    return {};
  } catch (e) {
    console.error(e);
    return { error: e instanceof Error ? e.message : "Failed to update listing." };
  }
}
