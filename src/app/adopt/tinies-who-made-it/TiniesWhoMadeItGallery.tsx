"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Copy, Facebook, Share2 } from "lucide-react";
import { toast } from "sonner";

export type GalleryStory = {
  placementId: string;
  animalName: string;
  species: string;
  beforePhoto: string | null;
  afterPhoto: string | null;
  originLabel: string;
  destinationLabel: string;
  quote: string | null;
  adoptedAtIso: string;
  rescueName: string;
  rescueSlug: string;
};

type SpeciesFilter = "all" | "dogs" | "cats";

function speciesCategory(species: string): "dog" | "cat" | "other" {
  const s = species.toLowerCase();
  if (s.includes("dog") || s === "canine") return "dog";
  if (s.includes("cat") || s === "feline") return "cat";
  return "other";
}

function formatAdoptedDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function buildStoryUrl(baseUrl: string, placementId: string): string {
  const u = new URL(baseUrl);
  u.hash = `story-${placementId}`;
  return u.toString();
}

function StoryShareRow({ storyUrl, animalName }: { storyUrl: string; animalName: string }) {
  const text = `A tiny who made it: ${animalName} — ${storyUrl}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(storyUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3" style={{ borderColor: "var(--color-border)" }}>
      <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body), sans-serif" }}>
        Share
      </span>
      <button
        type="button"
        onClick={() => void copyLink()}
        className="inline-flex items-center gap-1 rounded-[var(--radius-lg)] border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-[var(--color-primary-50)]"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}
      >
        <Copy className="h-3.5 w-3.5" aria-hidden />
        Copy link
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-[var(--radius-lg)] border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-[var(--color-primary-50)]"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}
      >
        <Share2 className="h-3.5 w-3.5" aria-hidden />
        WhatsApp
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storyUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-[var(--radius-lg)] border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-[var(--color-primary-50)]"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}
      >
        <Facebook className="h-3.5 w-3.5" aria-hidden />
        Facebook
      </a>
    </div>
  );
}

type Props = {
  stories: GalleryStory[];
  siteBaseUrl: string;
};

export function TiniesWhoMadeItGallery({ stories, siteBaseUrl }: Props) {
  const [species, setSpecies] = useState<SpeciesFilter>("all");

  const filtered = useMemo(() => {
    let list = [...stories];
    if (species === "dogs") {
      list = list.filter((s) => speciesCategory(s.species) === "dog");
    } else if (species === "cats") {
      list = list.filter((s) => speciesCategory(s.species) === "cat");
    }
    list.sort((a, b) => new Date(b.adoptedAtIso).getTime() - new Date(a.adoptedAtIso).getTime());
    return list;
  }, [stories, species]);

  const galleryUrl = `${siteBaseUrl.replace(/\/$/, "")}/adopt/tinies-who-made-it`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 rounded-[var(--radius-lg)] border px-4 py-4 sm:px-6" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
        <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          Species
        </span>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "all" as const, label: "All" },
              { id: "dogs" as const, label: "Dogs" },
              { id: "cats" as const, label: "Cats" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSpecies(opt.id)}
              className="rounded-[var(--radius-pill)] px-4 py-2 text-sm font-medium transition-colors"
              style={{
                fontFamily: "var(--font-body), sans-serif",
                ...(species === opt.id
                  ? { backgroundColor: "var(--color-primary)", color: "#fff" }
                  : {
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-text-secondary)",
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: "var(--color-border)",
                    }),
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <span className="text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}>
          Sorted by most recent
        </span>
      </div>

      <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((s) => {
          const storyUrl = buildStoryUrl(galleryUrl, s.placementId);
          return (
            <article
              key={s.placementId}
              id={`story-${s.placementId}`}
              className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border transition-shadow hover:shadow-[var(--shadow-md)]"
              style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
            >
              <div className="grid grid-cols-1 gap-0 sm:grid-cols-2">
                <div className="relative aspect-[4/3] border-b sm:border-b-0 sm:border-r" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                  <span className="absolute left-2 top-2 z-10 rounded-[var(--radius-pill)] bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
                    Before
                  </span>
                  {s.beforePhoto ? (
                    <Image src={s.beforePhoto} alt={`${s.animalName} before adoption`} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
                  ) : (
                    <div className="flex h-full min-h-[160px] items-center justify-center text-sm" style={{ color: "var(--color-text-muted)" }}>
                      No listing photo
                    </div>
                  )}
                </div>
                <div className="relative aspect-[4/3]" style={{ backgroundColor: "var(--color-background)" }}>
                  <span className="absolute left-2 top-2 z-10 rounded-[var(--radius-pill)] bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
                    {s.afterPhoto ? "After" : "Home"}
                  </span>
                  {s.afterPhoto ? (
                    <Image src={s.afterPhoto} alt={`${s.animalName} in their new home`} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
                  ) : s.beforePhoto ? (
                    <Image src={s.beforePhoto} alt={`${s.animalName}`} fill className="object-cover opacity-90" sizes="(max-width: 640px) 100vw, 50vw" />
                  ) : (
                    <div className="flex h-full min-h-[160px] items-center justify-center text-sm" style={{ color: "var(--color-text-muted)" }}>
                      Photo coming soon
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6" style={{ padding: "var(--space-card)" }}>
                <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
                  {s.animalName}
                </h2>
                <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                  From {s.originLabel} to {s.destinationLabel}
                </p>
                {s.quote ? (
                  <blockquote className="mt-3 border-l-2 pl-3 text-sm italic leading-relaxed" style={{ borderColor: "var(--color-primary)", color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}>
                    &ldquo;{s.quote}&rdquo;
                  </blockquote>
                ) : null}
                <p className="mt-3 text-xs" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}>
                  Adopted {formatAdoptedDate(s.adoptedAtIso)}
                </p>
                <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                  <span className="text-[var(--color-text-muted)]">Rescue: </span>
                  <Link href={`/rescue/${s.rescueSlug}`} className="font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
                    {s.rescueName}
                  </Link>
                </p>
                <StoryShareRow storyUrl={storyUrl} animalName={s.animalName} />
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && stories.length > 0 ? (
        <p className="mt-10 text-center text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          No stories match this filter yet.
        </p>
      ) : null}
    </div>
  );
}
