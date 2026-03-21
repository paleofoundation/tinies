"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  adminResolveDispute,
  adminResolveClaim,
  getOpenDisputesForAdmin,
  getOpenClaimsForAdmin,
} from "@/lib/disputes/actions";
import type { AdminClaimRow, AdminDisputeRow } from "@/lib/disputes/dispute-action-types";
import type { DisputeRuling } from "@prisma/client";

const DISPUTE_RULINGS: { value: DisputeRuling; label: string }[] = [
  { value: "no_action", label: "No action" },
  { value: "warning", label: "Warning" },
  { value: "partial_refund", label: "Partial refund" },
  { value: "full_refund", label: "Full refund" },
  { value: "provider_suspended", label: "Provider suspended" },
  { value: "owner_restricted", label: "Owner restricted" },
];

const CLAIM_RULINGS = [
  { value: "approved_full", label: "Approved (full)" },
  { value: "approved_partial", label: "Approved (partial)" },
  { value: "denied", label: "Denied" },
] as const;

function formatEur(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

export function DisputesClaimsSection({
  initialDisputes,
  initialClaims,
}: {
  initialDisputes: AdminDisputeRow[];
  initialClaims: AdminClaimRow[];
}) {
  const router = useRouter();
  const [disputes, setDisputes] = useState(initialDisputes);
  const [claims, setClaims] = useState(initialClaims);
  const [resolvingDisputeId, setResolvingDisputeId] = useState<string | null>(null);
  const [resolvingClaimId, setResolvingClaimId] = useState<string | null>(null);
  const [disputeRuling, setDisputeRuling] = useState<Record<string, DisputeRuling>>({});
  const [disputeRefundCents, setDisputeRefundCents] = useState<Record<string, string>>({});
  const [disputeNotes, setDisputeNotes] = useState<Record<string, string>>({});
  const [claimRuling, setClaimRuling] = useState<Record<string, string>>({});
  const [claimPayoutCents, setClaimPayoutCents] = useState<Record<string, string>>({});
  const [claimRecipientId, setClaimRecipientId] = useState<Record<string, string>>({});
  const [claimNotes, setClaimNotes] = useState<Record<string, string>>({});

  async function handleResolveDispute(disputeId: string) {
    if (resolvingDisputeId) return;
    const ruling = disputeRuling[disputeId];
    if (!ruling) {
      toast.error("Select a ruling.");
      return;
    }
    const needsRefund = ruling === "partial_refund" || ruling === "full_refund";
    let refundCents: number | null = null;
    if (needsRefund) {
      const raw = disputeRefundCents[disputeId];
      refundCents = raw ? Math.round(parseFloat(raw) * 100) : null;
      if (!refundCents || refundCents <= 0) {
        toast.error("Enter refund amount (e.g. 25.00 for €25).");
        return;
      }
    }
    setResolvingDisputeId(disputeId);
    const result = await adminResolveDispute(disputeId, {
      ruling,
      refundAmountCents: refundCents,
      rulingNotes: disputeNotes[disputeId]?.trim() || null,
    });
    setResolvingDisputeId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    const next = await getOpenDisputesForAdmin();
    if (!next.error) setDisputes(next.disputes);
    router.refresh();
    toast.success("Dispute resolved.");
  }

  async function handleResolveClaim(claimId: string) {
    if (resolvingClaimId) return;
    const ruling = claimRuling[claimId];
    if (!ruling) {
      toast.error("Select a ruling.");
      return;
    }
    const needsPayout = ruling === "approved_full" || ruling === "approved_partial";
    let payoutCents: number | null = null;
    let recipientId: string | null = null;
    if (needsPayout) {
      const raw = claimPayoutCents[claimId];
      payoutCents = raw ? Math.round(parseFloat(raw) * 100) : null;
      recipientId = claimRecipientId[claimId] || null;
      if (!payoutCents || payoutCents <= 0) {
        toast.error("Enter payout amount (e.g. 50.00 for €50).");
        return;
      }
      if (!recipientId) {
        toast.error("Select payout recipient.");
        return;
      }
    }
    setResolvingClaimId(claimId);
    const result = await adminResolveClaim(claimId, {
      ruling: ruling as "approved_full" | "approved_partial" | "denied",
      payoutAmountCents: payoutCents,
      payoutRecipientId: recipientId,
      rulingNotes: claimNotes[claimId]?.trim() || null,
    });
    setResolvingClaimId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    const next = await getOpenClaimsForAdmin();
    if (!next.error) setClaims(next.claims);
    router.refresh();
    toast.success("Claim resolved.");
  }

  return (
    <section className="mt-8 rounded-[var(--radius-lg)] border p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
      <h2 className="text-lg font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
        Disputes & Claims
      </h2>
      <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Review and resolve open disputes and guarantee claims.
      </p>

      <h3 className="mt-6 font-medium" style={{ color: "var(--color-text)" }}>Open disputes</h3>
      {disputes.length === 0 ? (
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>No open disputes.</p>
      ) : (
        <ul className="mt-4 space-y-6">
          {disputes.map((d) => (
            <li key={d.id} className="rounded-[var(--radius-lg)] border p-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
              <p className="font-medium" style={{ color: "var(--color-text)" }}>Booking {d.bookingId} · {d.openedByName} vs {d.respondentName}</p>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Type: {d.disputeType} · Status: {d.status}</p>
              <p className="mt-2 text-sm" style={{ color: "var(--color-text)" }}>{d.description}</p>
              {d.evidencePhotos.length > 0 && (
                <div className="mt-2 flex gap-2">
                  {d.evidencePhotos.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                      <img src={url} alt="" className="h-20 w-20 rounded object-cover" />
                    </a>
                  ))}
                </div>
              )}
              {d.respondentResponse && (
                <div className="mt-3 rounded border-l-4 pl-3 py-2" style={{ borderColor: "var(--color-primary)", backgroundColor: "var(--color-surface)" }}>
                  <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>Respondent response</p>
                  <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>{d.respondentResponse}</p>
                  {d.respondentPhotos.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      {d.respondentPhotos.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                          <img src={url} alt="" className="h-16 w-16 rounded object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>Ruling</label>
                  <select
                    value={disputeRuling[d.id] ?? ""}
                    onChange={(e) => setDisputeRuling((prev) => ({ ...prev, [d.id]: e.target.value as DisputeRuling }))}
                    className="mt-1 rounded border px-2 py-1.5 text-sm"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
                  >
                    <option value="">Select</option>
                    {DISPUTE_RULINGS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                {(disputeRuling[d.id] === "partial_refund" || disputeRuling[d.id] === "full_refund") && (
                  <div>
                    <label className="block text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>Refund amount (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={disputeRefundCents[d.id] ?? ""}
                      onChange={(e) => setDisputeRefundCents((prev) => ({ ...prev, [d.id]: e.target.value }))}
                      placeholder={`Max ${formatEur(d.bookingTotalCents)}`}
                      className="mt-1 w-28 rounded border px-2 py-1.5 text-sm"
                      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>Notes</label>
                  <input
                    type="text"
                    value={disputeNotes[d.id] ?? ""}
                    onChange={(e) => setDisputeNotes((prev) => ({ ...prev, [d.id]: e.target.value }))}
                    className="mt-1 w-48 rounded border px-2 py-1.5 text-sm"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleResolveDispute(d.id)}
                  disabled={resolvingDisputeId === d.id}
                  className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
                >
                  {resolvingDisputeId === d.id ? "Resolving…" : "Resolve"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h3 className="mt-8 font-medium" style={{ color: "var(--color-text)" }}>Open guarantee claims</h3>
      {claims.length === 0 ? (
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>No open claims.</p>
      ) : (
        <ul className="mt-4 space-y-6">
          {claims.map((c) => (
            <li key={c.id} className="rounded-[var(--radius-lg)] border p-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
              <p className="font-medium" style={{ color: "var(--color-text)" }}>Booking {c.bookingId} · Reporter: {c.reporterName}</p>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Type: {c.claimType} · Status: {c.status}</p>
              <p className="mt-2 text-sm" style={{ color: "var(--color-text)" }}>{c.description}</p>
              {c.photos.length > 0 && (
                <div className="mt-2 flex gap-2">
                  {c.photos.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                      <img src={url} alt="" className="h-20 w-20 rounded object-cover" />
                    </a>
                  ))}
                </div>
              )}
              {c.otherPartyResponse && (
                <div className="mt-3 rounded border-l-4 pl-3 py-2" style={{ borderColor: "var(--color-primary)", backgroundColor: "var(--color-surface)" }}>
                  <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>Other party response</p>
                  <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>{c.otherPartyResponse}</p>
                  {c.otherPartyPhotos.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      {c.otherPartyPhotos.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                          <img src={url} alt="" className="h-16 w-16 rounded object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>Ruling</label>
                  <select
                    value={claimRuling[c.id] ?? ""}
                    onChange={(e) => setClaimRuling((prev) => ({ ...prev, [c.id]: e.target.value }))}
                    className="mt-1 rounded border px-2 py-1.5 text-sm"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
                  >
                    <option value="">Select</option>
                    {CLAIM_RULINGS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                {(claimRuling[c.id] === "approved_full" || claimRuling[c.id] === "approved_partial") && (
                  <>
                    <div>
                      <label className="block text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>Payout amount (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={claimPayoutCents[c.id] ?? ""}
                        onChange={(e) => setClaimPayoutCents((prev) => ({ ...prev, [c.id]: e.target.value }))}
                        className="mt-1 w-28 rounded border px-2 py-1.5 text-sm"
                        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>Recipient</label>
                      <select
                        value={claimRecipientId[c.id] ?? ""}
                        onChange={(e) => setClaimRecipientId((prev) => ({ ...prev, [c.id]: e.target.value }))}
                        className="mt-1 rounded border px-2 py-1.5 text-sm"
                        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
                      >
                        <option value="">Select</option>
                        <option value={c.ownerId}>{c.ownerName} (owner)</option>
                        <option value={c.providerId}>{c.providerName} (provider)</option>
                      </select>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>Notes</label>
                  <input
                    type="text"
                    value={claimNotes[c.id] ?? ""}
                    onChange={(e) => setClaimNotes((prev) => ({ ...prev, [c.id]: e.target.value }))}
                    className="mt-1 w-48 rounded border px-2 py-1.5 text-sm"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleResolveClaim(c.id)}
                  disabled={resolvingClaimId === c.id}
                  className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
                >
                  {resolvingClaimId === c.id ? "Resolving…" : "Resolve"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
