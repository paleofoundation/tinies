import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, PawPrint } from "lucide-react";
import type { AdoptBrowseListing } from "@/lib/adoption/available-listings";

function formatLabel(value: string | null | undefined): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

type Props = {
  listing: AdoptBrowseListing;
};

export function AdoptionListingCard({ listing }: Props) {
  const photos = Array.isArray(listing.photos) ? listing.photos : [];
  const photo = photos[0];
  const speciesLabel = formatLabel(listing.species) || "Pet";
  const sexLabel = formatLabel(listing.sex);

  return (
    <article
      className="group rounded-[var(--radius-lg)] border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}
    >
      <Link
        href={`/adopt/${listing.slug}`}
        className="block rounded-t-[var(--radius-lg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
      >
        <div
          className="relative h-40 overflow-hidden rounded-t-[var(--radius-lg)] border-b group-hover:bg-[var(--color-primary-50)]"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}
        >
          {photo ? (
            <Image
              src={photo}
              alt={`${listing.name}, ${speciesLabel}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center" aria-hidden>
              <PawPrint className="h-16 w-16" style={{ color: "var(--color-primary-300)" }} strokeWidth={1.25} />
            </div>
          )}
        </div>
      </Link>
      <div className="p-8" style={{ padding: "var(--space-card)" }}>
        <Link href={`/adopt/${listing.slug}`}>
          <h3 className="font-semibold hover:underline" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
            {listing.name}
          </h3>
        </Link>
        <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          {speciesLabel}
          {listing.breed ? ` · ${listing.breed}` : ""}
        </p>
        <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          {listing.estimatedAge ?? "Age TBC"}
          {sexLabel ? ` · ${sexLabel}` : ""}
        </p>
        <p className="mt-2 flex flex-wrap items-center gap-x-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {listing.org.verified ? (
            <Link href={`/rescue/${listing.org.slug}`} className="font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
              {listing.org.name}
            </Link>
          ) : (
            <span>{listing.org.name}</span>
          )}
          {listing.org.location ? <span> · {listing.org.location}</span> : null}
        </p>
        <Link
          href={`/adopt/${listing.slug}`}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] px-4 font-semibold text-white transition-opacity group-hover:opacity-90"
          style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", backgroundColor: "var(--color-secondary)" }}
        >
          <Heart className="h-4 w-4" aria-hidden />
          Adopt this Tiny
        </Link>
      </div>
    </article>
  );
}
