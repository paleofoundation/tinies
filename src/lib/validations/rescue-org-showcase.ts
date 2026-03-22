import { z } from "zod";
import { DISTRICT_SLUG_TO_NAME } from "@/lib/constants/seo-landings";

export const DESCRIPTION_MAX = 2000;
export const MAX_FACILITY_PHOTOS = 10;
export const TEAM_MEMBERS_MAX = 24;

const optionalUrl = z.union([z.literal(""), z.string().url()]);

const teamMemberSchema = z.object({
  name: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(120),
  photo: optionalUrl.optional(),
  bio: z.string().trim().max(500).optional(),
});

export const teamMembersArraySchema = z.array(teamMemberSchema).max(TEAM_MEMBERS_MAX);

export type ParsedRescueTeamMember = z.infer<typeof teamMemberSchema>;

export function parseTeamMembersJson(raw: string | null | undefined): ParsedRescueTeamMember[] | "invalid" {
  const t = raw?.trim() ?? "";
  if (!t) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(t) as unknown;
  } catch {
    return "invalid";
  }
  const r = teamMembersArraySchema.safeParse(parsed);
  if (!r.success) return "invalid";
  return r.data.map((m) => ({
    name: m.name,
    role: m.role,
    ...(m.photo && m.photo.length > 0 ? { photo: m.photo } : {}),
    ...(m.bio && m.bio.length > 0 ? { bio: m.bio } : {}),
  }));
}

export function parseFacilityPhotosJson(raw: string | null | undefined): string[] | "invalid" {
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
      // eslint-disable-next-line no-new -- validate URL shape
      new URL(u);
    } catch {
      return "invalid";
    }
    urls.push(u);
  }
  if (urls.length > MAX_FACILITY_PHOTOS) return "invalid";
  return urls;
}

/** One URL per line (create flow before org id exists). */
export function parseFacilityPhotoUrlsFromLines(raw: string | null | undefined): string[] | "invalid" {
  const lines = (raw ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length > MAX_FACILITY_PHOTOS) return "invalid";
  for (const u of lines) {
    try {
      new URL(u);
    } catch {
      return "invalid";
    }
  }
  return lines;
}

export const CYPRUS_DISTRICT_OPTIONS = Object.values(DISTRICT_SLUG_TO_NAME).sort((a, b) =>
  a.localeCompare(b)
);

export function parseDistrict(raw: string | null | undefined): string | null | "invalid" {
  const s = raw?.trim() ?? "";
  if (!s) return null;
  if (CYPRUS_DISTRICT_OPTIONS.includes(s)) return s;
  return "invalid";
}

export function parseFoundedYear(raw: string | null | undefined): number | null | "invalid" {
  const s = raw?.trim() ?? "";
  if (!s) return null;
  const n = Number.parseInt(s, 10);
  if (Number.isNaN(n) || n < 1800 || n > 2100) return "invalid";
  return n;
}

export function parseOptionalPositiveInt(
  raw: string | null | undefined
): number | null | "invalid" {
  const s = raw?.trim() ?? "";
  if (!s) return null;
  const n = Number.parseInt(s, 10);
  if (Number.isNaN(n) || n < 0 || n > 10_000_000) return "invalid";
  return n;
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function parsePublicContactEmail(raw: string | null | undefined): string | null | "invalid" {
  const s = raw?.trim().toLowerCase() ?? "";
  if (!s) return null;
  if (!isValidEmail(s)) return "invalid";
  return s;
}

export function parseContactPhone(raw: string | null | undefined): string | null {
  const s = raw?.trim() ?? "";
  return s.length > 0 ? s.slice(0, 40) : null;
}

/** Normalise JSON column from DB for editor initial state. */
export function teamMembersFromPrismaJson(raw: unknown): ParsedRescueTeamMember[] {
  if (raw == null) return [];
  const r = teamMembersArraySchema.safeParse(raw);
  if (!r.success) return [];
  return r.data.map((m) => ({
    name: m.name,
    role: m.role,
    ...(m.photo && m.photo.length > 0 ? { photo: m.photo } : {}),
    ...(m.bio && m.bio.length > 0 ? { bio: m.bio } : {}),
  }));
}
