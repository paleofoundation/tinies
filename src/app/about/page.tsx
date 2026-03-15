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
    <div className="min-h-screen bg-[#F7F7F8] text-[#1B2432]">
      <main className="mx-auto max-w-[1170px] px-4 py-20 sm:px-6 lg:px-8">
        <h1
          className="text-3xl font-normal tracking-tight text-[#1B2432] sm:text-4xl"
          style={{ fontFamily: "var(--tiny-font-display), serif" }}
        >
          About Tinies
        </h1>
        <p className="mt-2 text-lg text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
          No matter the size. Every booking helps a tiny.
        </p>

        <section className="mt-14">
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#0A6E5C]/10 text-[#0A6E5C]">
            <Heart className="h-6 w-6" />
          </div>
          <h2
            className="mt-6 text-xl font-normal text-[#1B2432]"
            style={{ fontFamily: "var(--tiny-font-display), serif" }}
          >
            The real story
          </h2>
          <p className="mt-3 text-[#1B2432] leading-relaxed" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
            Gardens of St Gertrude is a cat sanctuary in Parekklisia, Cyprus. Ninety-two cats. Founded by Karen Pendergrass. For years it has been funded 100% out of pocket — by Karen and the Paleo Foundation. Not a single donation has ever been accepted.
          </p>
          <p className="mt-4 text-[#1B2432] leading-relaxed" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
            Until now.
          </p>
          <p className="mt-4 text-[#1B2432] leading-relaxed" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
            Instead of asking for handouts, she built a marketplace. Tinies doesn&apos;t walk dogs, sit pets, or coordinate adoptions directly. Independent service providers, rescue organisations, and transport coordinators list themselves on the platform. Pet owners and adopters find them, book, and pay through Tinies. We take a 12% commission — and roughly 90% of that goes straight to caring for rescue animals: food, vet visits, medications, surgeries, spay/neuter, emergency treatment, and shelter. The rest covers platform costs. There are no salaries, no investors, no profit motive.
          </p>
          <p className="mt-4 text-[#1B2432] leading-relaxed font-medium" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
            This is not a tech company. This is a feeding schedule, a vet bill, and a second chance.
          </p>
        </section>

        <section className="mt-20">
          <h2
            className="text-xl font-normal text-[#1B2432]"
            style={{ fontFamily: "var(--tiny-font-display), serif" }}
          >
            Who we support
          </h2>
          <p className="mt-4 text-[#1B2432] leading-relaxed" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
            Tinies was built first for Gardens of St Gertrude, but the model extends to other sanctuaries in Cyprus: Malcolm&apos;s Cat Sanctuary, Patch of Heaven, and others. The goal is simple: every booking on this platform helps feed, shelter, and heal rescue animals. When you book pet care or adopt through Tinies, you&apos;re part of that.
          </p>
        </section>

        <section className="mt-20 rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#0A6E5C]/10 text-[#0A6E5C]">
            <Leaf className="h-6 w-6" />
          </div>
          <h2
            className="mt-6 text-xl font-normal text-[#1B2432]"
            style={{ fontFamily: "var(--tiny-font-display), serif" }}
          >
            90% for rescue — always
          </h2>
          <p className="mt-4 text-[#6B7280] leading-relaxed" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
            Approximately 90% of Tinies&apos; commission revenue goes directly to animal sanctuaries for care. The remaining ~10% keeps the platform running. It&apos;s built into how we operate — not a one-off campaign. Every booking helps a tiny.
          </p>
          <Link
            href="/giving"
            className="mt-6 inline-flex items-center text-[#0A6E5C] font-semibold hover:underline"
            style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
          >
            See how we give →
          </Link>
        </section>

        <p className="mt-20 text-center">
          <Link
            href="/"
            className="text-[#6B7280] hover:text-[#1B2432] hover:underline"
            style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
          >
            Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
