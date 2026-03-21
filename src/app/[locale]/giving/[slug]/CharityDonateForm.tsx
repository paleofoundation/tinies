"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { createOneTimeDonationPaymentIntent } from "@/lib/giving/actions";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");
const PRESET_EUR = [5, 10, 25, 50];

type Props = { charityId: string };

function PaymentForm({ charityId, amountCents, onSuccess }: { charityId: string; amountCents: number; onSuccess: () => void }) {
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
        return_url: `${typeof window !== "undefined" ? window.location.origin : ""}/giving?donation=success`,
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
    <form onSubmit={handleSubmit} className="mt-4">
      <PaymentElement options={{ layout: "tabs" }} />
      <button
        type="submit"
        disabled={!stripe || !elements || loading}
        className="mt-4 w-full rounded-[var(--radius-lg)] bg-[var(--color-primary)] py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
      >
        {loading ? "Processing…" : `Donate €${(amountCents / 100).toFixed(2)}`}
      </button>
    </form>
  );
}

export function CharityDonateForm({ charityId }: Props) {
  const [amountCents, setAmountCents] = useState<number | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [customEur, setCustomEur] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(false);

  async function selectAmount(cents: number) {
    setLoading(true);
    const { clientSecret: secret, error } = await createOneTimeDonationPaymentIntent({ charityId, amountCents: cents, showOnLeaderboard });
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

  if (clientSecret && amountCents != null) {
    return (
      <div className="mt-4">
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Donating €{(amountCents / 100).toFixed(2)}</p>
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
          <PaymentForm charityId={charityId} amountCents={amountCents} onSuccess={() => window.location.reload()} />
        </Elements>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        {PRESET_EUR.map((eur) => (
          <button
            key={eur}
            type="button"
            onClick={() => selectAmount(eur * 100)}
            disabled={loading}
            className="rounded-[var(--radius-lg)] border-2 px-3 py-1.5 text-sm font-semibold hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-50)] disabled:opacity-50"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
          >
            €{eur}
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          type="number"
          min="1"
          step="0.01"
          placeholder="Custom (min €1)"
          value={customEur}
          onChange={(e) => setCustomEur(e.target.value)}
          className="w-28 rounded-[var(--radius-lg)] border px-2 py-1.5 text-sm"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        />
        <button
          type="button"
          onClick={() => {
            const n = parseFloat(customEur);
            if (n >= 1) selectAmount(Math.round(n * 100));
            else toast.error("Minimum €1");
          }}
          disabled={loading}
          className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          Donate
        </button>
      </div>
      <label className="mt-3 flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={showOnLeaderboard}
          onChange={(e) => setShowOnLeaderboard(e.target.checked)}
          className="h-4 w-4 rounded border-[var(--color-border)]"
        />
        <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Show my name on the Tinies supporters page</span>
      </label>
    </div>
  );
}
