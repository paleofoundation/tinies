"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { createGuardianSubscription } from "@/lib/giving/actions";
import type { GuardianTier } from "@prisma/client";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

const TIERS: { tier: GuardianTier; eur: number; label: string; description: string }[] = [
  { tier: "friend", eur: 3, label: "Friend", description: "€3/month — Support rescue every month." },
  { tier: "guardian", eur: 5, label: "Guardian", description: "€5/month — Our most popular. Impact updates." },
  { tier: "champion", eur: 10, label: "Champion", description: "€10/month — Maximum impact." },
];

type CharityOption = { id: string | null; name: string };

type Props = { charities: CharityOption[] };

function ConfirmPaymentForm({ onSuccess }: { onSuccess: () => void }) {
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
        return_url: `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard/owner/giving?guardian=success`,
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
        className="mt-6 w-full rounded-[var(--radius-pill)] h-12 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {loading ? "Processing…" : "Confirm and start subscription"}
      </button>
    </form>
  );
}

export function GuardianCheckoutForm({ charities }: Props) {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<GuardianTier>("guardian");
  const [customEur, setCustomEur] = useState("");
  const [charityId, setCharityId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
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

  async function handleStart() {
    if (amountCents < 100) {
      toast.error("Minimum €1/month.");
      return;
    }
    setLoading(true);
    const result = await createGuardianSubscription({
      amountCents,
      tier: selectedTier,
      charityId,
      showOnLeaderboard,
    });
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.clientSecret) {
      setClientSecret(result.clientSecret);
    } else {
      toast.success("Subscription created.");
      router.push("/dashboard/owner/giving?guardian=success");
      router.refresh();
    }
  }

  if (clientSecret) {
    return (
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Confirm your payment to start your Guardian subscription.
        </p>
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
          <ConfirmPaymentForm onSuccess={() => router.push("/dashboard/owner/giving?guardian=success")} />
        </Elements>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Tier</p>
        <div className="space-y-2">
          {TIERS.map((t) => (
            <label
              key={t.tier}
              className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-lg)] border p-4 has-[:checked]:border-[var(--color-primary)] has-[:checked]:bg-[var(--color-primary-50)]"
              style={{ borderColor: "var(--color-border)" }}
            >
              <input
                type="radio"
                name="tier"
                value={t.tier}
                checked={selectedTier === t.tier}
                onChange={() => setSelectedTier(t.tier)}
                className="mt-1 h-4 w-4"
              />
              <div>
                <span className="font-semibold" style={{ color: "var(--color-text)" }}>{t.label}</span>
                <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>{t.description}</p>
              </div>
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-lg)] border p-4 has-[:checked]:border-[var(--color-primary)] has-[:checked]:bg-[var(--color-primary-50)]" style={{ borderColor: "var(--color-border)" }}>
            <input
              type="radio"
              name="tier"
              value="custom"
              checked={selectedTier === "custom"}
              onChange={() => setSelectedTier("custom")}
              className="h-4 w-4"
            />
            <div className="flex items-center gap-2">
              <span className="font-semibold" style={{ color: "var(--color-text)" }}>Custom</span>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="Min €1"
                value={customEur}
                onChange={(e) => setCustomEur(e.target.value)}
                onClick={() => setSelectedTier("custom")}
                className="w-24 rounded-[var(--radius-lg)] border px-2 py-1 text-sm"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
              />
              <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>/month</span>
            </div>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Charity</label>
        <select
          value={charityId ?? ""}
          onChange={(e) => setCharityId(e.target.value || null)}
          className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          {charities.map((c) => (
            <option key={c.id ?? "fund"} value={c.id ?? ""}>{c.name}</option>
          ))}
        </select>
      </div>

      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={showOnLeaderboard}
          onChange={(e) => setShowOnLeaderboard(e.target.checked)}
          className="h-4 w-4 rounded border-[var(--color-border)]"
        />
        <span className="text-sm" style={{ color: "var(--color-text)" }}>Show my name on the Tinies supporters page</span>
      </label>

      <button
        type="button"
        onClick={handleStart}
        disabled={loading || amountCents < 100}
        className="w-full rounded-[var(--radius-pill)] h-12 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {loading ? "Creating…" : `Start — €${(amountCents / 100).toFixed(2)}/month`}
      </button>
    </div>
  );
}
