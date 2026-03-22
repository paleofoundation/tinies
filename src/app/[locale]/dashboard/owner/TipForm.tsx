"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { createTipPaymentIntent } from "./actions";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");
const PRESET_EUR = [2, 5, 10];

function buildTipReturnUrl(origin: string, returnPath: string, amountCents: number, providerName: string): string {
  const path = returnPath.startsWith("/") ? returnPath : `/${returnPath}`;
  const u = new URL(path, origin);
  u.searchParams.set("tip", "success");
  u.searchParams.set("amountEur", (amountCents / 100).toFixed(2));
  u.searchParams.set("providerName", providerName);
  return u.toString();
}

function PaymentStep({
  returnPath,
  providerName,
  amountCents,
  onCancel,
}: {
  returnPath: string;
  providerName: string;
  amountCents: number;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const returnUrl =
      origin ? buildTipReturnUrl(origin, returnPath, amountCents, providerName) : returnPath;
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Payment failed.");
      return;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <PaymentElement options={{ layout: "tabs" }} />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[var(--radius-lg)] border px-4 py-2 text-sm font-medium"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || !elements || loading}
          className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
        >
          {loading ? "Processing…" : "Send tip"}
        </button>
      </div>
    </form>
  );
}

export function TipForm({
  bookingId,
  providerName,
  returnPath = "/dashboard/owner",
  variant = "modal",
  onClose,
}: {
  bookingId: string;
  providerName: string;
  returnPath?: string;
  variant?: "modal" | "inline";
  onClose: () => void;
}) {
  const [amountCents, setAmountCents] = useState<number | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [customEur, setCustomEur] = useState("");
  const [loading, setLoading] = useState(false);

  async function selectAmount(cents: number) {
    setLoading(true);
    const { clientSecret: secret, error } = await createTipPaymentIntent(bookingId, cents);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    if (secret) {
      setAmountCents(cents);
      setClientSecret(secret);
    }
  }

  async function submitCustom() {
    const eur = parseFloat(customEur.replace(",", "."));
    if (Number.isNaN(eur) || eur < 1 || eur > 100) {
      toast.error("Enter an amount between €1 and €100.");
      return;
    }
    await selectAmount(Math.round(eur * 100));
  }

  if (clientSecret && amountCents != null) {
    return (
      <div className={variant === "modal" ? "p-4" : ""}>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          You&apos;re sending €{(amountCents / 100).toFixed(2)} to {providerName}. 100% goes to them — Tinies takes no cut.
        </p>
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
          <PaymentStep
            returnPath={returnPath}
            providerName={providerName}
            amountCents={amountCents}
            onCancel={() => {
              setClientSecret(null);
              setAmountCents(null);
            }}
          />
        </Elements>
      </div>
    );
  }

  return (
    <div className={variant === "modal" ? "p-4" : ""}>
      {variant === "modal" && (
        <>
          <p className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
            Was {providerName} amazing? Leave a tip!
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            100% of your tip goes directly to {providerName}. Tinies takes no cut.
          </p>
        </>
      )}
      <p className={`text-sm ${variant === "modal" ? "mt-4" : "mt-0"}`} style={{ color: "var(--color-text-secondary)" }}>
        Quick amounts (optional):
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {PRESET_EUR.map((eur) => (
          <button
            key={eur}
            type="button"
            onClick={() => selectAmount(eur * 100)}
            disabled={loading}
            className="rounded-[var(--radius-lg)] border px-4 py-2 text-sm font-semibold transition-colors hover:bg-[var(--color-primary)]/10 disabled:opacity-70"
            style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
          >
            €{eur}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="tip-custom-eur" className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
            Custom (€1–€100)
          </label>
          <input
            id="tip-custom-eur"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 7.50"
            value={customEur}
            onChange={(e) => setCustomEur(e.target.value)}
            className="w-36 rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
          />
        </div>
        <button
          type="button"
          onClick={submitCustom}
          disabled={loading}
          className="rounded-[var(--radius-lg)] border border-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 disabled:opacity-70"
        >
          {loading ? "…" : "Use amount"}
        </button>
      </div>
      {variant === "modal" && (
        <button
          type="button"
          onClick={onClose}
          className="mt-6 text-sm font-semibold underline"
          style={{ color: "var(--color-primary)" }}
        >
          Skip
        </button>
      )}
    </div>
  );
}
