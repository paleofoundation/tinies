import Image from "next/image";
import { Link } from "@/i18n/navigation";

const BORDER_TEAL_15 = "rgba(10, 128, 128, 0.15)";

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 01.75-.75h10.19l-3.72-3.72a.75.75 0 111.06-1.06l5 5a.75.75 0 010 1.06l-5 5a.75.75 0 11-1.06-1.06l3.72-3.72H3.75A.75.75 0 013 10z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export type RescueDirectoryCardOrg = {
  slug: string;
  name: string;
  mission: string | null;
  coverPhotoUrl: string | null;
  logoUrl: string | null;
  district: string | null;
  location: string | null;
  verified: boolean;
  inCareListingCount: number;
  totalAnimalsRescued: number | null;
  activeCampaignCount: number;
  speciesLabel: string;
};

function excerptMission(text: string | null, maxLen: number): string {
  const t = text?.trim() ?? "";
  if (!t) return "";
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}

function locationLine(district: string | null, location: string | null): string | null {
  const parts = [district, location].filter((p): p is string => Boolean(p?.trim()));
  if (parts.length === 0) return null;
  return [...new Set(parts)].join(" · ");
}

export function RescueDirectoryCard({ org }: { org: RescueDirectoryCardOrg }) {
  const loc = locationLine(org.district, org.location);
  const imageUrl = org.coverPhotoUrl ?? org.logoUrl;
  const desc = excerptMission(org.mission, 220);
  const reported = org.totalAnimalsRescued ?? 0;
  const listed = org.inCareListingCount;
  const animalNum = Math.max(reported, listed);
  const animalPill = animalNum > 0 ? `${animalNum}+ animals` : "0 animals";

  return (
    <Link
      href={`/rescue/${org.slug}`}
      className={`group grid grid-cols-1 overflow-hidden rounded-[24px] border bg-[var(--color-background)] shadow-[0_2px_8px_rgba(10,128,128,0.06)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(10,128,128,0.08)] ${
        imageUrl ? "md:grid-cols-[clamp(200px,30%,360px)_minmax(0,1fr)]" : ""
      }`}
      style={{ borderColor: BORDER_TEAL_15 }}
    >
      {imageUrl ? (
        <div className="relative min-h-[240px] w-full overflow-hidden max-md:aspect-[16/10] max-md:min-h-[200px]">
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            sizes="(max-width: 768px) 100vw, clamp(200px, 30vw, 360px)"
          />
        </div>
      ) : null}
      <div className="flex flex-col justify-center" style={{ padding: "28px 32px" }}>
        <div className="mb-2 flex flex-wrap items-center gap-2.5">
          <h3
            className="text-[clamp(1.25rem,3vw,1.75rem)] font-black uppercase leading-tight tracking-[-0.03em]"
            style={{ fontFamily: "var(--font-display), sans-serif", color: "#1C1C1C" }}
          >
            {org.name}
          </h3>
          {org.verified ? (
            <span
              className="rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold"
              style={{
                backgroundColor: "rgba(10, 128, 128, 0.08)",
                color: "var(--color-primary)",
                fontFamily: "var(--font-body), sans-serif",
              }}
            >
              ✓ Verified
            </span>
          ) : null}
        </div>
        {loc ? (
          <p className="mb-3 text-[0.8125rem]" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
            {loc}
          </p>
        ) : null}
        {desc ? (
          <p
            className="mb-5 text-[0.9375rem] leading-[1.7]"
            style={{ color: "rgba(28, 28, 28, 0.7)", fontFamily: "var(--font-body), sans-serif" }}
          >
            {desc}
          </p>
        ) : (
          <div className="mb-5" />
        )}
        <div className="mb-4 flex flex-wrap gap-2">
          <span
            className="rounded-full px-3 py-1 text-[0.6875rem] font-semibold"
            style={{
              backgroundColor: "rgba(10, 128, 128, 0.06)",
              color: "var(--color-primary)",
              fontFamily: "var(--font-body), sans-serif",
            }}
          >
            {animalPill}
          </span>
          <span
            className="rounded-full px-3 py-1 text-[0.6875rem] font-semibold"
            style={{
              backgroundColor: "rgba(10, 128, 128, 0.06)",
              color: "rgba(28, 28, 28, 0.5)",
              fontFamily: "var(--font-body), sans-serif",
            }}
          >
            {org.speciesLabel}
          </span>
          {org.activeCampaignCount > 0 ? (
            <span
              className="rounded-full px-3 py-1 text-[0.6875rem] font-semibold"
              style={{
                backgroundColor: "rgba(244, 93, 72, 0.08)",
                color: "var(--color-secondary)",
                fontFamily: "var(--font-body), sans-serif",
              }}
            >
              {org.activeCampaignCount} active campaign{org.activeCampaignCount !== 1 ? "s" : ""}
            </span>
          ) : null}
        </div>
        <span
          className="inline-flex items-center gap-1.5 text-[0.875rem] font-bold"
          style={{ color: "var(--color-secondary)", fontFamily: "var(--font-body), sans-serif" }}
        >
          View profile <ArrowIcon className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
