"use client";

import type { Area } from "react-easy-crop";

/**
 * Loads an image for canvas cropping. Remote URLs use CORS; blob/data URLs omit crossOrigin.
 */
export function loadImageForCrop(imageSrc: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const local = imageSrc.startsWith("blob:") || imageSrc.startsWith("data:");
    if (!local) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(
        new Error(
          "Could not load this image for cropping. If it is hosted elsewhere, try downloading and uploading the file instead."
        )
      );
    img.src = imageSrc;
  });
}

/**
 * Renders the given pixel crop region into a JPEG blob (suitable for Storage upload).
 */
export async function getCroppedImage(imageSrc: string, cropArea: Area, quality = 0.92): Promise<Blob> {
  const image = await loadImageForCrop(imageSrc);
  const canvas = document.createElement("canvas");
  const w = Math.max(1, Math.round(cropArea.width));
  const h = Math.max(1, Math.round(cropArea.height));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create canvas context.");
  }
  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    w,
    h
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not export cropped image."));
      },
      "image/jpeg",
      quality
    );
  });
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const dataUrl = String(r.result ?? "");
      const i = dataUrl.indexOf(",");
      resolve(i >= 0 ? dataUrl.slice(i + 1) : dataUrl);
    };
    r.onerror = () => reject(new Error("Failed to read cropped image."));
    r.readAsDataURL(blob);
  });
}
