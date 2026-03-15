import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  Star,
  MapPin,
  Calendar,
  MessageCircle,
  Share2,
  Heart,
} from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = slugToName(slug);
  return {
    title: `${name} | Pet Care Provider | Tinies`,
    description: `View ${name}'s profile, services, availability, and reviews. Book trusted pet care in Cyprus.`,
  };
}

function slugToName(slug: string) {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

const SERVICES_PRICING = [
  { service: "Dog Walking", base: "€15", additional: "€8", maxPets: 3 },
  { service: "Pet Sitting", base: "€35", additional: "€15", maxPets: 2 },
  { service: "Drop-in visit", base: "€12", additional: "€6", maxPets: 4 },
] as const;

const AVAILABILITY_GRID = [
  { day: "Mon", morning: true, afternoon: true, evening: true },
  { day: "Tue", morning: true, afternoon: true, evening: false },
  { day: "Wed", morning: false, afternoon: true, evening: true },
  { day: "Thu", morning: true, afternoon: true, evening: true },
  { day: "Fri", morning: true, afternoon: true, evening: false },
  { day: "Sat", morning: true, afternoon: false, evening: false },
  { day: "Sun", morning: false, afternoon: true, evening: true },
] as const;

const PLACEHOLDER_REVIEWS = [
  { reviewer: "Sarah M.", date: "Mar 2025", rating: 5, text: "Maria was wonderful with our dog. She sent photos every day and left the house spotless. Will book again!", response: "Thank you, Sarah! Bella is always welcome." },
  { reviewer: "James K.", date: "Feb 2025", rating: 5, text: "Professional and caring. Our cat can be shy but warmed up to Maria quickly. Highly recommend.", response: "So glad Luna felt comfortable. She's a sweetheart." },
  { reviewer: "Elena T.", date: "Jan 2025", rating: 4, text: "Great experience. The only reason not 5 stars was a small delay on the first day—otherwise perfect.", response: "Thanks for the feedback. Sorry again about the traffic that day!" },
] as const;

const GALLERY_COLORS = ["#0A6E5C", "#0A6E5C", "#F45D48", "#0A6E5C", "#0A6E5C", "#F45D48"] as const;

export default async function ProviderProfilePage({ params }: Props) {
  const { slug } = await params;
  const name = slugToName(slug);
  const initials = slug
    .split("-")
    .map((s) => s.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      {/* Hero */}
      <section className="border-b bg-white" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <div className="mx-auto px-4 py-12 sm:px-6 sm:py-14" style={{ maxWidth: "var(--max-width)" }}>
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full text-3xl font-bold text-white" style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-primary)" }}>
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="font-normal sm:text-3xl" style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}>{name}</h1>
                <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-sm font-medium" style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)", borderColor: "var(--color-primary-200)" }}>
                  <BadgeCheck className="h-4 w-4" />
                  Verified
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm sm:justify-start" style={{ color: "var(--color-text-secondary)" }}>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  4.9 (24 reviews)
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 shrink-0" />
                  Limassol
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 shrink-0" />
                  Member since 2024
                </span>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <Link
                  href={`/services/book/${slug}`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-pill)] px-6 font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", backgroundColor: "var(--color-primary)" }}
                >
                  Book Now
                </Link>
                <Link
                  href={`/services/book/${slug}?meet=true`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-pill)] border-2 bg-transparent px-6 font-semibold transition-opacity hover:opacity-90"
                  style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
                >
                  Request Meet & Greet
                </Link>
                <Link
                  href="/dashboard/owner"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-pill)] border bg-white px-6 font-semibold transition-opacity hover:opacity-90"
                  style={{ fontFamily: "var(--font-body), sans-serif", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Message
                </Link>
                <button
                  type="button"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-pill)] border bg-white px-6 font-semibold transition-opacity hover:opacity-90"
                  style={{ fontFamily: "var(--font-body), sans-serif", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto px-4 py-14 sm:px-6 sm:py-16" style={{ maxWidth: "var(--max-width)" }}>
        {/* Bio */}
        <section className="mb-12">
          <h2 className="text-lg font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>About</h2>
          <p className="mt-3 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            I&apos;ve been caring for dogs and cats for over 5 years. I work from home and have a
            fenced garden, so your pet will have plenty of space and attention. I only take a
            few bookings at a time so everyone gets the best care. I&apos;m happy to send photo
            updates and can administer medication if needed.
          </p>
        </section>

        {/* Services & pricing */}
        <section className="mb-12">
          <h2 className="text-lg font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>Services & pricing</h2>
          <div className="mt-4 overflow-x-auto rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--color-border)" }}>
            <table className="w-full min-w-[320px] text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--color-text)" }}>Service</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--color-text)" }}>Base price</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--color-text)" }}>Additional pet</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--color-text)" }}>Max pets</th>
                </tr>
              </thead>
              <tbody>
                {SERVICES_PRICING.map((row) => (
                  <tr key={row.service} className="border-b" style={{ borderColor: "var(--color-border)" }}>
                    <td className="px-4 py-3" style={{ color: "var(--color-text)" }}>{row.service}</td>
                    <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>{row.base}</td>
                    <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>{row.additional}</td>
                    <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>{row.maxPets}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Availability */}
        <section className="mb-12">
          <h2 className="text-lg font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>Availability</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>Typical weekly schedule (read-only)</p>
          <div className="mt-4 overflow-x-auto rounded-[var(--radius-lg)] border bg-white" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
            <table className="w-full min-w-[320px] text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                  <th className="px-3 py-2 text-left font-medium" style={{ color: "var(--color-text-secondary)" }}></th>
                  {AVAILABILITY_GRID.map((r) => (
                    <th key={r.day} className="px-3 py-2 text-center font-medium" style={{ color: "var(--color-text)" }}>{r.day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(["morning", "afternoon", "evening"] as const).map((slot) => (
                  <tr key={slot} className="border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
                    <td className="px-3 py-2 font-medium capitalize" style={{ color: "var(--color-text-secondary)" }}>{slot}</td>
                    {AVAILABILITY_GRID.map((r) => (
                      <td key={r.day} className="px-3 py-2 text-center">
                        <span
                          className={`inline-block h-6 w-6 rounded ${
                            r[slot] ? "" : ""
                          }`}
                          style={r[slot] ? { backgroundColor: "var(--color-primary-200)", color: "var(--color-primary)" } : { backgroundColor: "var(--color-neutral-200)", color: "var(--color-text-muted)" }}
                        >
                          {r[slot] ? "✓" : "—"}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Photo gallery */}
        <section className="mb-12">
          <h2 className="text-lg font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>Photos</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {GALLERY_COLORS.map((color, i) => (
              <div
                key={i}
                className="aspect-square rounded-[14px]"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section className="mb-12">
          <h2 className="text-lg font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>Reviews</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>24 reviews · 4.9 average</p>
          <ul className="mt-6 space-y-6">
            {PLACEHOLDER_REVIEWS.map((review, i) => (
              <li
                key={i}
                className="rounded-[var(--radius-lg)] border p-5 shadow-sm"
                style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium" style={{ color: "var(--color-text)" }}>{review.reviewer}</span>
                  <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{review.date}</span>
                  <span className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className={`h-4 w-4 ${j < review.rating ? "fill-current" : ""}`}
                        style={j >= review.rating ? { color: "var(--color-text-muted)" } : undefined}
                      />
                    ))}
                  </span>
                </div>
                <p className="mt-2 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{review.text}</p>
                {review.response && (
                  <div className="mt-4 rounded-[var(--radius-lg)] border-l-4 pl-4 py-2" style={{ borderColor: "var(--color-primary)", backgroundColor: "var(--color-background)" }}>
                    <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>Response from provider</p>
                    <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>{review.response}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="rounded-[var(--radius-lg)] p-8 text-center text-white" style={{ backgroundColor: "var(--color-primary)" }}>
          <h2 className="text-xl font-normal" style={{ fontFamily: "var(--font-heading), serif", color: "white" }}>Ready to book?</h2>
          <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(255,255,255,0.9)" }}>Send a request and {name} will respond within a few hours.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/services/book/${slug}`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-white px-6 font-semibold transition-opacity hover:opacity-90"
              style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", color: "var(--color-primary)" }}
            >
              Book Now
            </Link>
            <Link
              href={`/services/book/${slug}?meet=true`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-pill)] border-2 border-white/50 bg-transparent px-6 font-semibold text-white transition-opacity hover:opacity-90"
              style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)" }}
            >
              <Heart className="h-4 w-4" />
              Request Meet & Greet
            </Link>
          </div>
        </section>

        <p className="mt-8">
          <Link href="/services/search" className="text-sm hover:underline" style={{ color: "var(--color-text-secondary)" }}>
            ← Back to search
          </Link>
        </p>
      </div>
    </div>
  );
}
