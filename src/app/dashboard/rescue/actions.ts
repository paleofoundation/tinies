"use server";

import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { AdoptionListingStatus, ApplicationStatus, PlacementStatus } from "@prisma/client";
import type { CreateListingInput } from "@/app/dashboard/admin/actions";

const STATUS_MAP: Record<string, AdoptionListingStatus> = {
  available: AdoptionListingStatus.available,
  application_pending: AdoptionListingStatus.application_pending,
  matched: AdoptionListingStatus.matched,
  in_transit: AdoptionListingStatus.in_transit,
  adopted: AdoptionListingStatus.adopted,
};

async function getRescueOrgForUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { org: null, error: "You must be signed in." };
  const org = await prisma.rescueOrg.findUnique({
    where: { userId: user.id },
  });
  return { org, error: org ? undefined : undefined };
}

/** Load current user's rescue org. Null if not a rescue or not found. */
export async function getRescueOrgDashboard(): Promise<{
  org: {
    id: string;
    name: string;
    mission: string | null;
    location: string | null;
    website: string | null;
    socialLinks: unknown;
    logoUrl: string | null;
    slug: string;
    verified: boolean;
    donationsTabLastSeenAt: Date | null;
  } | null;
  error?: string;
}> {
  const { org, error } = await getRescueOrgForUser();
  if (error) return { org: null, error };
  if (!org) return { org: null };
  return {
    org: {
      id: org.id,
      name: org.name,
      mission: org.mission,
      location: org.location,
      website: org.website,
      socialLinks: org.socialLinks,
      logoUrl: org.logoUrl,
      slug: org.slug,
      verified: org.verified,
      donationsTabLastSeenAt: org.donationsTabLastSeenAt,
    },
  };
}

export type OrgListingRow = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  estimatedAge: string | null;
  status: string;
  active: boolean;
  slug: string;
  photos: string[];
};

export async function getOrgListings(): Promise<{
  listings: OrgListingRow[];
  error?: string;
}> {
  const { org, error } = await getRescueOrgForUser();
  if (error || !org) return { listings: [], error };
  const rows = await prisma.adoptionListing.findMany({
    where: { orgId: org.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      species: true,
      breed: true,
      estimatedAge: true,
      status: true,
      active: true,
      slug: true,
      photos: true,
    },
  });
  return {
    listings: rows.map((r) => ({
      id: r.id,
      name: r.name,
      species: r.species,
      breed: r.breed,
      estimatedAge: r.estimatedAge,
      status: r.status,
      active: r.active,
      slug: r.slug,
      photos: r.photos,
    })),
  };
}

export type OrgApplicationRow = {
  id: string;
  status: string;
  createdAt: Date;
  country: string;
  city: string;
  livingSituation: string | null;
  hasGarden: boolean | null;
  otherPets: string | null;
  childrenAges: string | null;
  experience: string | null;
  reason: string | null;
  vetReference: string | null;
  applicantName: string;
  listingName: string;
  listingSlug: string;
};

export type OrgPlacementRow = {
  id: string;
  status: string;
  destinationCountry: string;
  listingName: string;
  adopterName: string;
  createdAt: Date;
  awaitingGalleryApproval: boolean;
};

export async function getOrgPlacements(): Promise<{
  placements: OrgPlacementRow[];
  error?: string;
}> {
  const { org, error } = await getRescueOrgForUser();
  if (error || !org) return { placements: [], error };
  const rows = await prisma.adoptionPlacement.findMany({
    where: { rescueOrgId: org.id },
    orderBy: { createdAt: "desc" },
    include: {
      listing: { select: { name: true } },
      adopter: { select: { name: true } },
    },
  });
  return {
    placements: rows.map((r) => {
      const hasBody =
        (r.successStoryText?.trim().length ?? 0) > 0 || r.successStoryPhotos.length > 0;
      return {
        id: r.id,
        status: r.status,
        destinationCountry: r.destinationCountry,
        listingName: r.listing.name,
        adopterName: r.adopter.name,
        createdAt: r.createdAt,
        awaitingGalleryApproval: hasBody && !r.successStoryApprovedAt,
      };
    }),
  };
}

export async function getOrgApplications(): Promise<{
  applications: OrgApplicationRow[];
  error?: string;
}> {
  const { org, error } = await getRescueOrgForUser();
  if (error || !org) return { applications: [], error };
  const rows = await prisma.adoptionApplication.findMany({
    where: { listing: { orgId: org.id } },
    orderBy: { createdAt: "desc" },
    include: {
      applicant: { select: { name: true } },
      listing: { select: { name: true, slug: true } },
    },
  });
  return {
    applications: rows.map((r) => ({
      id: r.id,
      status: r.status,
      createdAt: r.createdAt,
      country: r.country,
      city: r.city,
      livingSituation: r.livingSituation,
      hasGarden: r.hasGarden,
      otherPets: r.otherPets,
      childrenAges: r.childrenAges,
      experience: r.experience,
      reason: r.reason,
      vetReference: r.vetReference,
      applicantName: r.applicant.name,
      listingName: r.listing.name,
      listingSlug: r.listing.slug,
    })),
  };
}

