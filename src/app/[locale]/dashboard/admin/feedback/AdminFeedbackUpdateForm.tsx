"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateFeedbackAdmin } from "@/lib/feedback/admin-actions";
import { FEEDBACK_STATUSES } from "@/lib/validations/feedback";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  reviewed: "Reviewed",
  in_progress: "In progress",
  resolved: "Resolved",
  wont_fix: "Won't fix",
};

type Props = {
  id: string;
  initialStatus: string;
  initialNotes: string | null;
};

export function AdminFeedbackUpdateForm({ id, initialStatus, initialNotes }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await updateFeedbackAdmin({ id, status, adminNotes: notes });
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Feedback updated.");
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
      <div>
        <label htmlFor="fb-status" className="mb-1 block text-sm font-semibold" style={{ fontFamily: "var(--font-body), sans-serif" }}>
          Status
        </label>
        <select
          id="fb-status"
          value={status}
          onChange={(ev) => setStatus(ev.target.value)}
          className="w-full max-w-md rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: "var(--color-border)", fontFamily: "var(--font-body), sans-serif" }}
        >
          {FEEDBACK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s] ?? s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="fb-notes" className="mb-1 block text-sm font-semibold" style={{ fontFamily: "var(--font-body), sans-serif" }}>
          Admin notes
        </label>
        <textarea
          id="fb-notes"
          value={notes}
          onChange={(ev) => setNotes(ev.target.value)}
          rows={5}
          className="w-full rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: "var(--color-border)", fontFamily: "var(--font-body), sans-serif" }}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 max-w-xs items-center justify-center rounded-lg px-5 text-sm font-semibold text-white disabled:opacity-50"
        style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
