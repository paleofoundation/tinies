import type { Metadata } from "next";
import { Suspense } from "react";
import { getFeaturedCharitiesForQuickDonate } from "@/lib/giving/actions";
import { QuickDonateClient } from "./QuickDonateClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Give | Help rescue animals in Cyprus | Tinies",
  description: "Donate once or give monthly. Apple Pay, Google Pay, card. 15 seconds to support animal rescue.",
};

export default async function GivePage() {
  let charities: Awaited<ReturnType<typeof getFeaturedCharitiesForQuickDonate>>;
  try {
    charities = await getFeaturedCharitiesForQuickDonate();
  } catch (e) {
    console.error("getFeaturedCharitiesForQuickDonate", e);
    charities = [];
  }
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-10">
        <h1
          className="text-center font-normal tracking-tight"
          style={{ fontFamily: "var(--font-heading), serif", fontSize: "clamp(1.5rem, 5vw, 1.75rem)", color: "var(--color-text)" }}
        >
          Help rescue animals in Cyprus
        </h1>
        <p className="mt-2 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
          One-time or monthly. No account needed.
        </p>
        <div className="mt-8 rounded-[var(--radius-lg)] border p-6" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
          <Suspense fallback={<div className="py-8 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>Loading…</div>}>
            <QuickDonateClient initialCharities={charities} />
          </Suspense>
        </div>
        <p className="mt-6 text-center">
          <a href="/giving" className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>
            Learn more about Tinies Giving
          </a>
        </p>
      </main>
    </div>
  );
}