export async function approveApplication(applicationId: string): Promise<{ error?: string }> {
  const { org, error } = await getRescueOrgForUser();
  if (error || !org) return { error: error ?? "Rescue org not found." };
  const app = await prisma.adoptionApplication.findFirst({
    where: { id: applicationId, listing: { orgId: org.id } },
    include: { listing: true, applicant: true },
  });
  if (!app) return { error: "Application not found." };
  if (app.status === ApplicationStatus.approved) return { error: "Already approved." };
  try {
    await prisma.$transaction([
      prisma.adoptionApplication.update({
        where: { id: applicationId },
        data: { status: ApplicationStatus.approved },
      }),
      prisma.adoptionPlacement.create({
        data: {
          listingId: app.listingId,
          applicationId: app.id,
          rescueOrgId: org.id,
          adopterId: app.applicantId,
          destinationCountry: app.country,
          status: PlacementStatus.preparing,
          totalFee: 0,
        },
      }),
    ]);
    revalidatePath("/dashboard/rescue");
    return {};
  } catch (e) {
    console.error("approveApplication failed:", e);
    return { error: e instanceof Error ? e.message : "Failed to approve." };
  }
}

export async function declineApplication(applicationId: string): Promise<{ error?: string }> {
  const { org, error } = await getRescueOrgForUser();
  if (error || !org) return { error: error ?? "Rescue org not found." };
  const app = await prisma.adoptionApplication.findFirst({
    where: { id: applicationId, listing: { orgId: org.id } },
  });
  if (!app) return { error: "Application not found." };
  try {
    await prisma.adoptionApplication.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.declined },
    });
    revalidatePath("/dashboard/rescue");
    return {};
  } catch (e) {
    console.error("declineApplication failed:", e);
    return { error: e instanceof Error ? e.message : "Failed to decline." };
  }
}

export async function toggleListingStatus(listingId: string): Promise<{ error?: string }> {
  const { org, error } = await getRescueOrgForUser();
  if (error || !org) return { error: error ?? "Rescue org not found." };
  const listing = await prisma.adoptionListing.findFirst({
    where: { id: listingId, orgId: org.id },
    select: { id: true, active: true },
  });
  if (!listing) return { error: "Listing not found." };
  try {
    await prisma.adoptionListing.update({
      where: { id: listingId },
      data: { active: !listing.active },
    });
    revalidatePath("/dashboard/rescue");
    return {};
  } catch (e) {
    console.error("toggleListingStatus failed:", e);
    return { error: e instanceof Error ? e.message : "Failed to update." };
  }
}

export type UpdateOrgProfileInput = {
  name?: string;
  mission?: string;
  location?: string;
  website?: string;
  socialLinks?: string;
  logoUrl?: string;
};

export async function updateOrgProfile(formData: FormData): Promise<{ error?: string }> {
  const { org, error } = await getRescueOrgForUser();
  if (error || !org) return { error: error ?? "Rescue org not found." };
  const name = (formData.get("name") as string)?.trim();
  const mission = (formData.get("mission") as string)?.trim() || null;
  const location = (formData.get("location") as string)?.trim() || null;
  const website = (formData.get("website") as string)?.trim() || null;
  const logoUrl = (formData.get("logoUrl") as string)?.trim() || null;
  let socialLinks: unknown = null;
  const rawLinks = (formData.get("socialLinks") as string)?.trim();
  if (rawLinks) {
    try {
      socialLinks = JSON.parse(rawLinks) as unknown;
    } catch {
      // leave null if invalid JSON
    }
  }
  try {
    await prisma.rescueOrg.update({
      where: { id: org.id },
      data: {
        name: (name && name.trim()) ? name.trim() : org.name,
        mission,
        location,
        website,
        logoUrl,
        socialLinks,
      },
    });
    revalidatePath("/dashboard/rescue");
    return {};
  } catch (e) {
    console.error("updateOrgProfile failed:", e);
    return { error: e instanceof Error ? e.message : "Failed to update profile." };
  }
}

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

export async function createRescueAdoptionListing(
  input: CreateListingInput
): Promise<{ error?: string }> {
  const { org, error } = await getRescueOrgForUser();
  if (error || !org) return { error: error ?? "Rescue org not found." };
  try {
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
    revalidatePath("/dashboard/rescue");
    return {};
  } catch (e) {
    console.error("createRescueAdoptionListing failed:", e);
    return { error: e instanceof Error ? e.message : "Failed to create listing." };
  }
}

export async function updateRescueAdoptionListing(
  id: string,
  input: CreateListingInput
): Promise<{ error?: string }> {
  const { org, error } = await getRescueOrgForUser();
  if (error || !org) return { error: error ?? "Rescue org not found." };
  const listing = await prisma.adoptionListing.findFirst({
    where: { id, orgId: org.id },
  });
  if (!listing) return { error: "Listing not found." };
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
    revalidatePath("/dashboard/rescue");
    revalidatePath(`/dashboard/rescue/listings/${id}/edit`);
    return {};
  } catch (e) {
    console.error("updateRescueAdoptionListing failed:", e);
    return { error: e instanceof Error ? e.message : "Failed to update listing." };
  }
}
