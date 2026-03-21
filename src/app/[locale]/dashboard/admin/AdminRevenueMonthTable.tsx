"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { RevenueMonthRow } from "@/lib/admin/revenue-actions";

const eur = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatEurCents(cents: number): string {
  return eur.format(cents / 100);
}

type SortKey =
  | "yearMonth"
  | "bookingsCount"
  | "bookingRevenueCents"
  | "commissionCents"
  | "commissionToRescueCents"
  | "commissionRetainedCents"
  | "adoptionCoordinationFeesCents"
  | "totalRevenueCents";

type Props = {
  rows: RevenueMonthRow[];
};

export function AdminRevenueMonthTable({ rows }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("yearMonth");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp =
        typeof av === "string" && typeof bv === "string"
          ? av.localeCompare(bv)
          : Number(av) - Number(bv);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  function toggle(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "yearMonth" ? "desc" : "desc");
    }
  }

  const thClass =
    "px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide select-none";
  const thStyle = { fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" };

  return (
    <div className="mt-6 overflow-x-auto rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--color-border)" }}>
      <table className="w-full min-w-[920px] text-sm">
        <thead>
          <tr className="border-b" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
            <th className={thClass} style={thStyle}>
              <button type="button" className="inline-flex cursor-pointer items-center gap-1 hover:underline" onClick={() => toggle("yearMonth")}>
                Month
                {sortKey === "yearMonth" && (sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />)}
              </button>
            </th>
            {(
              [
                ["bookingsCount", "Bookings"],
                ["bookingRevenueCents", "Booking revenue"],
                ["commissionCents", "Commission"],
                ["commissionToRescueCents", "To rescue (90%)"],
                ["commissionRetainedCents", "Retained (10%)"],
                ["adoptionCoordinationFeesCents", "Adoption fees"],
                ["totalRevenueCents", "Total revenue"],
              ] as const
            ).map(([key, label]) => (
              <th key={key} className={thClass} style={thStyle}>
                <button type="button" className="inline-flex cursor-pointer items-center gap-1 hover:underline" onClick={() => toggle(key)}>
                  {label}
                  {sortKey === key && (sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />)}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-3 py-8 text-center" style={{ color: "var(--color-text-secondary)" }}>
                No completed booking or placement data in this range.
              </td>
            </tr>
          ) : (
            sorted.map((r) => (
              <tr key={r.yearMonth} className="border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
                <td className="px-3 py-3 font-medium" style={{ color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}>
                  {r.label}
                </td>
                <td className="px-3 py-3 tabular-nums" style={{ color: "var(--color-text)" }}>
                  {r.bookingsCount}
                </td>
                <td className="px-3 py-3 tabular-nums" style={{ color: "var(--color-text)" }}>
                  {formatEurCents(r.bookingRevenueCents)}
                </td>
                <td className="px-3 py-3 tabular-nums" style={{ color: "var(--color-text)" }}>
                  {formatEurCents(r.commissionCents)}
                </td>
                <td className="px-3 py-3 tabular-nums" style={{ color: "var(--color-text)" }}>
                  {formatEurCents(r.commissionToRescueCents)}
                </td>
                <td className="px-3 py-3 tabular-nums" style={{ color: "var(--color-text)" }}>
                  {formatEurCents(r.commissionRetainedCents)}
                </td>
                <td className="px-3 py-3 tabular-nums" style={{ color: "var(--color-text)" }}>
                  {formatEurCents(r.adoptionCoordinationFeesCents)}
                </td>
                <td className="px-3 py-3 tabular-nums font-medium" style={{ color: "var(--color-text)" }}>
                  {formatEurCents(r.totalRevenueCents)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
