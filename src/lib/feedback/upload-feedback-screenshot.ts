import { createSupabaseAdmin } from "@/lib/supabase/admin";

const BUCKET = "feedback";
const MAX_BYTES = 1_048_576; // 1 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function uploadFeedbackScreenshot(file: File): Promise<{ url: string } | { error: string }> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "Screenshot upload is not configured. Submit without an attachment or try again later." };
  }
  if (!file || file.size === 0) {
    return { error: "Invalid file." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Screenshot must be 1 MB or smaller." };
  }
  if (!ALLOWED.has(file.type)) {
    return { error: "Please upload a JPEG, PNG, WebP, or GIF image." };
  }

  const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1] ?? "png";
  const safeBase = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 80);
  const path = `${crypto.randomUUID()}-${safeBase || "screenshot"}.${ext}`;

  try {
    const admin = createSupabaseAdmin();
    const { error } = await admin.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    if (error) {
      return { error: error.message };
    }
    const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
    return { url: data.publicUrl };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed.";
    return { error: message };
  }
}
