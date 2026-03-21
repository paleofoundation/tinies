import { z } from "zod";

export const MAX_SUCCESS_STORY_PHOTOS = 4;
export const MAX_SUCCESS_STORY_TEXT_LENGTH = 2000;

export const successStorySubmitSchema = z.object({
  placementId: z.string().uuid("Select a valid placement."),
  storyText: z
    .string()
    .max(MAX_SUCCESS_STORY_TEXT_LENGTH, `Keep your story under ${MAX_SUCCESS_STORY_TEXT_LENGTH} characters.`)
    .transform((s) => s.trim()),
});

export type SuccessStorySubmitInput = z.infer<typeof successStorySubmitSchema>;

export function validateSuccessStoryHasBody(text: string, photoCount: number): boolean {
  if (photoCount > 0) return true;
  return text.length >= 20;
}
