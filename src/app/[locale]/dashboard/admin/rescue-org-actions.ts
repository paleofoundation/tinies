"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ensureUniqueOrgSlug } from "@/lib/rescue/ensure-unique-org-slug";
import { createClient } from "@/lib/supabase/server";
import type { RescueOrgDetail, RescueOrgRow } from "@/app/[locale]/dashboard/admin/rescue-org-types";

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
    contactEmail: org.user.email,
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
  const contactEmail = (formData.get("contactEmail") as string)?.trim().toLowerCase();
  if (!contactEmail) return { error: "Contact email is required." };
  if (!isValidEmail(contactEmail)) return { error: "Please enter a valid contact email." };

  const socialLinks = parseSocialLinks(formData);

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: contactEmail },
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
          email: contactEmail,
          name: name,
          passwordHash: PLACEHOLDER_PASSWORD_HASH,
          role: "rescue",
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
      },
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/rescue");
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
      },
    });

    revalidatePath("/dashboard/admin");
    revalidatePath(`/dashboard/admin/rescue-orgs/${id}/edit`);
    revalidatePath("/dashboard/rescue");
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
      select: { verified: true },
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/rescue");
    return { verified: updated.verified };
  } catch (e) {
    console.error("toggleRescueOrgVerification", e);
    return { error: e instanceof Error ? e.message : "Failed to update verification." };
  }
}
