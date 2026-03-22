"use server";

import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import AdoptionStatusUpdateEmail from "@/lib/email/templates/adoption-status-update";
import { filterGoodWithTags, filterNotGoodWithTags } from "@/lib/adoption/listing-compatibility-tags";
import {
  normalizeAlternateNames,
  normalizeListingFk,
  normalizeSiblingIds,
  sanitizeParentIds,
} from "@/lib/adoption/listing-input-normalize";
import { normalizeListingPhotoUrls } from "@/lib/adoption/listing-photos";
import {
  AdoptionListingStatus,
  ApplicationStatus,
  PlacementStatus,
  Prisma,
} from "@prisma/client";
import type { CreateListingInput } from "@/app/[locale]/dashboard/admin/adoption-listing-types";
import type {
  OrgApplicationRow,
  OrgListingRow,
  OrgPlacementRow,
  UpdateOrgProfileInput,
} from "@/lib/rescue/rescue-org-dashboard-types";
import { extractRescueOrgShowcaseFromForm } from "@/lib/rescue/rescue-org-showcase-form";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

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
    description: string | null;
    foundedYear: number | null;
    teamMembers: unknown;
    facilityPhotos: string[];
    facilityVideoUrl: string | null;
    operatingHours: string | null;
    volunteerInfo: string | null;
    donationNeeds: string | null;
    totalAnimalsRescued: number | null;
    totalAnimalsAdopted: number | null;
    contactPhone: string | null;
    contactEmail: string | null;
    district: string | null;
    coverPhotoUrl: string | null;
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
      description: org.description,
      foundedYear: org.foundedYear,
      teamMembers: org.teamMembers,
      facilityPhotos: [...org.facilityPhotos],
      facilityVideoUrl: org.facilityVideoUrl,
      operatingHours: org.operatingHours,
      volunteerInfo: org.volunteerInfo,
      donationNeeds: org.donationNeeds,
      totalAnimalsRescued: org.totalAnimalsRescued,
      totalAnimalsAdopted: org.totalAnimalsAdopted,
      contactPhone: org.contactPhone,
      contactEmail: org.contactEmail,
      district: org.district,
      coverPhotoUrl: org.coverPhotoUrl,
    },
  };
}

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
    include: {
      listing: { select: { id: true, name: true, slug: true } },
      applicant: { select: { id: true, email: true, name: true } },
    },
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
    try {
      if (app.applicant.email) {
        await sendEmail({
          to: app.applicant.email,
          subject: `Update on your application for ${app.listing.name}`,
          react: AdoptionStatusUpdateEmail({
            animalName: app.listing.name,
            statusMessage:
              "Approved — the rescue will begin preparing next steps for adoption.",
            dashboardUrl: `${APP_URL}/dashboard/adopter`,
          }),
        });
      }
    } catch (emailErr) {
      console.error("approveApplication: status email failed", emailErr);
    }
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
    include: {
      listing: { select: { name: true } },
      applicant: { select: { email: true } },
    },
  });
  if (!app) return { error: "Application not found." };
  try {
    await prisma.adoptionApplication.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.declined },
    });
    try {
      if (app.applicant.email) {
        await sendEmail({
          to: app.applicant.email,
          subject: `Update on your application for ${app.listing.name}`,
          react: AdoptionStatusUpdateEmail({
            animalName: app.listing.name,
            statusMessage:
              "The rescue is unable to proceed with this application. You can browse other animals on Tinies.",
            dashboardUrl: `${APP_URL}/dashboard/adopter`,
          }),
        });
      }
    } catch (emailErr) {
      console.error("declineApplication: status email failed", emailErr);
    }
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

const MISSION_MAX = 500;

