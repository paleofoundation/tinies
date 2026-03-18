"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { createSignupDonationPaymentIntent } from "@/lib/giving/actions";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

const PRESET_EUR = [5, 10, 25];

type Props = { charityId: string | null };

function DonationPaymentForm({ charityId, amountCents, onSuccess }: { charityId: string | null; amountCents: number; onSuccess: () => void }) {
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
        return_url: `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard/owner?donation=success`,
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
    <form onSubmit={handleSubmit} className="mt-6">
      <PaymentElement options={{ layout: "tabs" }} />
      <button
        type="submit"
        disabled={!stripe || !elements || loading}
        className="mt-4 w-full rounded-[var(--radius-pill)] h-12 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {loading ? "Processing…" : `Donate €${(amountCents / 100).toFixed(2)}`}
      </button>
    </form>
  );
}

export function WelcomeDonationForm({ charityId }: Props) {
  const router = useRouter();
  const [amountCents, setAmountCents] = useState<number | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [customEur, setCustomEur] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(false);

  async function selectAmount(cents: number) {
    setLoading(true);
    const { clientSecret: secret, error } = await createSignupDonationPaymentIntent({ charityId, amountCents: cents, showOnLeaderboard });
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
      <div className="mt-6">
        <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Donating €{(amountCents / 100).toFixed(2)}
        </p>
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
          <DonationPaymentForm
            charityId={charityId}
            amountCents={amountCents}
            onSuccess={() => router.push("/dashboard/owner?donation=success")}
          />
        </Elements>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p className="mb-3 text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Choose amount (EUR)</p>
      <div className="flex flex-wrap gap-2">
        {PRESET_EUR.map((eur) => (
          <button
            key={eur}
            type="button"
            onClick={() => selectAmount(eur * 100)}
            disabled={loading}
            className="rounded-[var(--radius-lg)] border-2 px-4 py-2 text-sm font-semibold transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-50)] disabled:opacity-50"
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
          placeholder="Custom amount"
          value={customEur}
          onChange={(e) => setCustomEur(e.target.value)}
          className="w-32 rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
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
          className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          Donate
        </button>
      </div>
      <label className="mt-4 flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={showOnLeaderboard}
          onChange={(e) => setShowOnLeaderboard(e.target.checked)}
          className="h-4 w-4 rounded border-[var(--color-border)]"
        />
        <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Show my name on the Tinies supporters page
        </span>
      </label>
    </div>
  );
}
