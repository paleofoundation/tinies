"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { markWelcomeShown, completeWelcomeAfterSignupCheckout } from "@/lib/giving/signup-donation-actions";
import type { WelcomeCharityOption } from "@/lib/giving/signup-donation-actions";
import { WelcomeDonationForm } from "./WelcomeDonationForm";

const RESCUE_CAT_URL = "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/hero_garden_cat.jpg";

type Props = {
  charities: WelcomeCharityOption[];
  nextPath: string;
  /** From `?donated=true` after Stripe Checkout success */
  donatedReturn: boolean;
  checkoutSessionId: string | null;
};

export function WelcomeExperience({ charities, nextPath, donatedReturn, checkoutSessionId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [thanksEur, setThanksEur] = useState<string | null>(null);
  const [confirmingCheckout, setConfirmingCheckout] = useState(Boolean(donatedReturn && checkoutSessionId));
  const checkoutHandled = useRef(false);

  async function proceedAfterWelcome() {
    const r = await markWelcomeShown();
    if (!r.ok) {
      toast.error(r.error ?? "Something went wrong.");
      return;
    }
    router.push(nextPath);
    router.refresh();
  }

  useEffect(() => {
    if (!donatedReturn || !checkoutSessionId) return;
    if (checkoutHandled.current) return;
    checkoutHandled.current = true;

    const nextFromQuery = searchParams.get("next");
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    void (async () => {
      const result = await completeWelcomeAfterSignupCheckout(checkoutSessionId, nextFromQuery);
      setConfirmingCheckout(false);
      if (!result.ok) {
        checkoutHandled.current = false;
        toast.error(result.error);
        return;
      }
      setThanksEur(result.amountEur);
      timeoutId = setTimeout(() => {
        router.push(result.nextPath);
        router.refresh();
      }, 3000);
    })();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [donatedReturn, checkoutSessionId, searchParams, router]);

  if (confirmingCheckout && !thanksEur) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
        <p style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>Confirming your gift…</p>
      </div>
    );
  }

  if (thanksEur) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <p className="text-lg leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
          Thank you! Your EUR {thanksEur} donation helps rescue animals in Cyprus.
        </p>
        <p className="mt-4 text-sm" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body), sans-serif" }}>
          Taking you to your dashboard…
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 sm:py-14">
      <div
        className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-[var(--radius-xl)] border shadow-[var(--shadow-md)]"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
      >
        <Image
          src={RESCUE_CAT_URL}
          alt="A rescue cat cared for through Tinies partner sanctuaries in Cyprus"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 448px"
          priority
        />
      </div>

      <div className="mt-10 text-center">
        <h1
          className="font-normal tracking-tight sm:text-3xl"
          style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
        >
          Welcome to Tinies!
        </h1>
        <p className="mt-3 text-base leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          Want to start your journey by helping a tiny in need?
        </p>
        <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}>
          Optional — every gift supports verified charities and the Tinies Giving Fund. Skip anytime.
        </p>
      </div>

      <div
        className="mt-10 rounded-[var(--radius-lg)] border p-6 sm:p-8"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}
      >
        <WelcomeDonationForm charities={charities} nextPath={nextPath} />
      </div>

      <div className="mt-10 flex justify-center border-t pt-8" style={{ borderColor: "var(--color-border)" }}>
        <button
          type="button"
          onClick={() => void proceedAfterWelcome()}
          className="text-base font-semibold underline-offset-4 hover:underline"
          style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
