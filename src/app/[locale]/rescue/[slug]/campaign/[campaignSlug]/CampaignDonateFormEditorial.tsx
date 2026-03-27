"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createCampaignDonationCheckout } from "@/lib/campaign/campaign-checkout";

const PRESETS = [2500, 5000, 10000, 25000] as const;

const BORDER_TEAL_15 = "rgba(10, 128, 128, 0.15)";

type Props = {
  orgSlug: string;
  campaignSlug: string;
};

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[18px] w-[18px]" aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function CampaignDonateFormEditorial({ orgSlug, campaignSlug }: Props) {
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

  const trimmedCustom = customEur.trim();
  let displayEur = amountCents / 100;
  if (trimmedCustom !== "") {
    const n = parseFloat(trimmedCustom.replace(",", "."));
    if (!Number.isNaN(n)) displayEur = n;
  }

  const donateLabel = loading
    ? "Redirecting…"
    : `Donate €${Number.isFinite(displayEur) ? displayEur.toFixed(2) : "…"} with card`;

  return (
    <div
      id="campaign-donate"
      className="rounded-[20px] p-7"
      style={{
        border: "2px solid var(--color-secondary)",
        backgroundColor: "var(--color-background)",
        boxShadow: "0 2px 8px rgba(10, 128, 128, 0.06)",
      }}
    >
      <div className="mb-5 flex items-center gap-2">
        <span style={{ color: "var(--color-secondary)" }}>
          <HeartIcon />
        </span>
        <div className="text-[1.125rem] font-bold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
          Make a donation
        </div>
      </div>

      <div className="mb-2.5 text-[0.8125rem] font-semibold" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
        Choose an amount (EUR)
      </div>

      <div className="mb-4 grid grid-cols-4 gap-2">
        {PRESETS.map((c) => {
          const active = amountCents === c && !trimmedCustom;
          return (
            <button
              key={c}
              type="button"
              data-active={active ? "true" : "false"}
              onClick={() => {
                setAmountCents(c);
                setCustomEur("");
              }}
              className="rounded-[14px] border border-[rgba(10,128,128,0.15)] bg-[var(--color-background)] py-3.5 text-[1.125rem] font-bold text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] data-[active=true]:border-[var(--color-primary)] data-[active=true]:bg-[var(--color-primary)] data-[active=true]:text-white data-[active=true]:hover:text-white"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              €{c / 100}
            </button>
          );
        })}
      </div>

      <div className="mb-4">
        <input
          type="text"
          inputMode="decimal"
          placeholder="Custom amount (EUR)"
          value={customEur}
          onChange={(e) => setCustomEur(e.target.value)}
          className="w-full rounded-[14px] border px-4 py-3 text-[0.9375rem] outline-none transition-[border-color] focus:border-[var(--color-primary)]"
          style={{
            borderColor: BORDER_TEAL_15,
            color: "var(--color-text)",
            fontFamily: "var(--font-body), sans-serif",
          }}
        />
      </div>

      <label className="mb-3 flex cursor-pointer items-center gap-2.5 text-[0.8125rem]" style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28, 28, 28, 0.7)" }}>
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
          className="h-[18px] w-[18px] shrink-0"
          style={{ accentColor: "var(--color-primary)" }}
        />
        Donate anonymously
      </label>

      {!anonymous ? (
        <input
          type="text"
          placeholder="Display name"
          value={donorDisplayName}
          onChange={(e) => setDonorDisplayName(e.target.value)}
          className="mb-3 w-full rounded-xl border px-3.5 py-2.5 text-[0.875rem] outline-none transition-[border-color] focus:border-[var(--color-primary)]"
          style={{
            borderColor: BORDER_TEAL_15,
            color: "var(--color-text)",
            fontFamily: "var(--font-body), sans-serif",
          }}
        />
      ) : null}

      <textarea
        placeholder="Leave a message of support (optional)"
        value={donorMessage}
        onChange={(e) => setDonorMessage(e.target.value)}
        rows={3}
        className="mb-4 w-full resize-y rounded-xl border px-3.5 py-2.5 text-[0.875rem] outline-none transition-[border-color] focus:border-[var(--color-primary)]"
        style={{
          borderColor: BORDER_TEAL_15,
          color: "var(--color-text)",
          fontFamily: "var(--font-body), sans-serif",
        }}
      />

      <button
        type="button"
        onClick={() => void submit()}
        disabled={loading}
        className="w-full rounded-full px-6 py-4 text-base font-bold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
        style={{
          fontFamily: "var(--font-body), sans-serif",
          backgroundColor: "var(--color-secondary)",
          boxShadow: "0 4px 20px rgba(244, 93, 72, 0.25)",
        }}
      >
        {donateLabel}
      </button>

      <p className="mt-3.5 text-center text-[0.6875rem]" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
        Secure payment via Stripe. Tinies takes 0% — your full donation reaches the rescue.
      </p>
    </div>
  );
}
