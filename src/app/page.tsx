import {
  Search,
  CreditCard,
  Camera,
  PawPrint,
  Heart,
  Leaf,
} from "lucide-react";
import Link from "next/link";
import { HomeSearchBar } from "@/components/layout/HomeSearchBar";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Tinies",
  url: BASE_URL,
  description: "Trusted pet care and rescue adoption in Cyprus. No matter the size.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/services/search?type={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const ADOPTABLES = [
  { emoji: "🐕", name: "Max", age: "3 years", id: "max" },
  { emoji: "🐈", name: "Luna", age: "2 years", id: "luna" },
  { emoji: "🐱", name: "Mittens", age: "4 months", id: "mittens" },
  { emoji: "🐶", name: "Buddy", age: "6 months", id: "buddy" },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {/* Hero */}
      <header className="relative overflow-hidden px-4 pt-10 pb-16 sm:px-6 sm:pt-16 sm:pb-24 lg:px-8">
        <div className="absolute inset-0 rounded-b-[3rem] sm:rounded-b-[4rem]" style={{ backgroundColor: "rgba(10, 110, 92, 0.05)" }} />
        <div className="relative mx-auto text-center" style={{ maxWidth: "var(--max-width)" }}>
          <h1
            className="font-normal tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-4xl)", color: "var(--color-text)" }}
          >
            No matter the size.
          </h1>
          <p className="mt-4 mx-auto max-w-xl text-lg sm:text-xl" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Trusted pet care and rescue adoption in Cyprus
          </p>
          <p className="mt-2 text-base font-medium sm:text-lg" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}>
            Every booking helps a tiny.
          </p>

          {/* Search area: geocodes location and redirects to /services/search?lat=&lng=&type= */}
          <HomeSearchBar />
        </div>
      </header>

      {/* How It Works */}
      <section className="px-4 py-20 sm:px-6 lg:px-8" style={{ paddingTop: "var(--space-section)", paddingBottom: "var(--space-section)" }}>
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <h2
            className="text-center"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
          >
            How it works
          </h2>
          <p className="mt-2 mx-auto max-w-lg text-center" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Book trusted pet care in three simple steps.
          </p>
          <div className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}>
                <Search className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>Search</h3>
              <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                Find verified providers near you
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}>
                <CreditCard className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>Book</h3>
              <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                Secure payment, instant confirmation
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}>
                <Camera className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>Relax</h3>
              <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                Photo updates while you&apos;re away
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tinies Looking for Homes */}
      <section className="rounded-t-[2rem] bg-white px-4 py-20 sm:px-6 sm:rounded-t-[3rem] lg:px-8" style={{ paddingTop: "var(--space-section)", paddingBottom: "var(--space-section)" }}>
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <h2
            className="text-center"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
          >
            Tinies looking for homes
          </h2>
          <p className="mt-2 mx-auto max-w-lg text-center" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Adopt a rescue animal and give them a forever home.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {ADOPTABLES.map((animal) => (
              <article
                key={animal.id}
                className="rounded-[var(--radius-lg)] border p-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
                style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)", padding: "var(--space-card)" }}
              >
                <div className="flex h-32 items-center justify-center rounded-[var(--radius-lg)] border text-6xl" style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)" }}>
                  {animal.emoji}
                </div>
                <h3 className="mt-6 font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                  {animal.name}
                </h3>
                <p className="text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>{animal.age}</p>
                <Link
                  href={`/adopt/${animal.id}`}
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] px-4 font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", backgroundColor: "var(--color-secondary)" }}
                >
                  <Heart className="h-4 w-4" />
                  Adopt this Tiny
                </Link>
              </article>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/adopt"
              className="inline-flex items-center gap-2 font-semibold hover:underline"
              style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}
            >
              View all adoptable Tinies
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust signals bar */}
      <section className="border-t px-4 py-20 sm:px-6 lg:px-8" style={{ borderColor: "var(--color-border)", paddingTop: "var(--space-section)", paddingBottom: "var(--space-section)" }}>
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <div className="flex flex-col gap-10 text-center sm:flex-row sm:justify-around sm:gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-primary-100)", color: "var(--color-primary)" }}>
                <PawPrint className="h-6 w-6" />
              </div>
              <p className="text-xl font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                50+ Verified Providers
              </p>
              <p className="text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>Across Cyprus</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-secondary-100)", color: "var(--color-secondary)" }}>
                <Heart className="h-6 w-6" />
              </div>
              <p className="text-xl font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                100+ Happy Tinies Adopted
              </p>
              <p className="text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>And counting</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-primary-100)", color: "var(--color-primary)" }}>
                <Leaf className="h-6 w-6" />
              </div>
              <p className="text-xl font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                90% of our commission goes to rescue animal care
              </p>
              <p className="text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>Food, vet care, shelter</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Tinies */}
      <section className="border-t bg-white px-4 py-20 sm:px-6 lg:px-8" style={{ borderColor: "var(--color-border)", paddingTop: "var(--space-section)", paddingBottom: "var(--space-section)" }}>
        <div className="mx-auto max-w-[720px] text-center">
          <p className="leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)", fontSize: "var(--text-base)" }}>
            Tinies was built to fund Gardens of St Gertrude, a cat sanctuary in Parekklisia caring for 92 cats. Every booking on this platform helps feed, shelter, and provide medical care for rescue animals across Cyprus.
          </p>
        </div>
      </section>
    </div>
  );
}
