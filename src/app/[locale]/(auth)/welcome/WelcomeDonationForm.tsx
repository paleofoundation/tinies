"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createSignupDonationCheckout } from "@/lib/giving/signup-donation-actions";
import type { WelcomeCharityOption } from "@/lib/giving/signup-donation-actions";

const PRESET_EUR = [5, 10, 25] as const;

type Props = {
  charities: WelcomeCharityOption[];
  nextPath: string;
};

export function WelcomeDonationForm({ charities, nextPath }: Props) {
  const [selectedCharityId, setSelectedCharityId] = useState<string | "">("");
  const [selectedPresetEur, setSelectedPresetEur] = useState<number | null>(null);
  const [customEur, setCustomEur] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(false);

  const charityIdForCheckout: string | null = selectedCharityId === "" ? null : selectedCharityId;

  function resolveAmountCents(): number | null {
    if (selectedPresetEur != null) return selectedPresetEur * 100;
    const n = parseFloat(customEur);
    if (Number.isFinite(n) && n >= 1) return Math.round(n * 100);
    return null;
  }

  async function handleDonate() {
    const cents = resolveAmountCents();
    if (cents == null || cents < 100) {
      toast.error("Choose EUR 5, 10, 25 or enter at least EUR 1.");
      return;
    }
    setLoading(true);
    const { checkoutUrl, error } = await createSignupDonationCheckout({
      amountCents: cents,
      charityId: charityIdForCheckout,
      returnNextPath: nextPath,
      showOnLeaderboard,
    });
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  }

  return (
    <div>
      <label htmlFor="welcome-charity" className="block text-sm font-medium" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
        Where should your gift go?
      </label>
      <select
        id="welcome-charity"
        value={selectedCharityId}
        onChange={(e) => setSelectedCharityId(e.target.value)}
        className="mt-2 w-full rounded-[var(--radius-lg)] border px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-background)",
          color: "var(--color-text)",
          fontFamily: "var(--font-body), sans-serif",
        }}
      >
        <option value="">Tinies Giving Fund (default)</option>
        {charities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <p className="mb-3 mt-6 text-sm font-medium" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}>
        Amount (EUR)
      </p>
      <div className="flex flex-wrap gap-2">
        {PRESET_EUR.map((eur) => {
          const active = selectedPresetEur === eur;
          return (
            <button
              key={eur}
              type="button"
              onClick={() => {
                setSelectedPresetEur(eur);
                setCustomEur("");
              }}
              disabled={loading}
              className="rounded-[var(--radius-lg)] border-2 px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
              style={{
                borderColor: active ? "var(--color-primary)" : "var(--color-border)",
                backgroundColor: active ? "var(--color-primary-muted-08)" : "transparent",
                color: "var(--color-text)",
                fontFamily: "var(--font-body), sans-serif",
              }}
            >
              EUR {eur}
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        <label htmlFor="welcome-custom-eur" className="block text-sm font-medium" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          Or custom amount (min EUR 1)
        </label>
        <input
          id="welcome-custom-eur"
          type="number"
          min="1"
          step="0.01"
          placeholder="e.g. 15"
          value={customEur}
          onChange={(e) => {
            setCustomEur(e.target.value);
            setSelectedPresetEur(null);
          }}
          disabled={loading}
          className="mt-1.5 w-full max-w-xs rounded-[var(--radius-lg)] border px-3 py-2.5 text-sm disabled:opacity-50"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}
        />
      </div>

      <label className="mt-6 flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={showOnLeaderboard}
          onChange={(e) => setShowOnLeaderboard(e.target.checked)}
          className="h-4 w-4 rounded border-[var(--color-border)]"
        />
        <span className="text-sm" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}>
          Show my name on the Tinies supporters page
        </span>
      </label>

      <button
        type="button"
        onClick={() => void handleDonate()}
        disabled={loading}
        className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: "var(--color-secondary)", fontFamily: "var(--font-body), sans-serif" }}
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
        Donate
      </button>
    </div>
  );
}
