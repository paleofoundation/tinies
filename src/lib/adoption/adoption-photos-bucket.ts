/**
 * Supabase Storage bucket id for adoption listing gallery images.
 *
 * **Create in Supabase Dashboard → Storage:** bucket id `adoption-photos`, enable **public read**
 * (so `/adopt/[slug]` can show images without signing). Restrict **upload** with Storage policies
 * as needed; uploads are also gated in `listing-photo-upload.ts` (admin/rescue only).
 */
export const ADOPTION_PHOTOS_BUCKET = "adoption-photos";
