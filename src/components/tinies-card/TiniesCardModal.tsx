"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, ImagePlus, Smile, Moon, Zap, BatteryLow, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { ProviderBookingCard } from "@/lib/utils/provider-helpers";
import {
  MAX_TINIES_CARD_PHOTOS,
  MAX_TINIES_CARD_PERSONAL_NOTE,
  TINIES_CARD_ACTIVITY_TYPES,
  type TiniesCardActivityType,
  type TiniesCardMood,
} from "@/lib/validations/tinies-card";
import { submitTiniesCard, uploadTiniesCardPhoto } from "@/lib/tinies-card/actions";

type ActivityRow = { type: TiniesCardActivityType; time: string; notes: string };

function nowTimeString(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const ACTIVITY_LABELS: Record<TiniesCardActivityType, string> = {
  pee: "Pee",
  poo: "Poo",
  food: "Food",
  water: "Water",
  medication: "Medication",
  play: "Play",
  rest: "Rest",
  other: "Other",
};

const MOOD_CONFIG: { value: TiniesCardMood; label: string; Icon: typeof Smile }[] = [
  { value: "happy", label: "Happy", Icon: Smile },
  { value: "calm", label: "Calm", Icon: Moon },
  { value: "playful", label: "Playful", Icon: Zap },
  { value: "tired", label: "Tired", Icon: BatteryLow },
  { value: "anxious", label: "Anxious", Icon: AlertTriangle },
];

type Props = {
  booking: ProviderBookingCard;
  open: boolean;
  onClose: () => void;
  /** When true, modal opened automatically (e.g. after ending walk). */
  autoOpenNote?: string;
};

export function TiniesCardModal({ booking, open, onClose, autoOpenNote }: Props) {
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [personalNote, setPersonalNote] = useState("");
  const [mood, setMood] = useState<TiniesCardMood>("happy");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const petLabel = booking.petNames.join(", ");
  const isWalk = booking.serviceType === "walking";

  const addActivity = useCallback((type: TiniesCardActivityType) => {
    setActivities((prev) => [...prev, { type, time: nowTimeString(), notes: "" }]);
  }, []);

  const updateActivity = useCallback((index: number, patch: Partial<ActivityRow>) => {
    setActivities((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }, []);

  const removeActivity = useCallback((index: number) => {
    setActivities((prev) => prev.filter((_, i) => i !== index));
  }, []);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    const room = MAX_TINIES_CARD_PHOTOS - photos.length;
    if (room <= 0) {
      toast.error(`Maximum ${MAX_TINIES_CARD_PHOTOS} photos.`);
      return;
    }
    setUploading(true);
    try {
      for (let i = 0; i < Math.min(files.length, room); i++) {
        const res = await uploadTiniesCardPhoto(booking.id, files[i]!);
        if (res.url) setPhotos((p) => [...p, res.url!]);
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
    const result = await submitTiniesCard(booking.id, {
      activities,
      photos,
      personalNote,
      mood,
    });
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Tinies Card sent! The owner has been notified.");
    setActivities([]);
    setPhotos([]);
    setPersonalNote("");
    setMood("happy");
    onClose();
    router.refresh();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto p-4"
      style={{ backgroundColor: "rgba(28, 28, 28, 0.5)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tinies-card-title"
    >
      <div
        className="relative my-8 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius-xl)] border p-6 shadow-[var(--shadow-lg)]"
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
          id="tinies-card-title"
          className="pr-10 text-lg font-normal"
          style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
        >
          Tinies Card
        </h2>
        <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          {booking.ownerName} · {petLabel} · Complete this report to finish the booking.
        </p>
        {autoOpenNote ? (
          <p className="mt-2 text-sm font-medium" style={{ color: "var(--color-primary)" }}>
            {autoOpenNote}
          </p>
        ) : null}

        {isWalk && (booking.walkSummaryMapUrl || (booking.walkRoute && booking.walkRoute.length > 0)) ? (
          <div className="mt-4 rounded-[var(--radius-lg)] border p-3" style={{ borderColor: "var(--color-border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
              Walk route
            </p>
            {booking.walkSummaryMapUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={booking.walkSummaryMapUrl}
                alt="Walk route map"
                className="mt-2 h-36 w-full rounded-[var(--radius-lg)] object-cover"
              />
            ) : null}
            <div className="mt-2 flex flex-wrap gap-3 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {booking.walkDistanceKm != null && <span>{booking.walkDistanceKm.toFixed(2)} km</span>}
              {booking.walkDurationMinutes != null && <span>{booking.walkDurationMinutes} min</span>}
            </div>
          </div>
        ) : null}

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
              Activity log
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
              Tap to add a row with the current time (editable). Add at least one activity or a personal note.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TINIES_CARD_ACTIVITY_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => addActivity(t)}
                  className="rounded-[var(--radius-lg)] border px-3 py-1.5 text-sm font-medium hover:bg-[var(--color-background)]"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                >
                  {ACTIVITY_LABELS[t]}
                </button>
              ))}
            </div>
            <ul className="mt-4 space-y-3">
              {activities.map((row, i) => (
                <li
                  key={`${i}-${row.type}`}
                  className="flex flex-col gap-2 rounded-[var(--radius-lg)] border p-3 sm:flex-row sm:items-start"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <span className="text-sm font-medium capitalize" style={{ color: "var(--color-text)", minWidth: "5rem" }}>
                    {ACTIVITY_LABELS[row.type]}
                  </span>
                  <input
                    type="text"
                    value={row.time}
                    onChange={(ev) => updateActivity(i, { time: ev.target.value.slice(0, 8) })}
                    placeholder="10:15"
                    className="w-24 rounded border px-2 py-1 text-sm tabular-nums"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                    autoComplete="off"
                  />
                  <input
                    type="text"
                    value={row.notes}
                    onChange={(ev) => updateActivity(i, { notes: ev.target.value })}
                    placeholder="Optional notes"
                    className="min-w-0 flex-1 rounded border px-2 py-1 text-sm"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                  />
                  <button
                    type="button"
                    onClick={() => removeActivity(i)}
                    className="text-sm font-medium text-[var(--color-error)]"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
              Photos
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {photos.map((url, i) => (
                <div key={url} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-24 w-24 rounded-[var(--radius-lg)] object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                    className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full text-xs text-white"
                    style={{ backgroundColor: "var(--color-error)" }}
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ))}
              {photos.length < MAX_TINIES_CARD_PHOTOS && (
                <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed" style={{ borderColor: "var(--color-border)" }}>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => void handleFiles(e)} disabled={uploading} />
                  <span className="flex flex-col items-center gap-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    <ImagePlus className="h-6 w-6" />
                    {uploading ? "…" : "Add"}
                  </span>
                </label>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
              Mood
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {MOOD_CONFIG.map(({ value, label, Icon }) => {
                const active = mood === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMood(value)}
                    className={`inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] border px-3 py-2 text-sm font-medium ${
                      active ? "text-white" : ""
                    }`}
                    style={{
                      borderColor: active ? "var(--color-primary)" : "var(--color-border)",
                      backgroundColor: active ? "var(--color-primary)" : "var(--color-background)",
                      color: active ? "#fff" : "var(--color-text-secondary)",
                    }}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="tinies-personal-note" className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
              Personal note for {booking.ownerName} about {petLabel}&apos;s day
            </label>
            <textarea
              id="tinies-personal-note"
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value.slice(0, MAX_TINIES_CARD_PERSONAL_NOTE))}
              rows={4}
              maxLength={MAX_TINIES_CARD_PERSONAL_NOTE}
              className="mt-2 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
              placeholder="How did it go?"
            />
            <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
              {personalNote.length}/{MAX_TINIES_CARD_PERSONAL_NOTE}
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-[var(--radius-lg)] py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {submitting ? "Submitting…" : "Submit Tinies Card & complete booking"}
          </button>
        </form>
      </div>
    </div>
  );
}
