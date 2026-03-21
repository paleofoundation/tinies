"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MAX_SUCCESS_STORY_PHOTOS, MAX_SUCCESS_STORY_TEXT_LENGTH } from "@/lib/validations/success-story";
import { submitAdoptionSuccessStory } from "@/lib/adoption/success-stories-actions";

type PlacementOption = {
  id: string;
  listingName: string;
  awaitingGalleryApproval: boolean;
};

type Props = {
  placements: PlacementOption[];
  initialPlacementId: string | null;
};

export function ShareSuccessStoryForm({ placements, initialPlacementId }: Props) {
  const router = useRouter();
  const defaultId =
    initialPlacementId && placements.some((p) => p.id === initialPlacementId)
      ? initialPlacementId
      : placements[0]?.id ?? "";
  const [placementId, setPlacementId] = useState(defaultId);
  const [storyText, setStoryText] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!placementId) {
      toast.error("Choose a placement.");
      return;
    }
    const form = e.currentTarget;
    setPending(true);
    const result = await submitAdoptionSuccessStory(new FormData(form));
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Thank you! Your story will appear after your rescue or Tinies approves it.");
    router.refresh();
    setStoryText("");
    form.reset();
    setPlacementId(defaultId);
  }

  const selected = placements.find((p) => p.id === placementId);

  return (
    <form onSubmit={(ev) => void handleSubmit(ev)} className="space-y-6">
      <input type="hidden" name="placementId" value={placementId} />

      <div>
        <label htmlFor="placement" className="block text-sm font-medium" style={{ color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}>
          Adoption
        </label>
        <select
          id="placement"
          value={placementId}
          onChange={(e) => setPlacementId(e.target.value)}
          className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}
          required
        >
          {placements.length === 0 ? <option value="">—</option> : null}
          {placements.map((p) => (
            <option key={p.id} value={p.id}>
              {p.listingName}
              {p.awaitingGalleryApproval ? " (pending approval)" : ""}
            </option>
          ))}
        </select>
        {selected?.awaitingGalleryApproval ? (
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}>
            You already submitted an update for this adoption. You can edit below; it will need approval again before it appears on{" "}
            <Link href="/adopt/tinies-who-made-it" className="font-medium underline" style={{ color: "var(--color-primary)" }}>
              Tinies who made it
            </Link>
            .
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="storyText" className="block text-sm font-medium" style={{ color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}>
          Your story (optional if you add photos)
        </label>
        <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body), sans-serif" }}>
          At least 20 characters, or upload a photo from their new home. Max {MAX_SUCCESS_STORY_TEXT_LENGTH} characters.
        </p>
        <textarea
          id="storyText"
          name="storyText"
          value={storyText}
          onChange={(e) => setStoryText(e.target.value)}
          rows={6}
          maxLength={MAX_SUCCESS_STORY_TEXT_LENGTH}
          className="mt-2 w-full rounded-[var(--radius-lg)] border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}
          placeholder="How are they settling in? What made you fall in love?"
        />
      </div>

      <div>
        <label htmlFor="photos" className="block text-sm font-medium" style={{ color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}>
          Photos from their new home
        </label>
        <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body), sans-serif" }}>
          Up to {MAX_SUCCESS_STORY_PHOTOS} images, 1MB each. Leave empty to keep any photos you already uploaded.
        </p>
        <input
          id="photos"
          name="photos"
          type="file"
          accept="image/*"
          multiple
          className="mt-2 block w-full text-sm file:mr-4 file:rounded-[var(--radius-lg)] file:border-0 file:bg-[var(--color-primary)] file:px-4 file:py-2 file:font-semibold file:text-white"
          style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
        />
      </div>

      <button
        type="submit"
        disabled={pending || placements.length === 0}
        className="h-12 rounded-[var(--radius-pill)] px-8 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-primary)" }}
      >
        {pending ? "Sending…" : "Submit story"}
      </button>
    </form>
  );
}
