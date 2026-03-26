"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { SITE_SETTINGS_CACHE_TAG } from "@/lib/site-settings/queries";

const optionalUrlField = z
  .string()
  .trim()
  .max(2048)
  .transform((s) => (s === "" ? null : s))
  .superRefine((s, ctx) => {
    if (s === null) return;
    const r = z.string().url().safeParse(s);
    if (!r.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Must be a valid URL." });
    }
  });

const updateSchema = z.object({
  socialLinkedInUrl: optionalUrlField,
  socialFacebookUrl: optionalUrlField,
  socialXUrl: optionalUrlField,
  socialInstagramUrl: optionalUrlField,
});

/** Form / wire format (empty string clears a link). */
export type SiteSocialFormInput = z.input<typeof updateSchema>;

async function requireAdminUserId(): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  const u = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (u?.role !== "admin") return { ok: false, error: "Admin only." };
  return { ok: true, userId: user.id };
}

export type UpdateSiteSocialUrlsResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updateSiteSocialUrls(input: SiteSocialFormInput): Promise<UpdateSiteSocialUrlsResult> {
  const auth = await requireAdminUserId();
  if (!auth.ok) return { ok: false, error: auth.error };

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path[0];
      if (typeof path === "string") {
        fieldErrors[path] = fieldErrors[path] ?? [];
        fieldErrors[path].push(issue.message);
      }
    }
    return { ok: false, error: "Check the fields below.", fieldErrors };
  }

  const d = parsed.data;
  try {
    await prisma.siteSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        socialLinkedInUrl: d.socialLinkedInUrl,
        socialFacebookUrl: d.socialFacebookUrl,
        socialXUrl: d.socialXUrl,
        socialInstagramUrl: d.socialInstagramUrl,
      },
      update: {
        socialLinkedInUrl: d.socialLinkedInUrl,
        socialFacebookUrl: d.socialFacebookUrl,
        socialXUrl: d.socialXUrl,
        socialInstagramUrl: d.socialInstagramUrl,
      },
    });
  } catch (err) {
    console.error("[site-settings] updateSiteSocialUrls upsert:", err);
    return {
      ok: false,
      error:
        "Could not save. Apply the latest database migration (site_settings table), then try again.",
    };
  }

  revalidateTag(SITE_SETTINGS_CACHE_TAG, "max");
  return { ok: true };
}

export async function getSiteSocialUrlsForAdmin(): Promise<
  | { ok: true; data: SiteSocialFormInput }
  | { ok: false; error: string }
> {
  const auth = await requireAdminUserId();
  if (!auth.ok) return { ok: false, error: auth.error };

  const empty: SiteSocialFormInput = {
    socialLinkedInUrl: "",
    socialFacebookUrl: "",
    socialXUrl: "",
    socialInstagramUrl: "",
  };

  try {
    const row = await prisma.siteSettings.findUnique({
      where: { id: "default" },
      select: {
        socialLinkedInUrl: true,
        socialFacebookUrl: true,
        socialXUrl: true,
        socialInstagramUrl: true,
      },
    });

    return {
      ok: true,
      data: {
        socialLinkedInUrl: row?.socialLinkedInUrl ?? "",
        socialFacebookUrl: row?.socialFacebookUrl ?? "",
        socialXUrl: row?.socialXUrl ?? "",
        socialInstagramUrl: row?.socialInstagramUrl ?? "",
      },
    };
  } catch (err) {
    console.error("[site-settings] getSiteSocialUrlsForAdmin:", err);
    return { ok: true, data: empty };
  }
}
