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
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-10 pb-14 sm:px-6 sm:pt-14 sm:pb-20 lg:px-8">
        <div className="absolute inset-0 rounded-b-[3rem] sm:rounded-b-[4rem]" style={{ backgroundColor: "rgba(10, 110, 92, 0.05)" }} />
        <div className="relative mx-auto text-center" style={{ maxWidth: "var(--max-width)" }}>
          <h1
            className="font-normal tracking-tight sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-4xl)", color: "var(--color-text)" }}
          >
            Every booking helps.
          </h1>
          <p className="mt-4 mx-auto max-w-xl text-lg" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            10% of Tinies&apos; proceeds go directly to animal rescue in Cyprus. Here&apos;s how it works.
          </p>
        </div>
      </section>

      {/* Counters */}
      <section className="-mt-4 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="rounded-[var(--radius-lg)] border px-8 py-10 text-center" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
              <p className="tabular-nums text-3xl font-bold sm:text-4xl" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-secondary)" }}>
                €0
              </p>
              <p className="mt-2 text-sm font-medium" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                donated to date
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border px-8 py-10 text-center" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
              <p className="tabular-nums text-3xl font-bold sm:text-4xl" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-secondary)" }}>
                0
              </p>
              <p className="mt-2 text-sm font-medium" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                charities supported
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border px-8 py-10 text-center" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
              <p className="tabular-nums text-3xl font-bold sm:text-4xl" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-secondary)" }}>
                0
              </p>
              <p className="mt-2 text-sm font-medium" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                Tinies Guardians
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Three giving mechanisms */}
      <section className="px-4 py-20 sm:px-6 lg:px-8" style={{ paddingTop: "var(--space-section)", paddingBottom: "var(--space-section)" }}>
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <h2
            className="text-center font-normal sm:text-3xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
          >
            How we give
          </h2>
          <div className="mt-14 space-y-8">
            <div className="flex gap-6 rounded-[var(--radius-lg)] border p-8 sm:gap-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)", padding: "var(--space-card)" }}>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-lg)]" style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}>
                <Leaf className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                  We give 10% of every commission to animal rescue. Automatically. Always.
                </h3>
                <p className="mt-3 leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                  When a booking completes, 10% of what Tinies earns goes straight into the Giving Fund. No opt-in, no extra step. It&apos;s built into how we run the platform. You book care — we share the proceeds with rescues and sanctuaries in Cyprus.
                </p>
              </div>
            </div>
            <div className="flex gap-6 rounded-[var(--radius-lg)] border p-8 sm:gap-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)", padding: "var(--space-card)" }}>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-lg)]" style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}>
                <Coins className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                  Round up your booking to donate the change.
                </h3>
                <p className="mt-3 leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                  At checkout, you can round up to the nearest euro. The difference goes to your chosen charity or the general Giving Fund. It&apos;s on by default — you can turn it off anytime. Every round-up adds up.
                </p>
              </div>
            </div>
            <div className="flex gap-6 rounded-[var(--radius-lg)] border p-8 sm:gap-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)", padding: "var(--space-card)" }}>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-lg)]" style={{ backgroundColor: "var(--color-secondary-50)", color: "var(--color-secondary)" }}>
                <Heart className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                  Become a Tinies Guardian and give monthly (from €3/month).
                </h3>
                <p className="mt-3 leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                  Guardians give a set amount each month to a charity they choose (or the general fund). You get a badge on your profile, impact updates, and early access to new adoption listings. Pause or cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured charities */}
      <section className="rounded-t-[2rem] bg-white px-4 py-20 sm:px-6 lg:px-8" style={{ paddingTop: "var(--space-section)", paddingBottom: "var(--space-section)" }}>
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <h2
            className="font-normal"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
          >
            Featured charities
          </h2>
          <p className="mt-2" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Verified rescues and sanctuaries we support.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {FEATURED_CHARITIES.map((charity) => (
              <div
                key={charity.slug}
                className="rounded-[var(--radius-lg)] border p-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
                style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)", padding: "var(--space-card)" }}
              >
                <h3 className="font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>{charity.name}</h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                  {charity.mission}
                </p>
                <Link
                  href={`/giving/${charity.slug}`}
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] border-2 bg-transparent px-4 font-semibold transition-opacity hover:opacity-90"
                  style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
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
      <section className="px-4 py-20 sm:px-6 lg:px-8" style={{ paddingTop: "var(--space-section)", paddingBottom: "var(--space-section)" }}>
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <div className="rounded-[var(--radius-lg)] px-8 py-14 text-center text-white sm:px-12 sm:py-16" style={{ backgroundColor: "var(--color-primary)" }}>
            <h2
              className="font-normal sm:text-3xl"
              style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "white" }}
            >
              Become a Tinies Guardian
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm sm:text-base" style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(255,255,255,0.9)" }}>
              Give monthly to animal rescue. Choose your tier, pick a charity or the general fund, and get a Guardian badge plus impact updates.
            </p>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {GUARDIAN_TIERS.map((tier) => (
                <div
                  key={tier.name}
                  className="rounded-[var(--radius-lg)] border p-8 backdrop-blur-sm"
                  style={{ borderColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(255,255,255,0.05)" }}
                >
                  <p className="font-semibold text-white" style={{ fontFamily: "var(--font-body), sans-serif" }}>{tier.name}</p>
                  <p className="mt-2 text-2xl font-bold tabular-nums text-white" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                    {tier.amount}
                    <span className="text-lg font-normal text-white/80">{tier.perMonth}</span>
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/85" style={{ fontFamily: "var(--font-body), sans-serif" }}>
                    {tier.description}
                  </p>
                </div>
              ))}
            </div>
            <Link
              href="/giving/become-a-guardian"
              className="mt-12 inline-flex h-12 items-center rounded-[var(--radius-pill)] bg-white px-8 font-semibold transition-opacity hover:opacity-95"
              style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", color: "var(--color-primary)" }}
            >
              Become a Guardian
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
