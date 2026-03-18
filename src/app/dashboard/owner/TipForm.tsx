"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { createTipPaymentIntent } from "./actions";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");
const PRESET_EUR = [2, 5, 10];

function PaymentStep({ clientSecret, amountCents, onSuccess, onCancel }: { clientSecret: string; amountCents: number; onSuccess: () => void; onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: typeof window !== "undefined" ? `${window.location.origin}/dashboard/owner?tip=success` : "/dashboard/owner",
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Payment failed.");
      return;
    }
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <PaymentElement options={{ layout: "tabs" }} />
      <div className="flex gap-2">
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
          {loading ? "Processing…" : `Tip €${(amountCents / 100).toFixed(2)}`}
        </button>
      </div>
    </form>
  );
}

export function TipForm({
  bookingId,
  providerName,
  onSuccess,
  onClose,
}: {
  bookingId: string;
  providerName: string;
  onSuccess: () => void;
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
      <div className="p-4">
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Tipping €{(amountCents / 100).toFixed(2)} to {providerName}</p>
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
          <PaymentStep
            clientSecret={clientSecret}
            amountCents={amountCents}
            onSuccess={() => { onSuccess(); onClose(); }}
            onCancel={() => { setClientSecret(null); setAmountCents(null); }}
          />
        </Elements>
      </div>
    );
  }

  return (
    <div className="p-4">
      <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>Tip {providerName}</p>
      <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>100% goes to the provider.</p>
      <div className="mt-4 flex flex-wrap gap-2">
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
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          inputMode="decimal"
          placeholder="Custom amount (€)"
          value={customEur}
          onChange={(e) => setCustomEur(e.target.value)}
          className="w-32 rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        />
        <button
          type="button"
          onClick={submitCustom}
          disabled={loading}
          className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
        >
          {loading ? "…" : "Custom"}
        </button>
      </div>
      <button type="button" onClick={onClose} className="mt-4 text-sm underline" style={{ color: "var(--color-text-secondary)" }}>Cancel</button>
    </div>
  );
}
