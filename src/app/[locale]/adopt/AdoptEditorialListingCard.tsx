import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PawPrint } from "lucide-react";
import type { AdoptBrowseListing } from "@/lib/adoption/available-listings";

const BORDER_TEAL_15 = "rgba(10, 128, 128, 0.15)";
const CARD_SHADOW = "0 2px 8px rgba(10, 128, 128, 0.06)";

function formatLabel(value: string | null | undefined): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

type Props = {
  listing: AdoptBrowseListing;
};

export function AdoptEditorialListingCard({ listing }: Props) {
  const photos = Array.isArray(listing.photos) ? listing.photos : [];
  const photo = photos[0];
  const speciesLabel = formatLabel(listing.species) || "Pet";

  return (
    <article
      className="group border bg-white transition-[transform,box-shadow] hover:-translate-y-1"
      style={{ borderColor: BORDER_TEAL_15, boxShadow: CARD_SHADOW }}
    >
      <Link
        href={`/adopt/${listing.slug}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
      >
        <div
          className="relative h-64 w-full overflow-hidden"
          style={{ backgroundColor: "var(--color-background)" }}
        >
          {photo ? (
            <Image
              src={photo}
              alt={`${listing.name}, ${speciesLabel}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.06]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center" aria-hidden>
              <PawPrint className="h-16 w-16" style={{ color: "var(--color-primary-300)" }} strokeWidth={1.25} />
            </div>
          )}
        </div>
      </Link>
      <div className="p-6" style={{ padding: "24px" }}>
        <Link href={`/adopt/${listing.slug}`}>
          <h3
            className="uppercase hover:underline"
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontWeight: 900,
              fontSize: "1.5rem",
              color: "#1C1C1C",
              lineHeight: 1.1,
            }}
          >
            {listing.name}
          </h3>
        </Link>
        <p
          className="mt-2 font-medium"
          style={{
            fontFamily: "var(--font-body), sans-serif",
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: "#0A8080",
          }}
        >
          {listing.breed ? `${listing.breed} · ` : ""}
          {speciesLabel}
        </p>
        <div className="mt-3">
          <span
            className="inline-block rounded-full px-3 py-1 font-semibold"
            style={{
              fontFamily: "var(--font-body), sans-serif",
              fontSize: "0.75rem",
              backgroundColor: "rgba(10,128,128,0.08)",
              color: "#0A8080",
            }}
          >
            {listing.estimatedAge ?? "Age TBC"}
          </span>
        </div>
      </div>
      <div
        className="flex items-start justify-between gap-3 border-t px-6 py-4"
        style={{ borderColor: BORDER_TEAL_15, paddingInline: "24px", paddingBlock: "16px" }}
      >
        <div className="min-w-0 flex-1">
          {listing.org.verified ? (
            <Link
              href={`/rescue/${listing.org.slug}`}
              className="block truncate font-semibold hover:underline"
              style={{
                fontFamily: "var(--font-body), sans-serif",
                fontSize: "0.75rem",
                color: "#1C1C1C",
              }}
            >
              {listing.org.name}
            </Link>
          ) : (
            <span
              className="block truncate font-semibold"
              style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "0.75rem", color: "#1C1C1C" }}
            >
              {listing.org.name}
            </span>
          )}
          {listing.org.location ? (
            <p
              className="mt-1 truncate"
              style={{
                fontFamily: "var(--font-body), sans-serif",
                fontSize: "0.6875rem",
                color: "rgba(28,28,28,0.5)",
              }}
            >
              {listing.org.location}
            </p>
          ) : null}
        </div>
        <Link
          href={`/adopt/${listing.slug}`}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold hover:underline"
          style={{ fontFamily: "var(--font-body), sans-serif", color: "#F45D48" }}
        >
          Meet {listing.name}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
