"use client";

import { useState } from "react";
import { Heart, Sparkles, Mail, PawPrint } from "lucide-react";
import { toast } from "sonner";
import { createGuardianSubscription } from "@/lib/giving/guardian-actions";
import type { GuardianTier } from "@prisma/client";

const TIERS: {
  tier: GuardianTier;
  eur: number;
  label: string;
  tagline: string;
}[] = [
  {
    tier: "friend",
    eur: 3,
    label: "Friend",
    tagline: "Feed a rescue cat for a week",
  },
  {
    tier: "guardian",
    eur: 5,
    label: "Guardian",
    tagline: "Cover a vet checkup for one animal",
  },
  {
    tier: "champion",
    eur: 10,
    label: "Champion",
    tagline: "Help fund a rescue operation",
  },
];

type CharityOption = { id: string | null; name: string };

type Props = { charities: CharityOption[] };

const BENEFITS = [
  { icon: Sparkles, text: "Guardian badge on your profile" },
  { icon: Mail, text: "Monthly impact email" },
  { icon: PawPrint, text: "Early access to new adoption listings" },
] as const;

export function GuardianCheckoutForm({ charities }: Props) {
  const [selectedTier, setSelectedTier] = useState<GuardianTier>("guardian");
  const [customEur, setCustomEur] = useState("");
  const [charityId, setCharityId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(false);

  const amountCents = (() => {
    if (selectedTier === "custom") {
      const n = parseFloat(customEur);
      return Number.isFinite(n) && n >= 1 ? Math.round(n * 100) : 0;
    }
    const t = TIERS.find((x) => x.tier === selectedTier);
    return t ? t.eur * 100 : 0;
  })();

  async function handleSubscribe() {
    if (amountCents < 100) {
      toast.error("Minimum €1/month.");
      return;
    }
    setLoading(true);
    const result = await createGuardianSubscription({
      amountMonthlyCents: amountCents,
      tier: selectedTier,
      charityId,
      showOnLeaderboard,
    });
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.checkoutUrl) {
      window.location.assign(result.checkoutUrl);
      return;
    }
    toast.error("Could not start checkout.");
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-3">
        {TIERS.map((t) => {
          const selected = selectedTier === t.tier;
          return (
            <button
              key={t.tier}
              type="button"
              onClick={() => setSelectedTier(t.tier)}
              className="flex flex-col rounded-[var(--radius-xl)] border p-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
              style={{
                borderColor: selected ? "var(--color-primary)" : "var(--color-border)",
                backgroundColor: selected ? "var(--color-primary-50)" : "var(--color-surface)",
                boxShadow: selected ? "var(--shadow-md)" : "var(--shadow-sm)",
              }}
            >
              <span
                className="text-lg font-semibold"
                style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
              >
                {t.label}
              </span>
              <span className="mt-2 text-2xl font-semibold tabular-nums" style={{ color: "var(--color-primary)" }}>
                €{t.eur}
                <span className="text-base font-normal" style={{ color: "var(--color-text-secondary)" }}>
                  /month
                </span>
              </span>
              <p className="mt-3 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                {t.tagline}
              </p>
            </button>
          );
        })}
      </div>

      <div>
        <p className="text-sm font-medium" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
          Custom amount
        </p>
        <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
          Minimum €1 per month. Any amount other than €3, €5, or €10 is shown as a custom tier.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>€</span>
          <input
            type="number"
            min={1}
            step={0.5}
            placeholder="e.g. 7"
            value={customEur}
            onChange={(e) => {
              setCustomEur(e.target.value);
              setSelectedTier("custom");
            }}
            className="w-28 rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
          />
          <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>/month</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Where should your gift go?
        </label>
        <select
          value={charityId ?? ""}
          onChange={(e) => setCharityId(e.target.value || null)}
          className="mt-2 w-full max-w-md rounded-[var(--radius-lg)] border px-3 py-2.5 text-sm"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          {charities.map((c) => (
            <option key={c.id ?? "fund"} value={c.id ?? ""}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={showOnLeaderboard}
          onChange={(e) => setShowOnLeaderboard(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-[var(--color-border)]"
        />
        <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Show my name on the Tinies supporters page
        </span>
      </label>

      <div
        className="rounded-[var(--radius-lg)] border px-5 py-6"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-primary-50)" }}
      >
        <p
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
        >
          <Heart className="h-4 w-4 shrink-0" style={{ color: "var(--color-secondary)" }} />
          Your benefits
        </p>
        <ul className="mt-4 space-y-3">
          {BENEFITS.map((b) => (
            <li key={b.text} className="flex gap-3 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              <b.icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} />
              {b.text}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={handleSubscribe}
        disabled={loading || amountCents < 100}
        className="w-full rounded-[var(--radius-pill)] py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-primary)" }}
      >
        {loading ? "Redirecting to secure checkout…" : `Subscribe — €${(amountCents / 100).toFixed(2)}/month`}
      </button>
      <p className="text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
        You&apos;ll complete payment on Stripe. Subscriptions renew monthly until you cancel in Giving settings.
      </p>
    </div>
  );
}
