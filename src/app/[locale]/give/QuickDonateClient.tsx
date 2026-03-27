"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import {
  createQuickDonation,
  createQuickGuardianSubscription,
  getFeaturedCharitiesForQuickDonate,
} from "@/lib/giving/actions";
import type { GuardianTier } from "@prisma/client";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

const ONE_TIME_AMOUNTS = [5, 10, 25, 50, 100];
const MONTHLY_AMOUNTS = [3, 5, 10, 25];

function tierForAmountEur(eur: number): GuardianTier {
  if (eur >= 10) return "champion";
  if (eur >= 5) return "guardian";
  return "friend";
}

function tierLabel(tier: GuardianTier): string {
  const labels: Record<GuardianTier, string> = {
    friend: "Tinies Friend",
    guardian: "Tinies Guardian",
    champion: "Tinies Champion",
    custom: "Tinies Guardian",
  };
  return labels[tier] ?? tier;
}

const GIVE_SUCCESS_KEY = "tinies_give_success_meta";

type CharityOption = { id: string | null; name: string; slug: string | null; logoUrl: string | null };

type Props = {
  initialCharities: CharityOption[];
  preselectedCharity?: { id: string | null; name: string; slug: string | null };
};

function PaymentStep({
  clientSecret,
  onSuccess,
  isSubscription,
  successMeta,
}: {
  clientSecret: string;
  onSuccess: () => void;
  isSubscription: boolean;
  successMeta: { amountEur: number; charityName: string; isMonthly: boolean; tier?: string };
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (typeof window !== "undefined") sessionStorage.setItem(GIVE_SUCCESS_KEY, JSON.stringify(successMeta));
    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url:
          typeof window !== "undefined"
            ? `${window.location.origin}${window.location.pathname}?success=1`
            : "/giving/donate?success=1",
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
        className="mt-6 w-full rounded-[var(--radius-lg)] py-4 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {loading ? "Processing…" : isSubscription ? "Start monthly giving" : "Donate now"}
      </button>
    </form>
  );
}

