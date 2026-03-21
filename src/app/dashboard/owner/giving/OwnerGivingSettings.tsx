"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  setPreferredCharity,
  updateRoundupEnabled,
} from "@/lib/giving/actions";
import {
  pauseGuardianSubscription,
  cancelGuardianSubscription,
  resumeGuardianSubscription,
} from "@/lib/giving/guardian-actions";
import type { OwnerGivingData } from "@/lib/utils/giving-helpers";

type Props = { data: OwnerGivingData };

export function OwnerGivingSettings({ data }: Props) {
  const router = useRouter();
  const [preferredId, setPreferredId] = useState<string | null>(data.preferredCharityId);
  const [roundup, setRoundup] = useState(data.roundupEnabled);
  const [savingPref, setSavingPref] = useState(false);
  const [savingRoundup, setSavingRoundup] = useState(false);
  const [guardianAction, setGuardianAction] = useState<string | null>(null);

  async function handleSavePreferred() {
    setSavingPref(true);
    const result = await setPreferredCharity(preferredId);
    setSavingPref(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Preferred charity updated.");
      router.refresh();
    }
  }

  async function handleRoundupToggle() {
    const next = !roundup;
    setRoundup(next);
    setSavingRoundup(true);
    const result = await updateRoundupEnabled(next);
    setSavingRoundup(false);
    if (result.error) {
      setRoundup(!next);
      toast.error(result.error);
    } else {
      toast.success(next ? "Round-up enabled." : "Round-up disabled.");
      router.refresh();
    }
  }

  async function handlePause() {
    if (!data.guardianSubscription) return;
    setGuardianAction("pause");
    const result = await pauseGuardianSubscription();
    setGuardianAction(null);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Subscription paused.");
      router.refresh();
    }
  }

  async function handleResume() {
    if (!data.guardianSubscription) return;
    setGuardianAction("resume");
    const result = await resumeGuardianSubscription();
    setGuardianAction(null);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Subscription resumed.");
      router.refresh();
    }
  }

  async function handleCancel() {
    if (!data.guardianSubscription) return;
    if (!confirm("Cancel your Guardian subscription? You can rejoin anytime.")) return;
    setGuardianAction("cancel");
    const result = await cancelGuardianSubscription();
    setGuardianAction(null);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Subscription cancelled.");
      router.refresh();
    }
  }

  return (
    <div className="mt-8 space-y-8">
      <section className="rounded-[var(--radius-lg)] border p-6" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>Preferred charity</h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Round-up and optional donations go to this charity. Choose &quot;Tinies Giving Fund&quot; for the general fund.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            value={preferredId ?? ""}
            onChange={(e) => setPreferredId(e.target.value || null)}
            className="rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)", minWidth: "200px" }}
          >
            <option value="">Tinies Giving Fund</option>
            {data.charitiesForDropdown.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleSavePreferred}
            disabled={savingPref}
            className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {savingPref ? "Saving…" : "Save"}
          </button>
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border p-6" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>Round-up at checkout</h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          When you book, round up to the nearest euro and donate the difference.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={roundup}
            onClick={handleRoundupToggle}
            disabled={savingRoundup}
            className="relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 disabled:opacity-50"
            style={{ backgroundColor: roundup ? "var(--color-primary)" : "var(--color-border)" }}
          >
            <span
              className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition"
              style={{ translate: roundup ? "translateX(1.25rem)" : "translateX(0.125rem)" }}
            />
          </button>
          <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            {roundup ? "On" : "Off"}
          </span>
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border p-6" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>Guardian subscription</h2>
        {data.guardianSubscription ? (
          <div className="mt-4">
            <p className="text-sm" style={{ color: "var(--color-text)" }}>
              €{(data.guardianSubscription.amountMonthly / 100).toFixed(2)}/month
              {data.guardianSubscription.charityName && ` → ${data.guardianSubscription.charityName}`}
              {data.guardianSubscription.status !== "active" && (
                <span className="ml-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  (Status: {data.guardianSubscription.status})
                </span>
              )}
            </p>
            {data.guardianSubscription.status === "active" && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handlePause}
                  disabled={!!guardianAction}
                  className="rounded-[var(--radius-lg)] border px-3 py-1.5 text-sm font-medium hover:bg-[var(--color-surface)] disabled:opacity-50"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                >
                  {guardianAction === "pause" ? "…" : "Pause"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={!!guardianAction}
                  className="rounded-[var(--radius-lg)] px-3 py-1.5 text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/10 disabled:opacity-50"
                >
                  {guardianAction === "cancel" ? "…" : "Cancel subscription"}
                </button>
              </div>
            )}
            {data.guardianSubscription.status === "paused" && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleResume}
                  disabled={!!guardianAction}
                  className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {guardianAction === "resume" ? "…" : "Resume"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={!!guardianAction}
                  className="rounded-[var(--radius-lg)] px-3 py-1.5 text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/10 disabled:opacity-50"
                >
                  {guardianAction === "cancel" ? "…" : "Cancel subscription"}
                </button>
              </div>
            )}
            {data.guardianSubscription.status === "cancelled" && (
              <p className="mt-3 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                This subscription has ended.{" "}
                <Link href="/giving/become-a-guardian" className="font-medium underline" style={{ color: "var(--color-primary)" }}>
                  Start again
                </Link>
              </p>
            )}
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Give monthly to animal rescue. Choose your tier and charity.
            </p>
            <Link
              href="/giving/become-a-guardian"
              className="mt-3 inline-flex h-10 items-center rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:opacity-90"
            >
              Become a Guardian
            </Link>
          </>
        )}
      </section>
    </div>
  );
}
