"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import {
  uploadBookingUpdatePhoto,
  sendBookingUpdate,
} from "@/lib/bookings/update-actions";
import { MAX_BOOKING_UPDATE_PHOTOS } from "@/lib/validations/booking-update";

type Props = {
  bookingId: string;
  open: boolean;
  onClose: () => void;
  headline: string;
};

export function SendBookingUpdateModal({ bookingId, open, onClose, headline }: Props) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    const room = MAX_BOOKING_UPDATE_PHOTOS - photoUrls.length;
    if (room <= 0) {
      toast.error(`Maximum ${MAX_BOOKING_UPDATE_PHOTOS} photos.`);
      return;
    }
    setUploading(true);
    try {
      for (let i = 0; i < Math.min(files.length, room); i++) {
        const res = await uploadBookingUpdatePhoto(bookingId, files[i]!);
        if (res.url) setPhotoUrls((p) => [...p, res.url!]);
        else toast.error(res.error ?? "Upload failed");
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const result = await sendBookingUpdate(bookingId, {
      text: note.trim() || null,
      photoUrls,
      videoUrl: videoUrl.trim() || null,
    });
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Update sent to the pet owner.");
    setNote("");
    setPhotoUrls([]);
    setVideoUrl("");
    onClose();
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(28, 28, 28, 0.45)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-update-title"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius-xl)] border p-6 shadow-[var(--shadow-lg)]"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 hover:bg-[var(--color-background)]"
          style={{ color: "var(--color-text-secondary)" }}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <h2
          id="send-update-title"
          className="pr-10 text-lg font-normal"
          style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
        >
          Send update
        </h2>
        <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          {headline}
        </p>
        <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
              Photos (up to {MAX_BOOKING_UPDATE_PHOTOS}, 1MB each)
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {photoUrls.map((url, i) => (
                <div key={url} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-24 w-24 rounded-[var(--radius-lg)] object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrls((p) => p.filter((_, j) => j !== i))}
                    className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full text-xs text-white"
                    style={{ backgroundColor: "var(--color-error)" }}
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ))}
              {photoUrls.length < MAX_BOOKING_UPDATE_PHOTOS && (
                <label
                  className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-[var(--radius-lg)] border-2 border-dashed text-xs transition-colors hover:bg-[var(--color-primary-50)]"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                >
                  <ImagePlus className="h-6 w-6" aria-hidden />
                  Add
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => void handleFiles(e)}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
            {uploading && <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>Uploading…</p>}
          </div>
          <div>
            <label htmlFor="update-note" className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
              Note <span style={{ fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              id="update-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="A quick word for the family…"
              className="mt-2 w-full rounded-[var(--radius-lg)] border px-3 py-2.5 text-sm"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}
            />
          </div>
          <div>
            <label htmlFor="update-video" className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
              Video link <span style={{ fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              id="update-video"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://…"
              className="mt-2 w-full rounded-[var(--radius-lg)] border px-3 py-2.5 text-sm"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}
            />
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="rounded-[var(--radius-pill)] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
            >
              {submitting ? "Sending…" : "Send update"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-[var(--radius-pill)] border px-6 py-2.5 text-sm font-semibold"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
