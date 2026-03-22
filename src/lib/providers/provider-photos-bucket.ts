/**
 * Supabase Storage bucket id for provider home / facility photos on public profile.
 *
 * **Create in Supabase Dashboard → Storage:** bucket id `provider-photos`, enable **public read**.
 * Restrict **upload** with Storage policies; uploads are gated in `provider-home-photo-upload.ts`.
 */
export const PROVIDER_PHOTOS_BUCKET = "provider-photos";
