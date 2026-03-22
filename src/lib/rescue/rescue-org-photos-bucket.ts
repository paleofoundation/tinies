/**
 * Supabase Storage bucket id for rescue org facility and cover images.
 *
 * **Create in Supabase Dashboard → Storage:** bucket id `rescue-org-photos`, enable **public read**
 * (so `/rescue/[slug]` can show images). Restrict **upload** with Storage policies; uploads are
 * gated in `rescue-org-photo-upload.ts` (admin or owning rescue user only).
 */
export const RESCUE_ORG_PHOTOS_BUCKET = "rescue-org-photos";
