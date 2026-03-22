import { z } from "zod";

export const HEADLINE_MAX = 120;
export const WHY_MAX = 300;
export const HOME_DESC_MAX = 500;
export const PREV_EXP_MAX = 500;
export const EMERGENCY_MAX = 300;
export const INSURANCE_MAX = 200;
export const MAX_HOME_PHOTOS = 10;
export const QUALIFICATIONS_MAX = 15;

export const EXPERIENCE_TAG_OPTIONS = [
  "senior dogs",
  "puppies",
  "cats",
  "dogs",
  "exotic pets",
  "medical needs",
  "aggressive breeds",
  "multiple pets",
  "separation anxiety",
  "special dietary needs",
  "large breeds",
  "active breeds",
  "small breeds",
] as const;

export type ExperienceTagOption = (typeof EXPERIENCE_TAG_OPTIONS)[number];

export const LANGUAGE_OPTIONS = [
  "English",
  "Greek",
  "Russian",
  "German",
  "French",
  "Arabic",
  "Other",
] as const;

const qualificationSchema = z.object({
  title: z.string().trim().min(1).max(200),
  issuer: z.string().trim().max(120).nullable().optional(),
  year: z.coerce.number().int().min(1950).max(2100).optional().nullable(),
  description: z.string().trim().max(300).nullable().optional(),
});

/** Exported for server-side validation of provider profile updates. */
export const qualificationsArraySchema = z.array(qualificationSchema).max(QUALIFICATIONS_MAX);

export type ParsedQualification = {
  title: string;
  issuer?: string;
  year?: number;
  description?: string;
};

export function parseQualificationsJson(raw: string | null | undefined): ParsedQualification[] | "invalid" {
  const t = raw?.trim() ?? "";
  if (!t) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(t) as unknown;
  } catch {
    return "invalid";
  }
  const r = qualificationsArraySchema.safeParse(parsed);
  if (!r.success) return "invalid";
  return r.data.map((q) => {
    const issuer = q.issuer?.trim();
    const desc = q.description?.trim();
    return {
      title: q.title,
      ...(issuer ? { issuer } : {}),
      ...(q.year != null ? { year: q.year } : {}),
      ...(desc ? { description: desc } : {}),
    };
  });
}

export function parseHomePhotosJson(raw: string | null | undefined): string[] | "invalid" {
  const t = raw?.trim() ?? "";
  if (!t) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(t) as unknown;
  } catch {
    return "invalid";
  }
  if (!Array.isArray(parsed)) return "invalid";
  const urls: string[] = [];
  for (const item of parsed) {
    if (typeof item !== "string" || !item.trim()) continue;
    const u = item.trim();
    try {
      new URL(u);
    } catch {
      return "invalid";
    }
    urls.push(u);
  }
  if (urls.length > MAX_HOME_PHOTOS) return "invalid";
  return urls;
}

export function qualificationsFromPrismaJson(raw: unknown): ParsedQualification[] {
  if (raw == null) return [];
  const r = qualificationsArraySchema.safeParse(raw);
  if (!r.success) return [];
  return r.data.map((q) => {
    const issuer = q.issuer?.trim();
    const desc = q.description?.trim();
    return {
      title: q.title,
      ...(issuer ? { issuer } : {}),
      ...(q.year != null ? { year: q.year } : {}),
      ...(desc ? { description: desc } : {}),
    };
  });
}

export function parseCommaList(raw: string | null | undefined, maxItems: number): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, maxItems);
}
