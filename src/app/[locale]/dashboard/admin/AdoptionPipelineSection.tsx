"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { PlacementRow } from "./adoptions/actions";

const PLACEMENT_STATUS_LABELS: Record<string, string> = {
  preparing: "Preparing",
  vet_complete: "Vet complete",
  transport_booked: "Transport booked",
  in_transit: "In transit",
  delivered: "Delivered",
  follow_up: "Follow-up",
};

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "preparing", label: "Preparing" },
  { value: "vet_complete", label: "Vet complete" },
  { value: "transport_booked", label: "Transport booked" },
  { value: "in_transit", label: "In transit" },
  { value: "delivered", label: "Delivered" },
  { value: "follow_up", label: "Follow-up" },
];

type Props = {
  placements: PlacementRow[];
};

export function AdoptionPipelineSection({ placements }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("placementStatus") ?? "all";

  function handleFilterChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("placementStatus");
    else params.set("placementStatus", value);
    router.push(`/dashboard/admin?${params.toString()}`);
  }

  return (
    <section
      className="mt-8 rounded-[var(--radius-lg)] border p-8"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2
          className="text-lg font-normal"
          style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
        >
          Adoption Pipeline
        </h2>
        <div className="flex items-center gap-3">
          <label htmlFor="placement-status" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
            Status:
          </label>
          <select
            id="placement-status"
            value={currentFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="rounded-[var(--radius-lg)] border px-3 py-2 text-sm focus:outline-none focus:ring-2"
            style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Link
            href="/dashboard/admin/transport"
            className="text-sm font-semibold hover:underline"
            style={{ color: "var(--color-primary)" }}
          >
            Transport providers
          </Link>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--color-border)" }}>
              <th className="pb-3 pr-4 text-left font-semibold">Animal</th>
              <th className="pb-3 pr-4 text-left font-semibold">Adopter</th>
              <th className="pb-3 pr-4 text-left font-semibold">Destination</th>
              <th className="pb-3 pr-4 text-left font-semibold">Status</th>
              <th className="pb-3 pr-4 text-left font-semibold">Days since created</th>
              <th className="pb-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {placements.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center" style={{ color: "var(--color-text-secondary)" }}>
                  No placements match the filter.
                </td>
              </tr>
            ) : (
              placements.map((row) => (
                <tr key={row.id} className="border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
                  <td className="py-3 pr-4 font-medium">{row.listingName}</td>
                  <td className="py-3 pr-4">{row.adopterName}</td>
                  <td className="py-3 pr-4">{row.destinationCountry}</td>
                  <td className="py-3 pr-4">
                    <span
                      className="rounded-[var(--radius-pill)] border px-2.5 py-0.5 font-medium"
                      style={{
                        backgroundColor: "var(--color-primary-50)",
                        color: "var(--color-primary)",
                        borderColor: "var(--color-primary-200)",
                      }}
                    >
                      {PLACEMENT_STATUS_LABELS[row.status] ?? row.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">{row.daysSinceCreated} days</td>
                  <td className="py-3">
                    <Link
                      href={`/dashboard/admin/adoptions/placements/${row.id}`}
                      className="font-semibold hover:underline"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
