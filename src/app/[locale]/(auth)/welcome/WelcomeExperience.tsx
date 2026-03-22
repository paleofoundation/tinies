"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import { markWelcomeShown } from "@/lib/giving/signup-donation-actions";
import type { WelcomeCharityOption } from "@/lib/giving/signup-donation-actions";
import { WelcomeDonationForm } from "./WelcomeDonationForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

const ROTATING_RESCUE_PHOTOS = [
  "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/hero_cats_v2.jpg",
  "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/hero_garden_cat.jpg",
  "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/hero_volunteer.jpg",
  "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/story_portrait_new.jpg",
] as const;

type Props = {
  charities: WelcomeCharityOption[];
  nextPath: string;
};

export function WelcomeExperience({ charities, nextPath }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [thanksEur, setThanksEur] = useState<string | null>(null);
  const paymentReturnStarted = useRef(false);

  useEffect(() => {
    const t = setInterval(() => {
      setPhotoIndex((i) => (i + 1) % ROTATING_RESCUE_PHOTOS.length);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  async function proceedAfterWelcome() {
    await markWelcomeShown();
    router.push(nextPath);
    router.refresh();
  }

  useEffect(() => {
    if (paymentReturnStarted.current) return;
    const clientSecret = searchParams.get("payment_intent_client_secret");
    const donationReturn = searchParams.get("donation_return");
    if (!clientSecret || donationReturn !== "1") return;

    paymentReturnStarted.current = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    (async () => {
      try {
        const stripe = await stripePromise;
        if (!stripe) {
          paymentReturnStarted.current = false;
          return;
        }
        const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
        if (paymentIntent?.status === "succeeded" && typeof paymentIntent.amount === "number") {
          const eur = (paymentIntent.amount / 100).toFixed(2);
          await markWelcomeShown();
          setThanksEur(eur);
          timeoutId = setTimeout(() => {
            router.push(nextPath);
            router.refresh();
          }, 3200);
          return;
        }
        if (paymentIntent?.status === "requires_payment_method") {
          toast.error("Payment was not completed. You can try again or skip for now.");
        }
        paymentReturnStarted.current = false;
      } catch (e) {
        console.error("Welcome payment return", e);
        toast.error("Could not confirm payment status.");
        paymentReturnStarted.current = false;
      }
    })();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [searchParams, nextPath, router]);

  if (thanksEur) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <p
          className="text-lg leading-relaxed"
          style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}
        >
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
          key={ROTATING_RESCUE_PHOTOS[photoIndex]}
          src={ROTATING_RESCUE_PHOTOS[photoIndex]}
          alt="A rescue cat cared for through Tinies partner sanctuaries in Cyprus"
          fill
          className="object-cover transition-opacity duration-700"
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

      <p className="mt-8 text-center">
        <button
          type="button"
          onClick={() => void proceedAfterWelcome()}
          className="text-sm font-semibold underline-offset-4 hover:underline"
          style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
        >
          Skip for now
        </button>
      </p>
    </div>
  );
}
