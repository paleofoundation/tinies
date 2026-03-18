/**
 * Zod schemas for review form and Server Action input.
 */

import { z } from "zod";

const MIN_TEXT_LENGTH = 20;
const MAX_TEXT_LENGTH = 2000;
const MAX_PHOTOS = 5;

export const reviewFormSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1 star")
    .max(5, "Rating must be at most 5 stars"),
  text: z
    .string()
    .min(MIN_TEXT_LENGTH, `Review must be at least ${MIN_TEXT_LENGTH} characters`)
    .max(MAX_TEXT_LENGTH, `Review must be ${MAX_TEXT_LENGTH} characters or less`)
    .trim(),
});

export const createReviewInputSchema = reviewFormSchema.extend({
  bookingId: z.string().uuid(),
  providerId: z.string().uuid(),
});

export const updateReviewInputSchema = reviewFormSchema.extend({
  reviewId: z.string().uuid(),
});

export type ReviewFormData = z.infer<typeof reviewFormSchema>;
export type CreateReviewInput = z.infer<typeof createReviewInputSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewInputSchema>;

export { MIN_TEXT_LENGTH, MAX_TEXT_LENGTH, MAX_PHOTOS };
