import {
  Search,
  CreditCard,
  Camera,
  PawPrint,
  Heart,
  Leaf,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

const SERVICE_OPTIONS = [
  "Dog Walking",
  "Pet Sitting",
  "Overnight Boarding",
  "Drop-In Visits",
  "Daycare",
] as const;

const ADOPTABLES = [
  { emoji: "🐕", name: "Max", age: "3 years", id: "max" },
  { emoji: "🐈", name: "Luna", age: "2 years", id: "luna" },
  { emoji: "🐱", name: "Mittens", age: "4 months", id: "mittens" },
  { emoji: "🐶", name: "Buddy", age: "6 months", id: "buddy" },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#1B2432]">
      {/* Hero */}
      <header className="relative overflow-hidden px-4 pt-10 pb-16 sm:px-6 sm:pt-16 sm:pb-24 lg:px-8">
        <div className="absolute inset-0 bg-[#0A6E5C]/5 rounded-b-[3rem] sm:rounded-b-[4rem]" />
        <div className="relative mx-auto max-w-[1170px] text-center">
          <h1
            className="text-4xl font-normal tracking-tight text-[#1B2432] sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--tiny-font-display), serif" }}
          >
            No matter the size.
          </h1>
          <p className="mt-4 text-lg text-[#6B7280] sm:text-xl max-w-xl mx-auto" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
            Trusted pet care and rescue adoption in Cyprus
          </p>
          <p className="mt-2 text-base font-medium text-[#0A6E5C] sm:text-lg" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
            Every booking helps a tiny.
          </p>

          {/* Search area */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-center sm:gap-0 sm:rounded-[14px] sm:bg-white sm:overflow-hidden sm:max-w-xl sm:mx-auto sm:border sm:border-[#E5E7EB] sm:shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <div className="relative flex-1">
              <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B7280] pointer-events-none" />
              <select
                className="w-full appearance-none rounded-[14px] border border-[#E5E7EB] bg-white py-3.5 pl-11 pr-4 text-[#1B2432] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40 sm:rounded-none sm:border-0 sm:border-r border-r-[#E5E7EB]"
                style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
                defaultValue=""
                aria-label="Service type"
              >
                <option value="" disabled>
                  Choose a service
                </option>
                {SERVICE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <Link
              href="/services/search"
              className="inline-flex items-center justify-center gap-2 rounded-[999px] bg-[#0A6E5C] px-6 h-12 font-semibold text-white transition-opacity hover:opacity-90 sm:rounded-none sm:rounded-r-[14px]"
              style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
            >
              <Search className="h-5 w-5" />
              Find Care
            </Link>
          </div>
        </div>
      </header>

      {/* How It Works */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1170px]">
          <h2
            className="text-2xl font-normal text-[#1B2432] sm:text-3xl text-center"
            style={{ fontFamily: "var(--tiny-font-display), serif" }}
          >
            How it works
          </h2>
          <p className="mt-2 text-[#6B7280] text-center max-w-lg mx-auto" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
            Book trusted pet care in three simple steps.
          </p>
          <div className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0A6E5C]/10 text-[#0A6E5C]">
                <Search className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>Search</h3>
              <p className="mt-1 text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                Find verified providers near you
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0A6E5C]/10 text-[#0A6E5C]">
                <CreditCard className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>Book</h3>
              <p className="mt-1 text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                Secure payment, instant confirmation
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0A6E5C]/10 text-[#0A6E5C]">
                <Camera className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>Relax</h3>
              <p className="mt-1 text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                Photo updates while you&apos;re away
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tinies Looking for Homes */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-white rounded-t-[2rem] sm:rounded-t-[3rem]">
        <div className="mx-auto max-w-[1170px]">
          <h2
            className="text-2xl font-normal text-[#1B2432] sm:text-3xl text-center"
            style={{ fontFamily: "var(--tiny-font-display), serif" }}
          >
            Tinies looking for homes
          </h2>
          <p className="mt-2 text-[#6B7280] text-center max-w-lg mx-auto" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
            Adopt a rescue animal and give them a forever home.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {ADOPTABLES.map((animal) => (
              <article
                key={animal.id}
                className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
              >
                <div className="flex h-32 items-center justify-center rounded-[14px] bg-[#F7F7F8] text-6xl border border-[#E5E7EB]">
                  {animal.emoji}
                </div>
                <h3 className="mt-6 font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                  {animal.name}
                </h3>
                <p className="text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>{animal.age}</p>
                <Link
                  href={`/adopt/${animal.id}`}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-[999px] bg-[#F45D48] px-4 h-12 font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
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
              className="inline-flex items-center gap-2 text-[#0A6E5C] font-semibold hover:underline"
              style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
            >
              View all adoptable Tinies
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust signals bar */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 border-t border-[#E5E7EB]">
        <div className="mx-auto max-w-[1170px]">
          <div className="flex flex-col gap-10 sm:flex-row sm:justify-around sm:gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A6E5C]/15 text-[#0A6E5C]">
                <PawPrint className="h-6 w-6" />
              </div>
              <p className="text-xl font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                50+ Verified Providers
              </p>
              <p className="text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>Across Cyprus</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F45D48]/15 text-[#F45D48]">
                <Heart className="h-6 w-6" />
              </div>
              <p className="text-xl font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                100+ Happy Tinies Adopted
              </p>
              <p className="text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>And counting</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A6E5C]/15 text-[#0A6E5C]">
                <Leaf className="h-6 w-6" />
              </div>
              <p className="text-xl font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                90% of our commission goes to rescue animal care
              </p>
              <p className="text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>Food, vet care, shelter</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Tinies */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-white border-t border-[#E5E7EB]">
        <div className="mx-auto max-w-[720px] text-center">
          <p className="text-[#1B2432] leading-relaxed" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
            Tinies was built to fund Gardens of St Gertrude, a cat sanctuary in Parekklisia caring for 92 cats. Every booking on this platform helps feed, shelter, and provide medical care for rescue animals across Cyprus.
          </p>
        </div>
      </section>
    </div>
  );
}
