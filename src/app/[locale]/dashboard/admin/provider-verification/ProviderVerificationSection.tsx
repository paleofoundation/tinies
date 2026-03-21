"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ProviderVerificationRow } from "../provider-verification-types";
import { approveProviderVerification, rejectProviderVerification } from "./actions";

type Props = {
  pending: ProviderVerificationRow[];
  recentlyVerified: ProviderVerificationRow[];
};

export function ProviderVerificationSection({ pending, recentlyVerified }: Props) {
  const router = useRouter();
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});

  async function handleApprove(profileId: string) {
    setApprovingId(profileId);
    const result = await approveProviderVerification(profileId);
    setApprovingId(null);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Provider verified. They've been notified.");
      router.refresh();
    }
  }

  async function handleReject(profileId: string) {
    if (rejectingId) return;
    setRejectingId(profileId);
    const result = await rejectProviderVerification(profileId, rejectReasons[profileId] ?? "");
    setRejectingId(null);
    setRejectReasons((prev) => ({ ...prev, [profileId]: "" }));
    if (result.error) toast.error(result.error);
    else {
      toast.success("Rejection email sent.");
      router.refresh();
    }
  }

  return (
    <section className="mt-8 rounded-[var(--radius-lg)] border p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
      <h2 className="text-lg font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
        Provider verification
      </h2>
      <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Approve or reject providers who uploaded ID for manual review. Stripe Identity verifications are auto-approved via webhook.
      </p>

      {/* Pending queue */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Awaiting review ({pending.length})</h3>
        {pending.length === 0 ? (
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>No providers awaiting review.</p>
        ) : (
          <ul className="mt-3 space-y-4">
            {pending.map((p) => (
              <li key={p.id} className="flex flex-wrap gap-4 rounded-[var(--radius-lg)] border p-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                <div className="min-w-0 flex-1">
                  <p className="font-medium" style={{ color: "var(--color-text)" }}>{p.user.name}</p>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{p.user.email} · /services/provider/{p.slug}</p>
                  {p.bio && <p className="mt-2 line-clamp-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>{p.bio.length > 200 ? `${p.bio.slice(0, 200)}…` : p.bio}</p>}
                  {p.idDocumentUrl ? (
                    <p className="mt-2 text-xs" style={{ color: "var(--color-text-secondary)" }}>Manual upload</p>
                  ) : p.stripeVerificationSessionId ? (
                    <p className="mt-2 text-xs" style={{ color: "var(--color-text-secondary)" }}>Stripe Identity (requires_input or not yet verified)</p>
                  ) : null}
                </div>
                {p.idDocumentUrl && (
                  <div className="shrink-0">
                    <img src={p.idDocumentUrl} alt="ID document" className="h-24 w-auto rounded border object-cover" style={{ maxWidth: "120px", borderColor: "var(--color-border)" }} />
                  </div>
                )}
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <button
                    type="button"
                    onClick={() => handleApprove(p.id)}
                    disabled={!!approvingId}
                    className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
                  >
                    {approvingId === p.id ? "Approving…" : "Approve"}
                  </button>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Reject reason (optional)"
                      value={rejectReasons[p.id] ?? ""}
                      onChange={(e) => setRejectReasons((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      className="flex-1 rounded-[var(--radius-lg)] border px-2 py-1.5 text-sm"
                      style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                    />
                    <button
                      type="button"
                      onClick={() => handleReject(p.id)}
                      disabled={!!rejectingId}
                      className="rounded-[var(--radius-lg)] border-2 border-red-500 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-70"
                    >
                      {rejectingId === p.id ? "Sending…" : "Reject"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recently verified */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Recently verified</h3>
        {recentlyVerified.length === 0 ? (
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>None yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {recentlyVerified.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-[var(--radius-lg)] border px-3 py-2 text-sm" style={{ borderColor: "var(--color-border)" }}>
                <span style={{ color: "var(--color-text)" }}>{p.user.name}</span>
                <span style={{ color: "var(--color-text-secondary)" }}>
                  {p.verifiedAt ? new Date(p.verifiedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
