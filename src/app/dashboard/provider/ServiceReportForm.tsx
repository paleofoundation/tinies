"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { uploadServiceReportPhoto, submitServiceReport, type SubmitServiceReportInput } from "./actions";
import type { ProviderBookingCard } from "./actions";

const ACTIVITY_OPTIONS = [
  { id: "fed", label: "Fed" },
  { id: "watered", label: "Watered" },
  { id: "walked", label: "Walked" },
  { id: "played", label: "Played" },
  { id: "medication", label: "Medication given" },
] as const;

export function ServiceReportForm({ booking }: { booking: ProviderBookingCard }) {
  const router = useRouter();
  const [arrivalTime, setArrivalTime] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [notes, setNotes] = useState("");
  const [activities, setActivities] = useState<string[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggleActivity = (id: string) => {
    setActivities((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const remaining = 5 - photoUrls.length;
    if (remaining <= 0) {
      toast.error("Maximum 5 photos.");
      return;
    }
    setUploading(true);
    try {
      for (let i = 0; i < Math.min(files.length, remaining); i++) {
        const res = await uploadServiceReportPhoto(booking.id, files[i]);
        if (res.url) setPhotoUrls((prev) => [...prev, res.url!]);
        else toast.error(res.error ?? "Upload failed");
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const input: SubmitServiceReportInput = {
      arrivalTime: arrivalTime || undefined,
      departureTime: departureTime || undefined,
      notes: notes.trim() || undefined,
      photos: photoUrls,
      activities,
    };
    const result = await submitServiceReport(booking.id, input);
    setSubmitting(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Service report submitted.");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-[var(--radius-lg)] border p-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
      <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>Submit Service Report</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>Arrival time</label>
          <input type="datetime-local" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }} />
        </div>
        <div>
          <label className="block text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>Departure time</label>
          <input type="datetime-local" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="How did the visit go?" className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }} />
      </div>
      <div>
        <span className="block text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>Activities</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {ACTIVITY_OPTIONS.map((opt) => (
            <label key={opt.id} className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-lg)] border px-3 py-1.5 text-sm" style={{ borderColor: "var(--color-border)" }}>
              <input type="checkbox" checked={activities.includes(opt.id)} onChange={() => toggleActivity(opt.id)} className="rounded border-[var(--color-primary)] text-[var(--color-primary)]" />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>Photos (up to 5)</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {photoUrls.map((url, i) => (
            <div key={i} className="relative">
              <img src={url} alt="" className="h-20 w-20 rounded-lg object-cover" />
              <button type="button" onClick={() => setPhotoUrls((p) => p.filter((_, j) => j !== i))} className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">×</button>
            </div>
          ))}
          {photoUrls.length < 5 && (
            <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} disabled={uploading} />
              {uploading ? "…" : "+"}
            </label>
          )}
        </div>
      </div>
      <button type="submit" disabled={submitting} className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70">
        {submitting ? "Saving…" : "Submit report"}
      </button>
    </form>
  );
}
