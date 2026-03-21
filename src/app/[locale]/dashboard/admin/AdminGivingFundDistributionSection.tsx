"use client";

import { Fragment, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import type { DistributionPreview, PastDistributionRow } from "@/lib/giving/distribution-shared";
import { approveDistribution, markDistributionCompleted } from "@/lib/giving/distribution-actions";

const eur = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatEurCents(cents: number): string {
  return eur.format(cents / 100);
}

type Props = {
  preview: DistributionPreview;
  past: PastDistributionRow[];
  loadError?: string;
  /** Shown when preview loaded but past list failed (non-fatal). */
  pastLoadError?: string;
};

export function AdminGivingFundDistributionSection({ preview, past, loadError, pastLoadError }: Props) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingPaidId, setPendingPaidId] = useState<string | null>(null);
  const [approving, startApprove] = useTransition();

  function toggleExpand(id: string) {
    setExpandedId((x) => (x === id ? null : id));
  }

  async function handleApprove() {
    startApprove(async () => {
      const result = await approveDistribution();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.message) toast.success(result.message);
      router.refresh();
    });
  }

  async function handleMarkPaid(id: string) {
    setPendingPaidId(id);
    const result = await markDistributionCompleted(id);
    setPendingPaidId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Marked as paid.");
    router.refresh();
  }

  if (loadError) {
    return (
      <section
        className="mt-8 rounded-[var(--radius-lg)] border p-6 sm:p-8"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}
      >
        <p className="text-sm" style={{ color: "var(--color-error)", fontFamily: "var(--font-body), sans-serif" }}>
          {loadError}
        </p>
      </section>
    );
  }

  return (
    <section
      className="mt-8 rounded-[var(--radius-lg)] border p-6 sm:p-8"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}
    >
      <h2
        className="text-lg font-normal"
        style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
      >
        Giving Fund Distribution
      </h2>
      <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
        Review the Tinies Giving Fund (platform commission with no charity attribution), approve equal splits to verified
        charities, and track payout status. Transfers are manual until Stripe Connect is wired.
      </p>

      <div
        className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        style={{ fontFamily: "var(--font-body), sans-serif" }}
      >
        <div className="rounded-[var(--radius-lg)] border p-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
            Unallocated (after completed payouts)
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums" style={{ color: "var(--color-text)" }}>
            {formatEurCents(preview.unallocatedCents)}
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border p-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
            Locked (pending / processing)
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums" style={{ color: "var(--color-text)" }}>
            {formatEurCents(preview.pendingOrProcessingLockedCents)}
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border p-4" style={{ borderColor: "var(--color-primary-200)", backgroundColor: "var(--color-primary-50)" }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-primary)" }}>
            Available to allocate now
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums" style={{ color: "var(--color-primary)" }}>
            {formatEurCents(preview.availableForDistributionCents)}
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border p-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
            Fund in (commission, all time)
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums" style={{ color: "var(--color-text)" }}>
            {formatEurCents(preview.platformCommissionToFundCents)}
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
            Completed distributions: {formatEurCents(preview.distributedCompletedCents)}
          </p>
        </div>
      </div>

      <h3 className="mt-10 text-base font-semibold" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
        Pending distribution (preview)
      </h3>
      <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Method: <strong>equal</strong> split among verified active charities. Donation counts are direct gifts to each charity this
        calendar month (UTC), all sources.
      </p>

      {!preview.canApprove && preview.approveBlockedReason && (
        <p className="mt-3 rounded-[var(--radius-lg)] border px-4 py-3 text-sm" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-warning-bg)", color: "var(--color-text)" }}>
          {preview.approveBlockedReason}
        </p>
      )}

      <div className="mt-4 overflow-x-auto rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--color-border)" }}>
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                Charity
              </th>
              <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                Proposed share
              </th>
              <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                Direct donations (this month)
              </th>
              <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                Count
              </th>
              <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                Total w/ share
              </th>
            </tr>
          </thead>
          <tbody>
            {preview.charityRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center" style={{ color: "var(--color-text-secondary)" }}>
                  No verified active charities.
                </td>
              </tr>
            ) : (
              preview.charityRows.map((row) => (
                <tr key={row.charityId} className="border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
                  <td className="px-3 py-3 font-medium" style={{ color: "var(--color-text)" }}>
                    {row.charityName}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums" style={{ color: "var(--color-text)" }}>
                    {formatEurCents(row.proposedShareCents)}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums" style={{ color: "var(--color-text)" }}>
                    {formatEurCents(row.directDonationsTotalCentsThisMonth)}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums" style={{ color: "var(--color-text-secondary)" }}>
                    {row.directDonationCountThisMonth}
                  </td>
                  <td className="px-3 py-3 text-right font-medium tabular-nums" style={{ color: "var(--color-text)" }}>
                    {formatEurCents(row.totalWithShareCents)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={handleApprove}
          disabled={!preview.canApprove || approving}
          className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ fontFamily: "var(--font-body), sans-serif" }}
        >
          {approving ? "Approving…" : "Approve distribution"}
        </button>
      </div>

      <h3 className="mt-12 text-base font-semibold" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
        Past distributions
      </h3>
      {pastLoadError ? (
        <p className="mt-2 text-sm" style={{ color: "var(--color-error)", fontFamily: "var(--font-body), sans-serif" }}>
          {pastLoadError}
        </p>
      ) : null}
      <div className="mt-4 overflow-x-auto rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--color-border)" }}>
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
              <th className="w-10 px-2 py-3" aria-label="Expand" />
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                Month
              </th>
              <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                Total
              </th>
              <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                Charities
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                Method
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                Status
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                Approved by
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                Date approved
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {past.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center" style={{ color: "var(--color-text-secondary)" }}>
                  No distributions yet.
                </td>
              </tr>
            ) : (
              past.map((d) => {
                const expanded = expandedId === d.id;
                const canMarkPaid = d.payoutStatus === "pending" || d.payoutStatus === "processing";
                return (
                  <Fragment key={d.id}>
                    <tr className="border-b" style={{ borderColor: "var(--color-border)" }}>
                      <td className="px-2 py-3">
                        <button
                          type="button"
                          onClick={() => toggleExpand(d.id)}
                          className="rounded p-1 hover:bg-[var(--color-background)]"
                          style={{ color: "var(--color-text-secondary)" }}
                          aria-expanded={expanded}
                          aria-label={expanded ? "Collapse breakdown" : "Expand breakdown"}
                        >
                          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="px-3 py-3 font-medium" style={{ color: "var(--color-text)" }}>
                        {d.monthLabel}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums" style={{ color: "var(--color-text)" }}>
                        {formatEurCents(d.totalFundAmountCents)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums" style={{ color: "var(--color-text)" }}>
                        {d.charityCount}
                      </td>
                      <td className="px-3 py-3" style={{ color: "var(--color-text-secondary)" }}>
                        {d.distributionMethod}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className="rounded-[var(--radius-pill)] px-2 py-0.5 text-xs font-medium capitalize"
                          style={{
                            backgroundColor:
                              d.payoutStatus === "completed"
                                ? "var(--color-success-muted)"
                                : d.payoutStatus === "processing"
                                  ? "var(--color-primary-50)"
                                  : "var(--color-warning-bg)",
                            color: d.payoutStatus === "completed" ? "var(--color-success)" : "var(--color-text)",
                          }}
                        >
                          {d.payoutStatus}
                        </span>
                      </td>
                      <td className="px-3 py-3" style={{ color: "var(--color-text-secondary)" }}>
                        {d.approvedByName ?? "—"}
                      </td>
                      <td className="px-3 py-3" style={{ color: "var(--color-text-secondary)" }}>
                        {d.approvedAtIso
                          ? new Date(d.approvedAtIso).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-3 py-3">
                        {canMarkPaid ? (
                          <button
                            type="button"
                            onClick={() => handleMarkPaid(d.id)}
                            disabled={pendingPaidId === d.id}
                            className="text-sm font-semibold underline-offset-2 hover:underline disabled:opacity-50"
                            style={{ color: "var(--color-primary)" }}
                          >
                            {pendingPaidId === d.id ? "Saving…" : "Mark as paid"}
                          </button>
                        ) : (
                          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="border-b" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                        <td colSpan={9} className="px-4 py-4">
                          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                            Per-charity breakdown
                          </p>
                          <ul className="mt-2 space-y-1">
                            {d.breakdown.map((b) => (
                              <li key={b.charityId} className="flex flex-wrap justify-between gap-2 text-sm" style={{ color: "var(--color-text)" }}>
                                <span>{b.charityName}</span>
                                <span className="tabular-nums font-medium">{formatEurCents(b.amountCents)}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
