#!/usr/bin/env node

/**
 * TINIES BLOG IMAGE UPLOAD SCRIPT
 *
 * Takes images from ~/Desktop/blog-images/, resizes to 1200px wide,
 * compresses under 1MB, uploads to Supabase Storage, and inserts
 * the public URL into the site_images table keyed as blog-{slug}.
 *
 * USAGE:
 *   node upload-blog-images.js                  # Upload all images
 *   node upload-blog-images.js --dry-run        # Preview what would happen
 *   node upload-blog-images.js --slug=my-post   # Upload one specific image
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");

require("dotenv").config({ path: path.join(__dirname, ".env") });
if (fs.existsSync(path.join(__dirname, ".env.local"))) {
  require("dotenv").config({ path: path.join(__dirname, ".env.local"), override: true });
}

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STORAGE_BUCKET = "site-images";
const IMAGE_FOLDER = path.join(require("os").homedir(), "Desktop", "blog-images");
const MAX_WIDTH = 1200;
const MAX_FILE_SIZE = 1024 * 1024;
const QUALITY_START = 85;
const QUALITY_MIN = 50;

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const SINGLE_SLUG = args.find((a) => a.startsWith("--slug="))?.split("=")[1];

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("\n❌ Missing environment variables.");
  console.error("   Make sure .env or .env.local has:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co");
  console.error("   SUPABASE_SERVICE_ROLE_KEY=eyJ...\n");
  process.exit(1);
}

if (!fs.existsSync(IMAGE_FOLDER)) {
  console.error("\n❌ Image folder not found: " + IMAGE_FOLDER);
  console.error("   Create it: mkdir -p ~/Desktop/blog-images\n");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log("\n┌──────────────────────────────────────────┐");
  console.log("│   TINIES BLOG IMAGE UPLOAD SCRIPT        │");
  console.log("└──────────────────────────────────────────┘\n");

  if (DRY_RUN) console.log("🏃 DRY RUN MODE — no uploads will happen\n");

  if (!DRY_RUN) {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === STORAGE_BUCKET);
    if (!bucketExists) {
      console.log("📦 Creating storage bucket: " + STORAGE_BUCKET);
      const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      });
      if (error) {
        console.error("❌ Failed to create bucket:", error.message);
        process.exit(1);
      }
      console.log("   ✓ Bucket created\n");
    }
  }

  const allFiles = fs.readdirSync(IMAGE_FOLDER);
  const imageFiles = allFiles.filter((f) =>
    [".jpg", ".jpeg", ".png", ".webp"].includes(path.extname(f).toLowerCase())
  );

  if (SINGLE_SLUG) {
    const match = imageFiles.find((f) => path.parse(f).name === SINGLE_SLUG);
    if (!match) {
      console.error("❌ No image found for slug: " + SINGLE_SLUG);
      process.exit(1);
    }
    console.log("📎 Single image mode: " + match + "\n");
    await processImage(match);
  } else {
    console.log("📁 Found " + imageFiles.length + " images in " + IMAGE_FOLDER + "\n");
    if (imageFiles.length === 0) {
      console.log("   No images to process.\n");
      process.exit(0);
    }

    let success = 0,
      skipped = 0,
      failed = 0;
    for (const file of imageFiles) {
      const result = await processImage(file);
      if (result === "success") success++;
      else if (result === "skipped") skipped++;
      else failed++;
    }

    console.log("\n── RESULTS ──");
    console.log("   ✓ Uploaded: " + success);
    console.log("   ⏭ Skipped:  " + skipped);
    console.log("   ❌ Failed:   " + failed);
    console.log("   Total:      " + imageFiles.length + "\n");

    if (success > 0 && !DRY_RUN) {
      console.log("🎉 Done! Blog pages will pick up new images automatically via getSiteImageWithFallback.\n");
    }
  }
}

async function processImage(filename) {
  const slug = path.parse(filename).name;
  const imageKey = "blog-" + slug;
  const filePath = path.join(IMAGE_FOLDER, filename);
  const storagePath = "blog/" + slug + ".jpg";

  console.log("── " + slug + " ──");

  if (!DRY_RUN) {
    const { data: existing } = await supabase
      .from("site_images")
      .select("id, key, url")
      .eq("key", imageKey)
      .maybeSingle();

    if (existing) {
      console.log("   ⏭ Already exists. Skipping.");
      console.log("   URL: " + existing.url + "\n");
      return "skipped";
    }
  }

  console.log("   📐 Resizing to " + MAX_WIDTH + "px wide...");

  let buffer;
  let quality = QUALITY_START;

  try {
    buffer = await sharp(filePath)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    while (buffer.length > MAX_FILE_SIZE && quality > QUALITY_MIN) {
      quality -= 5;
      buffer = await sharp(filePath)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
    }

    console.log("   📦 Compressed: " + Math.round(buffer.length / 1024) + "KB (quality: " + quality + ")");
  } catch (err) {
    console.error("   ❌ Failed to process image: " + err.message + "\n");
    return "failed";
  }

  if (DRY_RUN) {
    console.log("   🏃 Would upload to: " + storagePath);
    console.log("   🏃 Would insert site_images key: " + imageKey + "\n");
    return "success";
  }

  console.log("   ☁️  Uploading to Supabase Storage...");

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, buffer, { contentType: "image/jpeg", upsert: true });

  if (uploadError) {
    console.error("   ❌ Upload failed: " + uploadError.message + "\n");
    return "failed";
  }

  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  const publicUrl = urlData.publicUrl;
  console.log("   🔗 URL: " + publicUrl);

  const { error: dbError } = await supabase.from("site_images").insert({
    id: crypto.randomUUID(),
    key: imageKey,
    category: "blog",
    label: "Blog: " + slug,
    url: publicUrl,
    alt: "",
    updated_at: new Date().toISOString(),
  });

  if (dbError) {
    console.error("   ⚠️  Image uploaded but DB insert failed: " + dbError.message);
    console.error("   Key: " + imageKey + "  URL: " + publicUrl + "\n");
    return "failed";
  }

  console.log("   ✓ Inserted into site_images: " + imageKey + "\n");
  return "success";
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
