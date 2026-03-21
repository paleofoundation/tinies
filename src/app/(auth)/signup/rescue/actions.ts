"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ensureUniqueOrgSlug } from "@/lib/rescue/ensure-unique-org-slug";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import {
  buildRescueSocialLinks,
  rescueSelfRegistrationSchema,
} from "@/lib/validations/rescue-registration";

const PLACEHOLDER_PASSWORD_HASH = "supabase-auth-placeholder";

export type RegisterRescueResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function registerRescueOrganisation(raw: unknown): Promise<RegisterRescueResult> {
  const parsed = rescueSelfRegistrationSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".") || "root";
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    return { ok: false, error: "Please check the form for errors.", fieldErrors };
  }

  const data = parsed.data;
  const email = data.email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return {
      ok: false,
      error: "An account with this email already exists. Sign in or use a different email.",
    };
  }

  const nameConflict = await prisma.rescueOrg.findFirst({
    where: { name: { equals: data.organisationName.trim(), mode: "insensitive" } },
    select: { id: true },
  });
  if (nameConflict) {
    return {
      ok: false,
      error:
        "An organisation with this name is already registered. If this is yours, sign in or contact support.",
    };
  }

  let admin;
  try {
    admin = createSupabaseAdmin();
  } catch (e) {
    console.error("registerRescueOrganisation admin client", e);
    return {
      ok: false,
      error: "Registration is temporarily unavailable. Please try again later or contact support.",
    };
  }

  const socialLinks = buildRescueSocialLinks({
    facebookUrl: data.facebookUrl,
    instagramHandle: data.instagramHandle,
  });

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      name: data.contactName,
      role: "rescue",
    },
  });

  if (authError || !authData.user) {
    const msg = authError?.message ?? "";
    if (/already|registered|exists|duplicate/i.test(msg)) {
      return {
        ok: false,
        error: "An account with this email already exists. Try signing in instead.",
      };
    }
    console.error("registerRescueOrganisation auth", authError);
    return {
      ok: false,
      error: "Could not create your login. Please try again or contact support.",
    };
  }

  const userId = authData.user.id;
  const slug = await ensureUniqueOrgSlug(data.organisationName);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          email,
          name: data.contactName,
          passwordHash: PLACEHOLDER_PASSWORD_HASH,
          role: "rescue",
          emailVerified: true,
        },
      });
      await tx.rescueOrg.create({
        data: {
          userId,
          name: data.organisationName.trim(),
          mission: data.missionStatement ?? null,
          location: data.location ?? null,
          charityRegistration: data.charityRegistrationNumber ?? null,
          website: data.websiteUrl ?? null,
          logoUrl: data.logoUrl ?? null,
          socialLinks:
            socialLinks && Object.keys(socialLinks).length > 0
              ? socialLinks
              : Prisma.JsonNull,
          slug,
          verified: false,
        },
      });
    });
  } catch (e) {
    console.error("registerRescueOrganisation prisma", e);
    await admin.auth.admin.deleteUser(userId);
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return { ok: false, error: "This email or organisation is already in use." };
    }
    return { ok: false, error: "Could not complete registration. Please try again." };
  }

  console.info("[rescue-registration] New rescue org pending verification", {
    userId,
    orgName: data.organisationName,
    slug,
  });

  revalidatePath("/dashboard/rescue");
  revalidatePath("/dashboard/admin");
  return { ok: true };
}
