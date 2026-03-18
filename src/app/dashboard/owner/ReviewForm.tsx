"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star, Camera, X } from "lucide-react";
import { toast } from "sonner";
import { createReview, updateReview, getBookingReview } from "./actions";
import { MIN_TEXT_LENGTH, MAX_PHOTOS } from "@/lib/validations/review";

type ReviewFormProps = {
  bookingId: string;
  providerId: string;
  providerName: string;
  /** When set, form is in edit mode. Pass { id, canEdit }; form will fetch full review. */
  existingReview?: { id: string; canEdit: boolean } | null;
  onClose: () => void;
  /** Called after create or update. newReviewId is set when a new review was created. */
  onSuccess: (newReviewId?: string) => void;
};

export function ReviewForm({
  bookingId,
  providerId,
  providerName,
  existingReview,
  onClose,
  onSuccess,
}: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [editLoaded, setEditLoaded] = useState(!existingReview?.id);

  const isEdit = Boolean(existingReview?.id);

  useEffect(() => {
    if (!isEdit || !existingReview?.id) return;
    getBookingReview(bookingId).then(({ review, error }) => {
      if (error || !review) {
        toast.error(error ?? "Could not load review.");
        onClose();
        return;
      }
      setRating(review.rating);
      setText(review.text);
      setEditLoaded(true);
    });
  }, [bookingId, existingReview?.id, isEdit, onClose]);

  const displayRating = hoverRating || rating;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < MIN_TEXT_LENGTH) {
      toast.error(`Review must be at least ${MIN_TEXT_LENGTH} characters.`);
      return;
    }
    if (rating < 1 || rating > 5) {
      toast.error("Please select a star rating.");
      return;
    }
    if (!isEdit && photoFiles.length > MAX_PHOTOS) {
      toast.error(`Maximum ${MAX_PHOTOS} photos.`);
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit) {
        const formData = new FormData();
        formData.set("reviewId", existingReview!.id);
        formData.set("rating", String(rating));
        formData.set("text", text.trim());
        const result = await updateReview(formData);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Review updated.");
      } else {
        const formData = new FormData();
        formData.set("bookingId", bookingId);
        formData.set("providerId", providerId);
        formData.set("rating", String(rating));
        formData.set("text", text.trim());
        photoFiles.forEach((file, i) => formData.append("photos", file));
        const result = await createReview(formData);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Thank you for your review!");
        onSuccess(result.reviewId);
      } else {
        onSuccess();
      }
      router.refresh();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter(
      (f) => f.size > 0 && f.type.startsWith("image/")
    );
    setPhotoFiles((prev) => [...prev, ...files].slice(0, MAX_PHOTOS));
  }
  function removePhoto(index: number) {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  }

  if (isEdit && !editLoaded) {
    return (
      <div
        className="mt-4 rounded-[var(--radius-lg)] border p-5"
        style={{
          backgroundColor: "var(--color-background)",
          borderColor: "var(--color-border)",
        }}
      >
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Loading review…
        </p>
      </div>
    );
  }

  return (
    <div
      className="mt-4 rounded-[var(--radius-lg)] border p-5"
      style={{
        backgroundColor: "var(--color-background)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold" style={{ color: "var(--color-text)" }}>
          {isEdit ? "Edit your review" : `Leave a review for ${providerName}`}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 transition-opacity hover:opacity-70"
          style={{ color: "var(--color-text-secondary)" }}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Rating
          </p>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="rounded p-0.5 transition-transform hover:scale-110"
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= displayRating ? "fill-amber-400 text-amber-400" : "text-[var(--color-text-muted)]"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="review-text" className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Your review (min {MIN_TEXT_LENGTH} characters)
          </label>
          <textarea
            id="review-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            required
            minLength={MIN_TEXT_LENGTH}
            maxLength={2000}
            className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
            placeholder="Share your experience..."
          />
          <p className="mt-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
            {text.length} / {MIN_TEXT_LENGTH}+ characters
          </p>
        </div>

        {!isEdit && (
          <div>
            <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
              Photos (optional)
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-lg)] border border-dashed px-4 py-2 text-sm transition-colors hover:bg-[var(--color-primary-50)]"
                style={{ borderColor: "var(--color-border)", color: "var(--color-primary)" }}>
                <Camera className="h-4 w-4" />
                Add photo
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>
              {photoFiles.map((file, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 rounded bg-[var(--color-neutral-200)] px-2 py-1 text-xs"
                  style={{ color: "var(--color-text)" }}
                >
                  {file.name.slice(0, 20)}
                  {file.name.length > 20 ? "…" : ""}
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="rounded p-0.5 hover:bg-[var(--color-error)]/20"
                    aria-label="Remove photo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
            {photoFiles.length >= MAX_PHOTOS && (
              <p className="mt-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                Max {MAX_PHOTOS} photos.
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
          >
            {submitting ? "Saving…" : isEdit ? "Update review" : "Submit review"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--color-background)]"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
