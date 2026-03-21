import { TrendingDown, TrendingUp } from "lucide-react";
import type { RevenueComparison, RevenueMonthRow, RevenueOverview } from "@/lib/admin/revenue-actions";
import { percentChange } from "@/lib/admin/revenue-actions";
import { AdminRevenueMonthTable } from "./AdminRevenueMonthTable";

const eur = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatEurCents(cents: number): string {
  return eur.format(cents / 100);
}

function ChangeBadge({ previous, current }: { previous: number; current: number }) {
  if (previous === 0 && current === 0) {
    return (
      <span className="text-xs tabular-nums" style={{ color: "var(--color-text-muted)" }}>
        —
      </span>
    );
  }
  if (previous === 0 && current > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-semibold" style={{ color: "#16A34A" }}>
        <TrendingUp className="h-3.5 w-3.5" aria-hidden />
        New
      </span>
    );
  }
  const p = percentChange(previous, current);
  if (p === null) {
    return (
      <span className="text-xs tabular-nums" style={{ color: "var(--color-text-muted)" }}>
        —
      </span>
    );
  }
  const up = p >= 0;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums"
      style={{ color: up ? "#16A34A" : "#DC2626" }}
    >
      {up ? <TrendingUp className="h-3.5 w-3.5" aria-hidden /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden />}
      {up ? "+" : ""}
      {p.toFixed(1)}%
    </span>
  );
}

function SummaryCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div
      className="rounded-[var(--radius-xl)] border p-5"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body), sans-serif" }}>
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold tabular-nums sm:text-2xl" style={{ color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}>
        {value}
      </p>
      {sub && (
        <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function ComparisonRow({
  label,
  current,
  previous,
  format = formatEurCents,
}: {
  label: string;
  current: number;
  previous: number;
  format?: (n: number) => string;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 border-b py-3 last:border-0 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center" style={{ borderColor: "var(--color-border)" }}>
      <span className="text-sm font-medium" style={{ color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}>
        {label}
      </span>
      <span className="text-sm tabular-nums sm:text-right" style={{ color: "var(--color-text)" }}>
        This month: <strong>{format(current)}</strong>
      </span>
      <span className="text-sm tabular-nums sm:text-right" style={{ color: "var(--color-text-secondary)" }}>
        Last month: {format(previous)}
      </span>
      <div className="sm:justify-self-end">
        <ChangeBadge previous={previous} current={current} />
      </div>
    </div>
  );
}

type Props = {
  overview: RevenueOverview;
  comparison: RevenueComparison;
  monthlyRows: RevenueMonthRow[];
};

export function AdminRevenueSection({ overview, comparison, monthlyRows }: Props) {
  const { current: cur, previous: prev } = comparison;
  const ledgerDelta = overview.commissionToRescueCents - overview.ledgerPlatformCommissionCents;
  const ledgerNote =
    Math.abs(ledgerDelta) <= 100
      ? "Aligned with giving ledger (platform commission donations), within €1."
      : `Giving ledger (platform commission recorded): ${formatEurCents(overview.ledgerPlatformCommissionCents)}. Difference vs 90% calc: ${formatEurCents(Math.abs(ledgerDelta))}${ledgerDelta > 0 ? " (ledger lower)" : " (ledger higher)"}.`;

  return (
    <section
      className="mt-8 rounded-[var(--radius-lg)] border p-6 sm:p-8"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}
    >
      <h2
        className="text-lg font-normal"
        style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
      >
        Revenue
      </h2>
      <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
        Completed bookings and completed adoptions (UTC months). Amounts ex VAT as stored (cents).
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <SummaryCard label="Completed bookings (all time)" value={String(overview.completedBookingsCount)} />
        <SummaryCard label="Booking revenue (GMV)" value={formatEurCents(overview.bookingRevenueCents)} />
        <SummaryCard label="Commission earned" value={formatEurCents(overview.commissionCents)} />
        <SummaryCard
          label="Commission to rescue (90%)"
          value={formatEurCents(overview.commissionToRescueCents)}
          sub={ledgerNote}
        />
        <SummaryCard label="Commission retained (10%)" value={formatEurCents(overview.commissionRetainedCents)} />
        <SummaryCard label="Adoption coordination fees" value={formatEurCents(overview.adoptionCoordinationFeesCents)} />
        <SummaryCard
          label="Total revenue (bookings + adoption)"
          value={formatEurCents(overview.totalRevenueCents)}
          sub="Booking GMV plus coordination fees; commission is part of booking flow, not double-counted here."
        />
      </div>

      <div
        className="mt-10 rounded-[var(--radius-lg)] border p-5"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}
      >
        <h3 className="text-base font-semibold" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
          This month vs last month
        </h3>
        <div className="mt-4">
          <ComparisonRow label="Completed bookings" current={cur.completedBookingsCount} previous={prev.completedBookingsCount} format={(n) => String(n)} />
          <ComparisonRow label="Booking revenue" current={cur.bookingRevenueCents} previous={prev.bookingRevenueCents} />
          <ComparisonRow label="Commission" current={cur.commissionCents} previous={prev.commissionCents} />
          <ComparisonRow label="To rescue (90%)" current={cur.commissionToRescueCents} previous={prev.commissionToRescueCents} />
          <ComparisonRow label="Retained (10%)" current={cur.commissionRetainedCents} previous={prev.commissionRetainedCents} />
          <ComparisonRow label="Adoption coordination fees" current={cur.adoptionCoordinationFeesCents} previous={prev.adoptionCoordinationFeesCents} />
          <ComparisonRow label="Total revenue" current={cur.totalRevenueCents} previous={prev.totalRevenueCents} />
        </div>
      </div>

      <h3 className="mt-10 text-base font-semibold" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
        Monthly revenue (last 12 months)
      </h3>
      <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}>
        Bookings attributed to the month they were marked completed (<code className="text-xs">updatedAt</code>). Placements by completion month.
      </p>
      <AdminRevenueMonthTable rows={monthlyRows} />
    </section>
  );
}
