"use client";

import { useState } from "react";
import Image from "next/image";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";
import { uploadAdoptionListingPhoto } from "@/lib/adoption/listing-photo-upload";
import { MAX_LISTING_PHOTOS } from "@/lib/adoption/listing-photos";

type Props = {
  photoUrls: string[];
  onChange: (urls: string[]) => void;
  /** Existing listing slug for storage path; omit on create (uses `new`). */
  listingSlugForUpload?: string | null;
};

export function AdoptionListingPhotosEditor({ photoUrls, onChange, listingSlugForUpload }: Props) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const setUrl = (index: number, value: string) => {
    const next = [...photoUrls];
    next[index] = value;
    onChange(next);
  };

  const removeRow = (index: number) => {
    if (photoUrls.length <= 1) {
      onChange([""]);
      return;
    }
    const next = photoUrls.filter((_, i) => i !== index);
    onChange(next.length ? next : [""]);
  };

  const addRow = () => {
    if (photoUrls.length >= MAX_LISTING_PHOTOS) return;
    onChange([...photoUrls, ""]);
  };

  const reorder = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    const next = [...photoUrls];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  async function handleFile(index: number, file: File | null) {
    if (!file) return;
    setUploadingIndex(index);
    const res = await uploadAdoptionListingPhoto(
      file,
      listingSlugForUpload?.trim() ? listingSlugForUpload.trim() : undefined
    );
    setUploadingIndex(null);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    if (res.url) {
      setUrl(index, res.url);
      toast.success("Photo uploaded.");
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#6B7280]">
        JPG, PNG, or WebP, max 1MB each. Up to {MAX_LISTING_PHOTOS} photos. Drag the handle to reorder.
      </p>
      <ul className="space-y-3">
        {photoUrls.map((url, i) => (
          <li
            key={`photo-row-${i}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIndex !== null) reorder(dragIndex, i);
              setDragIndex(null);
            }}
            className="flex flex-wrap items-start gap-3 rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] p-3 sm:flex-nowrap"
          >
            <div
              draggable
              role="button"
              tabIndex={0}
              aria-label="Drag to reorder"
              onDragStart={() => setDragIndex(i)}
              onDragEnd={() => setDragIndex(null)}
              className="mt-2 cursor-grab text-[#9CA3AF] active:cursor-grabbing"
            >
              <GripVertical className="h-5 w-5" aria-hidden />
            </div>
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
              {url.trim() ? (
                <Image src={url.trim()} alt="" fill className="object-cover" sizes="64px" unoptimized />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-[#9CA3AF]">—</div>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center rounded-[10px] border border-[#0A6E5C]/40 bg-white px-3 py-1.5 text-sm font-medium text-[#0A6E5C] hover:bg-[#0A6E5C]/5">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={uploadingIndex === i}
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      e.target.value = "";
                      void handleFile(i, f);
                    }}
                  />
                  {uploadingIndex === i ? "Uploading…" : "Upload photo"}
                </label>
                {photoUrls.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="rounded-[10px] px-3 py-1.5 text-sm text-[#6B7280] hover:bg-[#E5E7EB]"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <div>
                <label className="sr-only" htmlFor={`photo-url-${i}`}>
                  Or paste image URL
                </label>
                <input
                  id={`photo-url-${i}`}
                  type="url"
                  placeholder="Or paste image URL"
                  value={url}
                  onChange={(e) => setUrl(i, e.target.value)}
                  className="w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1B2432] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
      {photoUrls.length < MAX_LISTING_PHOTOS ? (
        <button
          type="button"
          onClick={addRow}
          className="text-sm font-semibold text-[#0A6E5C] hover:underline"
        >
          + Add another photo
        </button>
      ) : null}
    </div>
  );
}