export function QuickDonateClient({ initialCharities, preselectedCharity }: Props) {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"one-time" | "monthly">("one-time");
  const [amountCents, setAmountCents] = useState<number | null>(null);
  const [customEur, setCustomEur] = useState("");
  const [charityId, setCharityId] = useState<string | null>(preselectedCharity?.id ?? null);
  const [charities, setCharities] = useState<CharityOption[]>(initialCharities);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMeta, setSuccessMeta] = useState<{ amountEur: number; charityName: string; isMonthly: boolean; tier?: string } | null>(null);

  useEffect(() => {
    if (searchParams.get("success") === "1" && typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem(GIVE_SUCCESS_KEY);
        if (raw) {
          const meta = JSON.parse(raw) as { amountEur: number; charityName: string; isMonthly: boolean; tier?: string };
          setSuccessMeta(meta);
          setSuccess(true);
          sessionStorage.removeItem(GIVE_SUCCESS_KEY);
        }
      } catch {
        setSuccessMeta({ amountEur: 0, charityName: "Tinies", isMonthly: false });
        setSuccess(true);
      }
    }
  }, [searchParams]);

  const selectedCharity = preselectedCharity ?? charities.find((c) => (c.id ?? null) === charityId) ?? charities[0];
  const charityName = selectedCharity?.name ?? "Tinies Giving Fund";

  const amounts = mode === "one-time" ? ONE_TIME_AMOUNTS : MONTHLY_AMOUNTS;
  const minCents = mode === "one-time" ? 100 : 100;

  function getSelectedAmountCents(): number | null {
    if (amountCents !== null) return amountCents;
    const n = parseFloat(customEur);
    if (Number.isFinite(n) && n * 100 >= minCents) return Math.round(n * 100);
    return null;
  }

  const selectedCents = getSelectedAmountCents();
  const tier = mode === "monthly" && selectedCents != null ? tierForAmountEur(selectedCents / 100) : null;

  async function loadCharities() {
    const list = await getFeaturedCharitiesForQuickDonate();
    setCharities(list);
    if (!preselectedCharity && list.length > 0 && charityId === null) setCharityId(list[0].id);
  }

  if (typeof window !== "undefined" && charities.length === 0 && !preselectedCharity) {
    loadCharities();
  }

  async function handleProceed() {
    const cents = getSelectedAmountCents();
    if (cents == null || cents < minCents) {
      toast.error(mode === "one-time" ? "Choose an amount (min €1)." : "Choose an amount (min €1/month).");
      return;
    }
    if (mode === "monthly" && !donorEmail.trim()) {
      toast.error("Email is required for monthly giving.");
      return;
    }
    setLoading(true);
    if (mode === "one-time") {
      const { clientSecret: secret, error } = await createQuickDonation({
        amountCents: cents,
        charityId: charityId || null,
        donorName: donorName.trim() || null,
        donorEmail: donorEmail.trim() || null,
        showOnLeaderboard,
      });
      setLoading(false);
      if (error) {
        toast.error(error);
        return;
      }
      if (secret) {
        setClientSecret(secret);
      }
    } else {
      const { clientSecret: secret, error } = await createQuickGuardianSubscription({
        amountCents: cents,
        tier: tier ?? "guardian",
        charityId: charityId || null,
        donorEmail: donorEmail.trim(),
        donorName: donorName.trim() || null,
        showOnLeaderboard,
      });
      setLoading(false);
      if (error) {
        toast.error(error);
        return;
      }
      if (secret) {
        setClientSecret(secret);
      }
    }
  }

  if (success && successMeta) {
    return (
      <div className="rounded-[var(--radius-lg)] border p-8 text-center" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <h2 className="font-normal" style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}>
          Thank you!
        </h2>
        {successMeta.isMonthly ? (
          <p className="mt-3 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Welcome, {successMeta.tier ?? "Tinies Guardian"}! Your €{(successMeta.amountEur || 0).toFixed(0)}/month donation to {successMeta.charityName} starts today. You&apos;ll receive monthly impact reports.
          </p>
        ) : (
          <p className="mt-3 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Your donation of €{(successMeta.amountEur || 0).toFixed(2)} is on its way to {successMeta.charityName}.
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            if (navigator.share) {
              const shareUrl = `${window.location.origin}${window.location.pathname}`;
              navigator.share({
                title: "Tinies — Help rescue animals",
                url: shareUrl,
                text: successMeta.isMonthly
                  ? `I just became a ${successMeta.tier} — giving monthly to ${successMeta.charityName}. Join me: `
                  : `I just donated to ${successMeta.charityName}. Give in 15 seconds: `,
              });
            } else {
              navigator.clipboard?.writeText(`${window.location.origin}${window.location.pathname}`);
              toast.success("Link copied!");
            }
          }}
          className="mt-6 inline-flex w-full justify-center gap-2 rounded-[var(--radius-lg)] border-2 py-3 text-sm font-semibold"
          style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
        >
          Share
        </button>
        <a href="/giving" className="mt-4 block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Back to Giving
        </a>
      </div>
    );
  }

  if (clientSecret && selectedCents != null) {
    return (
      <div className="rounded-[var(--radius-lg)] border p-6" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          {mode === "one-time" ? `Donating €${(selectedCents / 100).toFixed(2)} to ${charityName}` : `€${(selectedCents / 100).toFixed(2)}/month to ${charityName}`}
        </p>
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
          <PaymentStep
            clientSecret={clientSecret}
            successMeta={{
              amountEur: selectedCents / 100,
              charityName,
              isMonthly: mode === "monthly",
              tier: mode === "monthly" ? tierLabel(tier ?? "guardian") : undefined,
            }}
            onSuccess={() => {
              setSuccess(true);
              setSuccessMeta({
                amountEur: selectedCents / 100,
                charityName,
                isMonthly: mode === "monthly",
                tier: mode === "monthly" ? tierLabel(tier ?? "guardian") : undefined,
              });
            }}
            isSubscription={mode === "monthly"}
          />
        </Elements>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode("one-time")}
          className={`rounded-[var(--radius-lg)] py-4 text-base font-semibold transition-colors ${
            mode === "one-time" ? "text-white" : "border-2"
          }`}
          style={
            mode === "one-time"
              ? { backgroundColor: "var(--color-primary)" }
              : { borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }
          }
        >
          One time
        </button>
        <button
          type="button"
          onClick={() => setMode("monthly")}
          className={`rounded-[var(--radius-lg)] py-4 text-base font-semibold transition-colors ${
            mode === "monthly" ? "text-white" : "border-2"
          }`}
          style={
            mode === "monthly"
              ? { backgroundColor: "var(--color-primary)" }
              : { borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }
          }
        >
          Monthly
        </button>
      </div>

      {/* Amounts */}
      <div>
        <p className="mb-2 text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Amount {mode === "monthly" && "(/month)"}
        </p>
        <div className="flex flex-wrap gap-2">
          {amounts.map((eur) => {
            const cents = eur * 100;
            const selected = amountCents === cents;
            return (
              <button
                key={eur}
                type="button"
                onClick={() => setAmountCents(cents)}
                className={`min-w-[4rem] rounded-[var(--radius-lg)] py-3 px-4 text-base font-semibold transition-colors ${
                  selected ? "text-white" : "border-2"
                }`}
                style={
                  selected
                    ? { backgroundColor: "var(--color-primary)" }
                    : { borderColor: "var(--color-border)", color: "var(--color-text)" }
                }
              >
                €{eur}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min={mode === "one-time" ? 1 : 1}
            step="0.01"
            placeholder="Custom"
            value={customEur}
            onChange={(e) => {
              setCustomEur(e.target.value);
              setAmountCents(null);
            }}
            className="w-24 rounded-[var(--radius-lg)] border px-3 py-2.5 text-base"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
          />
          <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{mode === "monthly" ? "/month" : "€"}</span>
        </div>
        {mode === "monthly" && selectedCents != null && selectedCents >= 100 && (
          <p className="mt-2 text-sm" style={{ color: "var(--color-primary)" }}>
            You&apos;ll become a {tierLabel(tierForAmountEur(selectedCents / 100))}.
          </p>
        )}
      </div>

      {/* Charity selector — only when no preselected */}
      {!preselectedCharity && (
        <div>
          <p className="mb-2 text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
            Where it goes
          </p>
          <div className="flex flex-wrap gap-2">
            {charities.map((c) => {
              const id = c.id ?? null;
              const selected = charityId === id;
              return (
                <button
                  key={id ?? "fund"}
                  type="button"
                  onClick={() => setCharityId(id)}
                  className={`flex items-center gap-2 rounded-[var(--radius-lg)] border-2 px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    selected ? "border-[var(--color-primary)] bg-[var(--color-primary-50)]" : "border-[var(--color-border)]"
                  }`}
                  style={{ color: "var(--color-text)" }}
                >
                  {c.logoUrl && <img src={c.logoUrl} alt="" className="h-8 w-8 rounded object-cover" />}
                  <span className="truncate">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Optional name / email */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
            Your name (optional)
          </label>
          <input
            type="text"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            placeholder="For your receipt"
            className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2.5 text-base"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
            Email {mode === "monthly" ? "(required for receipt)" : "(optional)"}
          </label>
          <input
            type="email"
            value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1 w-full rounded-[var(--radius-lg)] border px-3 py-2.5 text-base"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2">
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

      <button
        type="button"
        onClick={handleProceed}
        disabled={loading || selectedCents == null || selectedCents < minCents || (mode === "monthly" && !donorEmail.trim())}
        className="w-full rounded-[var(--radius-lg)] py-4 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {loading ? "Preparing…" : mode === "one-time" ? `Donate €${((selectedCents ?? 0) / 100).toFixed(2)}` : `Give €${((selectedCents ?? 0) / 100).toFixed(2)}/month`}
      </button>
    </div>
  );
}
