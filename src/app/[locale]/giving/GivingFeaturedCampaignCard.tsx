import Image from "next/image";
import Link from "next/link";
import type { FeaturedCampaignCard } from "@/lib/campaign/campaign-public";

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

const eur = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatEurCents(cents: number): string {
  return eur.format(cents / 100);
}

export function GivingFeaturedCampaignCard({ c }: { c: FeaturedCampaignCard }) {
  return (
    <Link
      href={`/rescue/${c.orgSlug}/campaign/${c.slug}`}
      className="group block overflow-hidden rounded-[24px] border bg-[var(--color-background)] shadow-[0_2px_8px_rgba(10,128,128,0.06)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(10,128,128,0.08)]"
      style={{ borderColor: BORDER_TEAL_15 }}
    >
      <div className="relative h-[200px] w-full overflow-hidden" style={{ backgroundColor: "var(--color-primary-50)" }}>
        {c.coverPhotoUrl ? (
          <Image
            src={c.coverPhotoUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : null}
      </div>
      <div className="p-6">
        <p className="mb-1.5 text-[0.75rem] font-semibold" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
          {c.orgName}
        </p>
        <p className="text-[1.125rem] font-bold leading-snug" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
          {c.title}
        </p>
        {c.subtitle ? (
          <p className="mt-2 text-[0.8125rem] leading-relaxed" style={{ color: "rgba(28, 28, 28, 0.7)", fontFamily: "var(--font-body), sans-serif" }}>
            {c.subtitle}
          </p>
        ) : null}
        <div
          className="mt-4 flex items-center justify-between gap-3 border-t pt-3.5"
          style={{ borderColor: BORDER_TEAL_15 }}
        >
          <p className="text-[0.8125rem]" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
            {formatEurCents(c.raisedAmountCents)} raised · {c.donorCount} supporters
          </p>
          <span
            className="inline-flex shrink-0 items-center gap-1 text-[0.75rem] font-bold"
            style={{ color: "var(--color-secondary)", fontFamily: "var(--font-body), sans-serif" }}
          >
            Support <ArrowIcon className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
