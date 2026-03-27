import Link from "next/link";
import type { GivingRescuePartnerCard } from "@/lib/giving/giving-ledger-shared";

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

export function GivingRescuePartnerCard({ p }: { p: GivingRescuePartnerCard }) {
  return (
    <Link
      href={`/rescue/${p.slug}`}
      className="block rounded-[22px] border bg-[var(--color-background)] p-6 shadow-[0_2px_8px_rgba(10,128,128,0.06)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(10,128,128,0.08)]"
      style={{ borderColor: BORDER_TEAL_15 }}
    >
      <p className="mb-2 text-base font-bold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
        {p.name}
      </p>
      {p.missionExcerpt ? (
        <p className="mb-4 text-[0.8125rem] leading-relaxed" style={{ color: "rgba(28, 28, 28, 0.7)", fontFamily: "var(--font-body), sans-serif" }}>
          {p.missionExcerpt}
        </p>
      ) : null}
      <div className="flex items-end justify-between gap-3 border-t pt-3.5" style={{ borderColor: BORDER_TEAL_15 }}>
        <div>
          {p.receivedThroughTiniesCents === null ? (
            <div className="text-[1.125rem] font-extrabold" style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}>
              Just joined
            </div>
          ) : (
            <>
              <div className="text-[1.125rem] font-extrabold tabular-nums" style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}>
                {formatEurCents(p.receivedThroughTiniesCents)}
              </div>
              <div className="mt-1 text-[0.6875rem]" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
                received through Tinies
              </div>
            </>
          )}
        </div>
        <span
          className="inline-flex shrink-0 items-center gap-1 text-[0.75rem] font-bold"
          style={{ color: "var(--color-secondary)", fontFamily: "var(--font-body), sans-serif" }}
        >
          View <ArrowIcon className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
