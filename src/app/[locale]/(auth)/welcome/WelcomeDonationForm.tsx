"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { createSignupDonation } from "@/lib/giving/signup-donation-actions";
import type { WelcomeCharityOption } from "@/lib/giving/signup-donation-actions";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

const PRESET_EUR = [5, 10, 25];

type Props = {
  charities: WelcomeCharityOption[];
  nextPath: string;
};

function DonationPaymentForm({
  amountCents,
  returnUrl,
  onError,
}: {
  amountCents: number;
  returnUrl: string;
  onError: () => void;
}) {
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
        return_url: returnUrl,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Payment failed.");
      onError();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <PaymentElement options={{ layout: "tabs" }} />
      <button
        type="submit"
        disabled={!stripe || !elements || loading}
        className="mt-4 h-12 w-full rounded-[var(--radius-pill)] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
        style={{ backgroundColor: "var(--color-secondary)", fontFamily: "var(--font-body), sans-serif" }}
      >
        {loading ? "Processing…" : `Donate €${(amountCents / 100).toFixed(2)}`}
      </button>
    </form>
  );
}

export function WelcomeDonationForm({ charities, nextPath }: Props) {
  const pathname = usePathname();
  const [selectedCharityId, setSelectedCharityId] = useState<string | "">("");
  const [amountCents, setAmountCents] = useState<number | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [customEur, setCustomEur] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(false);

  const charityIdForPi: string | null = selectedCharityId === "" ? null : selectedCharityId;

  const returnUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${pathname}?donation_return=1&next=${encodeURIComponent(nextPath)}`
      : "";

  async function startPayment(cents: number) {
    setLoading(true);
    const { clientSecret: secret, error } = await createSignupDonation({
      charityId: charityIdForPi,
      amountCents: cents,
      showOnLeaderboard,
    });
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

  if (clientSecret && amountCents != null && returnUrl) {
    return (
      <div className="mt-2">
        <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}>
          Donating €{(amountCents / 100).toFixed(2)}
          {charityIdForPi ? ` to ${charities.find((c) => c.id === charityIdForPi)?.name ?? "charity"}` : " to Tinies Giving Fund"}
        </p>
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
          <DonationPaymentForm
            amountCents={amountCents}
            returnUrl={returnUrl}
            onError={() => {
              setClientSecret(null);
              setAmountCents(null);
            }}
          />
        </Elements>
      </div>
    );
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
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}
      >
        <option value="">Tinies Giving Fund (default)</option>
        {charities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <p className="mb-3 mt-6 text-sm font-medium" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}>
        Choose amount (EUR)
      </p>
      <div className="flex flex-wrap gap-2">
        {PRESET_EUR.map((eur) => (
          <button
            key={eur}
            type="button"
            onClick={() => void startPayment(eur * 100)}
            disabled={loading}
            className="rounded-[var(--radius-lg)] border-2 px-4 py-2 text-sm font-semibold transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-50)] disabled:opacity-50"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}
          >
            €{eur}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-2">
        <div>
          <label htmlFor="welcome-custom-eur" className="sr-only">
            Custom amount in EUR
          </label>
          <input
            id="welcome-custom-eur"
            type="number"
            min="1"
            step="0.01"
            placeholder="Custom (min €1)"
            value={customEur}
            onChange={(e) => setCustomEur(e.target.value)}
            className="w-40 rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            const n = parseFloat(customEur);
            if (Number.isFinite(n) && n >= 1) void startPayment(Math.round(n * 100));
            else toast.error("Minimum €1");
          }}
          disabled={loading}
          className="rounded-[var(--radius-lg)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
        >
          Continue
        </button>
      </div>
      <label className="mt-5 flex cursor-pointer items-center gap-2">
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
    </div>
  );
}