export async function updateOrgProfile(formData: FormData): Promise<{ error?: string }> {
  const { org, error } = await getRescueOrgForUser();
  if (error || !org) return { error: error ?? "Rescue org not found." };
  const name = (formData.get("name") as string)?.trim();
  const mission = (formData.get("mission") as string)?.trim() || null;
  if (mission && mission.length > MISSION_MAX) {
    return { error: `Mission must be ${MISSION_MAX} characters or less.` };
  }
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

  const showcase = extractRescueOrgShowcaseFromForm(formData, "json");
  if (!showcase.ok) return { error: showcase.error };

  try {
    await prisma.rescueOrg.update({
      where: { id: org.id },
      data: {
        name: name && name.trim() ? name.trim() : org.name,
        mission,
        location,
        website,
        logoUrl,
        socialLinks:
          socialLinks == null
            ? Prisma.DbNull
            : (socialLinks as Prisma.InputJsonValue),
        description: showcase.data.description,
        foundedYear: showcase.data.foundedYear,
        teamMembers: showcase.data.teamMembers,
        facilityPhotos: showcase.data.facilityPhotos,
        facilityVideoUrl: showcase.data.facilityVideoUrl,
        operatingHours: showcase.data.operatingHours,
        volunteerInfo: showcase.data.volunteerInfo,
        donationNeeds: showcase.data.donationNeeds,
        totalAnimalsRescued: showcase.data.totalAnimalsRescued,
        totalAnimalsAdopted: showcase.data.totalAnimalsAdopted,
        contactPhone: showcase.data.contactPhone,
        contactEmail: showcase.data.contactEmail,
        district: showcase.data.district,
        coverPhotoUrl: showcase.data.coverPhotoUrl,
      },
    });
    revalidatePath("/dashboard/rescue");
    revalidatePath(`/rescue/${org.slug}`);
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
    const motherId = normalizeListingFk(input.motherId);
    const fatherId = normalizeListingFk(input.fatherId);
    const parents = sanitizeParentIds(motherId, fatherId);
    await prisma.adoptionListing.create({
      data: {
        orgId: org.id,
        name: input.name.trim(),
        alternateNames: normalizeAlternateNames(input.alternateNames),
        nameStory: input.nameStory?.trim() || null,
        species: input.species,
        breed: input.breed?.trim() || null,
        estimatedAge: input.estimatedAge?.trim() || null,
        sex: input.sex || null,
        spayedNeutered: input.spayedNeutered,
        temperament: input.temperament?.trim() || null,
        medicalHistory: input.medicalHistory?.trim() || null,
        specialNeeds: input.specialNeeds?.trim() || null,
        backstory: input.backstory?.trim() || null,
        personality: input.personality?.trim() || null,
        idealHome: input.idealHome?.trim() || null,
        goodWith: filterGoodWithTags(input.goodWith ?? []),
        notGoodWith: filterNotGoodWithTags(input.notGoodWith ?? []),
        videoUrl: input.videoUrl?.trim() || null,
        fosterLocation: input.fosterLocation?.trim() || null,
        lineageTitle: input.lineageTitle?.trim() || null,
        motherId: parents.motherId,
        fatherId: parents.fatherId,
        motherName: input.motherName?.trim() || null,
        fatherName: input.fatherName?.trim() || null,
        siblingIds: normalizeSiblingIds(input.siblingIds),
        familyNotes: input.familyNotes?.trim() || null,
        localAdoptionFee: feeCents,
        internationalEligible: input.internationalEligible,
        destinationCountries: input.destinationCountries ?? [],
        photos: normalizeListingPhotoUrls(input.photoUrls),
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
    const motherId = normalizeListingFk(input.motherId);
    const fatherId = normalizeListingFk(input.fatherId);
    const parents = sanitizeParentIds(motherId, fatherId, id);
    await prisma.adoptionListing.update({
      where: { id },
      data: {
        name: input.name.trim(),
        alternateNames: normalizeAlternateNames(input.alternateNames),
        nameStory: input.nameStory?.trim() || null,
        species: input.species,
        breed: input.breed?.trim() || null,
        estimatedAge: input.estimatedAge?.trim() || null,
        sex: input.sex || null,
        spayedNeutered: input.spayedNeutered,
        temperament: input.temperament?.trim() || null,
        medicalHistory: input.medicalHistory?.trim() || null,
        specialNeeds: input.specialNeeds?.trim() || null,
        backstory: input.backstory?.trim() || null,
        personality: input.personality?.trim() || null,
        idealHome: input.idealHome?.trim() || null,
        goodWith: filterGoodWithTags(input.goodWith ?? []),
        notGoodWith: filterNotGoodWithTags(input.notGoodWith ?? []),
        videoUrl: input.videoUrl?.trim() || null,
        fosterLocation: input.fosterLocation?.trim() || null,
        lineageTitle: input.lineageTitle?.trim() || null,
        motherId: parents.motherId,
        fatherId: parents.fatherId,
        motherName: input.motherName?.trim() || null,
        fatherName: input.fatherName?.trim() || null,
        siblingIds: normalizeSiblingIds(input.siblingIds, id),
        familyNotes: input.familyNotes?.trim() || null,
        localAdoptionFee: feeCents,
        internationalEligible: input.internationalEligible,
        destinationCountries: input.destinationCountries ?? [],
        photos: normalizeListingPhotoUrls(input.photoUrls),
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
