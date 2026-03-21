import { z } from "zod";

function emptyToUndefined(v: unknown): unknown {
  if (v === "" || v === null || v === undefined) return undefined;
  return v;
}

const optionalHttpUrl = z.preprocess(
  emptyToUndefined,
  z.string().trim().url("Enter a valid URL").max(500).optional()
);

const optionalLogoUrl = z.preprocess(
  emptyToUndefined,
  z.string().trim().url("Enter a valid image URL").max(2000).optional()
);

const optionalInstagram = z.preprocess(
  emptyToUndefined,
  z.string().trim().max(100).optional()
);

export const rescueSelfRegistrationSchema = z.object({
  contactName: z.string().trim().min(1, "Contact name is required").max(200),
  email: z.string().trim().email("Enter a valid email").max(320),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  organisationName: z.string().trim().min(1, "Organisation name is required").max(200),
  missionStatement: z
    .string()
    .trim()
    .max(500, "Mission statement must be 500 characters or less")
    .optional()
    .transform((s) => (s === "" ? undefined : s)),
  location: z
    .string()
    .trim()
    .max(300)
    .optional()
    .transform((s) => (s === "" ? undefined : s)),
  websiteUrl: optionalHttpUrl,
  facebookUrl: optionalHttpUrl,
  instagramHandle: optionalInstagram,
  charityRegistrationNumber: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((s) => (s === "" ? undefined : s)),
  logoUrl: optionalLogoUrl,
});

export type RescueSelfRegistrationInput = z.infer<typeof rescueSelfRegistrationSchema>;

/** Store Instagram as handle or URL in socialLinks JSON. */
export function normalizeInstagramValue(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const t = raw.trim();
  if (!t) return undefined;
  if (t.startsWith("@")) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return `@${t.replace(/^@+/, "")}`;
}

export function buildRescueSocialLinks(input: {
  facebookUrl?: string;
  instagramHandle?: string;
}): Record<string, string> | null {
  const instagram = normalizeInstagramValue(input.instagramHandle);
  const obj: Record<string, string> = {};
  if (input.facebookUrl?.trim()) obj.facebook = input.facebookUrl.trim();
  if (instagram) obj.instagram = instagram;
  return Object.keys(obj).length > 0 ? obj : null;
}
