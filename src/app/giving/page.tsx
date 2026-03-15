import type { Metadata } from "next";
import { Leaf, Coins, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tinies Giving | Transparency & Impact",
  description:
    "Every booking helps. 10% of our commission goes to animal rescue. Round up at checkout, become a Tinies Guardian, or support featured charities. See how we give.",
};

const FEATURED_CHARITIES = [
  { name: "Gardens of St Gertrude", mission: "Cat sanctuary in Parekklisia — 92 cats and counting.", slug: "gardens-of-st-gertrude" },
  { name: "Cyprus Dog Rescue", mission: "Rehoming stray and abandoned dogs across Cyprus.", slug: "cyprus-dog-rescue" },
  { name: "Paws & Claws Cyprus", mission: "Vet care and adoption for cats and dogs in need.", slug: "paws-and-claws-cyprus" },
] as const;

const GUARDIAN_TIERS = [
  { name: "Friend", amount: "€3", perMonth: "/month", description: "Support rescue every month. Badge on your profile." },
  { name: "Guardian", amount: "€5", perMonth: "/month", description: "Our most popular. Monthly impact email + early access to new adoptions." },
  { name: "Champion", amount: "€10", perMonth: "/month", description: "Maximum impact. Everything in Guardian, plus featured in our community." },
] as const;

export default function GivingPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#1B2432]">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-10 pb-14 sm:px-6 sm:pt-14 sm:pb-20 lg:px-8">
        <div className="absolute inset-0 bg-[#0A6E5C]/5 rounded-b-[3rem] sm:rounded-b-[4rem]" />
        <div className="relative mx-auto max-w-[1170px] text-center">
          <h1
            className="text-4xl font-normal tracking-tight text-[#1B2432] sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--tiny-font-display), serif" }}
          >
            Every booking helps.
          </h1>
          <p className="mt-4 text-lg text-[#6B7280] max-w-xl mx-auto" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
            10% of Tinies' proceeds go directly to animal rescue in Cyprus. Here's how it works.
          </p>
        </div>
      </section>

      {/* Counters */}
      <section className="px-4 -mt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1170px]">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="rounded-[14px] border border-[#E5E7EB] bg-white px-8 py-10 text-center shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <p className="text-3xl font-bold tabular-nums text-[#F45D48] sm:text-4xl" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                €0
              </p>
              <p className="mt-2 text-sm font-medium text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                donated to date
              </p>
            </div>
            <div className="rounded-[14px] border border-[#E5E7EB] bg-white px-8 py-10 text-center shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <p className="text-3xl font-bold tabular-nums text-[#F45D48] sm:text-4xl" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                0
              </p>
              <p className="mt-2 text-sm font-medium text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                charities supported
              </p>
            </div>
            <div className="rounded-[14px] border border-[#E5E7EB] bg-white px-8 py-10 text-center shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <p className="text-3xl font-bold tabular-nums text-[#F45D48] sm:text-4xl" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                0
              </p>
              <p className="mt-2 text-sm font-medium text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                Tinies Guardians
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Three giving mechanisms */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1170px]">
          <h2
            className="text-2xl font-normal text-[#1B2432] text-center sm:text-3xl"
            style={{ fontFamily: "var(--tiny-font-display), serif" }}
          >
            How we give
          </h2>
          <div className="mt-14 space-y-8">
            <div className="flex gap-6 rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:gap-8">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-[#0A6E5C]/10 text-[#0A6E5C]">
                <Leaf className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                  We give 10% of every commission to animal rescue. Automatically. Always.
                </h3>
                <p className="mt-3 text-[#6B7280] leading-relaxed" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                  When a booking completes, 10% of what Tinies earns goes straight into the Giving Fund. No opt-in, no extra step. It's built into how we run the platform. You book care — we share the proceeds with rescues and sanctuaries in Cyprus.
                </p>
              </div>
            </div>
            <div className="flex gap-6 rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:gap-8">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-[#0A6E5C]/10 text-[#0A6E5C]">
                <Coins className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                  Round up your booking to donate the change.
                </h3>
                <p className="mt-3 text-[#6B7280] leading-relaxed" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                  At checkout, you can round up to the nearest euro. The difference goes to your chosen charity or the general Giving Fund. It's on by default — you can turn it off anytime. Every round-up adds up.
                </p>
              </div>
            </div>
            <div className="flex gap-6 rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:gap-8">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-[#F45D48]/10 text-[#F45D48]">
                <Heart className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                  Become a Tinies Guardian and give monthly (from €3/month).
                </h3>
                <p className="mt-3 text-[#6B7280] leading-relaxed" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                  Guardians give a set amount each month to a charity they choose (or the general fund). You get a badge on your profile, impact updates, and early access to new adoption listings. Pause or cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured charities */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-white rounded-t-[2rem]">
        <div className="mx-auto max-w-[1170px]">
          <h2
            className="text-2xl font-normal text-[#1B2432]"
            style={{ fontFamily: "var(--tiny-font-display), serif" }}
          >
            Featured charities
          </h2>
          <p className="mt-2 text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
            Verified rescues and sanctuaries we support.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {FEATURED_CHARITIES.map((charity) => (
              <div
                key={charity.slug}
                className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
              >
                <h3 className="font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>{charity.name}</h3>
                <p className="mt-3 text-sm text-[#6B7280] leading-relaxed" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                  {charity.mission}
                </p>
                <Link
                  href={`/giving/${charity.slug}`}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-[999px] border-2 border-[#0A6E5C] bg-transparent px-4 h-12 font-semibold text-[#0A6E5C] transition-opacity hover:opacity-90"
                  style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
                >
                  Support this charity
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Become a Guardian CTA */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1170px]">
          <div className="rounded-[14px] bg-[#0A6E5C] px-8 py-14 text-center text-white sm:px-12 sm:py-16">
            <h2
              className="text-2xl font-normal sm:text-3xl"
              style={{ fontFamily: "var(--tiny-font-display), serif" }}
            >
              Become a Tinies Guardian
            </h2>
            <p className="mt-4 text-white/90 max-w-lg mx-auto text-sm sm:text-base" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
              Give monthly to animal rescue. Choose your tier, pick a charity or the general fund, and get a Guardian badge plus impact updates.
            </p>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {GUARDIAN_TIERS.map((tier) => (
                <div
                  key={tier.name}
                  className="rounded-[14px] border border-white/20 bg-white/5 p-8 backdrop-blur-sm"
                >
                  <p className="font-semibold text-white" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>{tier.name}</p>
                  <p className="mt-2 text-2xl font-bold tabular-nums text-white" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                    {tier.amount}
                    <span className="text-lg font-normal text-white/80">{tier.perMonth}</span>
                  </p>
                  <p className="mt-3 text-sm text-white/85 leading-relaxed" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                    {tier.description}
                  </p>
                </div>
              ))}
            </div>
            <Link
              href="/giving/become-a-guardian"
              className="mt-12 inline-flex items-center rounded-[999px] bg-white px-6 h-12 font-semibold text-[#0A6E5C] transition-opacity hover:opacity-95"
              style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
            >
              Become a Guardian
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
