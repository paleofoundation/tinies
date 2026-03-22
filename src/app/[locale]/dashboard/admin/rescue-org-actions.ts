"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ensureUniqueOrgSlug } from "@/lib/rescue/ensure-unique-org-slug";
import { createClient } from "@/lib/supabase/server";
import type { RescueOrgDetail, RescueOrgRow } from "@/app/[locale]/dashboard/admin/rescue-org-types";
import { extractRescueOrgShowcaseFromForm } from "@/lib/rescue/rescue-org-showcase-form";
import { teamMembersFromPrismaJson } from "@/lib/validations/rescue-org-showcase";

const PLACEHOLDER_PASSWORD_HASH = "supabase-auth-placeholder";
const MISSION_MAX = 500;

export async function getAllRescueOrgs(): Promise<{ orgs: RescueOrgRow[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { orgs: [], error: "You must be signed in." };

  try {
    const orgs = await prisma.rescueOrg.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { listings: true } },
      },
    });
    return {
      orgs: orgs.map((o) => ({
        id: o.id,
        name: o.name,
        location: o.location,
        verified: o.verified,
        listingCount: o._count.listings,
        createdAt: o.createdAt,
        slug: o.slug,
      })),
    };
  } catch (e) {
    console.error("getAllRescueOrgs", e);
    return { orgs: [], error: "Failed to load rescue organisations." };
  }
}

export async function getRescueOrgById(id: string): Promise<RescueOrgDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const org = await prisma.rescueOrg.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });
  if (!org) return null;
  return {
    id: org.id,
    userId: org.userId,
    name: org.name,
    mission: org.mission,
    location: org.location,
    charityRegistration: org.charityRegistration,
    website: org.website,
    socialLinks: org.socialLinks,
    logoUrl: org.logoUrl,
    bankIban: org.bankIban,
    verified: org.verified,
    slug: org.slug,
    accountEmail: org.user.email,
    description: org.description,
    foundedYear: org.foundedYear,
    teamMembers: teamMembersFromPrismaJson(org.teamMembers),
    facilityPhotos: [...org.facilityPhotos],
    facilityVideoUrl: org.facilityVideoUrl,
    operatingHours: org.operatingHours,
    volunteerInfo: org.volunteerInfo,
    donationNeeds: org.donationNeeds,
    totalAnimalsRescued: org.totalAnimalsRescued,
    totalAnimalsAdopted: org.totalAnimalsAdopted,
    contactPhone: org.contactPhone,
    publicContactEmail: org.contactEmail,
    district: org.district,
    coverPhotoUrl: org.coverPhotoUrl,
  };
}

