"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createCampaignDonationCheckout } from "@/lib/campaign/campaign-checkout";

const PRESETS = [2500, 5000, 10000, 25000] as const;

type Props = {
  orgSlug: string;
  campaignSlug: string;
};

export function CampaignDonateForm({ orgSlug, campaignSlug }: Props) {
  const [amountCents, setAmountCents] = useState<number>(5000);
  const [customEur, setCustomEur] = useState("");
  const [donorDisplayName, setDonorDisplayName] = useState("");
  const [donorMessage, setDonorMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    let cents = amountCents;
    const trimmed = customEur.trim();
    if (trimmed) {
      const n = parseFloat(trimmed.replace(",", "."));
      if (Number.isNaN(n) || n < 1) {
        toast.error("Enter a valid amount in EUR (minimum €1).");
        return;
      }
      cents = Math.round(n * 100);
    }
    if (cents < 100) {
      toast.error("Minimum donation is €1.");
      return;
    }
    setLoading(true);
    const res = await createCampaignDonationCheckout({
      orgSlug,
      campaignSlug,
      amountCents: cents,
      donorDisplayName,
      donorMessage,
      anonymous,
    });
    setLoading(false);
    if (res.error || !res.checkoutUrl) {
      toast.error(res.error ?? "Could not start checkout.");
      return;
    }
    window.location.href = res.checkoutUrl;
  }

  return (
    <div
      className="rounded-[var(--radius-xl)] border p-6 sm:p-8"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", boxShadow: "var(--shadow-md)" }}
    >
      <h2 className="font-normal text-xl" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
        Donate
      </h2>
      <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
        Choose an amount in EUR. Your gift is tracked transparently and supports this campaign.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {PRESETS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setAmountCents(c);
              setCustomEur("");
            }}
            className="h-11 min-w-[4.5rem] rounded-[var(--radius-lg)] border px-4 text-sm font-semibold transition-colors"
            style={{
              borderColor: amountCents === c && !customEur.trim() ? "var(--color-primary)" : "var(--color-border)",
              backgroundColor: amountCents === c && !customEur.trim() ? "rgba(10, 128, 128, 0.1)" : "var(--color-background)",
              color: "var(--color-text)",
              fontFamily: "var(--font-body), sans-serif",
            }}
          >
            €{c / 100}
          </button>
        ))}
      </div>
      <label className="mt-4 block text-sm font-medium" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}>
        Custom amount (EUR)
        <input
          type="text"
          inputMode="decimal"
          placeholder="e.g. 75"
          value={customEur}
          onChange={(e) => setCustomEur(e.target.value)}
          className="mt-1.5 w-full rounded-[var(--radius-lg)] border px-3 py-2.5 text-sm"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}
        />
      </label>
      <label className="mt-4 flex items-start gap-2 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
          className="mt-1"
        />
        <span>Donate anonymously</span>
      </label>
      {!anonymous ? (
        <label className="mt-3 block text-sm font-medium" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}>
          Display name
          <input
            type="text"
            value={donorDisplayName}
            onChange={(e) => setDonorDisplayName(e.target.value)}
            placeholder="Your name (shown to the rescue)"
            className="mt-1.5 w-full rounded-[var(--radius-lg)] border px-3 py-2.5 text-sm"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}
          />
        </label>
      ) : null}
      <label className="mt-4 block text-sm font-medium" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}>
        Leave a message of support (optional)
        <textarea
          value={donorMessage}
          onChange={(e) => setDonorMessage(e.target.value)}
          rows={3}
          className="mt-1.5 w-full resize-y rounded-[var(--radius-lg)] border px-3 py-2.5 text-sm"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}
        />
      </label>
      <button
        type="button"
        onClick={() => void submit()}
        disabled={loading}
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-pill)] text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-secondary)" }}
      >
        {loading ? "Redirecting…" : "Donate with card"}
      </button>
    </div>
  );
}
