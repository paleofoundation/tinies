"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, X } from "lucide-react";
import { toast } from "sonner";
import {
  requestMeetAndGreet,
  getOwnerPetsForMeetAndGreet,
} from "@/lib/meet-and-greet/actions";
import type { LocationType } from "@prisma/client";

const LOCATION_OPTIONS: { value: LocationType; label: string }[] = [
  { value: "owner_home", label: "At my home" },
  { value: "provider_home", label: "At provider's home" },
  { value: "neutral", label: "Neutral location" },
  { value: "video", label: "Video call" },
];

export function MeetAndGreetRequestModal({
  providerSlug,
  providerName,
  variant = "default",
}: {
  providerSlug: string;
  providerName: string;
  variant?: "default" | "light";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pets, setPets] = useState<{ id: string; name: string }[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [petIds, setPetIds] = useState<string[]>([]);
  const [requestedDatetime, setRequestedDatetime] = useState("");
  const [locationType, setLocationType] = useState<LocationType>("owner_home");
  const [locationNotes, setLocationNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [open]);

  useEffect(() => {
    if (open) {
      setLoadingPets(true);
      getOwnerPetsForMeetAndGreet().then((res) => {
        setLoadingPets(false);
        if (res.error) {
          toast.error(res.error === "Not signed in." ? "Please sign in to request a Meet & Greet." : res.error);
          if (res.error === "Not signed in.") setOpen(false);
          return;
        }
        setPets(res.pets);
        setPetIds(res.pets.length > 0 ? [res.pets[0].id] : []);
      });
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (petIds.length === 0) {
      toast.error("Select at least one pet.");
      return;
    }
    if (!requestedDatetime.trim()) {
      toast.error("Choose a preferred date and time.");
      return;
    }
    setSubmitting(true);
    const result = await requestMeetAndGreet({
      providerSlug,
      petIds,
      requestedDatetime: new Date(requestedDatetime).toISOString(),
      locationType,
      locationNotes: locationNotes.trim() || null,
    });
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Meet & Greet request sent. The provider will respond soon.");
    setOpen(false);
    router.refresh();
  }

  function togglePet(id: string) {
    setPetIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const minDatetime = new Date();
  minDatetime.setHours(0, 0, 0, 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-pill)] border-2 px-6 font-semibold transition-opacity hover:opacity-90"
        style={
          variant === "light"
            ? {
                fontFamily: "var(--font-body), sans-serif",
                fontSize: "var(--text-base)",
                borderColor: "rgba(255,255,255,0.5)",
                color: "white",
                backgroundColor: "transparent",
              }
            : {
                fontFamily: "var(--font-body), sans-serif",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
                backgroundColor: "white",
              }
        }
      >
        <Heart className="h-4 w-4" />
        Request Meet & Greet
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          aria-modal="true"
          role="dialog"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[var(--radius-lg)] border p-6 shadow-lg"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                Request Meet & Greet with {providerName}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-1 hover:bg-[var(--color-background)]"
                style={{ color: "var(--color-text-secondary)" }}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {loadingPets ? (
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  Loading your pets…
                </p>
              ) : pets.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--color-error)" }}>
                  Add at least one pet in your dashboard before requesting a Meet & Greet.
                </p>
              ) : (
                <div>
                  <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                    Which pets?
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {pets.map((pet) => (
                      <label
                        key={pet.id}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
                        style={{
                          borderColor: petIds.includes(pet.id) ? "var(--color-primary)" : "var(--color-border)",
                          backgroundColor: petIds.includes(pet.id) ? "var(--color-primary-50)" : "var(--color-background)",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={petIds.includes(pet.id)}
                          onChange={() => togglePet(pet.id)}
                          className="rounded"
                        />
                        {pet.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="mng-datetime" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                  Preferred date & time
                </label>
                <input
                  id="mng-datetime"
                  type="datetime-local"
                  value={requestedDatetime}
                  onChange={(e) => setRequestedDatetime(e.target.value)}
                  min={minDatetime.toISOString().slice(0, 16)}
                  className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text)",
                  }}
                />
              </div>

              <div>
                <label htmlFor="mng-location" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                  Location
                </label>
                <select
                  id="mng-location"
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value as LocationType)}
                  className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text)",
                  }}
                >
                  {LOCATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="mng-notes" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                  Notes (optional)
                </label>
                <textarea
                  id="mng-notes"
                  value={locationNotes}
                  onChange={(e) => setLocationNotes(e.target.value)}
                  rows={3}
                  placeholder="Any details for the provider…"
                  className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text)",
                  }}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting || pets.length === 0}
                  className="flex-1 rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
                >
                  {submitting ? "Sending…" : "Send request"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm font-medium"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
