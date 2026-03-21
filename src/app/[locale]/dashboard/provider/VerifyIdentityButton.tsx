"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import { createVerificationSession } from "./actions";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

type Props = {
  onSuccess?: () => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

/** Opens Stripe Identity verification modal (document + selfie). On success, webhook will set provider verified. */
export function VerifyIdentityButton({ onSuccess, className, style, children }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const { clientSecret, error } = await createVerificationSession();
      if (error) {
        toast.error(error);
        setLoading(false);
        return;
      }
      if (!clientSecret) {
        toast.error("Could not start verification.");
        setLoading(false);
        return;
      }
      const stripe = await stripePromise;
      if (!stripe) {
        toast.error("Stripe failed to load.");
        setLoading(false);
        return;
      }
      const verifyIdentity = (stripe as unknown as { verifyIdentity: (clientSecret: string) => Promise<{ error?: { message?: string } }> }).verifyIdentity;
      if (typeof verifyIdentity !== "function") {
        toast.error("Identity verification not available in this environment.");
        setLoading(false);
        return;
      }
      const result = await verifyIdentity(clientSecret);
      setLoading(false);
      if (result?.error?.message) {
        toast.error(result.error.message);
        return;
      }
      toast.success("Verification submitted. We'll notify you once your profile is verified.");
      onSuccess?.();
    } catch (e) {
      setLoading(false);
      toast.error(e instanceof Error ? e.message : "Verification failed.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={className}
      style={style}
    >
      {children ?? (loading ? "Opening…" : "Verify with Stripe (ID + selfie)")}
    </button>
  );
}
