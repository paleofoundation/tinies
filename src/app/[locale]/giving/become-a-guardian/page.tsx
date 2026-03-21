import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCharitiesForGuardian } from "@/lib/giving/actions";
import { GuardianCheckoutForm } from "./GuardianCheckoutForm";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Become a Tinies Guardian | Monthly Giving",
  description:
    "Subscribe to give monthly to animal rescue in Cyprus. 100% of your donation supports animals — Friend, Guardian, or Champion tiers, or choose your own amount.",
  openGraph: {
    title: "Become a Tinies Guardian | Tinies",
    description:
      "Support rescue animals every month with a Tinies Guardian subscription. 100% of your donation goes to animal rescue.",
    url: `${BASE_URL}/giving/become-a-guardian`,
    siteName: "Tinies",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Become a Tinies Guardian | Tinies",
    description: "Monthly giving for animal rescue — 100% to the animals.",
  },
};

export default async function BecomeAGuardianPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/giving/become-a-guardian");

  let charities: Awaited<ReturnType<typeof getCharitiesForGuardian>>;
  try {
    charities = await getCharitiesForGuardian();
  } catch (e) {
    console.error("getCharitiesForGuardian", e);
    charities = [];
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <section
        className="relative overflow-hidden px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-20"
        style={{ background: "linear-gradient(180deg, var(--color-primary-50) 0%, var(--color-background) 100%)" }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <Link
            href="/giving"
            className="inline-block text-sm font-medium hover:underline"
            style={{ color: "var(--color-primary)" }}
          >
            ← Back to Giving
          </Link>
          <h1
            className="mt-6 font-normal tracking-tight sm:text-5xl"
            style={{
              fontFamily: "var(--font-heading), serif",
              fontSize: "var(--text-4xl)",
              color: "var(--color-text)",
            }}
          >
            Become a Tinies Guardian
          </h1>
          <p
            className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed sm:text-xl"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
          >
            Support rescue animals every month.{" "}
            <span className="font-semibold" style={{ color: "var(--color-text)" }}>
              100% of your donation goes to animal rescue.
            </span>
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <div
          className="rounded-[var(--radius-xl)] border p-6 sm:p-10"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <GuardianCheckoutForm charities={charities} />
        </div>
      </main>
    </div>
  );
}
