import type { Metadata } from "next";
import { Heart, MapPin, Filter } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Adopt a Tiny | Rescue Animals in Cyprus",
  description:
    "Every tiny deserves a home. Rescue organisations post their own adoption listings on Tinies. Browse dogs and cats, apply through the platform, and connect with rescues and transport providers.",
};

const DISTRICTS = [
  "All districts",
  "Nicosia",
  "Limassol",
  "Larnaca",
  "Paphos",
  "Famagusta",
] as const;

const AGE_RANGES = [
  "Any age",
  "Under 1 year",
  "1–3 years",
  "3–7 years",
  "7+ years",
] as const;

const ANIMALS = [
  { emoji: "🐕", name: "Max", species: "Dog", breed: "Mixed", age: "3 years", sex: "Male", location: "Limassol", id: "max" },
  { emoji: "🐈", name: "Luna", species: "Cat", breed: "European Shorthair", age: "2 years", sex: "Female", location: "Nicosia", id: "luna" },
  { emoji: "🐶", name: "Buddy", species: "Dog", breed: "Terrier mix", age: "6 months", sex: "Male", location: "Paphos", id: "buddy" },
  { emoji: "🐱", name: "Mittens", species: "Cat", breed: "Tabby", age: "4 months", sex: "Female", location: "Larnaca", id: "mittens" },
  { emoji: "🐕", name: "Roxy", species: "Dog", breed: "Lab mix", age: "5 years", sex: "Female", location: "Limassol", id: "roxy" },
  { emoji: "🐈", name: "Shadow", species: "Cat", breed: "Black domestic", age: "1 year", sex: "Male", location: "Nicosia", id: "shadow" },
  { emoji: "🐶", name: "Cooper", species: "Dog", breed: "Beagle mix", age: "2 years", sex: "Male", location: "Famagusta", id: "cooper" },
  { emoji: "🐱", name: "Bella", species: "Cat", breed: "Calico", age: "8 months", sex: "Female", location: "Paphos", id: "bella" },
] as const;

export default function AdoptPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#1B2432]">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-10 pb-12 sm:px-6 sm:pt-14 sm:pb-16 lg:px-8">
        <div className="absolute inset-0 bg-[#F45D48]/5 rounded-b-[3rem] sm:rounded-b-[4rem]" />
        <div className="relative mx-auto max-w-[1170px] text-center">
          <h1
            className="text-4xl font-normal tracking-tight text-[#1B2432] sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--tiny-font-display), serif" }}
          >
            Every tiny deserves a home.
          </h1>
          <p className="mt-4 text-lg text-[#6B7280] max-w-2xl mx-auto" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
            Rescue organisations list their animals on Tinies. Browse dogs and cats, apply through the platform, and connect with rescues and transport providers — locally in Cyprus or internationally.
          </p>
        </div>
      </section>

      {/* Two paths: Local vs International */}
      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1170px]">
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <h2 className="text-lg font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                Adopt locally in Cyprus
              </h2>
              <p className="mt-3 text-sm text-[#6B7280] leading-relaxed" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                You're in Cyprus and ready to adopt. Browse animals listed by rescues near you, meet them, and take your tiny home. Each rescue sets their own adoption process and fees.
              </p>
              <Link
                href="#animals"
                className="mt-6 inline-flex items-center text-[#0A6E5C] font-semibold hover:underline"
                style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
              >
                Browse local animals →
              </Link>
            </div>
            <div className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <h2 className="text-lg font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                Adopt internationally from Cyprus
              </h2>
              <p className="mt-3 text-sm text-[#6B7280] leading-relaxed" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                You're in the UK, Germany, or elsewhere in the EU. Apply through Tinies; rescues and transport providers handle vet prep, EU pet passport, and transport. One platform — they run the process.
              </p>
              <Link
                href="/adopt/from-cyprus-to-uk"
                className="mt-6 inline-flex items-center text-[#F45D48] font-semibold hover:underline"
                style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
              >
                See adoption to your country →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="px-4 pb-8 sm:px-6 lg:px-8" aria-label="Filter adoptable animals">
        <div className="mx-auto max-w-[1170px]">
          <div className="flex flex-wrap items-center gap-4 rounded-[14px] border border-[#E5E7EB] bg-white px-6 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <span className="flex items-center gap-2 text-sm font-medium text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
              <Filter className="h-4 w-4" />
              Filters
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>Species:</span>
              <div className="flex rounded-[999px] border border-[#E5E7EB] bg-[#F7F7F8] p-0.5">
                {(["All", "Dogs", "Cats"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`rounded-[999px] px-4 py-2 text-sm font-medium transition-colors ${opt === "All"
                      ? "bg-[#0A6E5C] text-white"
                      : "text-[#6B7280] hover:bg-[#0A6E5C]/10 hover:text-[#1B2432]"
                    }`}
                    style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <select
              className="rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2 text-sm text-[#1B2432] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
              style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
              aria-label="District"
              defaultValue=""
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d === "All districts" ? "" : d}>{d}</option>
              ))}
            </select>
            <select
              className="rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2 text-sm text-[#1B2432] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
              style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
              aria-label="Age range"
              defaultValue=""
            >
              {AGE_RANGES.map((a) => (
                <option key={a} value={a === "Any age" ? "" : a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Animal grid */}
      <section id="animals" className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1170px]">
          <h2
            className="text-xl font-normal text-[#1B2432] sm:text-2xl"
            style={{ fontFamily: "var(--tiny-font-display), serif" }}
          >
            Tinies looking for homes
          </h2>
          <p className="mt-2 text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
            Animals listed by rescue organisations — waiting for you.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {ANIMALS.map((animal) => (
              <article
                key={animal.id}
                className="group rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
              >
                <div className="flex h-40 items-center justify-center rounded-t-[14px] bg-[#F7F7F8] text-6xl border-b border-[#E5E7EB] group-hover:bg-[#0A6E5C]/5">
                  {animal.emoji}
                </div>
                <div className="p-8">
                  <h3 className="font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>{animal.name}</h3>
                  <p className="mt-1 text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                    {animal.species} · {animal.breed}
                  </p>
                  <p className="mt-1 text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                    {animal.age} · {animal.sex}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {animal.location}
                  </p>
                  <Link
                    href={`/adopt/${animal.id}`}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-[999px] bg-[#F45D48] px-4 h-12 font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
                  >
                    <Heart className="h-4 w-4" />
                    Adopt this Tiny
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
