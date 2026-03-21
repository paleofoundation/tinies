import { z } from "zod";

export const MAX_BOOKING_UPDATE_PHOTOS = 3;
export const MAX_BOOKING_UPDATE_PHOTO_BYTES = 1024 * 1024; // 1MB

export const sendBookingUpdateInputSchema = z.object({
  text: z.string().max(2000).optional().nullable(),
  /** Public URLs (e.g. Supabase) — validated loosely in the action. */
  photoUrls: z.array(z.string().min(1).max(2000)).max(MAX_BOOKING_UPDATE_PHOTOS).default([]),
  videoUrl: z.string().max(2000).nullable().optional(),
});

export type SendBookingUpdateInput = z.infer<typeof sendBookingUpdateInputSchema>;
