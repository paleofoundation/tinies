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
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-10 pb-12 sm:px-6 sm:pt-14 sm:pb-16 lg:px-8">
        <div className="absolute inset-0 rounded-b-[3rem] sm:rounded-b-[4rem]" style={{ backgroundColor: "rgba(244, 93, 72, 0.05)" }} />
        <div className="relative mx-auto text-center" style={{ maxWidth: "var(--max-width)" }}>
          <h1
            className="font-normal tracking-tight sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-4xl)", color: "var(--color-text)" }}
          >
            Every tiny deserves a home.
          </h1>
          <p className="mt-4 mx-auto max-w-2xl text-lg" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Rescue organisations list their animals on Tinies. Browse dogs and cats, apply through the platform, and connect with rescues and transport providers — locally in Cyprus or internationally.
          </p>
        </div>
      </section>

      {/* Two paths: Local vs International */}
      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="rounded-[var(--radius-lg)] border p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)", padding: "var(--space-card)" }}>
              <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                Adopt locally in Cyprus
              </h2>
              <p className="mt-3 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                You&apos;re in Cyprus and ready to adopt. Browse animals listed by rescues near you, meet them, and take your tiny home. Each rescue sets their own adoption process and fees.
              </p>
              <Link
                href="#animals"
                className="mt-6 inline-flex items-center font-semibold hover:underline"
                style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}
              >
                Browse local animals →
              </Link>
            </div>
            <div className="rounded-[var(--radius-lg)] border p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)", padding: "var(--space-card)" }}>
              <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                Adopt internationally from Cyprus
              </h2>
              <p className="mt-3 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                You&apos;re in the UK, Germany, or elsewhere in the EU. Apply through Tinies; rescues and transport providers handle vet prep, EU pet passport, and transport. One platform — they run the process.
              </p>
              <Link
                href="/adopt/from-cyprus-to-uk"
                className="mt-6 inline-flex items-center font-semibold hover:underline"
                style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-secondary)" }}
              >
                See adoption to your country →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="px-4 pb-8 sm:px-6 lg:px-8" aria-label="Filter adoptable animals">
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <div className="flex flex-wrap items-center gap-4 rounded-[var(--radius-lg)] border px-6 py-4" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
            <span className="flex items-center gap-2 text-sm font-medium" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              <Filter className="h-4 w-4" />
              Filters
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>Species:</span>
              <div className="flex rounded-[var(--radius-pill)] border p-0.5" style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)" }}>
                {(["All", "Dogs", "Cats"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`rounded-[var(--radius-pill)] px-4 py-2 text-sm font-medium transition-colors ${opt === "All"
                      ? "text-white"
                      : "hover:bg-[var(--color-primary-50)]"
                    }`}
                    style={{
                      fontFamily: "var(--font-body), sans-serif",
                      ...(opt === "All" ? { backgroundColor: "var(--color-primary)" } : { color: "var(--color-text-secondary)" }),
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <select
              className="rounded-[var(--radius-lg)] border px-4 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
              aria-label="District"
              defaultValue=""
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d === "All districts" ? "" : d}>{d}</option>
              ))}
            </select>
            <select
              className="rounded-[var(--radius-lg)] border px-4 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
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
      <section id="animals" className="px-4 pb-20 sm:px-6 lg:px-8" style={{ paddingBottom: "var(--space-section)" }}>
        <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
          <h2
            className="font-normal sm:text-2xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
          >
            Tinies looking for homes
          </h2>
          <p className="mt-2" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Animals listed by rescue organisations — waiting for you.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {ANIMALS.map((animal) => (
              <article
                key={animal.id}
                className="group rounded-[var(--radius-lg)] border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
                style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}
              >
                <div className="flex h-40 items-center justify-center rounded-t-[var(--radius-lg)] border-b text-6xl group-hover:bg-[var(--color-primary-50)]" style={{ backgroundColor: "var(--color-background)", borderColor: "var(--color-border)" }}>
                  {animal.emoji}
                </div>
                <div className="p-8" style={{ padding: "var(--space-card)" }}>
                  <h3 className="font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>{animal.name}</h3>
                  <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                    {animal.species} · {animal.breed}
                  </p>
                  <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                    {animal.age} · {animal.sex}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {animal.location}
                  </p>
                  <Link
                    href={`/adopt/apply/${animal.id}`}
                    className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] px-4 font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", backgroundColor: "var(--color-secondary)" }}
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
