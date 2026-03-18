/**
 * Zod schemas for pet profile forms and Server Action input.
 */

import { z } from "zod";

const PET_SPECIES = ["dog", "cat", "other"] as const;
const MAX_PHOTOS = 5;
const NAME_MAX = 100;
const TEXT_MAX = 2000;
const PHONE_MAX = 30;

export const petFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(NAME_MAX, `Name must be ${NAME_MAX} characters or less`)
    .trim(),
  species: z.enum(PET_SPECIES, { required_error: "Species is required" }),
  breed: z.string().max(NAME_MAX).trim().optional().or(z.literal("")),
  ageYears: z
    .union([
      z.string(),
      z.number(),
    ])
    .optional()
    .transform((v) => {
      if (v === "" || v === undefined || v === null) return undefined;
      const n = typeof v === "string" ? parseFloat(v) : v;
      return Number.isFinite(n) && n >= 0 && n <= 30 ? n : undefined;
    }),
  weightKg: z
    .union([
      z.string(),
      z.number(),
    ])
    .optional()
    .transform((v) => {
      if (v === "" || v === undefined || v === null) return undefined;
      const n = typeof v === "string" ? parseFloat(v) : v;
      return Number.isFinite(n) && n > 0 && n <= 200 ? n : undefined;
    }),
  sex: z.string().max(20).trim().optional().or(z.literal("")),
  spayedNeutered: z
    .union([z.boolean(), z.literal("true"), z.literal("false"), z.literal("")])
    .optional()
    .transform((v) => {
      if (v === "" || v === undefined || v === null) return undefined;
      return v === true || v === "true";
    }),
  temperament: z.string().max(TEXT_MAX).trim().optional().or(z.literal("")),
  medicalNotes: z.string().max(TEXT_MAX).trim().optional().or(z.literal("")),
  dietaryNeeds: z.string().max(TEXT_MAX).trim().optional().or(z.literal("")),
  vetName: z.string().max(NAME_MAX).trim().optional().or(z.literal("")),
  vetPhone: z.string().max(PHONE_MAX).trim().optional().or(z.literal("")),
  existingPhotoUrls: z
    .string()
    .optional()
    .transform((s) => {
      if (!s?.trim()) return [] as string[];
      try {
        const parsed = JSON.parse(s) as unknown;
        return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
      } catch {
        return [] as string[];
      }
    }),
});

export type PetFormData = z.infer<typeof petFormSchema>;

/** For Server Actions: form data may include existingPhotoUrls JSON string; photos are sent as File in FormData separately. */
export const petCreateSchema = petFormSchema.omit({ existingPhotoUrls: true });
export type PetCreateInput = z.infer<typeof petCreateSchema>;

export function validatePetFormData(data: unknown): { success: true; data: PetFormData } | { success: false; error: string; issues?: z.ZodIssue[] } {
  const result = petFormSchema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  const first = result.error.issues[0];
  const message = first ? `${first.path.join(".")}: ${first.message}` : "Invalid pet data.";
  return { success: false, error: message, issues: result.error.issues };
}

export { PET_SPECIES, MAX_PHOTOS };
