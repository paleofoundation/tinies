import { z } from "zod";

export const FEEDBACK_TYPES = ["bug", "feature", "general"] as const;
export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export const FEEDBACK_STATUSES = [
  "new",
  "reviewed",
  "in_progress",
  "resolved",
  "wont_fix",
] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export const submitFeedbackSchema = z.object({
  type: z.enum(FEEDBACK_TYPES),
  description: z.string().trim().min(20, "Description must be at least 20 characters.").max(10_000),
  email: z
    .string()
    .max(320)
    .transform((s) => s.trim())
    .transform((s) => (s === "" ? undefined : s))
    .pipe(z.union([z.undefined(), z.string().email("Enter a valid email address.")])),
  pageUrl: z.string().trim().url().max(2048),
  userAgent: z.string().max(2048).optional().nullable(),
});

export const updateFeedbackAdminSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(FEEDBACK_STATUSES),
  adminNotes: z.string().max(20_000),
});
