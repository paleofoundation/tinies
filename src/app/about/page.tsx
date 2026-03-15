import type { Metadata } from "next";
import { Heart, Leaf } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Tinies | The Real Story",
  description:
    "Gardens of St Gertrude has 92 cats in Parekklisia, Cyprus. Funded 100% out of pocket — until now. Tinies is a marketplace built to feed them. 90% of every commission goes to rescue animal care.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto px-4 py-20 sm:px-6 lg:px-8" style={{ maxWidth: "var(--max-width)" }}>
        <h1
          className="font-normal tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
        >
          About Tinies
        </h1>
        <p className="mt-2 text-lg" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          No matter the size. Every booking helps a tiny.
        </p>

        <section className="mt-14">
          <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)]" style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}>
            <Heart className="h-6 w-6" />
          </div>
          <h2
            className="mt-6 font-normal"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
          >
            The real story
          </h2>
          <p className="mt-3 leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)", fontSize: "var(--text-base)" }}>
            Gardens of St Gertrude is a cat sanctuary in Parekklisia, Cyprus. Ninety-two cats. Founded by Karen Pendergrass. For years it has been funded 100% out of pocket — by Karen and the Paleo Foundation. Not a single donation has ever been accepted.
          </p>
          <p className="mt-4 leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)", fontSize: "var(--text-base)" }}>
            Until now.
          </p>
          <p className="mt-4 leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)", fontSize: "var(--text-base)" }}>
            Instead of asking for handouts, she built a marketplace. Tinies doesn&apos;t walk dogs, sit pets, or coordinate adoptions directly. Independent service providers, rescue organisations, and transport coordinators list themselves on the platform. Pet owners and adopters find them, book, and pay through Tinies. We take a 12% commission — and roughly 90% of that goes straight to caring for rescue animals: food, vet visits, medications, surgeries, spay/neuter, emergency treatment, and shelter. The rest covers platform costs. There are no salaries, no investors, no profit motive.
          </p>
          <p className="mt-4 font-medium leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)", fontSize: "var(--text-base)" }}>
            This is not a tech company. This is a feeding schedule, a vet bill, and a second chance.
          </p>
        </section>

        <section className="mt-20">
          <h2
            className="font-normal"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
          >
            Who we support
          </h2>
          <p className="mt-4 leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)", fontSize: "var(--text-base)" }}>
            Tinies was built first for Gardens of St Gertrude, but the model extends to other sanctuaries in Cyprus: Malcolm&apos;s Cat Sanctuary, Patch of Heaven, and others. The goal is simple: every booking on this platform helps feed, shelter, and heal rescue animals. When you book pet care or adopt through Tinies, you&apos;re part of that.
          </p>
        </section>

        <section className="mt-20 rounded-[var(--radius-lg)] border p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)", padding: "var(--space-card)" }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)]" style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}>
            <Leaf className="h-6 w-6" />
          </div>
          <h2
            className="mt-6 font-normal"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
          >
            90% for rescue — always
          </h2>
          <p className="mt-4 leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
            Approximately 90% of Tinies&apos; commission revenue goes directly to animal sanctuaries for care. The remaining ~10% keeps the platform running. It&apos;s built into how we operate — not a one-off campaign. Every booking helps a tiny.
          </p>
          <Link
            href="/giving"
            className="mt-6 inline-flex font-semibold hover:underline"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}
          >
            See how we give →
          </Link>
        </section>

        <p className="mt-20 text-center">
          <Link
            href="/"
            className="hover:underline"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
          >
            Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