function parseSocialLinks(formData: FormData): Record<string, string> | null {
  const instagram = (formData.get("instagram") as string)?.trim() || "";
  const facebook = (formData.get("facebook") as string)?.trim() || "";
  if (!instagram && !facebook) return null;
  const obj: Record<string, string> = {};
  if (instagram) obj.instagram = instagram;
  if (facebook) obj.facebook = facebook;
  return obj;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function createRescueOrg(formData: FormData): Promise<{ error?: string; id?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Organisation name is required." };

  const mission = (formData.get("mission") as string)?.trim() || null;
  if (mission && mission.length > MISSION_MAX) {
    return { error: `Mission must be ${MISSION_MAX} characters or less.` };
  }

  const location = (formData.get("location") as string)?.trim() || null;
  const charityRegistration = (formData.get("charityRegistration") as string)?.trim() || null;
  const website = (formData.get("website") as string)?.trim() || null;
  const logoUrl = (formData.get("logoUrl") as string)?.trim() || null;
  const bankIban = (formData.get("bankIban") as string)?.trim() || null;
  const loginEmail =
    (formData.get("loginEmail") as string)?.trim().toLowerCase() ||
    (formData.get("contactEmail") as string)?.trim().toLowerCase();
  if (!loginEmail) return { error: "Account email is required." };
  if (!isValidEmail(loginEmail)) return { error: "Please enter a valid account email." };

  const socialLinks = parseSocialLinks(formData);

  const showcase = extractRescueOrgShowcaseFromForm(formData, "lines");
  if (!showcase.ok) return { error: showcase.error };

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: loginEmail },
    });

    if (existingUser) {
      const existingOrg = await prisma.rescueOrg.findUnique({
        where: { userId: existingUser.id },
      });
      if (existingOrg) {
        return { error: "This user already has a rescue organisation linked." };
      }
    }

    const slug = await ensureUniqueOrgSlug(name);

    let userId: string;
    if (existingUser) {
      userId = existingUser.id;
    } else {
      userId = randomUUID();
      await prisma.user.create({
        data: {
          id: userId,
          email: loginEmail,
          name: name,
          passwordHash: PLACEHOLDER_PASSWORD_HASH,
          role: "rescue",
          welcomeFlowCompletedAt: new Date(),
        },
      });
    }

    const org = await prisma.rescueOrg.create({
      data: {
        userId,
        name,
        mission,
        location,
        charityRegistration,
        website,
        logoUrl,
        bankIban,
        socialLinks:
          socialLinks && Object.keys(socialLinks).length > 0 ? socialLinks : Prisma.JsonNull,
        slug,
        verified: false,
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

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/rescue");
    revalidatePath(`/rescue/${org.slug}`);
    return { id: org.id };
  } catch (e) {
    console.error("createRescueOrg", e);
    return { error: e instanceof Error ? e.message : "Failed to create rescue organisation." };
  }
}

export async function updateRescueOrg(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const org = await prisma.rescueOrg.findUnique({ where: { id } });
  if (!org) return { error: "Organisation not found." };

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Organisation name is required." };

  const mission = (formData.get("mission") as string)?.trim() || null;
  if (mission && mission.length > MISSION_MAX) {
    return { error: `Mission must be ${MISSION_MAX} characters or less.` };
  }

  const location = (formData.get("location") as string)?.trim() || null;
  const charityRegistration = (formData.get("charityRegistration") as string)?.trim() || null;
  const website = (formData.get("website") as string)?.trim() || null;
  const logoUrl = (formData.get("logoUrl") as string)?.trim() || null;
  const bankIban = (formData.get("bankIban") as string)?.trim() || null;
  const socialLinks = parseSocialLinks(formData);

  const verifiedRaw = formData.get("verified");
  const verified = verifiedRaw === "true" || verifiedRaw === "on";

  const showcase = extractRescueOrgShowcaseFromForm(formData, "json");
  if (!showcase.ok) return { error: showcase.error };

  try {
    await prisma.rescueOrg.update({
      where: { id },
      data: {
        name,
        mission,
        location,
        charityRegistration,
        website,
        logoUrl,
        bankIban,
        socialLinks:
          socialLinks && Object.keys(socialLinks).length > 0
            ? socialLinks
            : Prisma.JsonNull,
        verified,
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

    revalidatePath("/dashboard/admin");
    revalidatePath(`/dashboard/admin/rescue-orgs/${id}/edit`);
    revalidatePath("/dashboard/rescue");
    revalidatePath(`/rescue/${org.slug}`);
    return {};
  } catch (e) {
    console.error("updateRescueOrg", e);
    return { error: e instanceof Error ? e.message : "Failed to update rescue organisation." };
  }
}

export async function toggleRescueOrgVerification(id: string): Promise<{ error?: string; verified?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  try {
    const org = await prisma.rescueOrg.findUnique({
      where: { id },
      select: { verified: true },
    });
    if (!org) return { error: "Organisation not found." };

    const updated = await prisma.rescueOrg.update({
      where: { id },
      data: { verified: !org.verified },
      select: { verified: true, slug: true },
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/rescue");
    revalidatePath(`/rescue/${updated.slug}`);
    return { verified: updated.verified };
  } catch (e) {
    console.error("toggleRescueOrgVerification", e);
    return { error: e instanceof Error ? e.message : "Failed to update verification." };
  }
}
