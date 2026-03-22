import Image from "next/image";
import Link from "next/link";
import {
  Utensils,
  Droplets,
  Pill,
  CircleDot,
  PartyPopper,
  Moon,
  MoreHorizontal,
} from "lucide-react";
import type { TiniesCardPublicPayload } from "@/lib/tinies-card/load-card";
import { TiniesCardShareRow } from "./TiniesCardShareRow";

const SERVICE_LABELS: Record<string, string> = {
  walking: "Dog walking",
  sitting: "Pet sitting",
  boarding: "Overnight boarding",
  drop_in: "Drop-in visit",
  daycare: "Daycare",
};

const MOOD_LABEL: Record<string, string> = {
  happy: "Happy",
  calm: "Calm",
  playful: "Playful",
  tired: "Tired",
  anxious: "Anxious",
};

function activityIcon(type: string) {
  switch (type) {
    case "pee":
    case "poo":
      return <CircleDot className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />;
    case "food":
      return <Utensils className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />;
    case "water":
      return <Droplets className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />;
    case "medication":
      return <Pill className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />;
    case "play":
      return <PartyPopper className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />;
    case "rest":
      return <Moon className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />;
    default:
      return <MoreHorizontal className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />;
  }
}

function formatWhen(d: Date): string {
  return new Date(d).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  card: TiniesCardPublicPayload;
  shareUrl?: string;
  showBrandingCta?: boolean;
};

export function TiniesCardView({ card, shareUrl, showBrandingCta }: Props) {
  const serviceLabel = SERVICE_LABELS[card.serviceType] ?? card.serviceType;
  const petName = card.petNames.join(", ");
  const route =
    Array.isArray(card.walkRouteJson) && card.walkRouteJson.length > 0
      ? (card.walkRouteJson as { lat: number; lng: number }[])
      : [];
  let centerLat = 34.7;
  let centerLng = 33.0;
  if (route.length > 0) {
    const sum = route.reduce(
      (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
      { lat: 0, lng: 0 }
    );
    centerLat = sum.lat / route.length;
    centerLng = sum.lng / route.length;
  }
  const mapKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const embedUrl =
    mapKey && route.length > 0
      ? `https://www.google.com/maps/embed/v1/view?key=${encodeURIComponent(mapKey)}&center=${centerLat},${centerLng}&zoom=14`
      : null;

  return (
    <div className="space-y-10" style={{ fontFamily: "var(--font-body), sans-serif" }}>
      <header>
        <p className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>
          Tinies Card
        </p>
        <h1
          className="mt-2 font-normal text-2xl sm:text-3xl"
          style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
        >
          {petName} · {serviceLabel}
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          With {card.providerName}
        </p>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
          {formatWhen(card.startedAt)} – {formatWhen(card.endedAt)} · {card.durationMinutes} min
        </p>
        {shareUrl ? (
          <div className="mt-6">
            <TiniesCardShareRow shareUrl={shareUrl} title={`${petName}'s Tinies Card on Tinies`} />
          </div>
        ) : null}
      </header>

      {card.photos.length > 0 ? (
        <section aria-label="Photos">
          <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
            Photos
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {card.photos.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)] border"
                style={{ borderColor: "var(--color-border)" }}
              >
                <Image src={url} alt="" fill className="object-cover" sizes="(max-width: 640px) 50vw, 200px" unoptimized />
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {card.serviceType === "walking" && (card.walkMapImageUrl || embedUrl) ? (
        <section aria-label="Walk map">
          <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
            Walk route
          </h2>
          {card.walkMapImageUrl ? (
            <div className="relative mt-4 aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--color-border)" }}>
              <Image src={card.walkMapImageUrl} alt="Walk route map" fill className="object-cover" sizes="100vw" unoptimized />
            </div>
          ) : null}
          {embedUrl ? (
            <iframe
              title="Walk area map"
              className="mt-4 h-64 w-full rounded-[var(--radius-lg)] border"
              style={{ borderColor: "var(--color-border)" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={embedUrl}
            />
          ) : null}
          <div className="mt-2 flex flex-wrap gap-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {card.walkDistanceKm != null && <span>{card.walkDistanceKm.toFixed(2)} km</span>}
          </div>
        </section>
      ) : null}

      <section aria-label="Activity log">
        <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
          Activity log
        </h2>
        <ul className="mt-4 space-y-3">
          {card.activities.length === 0 ? (
            <li className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              No activities logged.
            </li>
          ) : (
            card.activities.map((a, i) => (
              <li
                key={`${a.type}-${a.time}-${i}`}
                className="flex gap-3 rounded-[var(--radius-lg)] border p-3"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
              >
                {activityIcon(a.type)}
                <div>
                  <p className="text-sm font-semibold capitalize" style={{ color: "var(--color-text)" }}>
                    {a.type} · {a.time}
                  </p>
                  {a.notes?.trim() ? (
                    <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      {a.notes.trim()}
                    </p>
                  ) : null}
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
          Mood
        </h2>
        <p className="mt-2 inline-flex rounded-[var(--radius-pill)] border px-4 py-1.5 text-sm font-medium" style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}>
          {MOOD_LABEL[card.mood] ?? card.mood}
        </p>
      </section>

      {card.personalNote.trim() ? (
        <section>
          <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
            Note from {card.providerName}
          </h2>
          <blockquote
            className="mt-4 border-l-4 pl-4 text-base leading-relaxed"
            style={{ borderColor: "var(--color-primary)", color: "var(--color-text-secondary)" }}
          >
            {card.personalNote.trim()}
          </blockquote>
        </section>
      ) : null}

      {showBrandingCta ? (
        <footer
          className="rounded-[var(--radius-xl)] border px-6 py-8 text-center"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <p className="font-medium" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
            Tinies
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Book trusted pet care at{" "}
            <Link href="https://tinies.app" className="font-semibold underline" style={{ color: "var(--color-primary)" }}>
              tinies.app
            </Link>
          </p>
        </footer>
      ) : null}
    </div>
  );
}
