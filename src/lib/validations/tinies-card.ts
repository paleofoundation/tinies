import { z } from "zod";

export const TINIES_CARD_ACTIVITY_TYPES = [
  "pee",
  "poo",
  "food",
  "water",
  "medication",
  "play",
  "rest",
  "other",
] as const;

export const TINIES_CARD_MOODS = ["happy", "calm", "playful", "tired", "anxious"] as const;

export type TiniesCardActivityType = (typeof TINIES_CARD_ACTIVITY_TYPES)[number];
export type TiniesCardMood = (typeof TINIES_CARD_MOODS)[number];

export const MAX_TINIES_CARD_PHOTOS = 8;
export const MAX_TINIES_CARD_PHOTO_BYTES = 1024 * 1024;
export const MAX_TINIES_CARD_PERSONAL_NOTE = 500;
export const MAX_TINIES_CARD_ACTIVITY_NOTE = 500;

const activityRowSchema = z.object({
  type: z.enum(TINIES_CARD_ACTIVITY_TYPES),
  time: z.string().min(1).max(8),
  notes: z.string().max(MAX_TINIES_CARD_ACTIVITY_NOTE).optional().default(""),
});

export const submitTiniesCardInputSchema = z
  .object({
    activities: z.array(activityRowSchema).max(50).default([]),
    photos: z.array(z.string().min(1).max(2000)).max(MAX_TINIES_CARD_PHOTOS).default([]),
    personalNote: z.string().max(MAX_TINIES_CARD_PERSONAL_NOTE).default(""),
    mood: z.enum(TINIES_CARD_MOODS),
  })
  .superRefine((data, ctx) => {
    const hasNote = data.personalNote.trim().length > 0;
    const hasActivities = data.activities.length > 0;
    if (!hasNote && !hasActivities) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one activity or a personal note.",
        path: ["activities"],
      });
    }
  });

export type SubmitTiniesCardInput = z.infer<typeof submitTiniesCardInputSchema>;
