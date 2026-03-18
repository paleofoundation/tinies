"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { reportProblem } from "@/lib/disputes/actions";
import type { DisputeType } from "@prisma/client";
import type { ClaimType } from "@prisma/client";

const DISPUTE_TYPES: { value: DisputeType; label: string }[] = [
  { value: "service_quality", label: "Service quality" },
  { value: "pet_welfare", label: "Pet welfare" },
  { value: "communication", label: "Communication" },
  { value: "payment", label: "Payment" },
];

const CLAIM_TYPES: { value: ClaimType; label: string }[] = [
  { value: "pet_injury", label: "Pet injury" },
  { value: "property_damage", label: "Property damage" },
  { value: "provider_no_show", label: "Provider no-show" },
  { value: "owner_no_show", label: "Owner no-show" },
];

const MIN_DESCRIPTION = 100;
const MAX_PHOTOS = 5;

export function ReportProblemModal({
  bookingId,
  onClose,
  onSuccess,
}: {
  bookingId: string;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [issueType, setIssueType] = useState<"dispute" | "claim">("dispute");
  const [disputeType, setDisputeType] = useState<DisputeType>("service_quality");
  const [claimType, setClaimType] = useState<ClaimType>("pet_injury");
  const [description, setDescription] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (description.trim().length < MIN_DESCRIPTION) {
      toast.error(`Description must be at least ${MIN_DESCRIPTION} characters.`);
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.set("bookingId", bookingId);
    formData.set("issueType", issueType);
    formData.set("disputeType", issueType === "dispute" ? disputeType : "");
    formData.set("claimType", issueType === "claim" ? claimType : "");
    formData.set("description", description.trim());
    photoFiles.forEach((file, i) => formData.append(`photos[${i}]`, file));
    const result = await reportProblem(formData);
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Report submitted. The other party has been notified and has 48 hours to respond.");
    onSuccess?.();
    onClose();
    router.refresh();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
    setPhotoFiles((prev) => [...prev, ...files].slice(0, MAX_PHOTOS));
  }

  function removePhoto(i: number) {
    setPhotoFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius-lg)] border p-6 shadow-lg"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
            Report a Problem
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-[var(--color-background)]"
            style={{ color: "var(--color-text-secondary)" }}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
              Issue type
            </label>
            <div className="mt-2 flex gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="issueType"
                  checked={issueType === "dispute"}
                  onChange={() => setIssueType("dispute")}
                  className="rounded"
                />
                <span style={{ color: "var(--color-text)" }}>Dispute</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="issueType"
                  checked={issueType === "claim"}
                  onChange={() => setIssueType("claim")}
                  className="rounded"
                />
                <span style={{ color: "var(--color-text)" }}>Guarantee Claim</span>
              </label>
            </div>
          </div>

          {issueType === "dispute" ? (
            <div>
              <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                Dispute type
              </label>
              <select
                value={disputeType}
                onChange={(e) => setDisputeType(e.target.value as DisputeType)}
                className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-background)",
                  color: "var(--color-text)",
                }}
              >
                {DISPUTE_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                Claim type
              </label>
              <select
                value={claimType}
                onChange={(e) => setClaimType(e.target.value as ClaimType)}
                className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-background)",
                  color: "var(--color-text)",
                }}
              >
                {CLAIM_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="report-desc" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
              Description (min {MIN_DESCRIPTION} characters)
            </label>
            <textarea
              id="report-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
              minLength={MIN_DESCRIPTION}
              className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-background)",
                color: "var(--color-text)",
              }}
            />
            <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-secondary)" }}>
              {description.length} / {MIN_DESCRIPTION}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
              Photos (up to {MAX_PHOTOS} for evidence)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onFileChange}
              className="mt-1 block w-full text-sm"
              style={{ color: "var(--color-text)" }}
            />
            {photoFiles.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-2">
                {photoFiles.map((f, i) => (
                  <li key={i} className="flex items-center gap-1 rounded border px-2 py-1 text-xs" style={{ borderColor: "var(--color-border)" }}>
                    {f.name}
                    <button type="button" onClick={() => removePhoto(i)} className="text-[var(--color-error)] hover:underline">
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting || description.trim().length < MIN_DESCRIPTION}
              className="flex-1 rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
            >
              {submitting ? "Submitting…" : "Submit report"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm font-medium"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
