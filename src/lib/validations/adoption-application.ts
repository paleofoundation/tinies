/**
 * Zod schema for adoption application form and Server Action input.
 */

import { z } from "zod";

const COUNTRY_VALUES = ["UK", "Germany", "Netherlands", "Sweden", "Other EU"] as const;
const LIVING_SITUATION_VALUES = ["house", "apartment", "other"] as const;

const TEXT_MAX = 2000;
const CITY_MAX = 120;
const VET_REF_MAX = 200;

export const adoptionApplicationSchema = z.object({
  listingSlug: z.string().min(1, "Listing is required").trim(),
  country: z.enum(COUNTRY_VALUES, { message: "Country is required" }),
  city: z
    .string()
    .min(1, "City is required")
    .max(CITY_MAX, `City must be ${CITY_MAX} characters or less`)
    .trim(),
  livingSituation: z
    .enum(LIVING_SITUATION_VALUES, { message: "Living situation is required" }),
  hasGarden: z
    .union([z.boolean(), z.literal("yes"), z.literal("no"), z.literal("")])
    .optional()
    .transform((v) => {
      if (v === "" || v === undefined || v === null) return undefined;
      return v === true || v === "yes";
    }),
  otherPets: z.string().max(TEXT_MAX).trim().optional().or(z.literal("")),
  childrenAges: z.string().max(200).trim().optional().or(z.literal("")),
  experience: z.string().max(TEXT_MAX).trim().optional().or(z.literal("")),
  reason: z.string().max(TEXT_MAX).trim().optional().or(z.literal("")),
  vetReference: z.string().max(VET_REF_MAX).trim().optional().or(z.literal("")),
});

export type AdoptionApplicationFormData = z.infer<typeof adoptionApplicationSchema>;

export function validateAdoptionApplication(
  data: unknown
): { success: true; data: AdoptionApplicationFormData } | { success: false; error: string } {
  const result = adoptionApplicationSchema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  const first = result.error.issues[0];
  const message = first ? `${first.path.join(".")}: ${first.message}` : "Invalid application data.";
  return { success: false, error: message };
}

export { COUNTRY_VALUES, LIVING_SITUATION_VALUES };
