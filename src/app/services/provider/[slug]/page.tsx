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
    <div className="min-h-screen bg-[#F7F7F8] text-[#1B2432]">
      {/* Hero */}
      <section className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto max-w-[1170px] px-4 py-12 sm:px-6 sm:py-14">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
            <div className="h-28 w-28 shrink-0 rounded-full bg-[#0A6E5C] flex items-center justify-center text-3xl font-bold text-white" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-normal text-[#1B2432] sm:text-3xl" style={{ fontFamily: "var(--tiny-font-display), serif" }}>{name}</h1>
                <span className="inline-flex items-center gap-1 rounded-[999px] bg-[#0A6E5C]/15 px-2.5 py-0.5 text-sm font-medium text-[#0A6E5C]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                  <BadgeCheck className="h-4 w-4" />
                  Verified
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-[#6B7280] sm:justify-start">
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
                  className="inline-flex items-center justify-center gap-2 rounded-[999px] bg-[#0A6E5C] px-5 h-12 font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Book Now
                </Link>
                <Link
                  href={`/services/book/${slug}?meet=true`}
                  className="inline-flex items-center justify-center gap-2 rounded-[999px] border-2 border-[#0A6E5C] bg-transparent px-5 h-12 font-semibold text-[#0A6E5C] transition-opacity hover:opacity-90"
                >
                  Request Meet & Greet
                </Link>
                <Link
                  href="/dashboard/owner"
                  className="inline-flex items-center justify-center gap-2 rounded-[999px] border border-[#E5E7EB] bg-white px-5 h-12 font-semibold text-[#1B2432] hover:bg-[#F7F7F8]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message
                </Link>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-[999px] border border-[#E5E7EB] bg-white px-5 h-12 font-semibold text-[#1B2432] hover:bg-[#F7F7F8]"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1170px] px-4 py-14 sm:px-6 sm:py-16">
        {/* Bio */}
        <section className="mb-12">
          <h2 className="text-lg font-normal text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-display), serif" }}>About</h2>
          <p className="mt-3 text-[#6B7280] leading-relaxed">
            I&apos;ve been caring for dogs and cats for over 5 years. I work from home and have a
            fenced garden, so your pet will have plenty of space and attention. I only take a
            few bookings at a time so everyone gets the best care. I&apos;m happy to send photo
            updates and can administer medication if needed.
          </p>
        </section>

        {/* Services & pricing */}
        <section className="mb-12">
          <h2 className="text-lg font-normal text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-display), serif" }}>Services & pricing</h2>
          <div className="mt-4 overflow-x-auto rounded-[14px] border border-[#E5E7EB]">
            <table className="w-full min-w-[320px] text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F7F7F8]">
                  <th className="px-4 py-3 text-left font-medium text-[#1B2432]">Service</th>
                  <th className="px-4 py-3 text-left font-medium text-[#1B2432]">Base price</th>
                  <th className="px-4 py-3 text-left font-medium text-[#1B2432]">Additional pet</th>
                  <th className="px-4 py-3 text-left font-medium text-[#1B2432]">Max pets</th>
                </tr>
              </thead>
              <tbody>
                {SERVICES_PRICING.map((row) => (
                  <tr key={row.service} className="border-b border-[#E5E7EB]">
                    <td className="px-4 py-3 text-[#1B2432]">{row.service}</td>
                    <td className="px-4 py-3 text-[#6B7280]">{row.base}</td>
                    <td className="px-4 py-3 text-[#6B7280]">{row.additional}</td>
                    <td className="px-4 py-3 text-[#6B7280]">{row.maxPets}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Availability */}
        <section className="mb-12">
          <h2 className="text-lg font-normal text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-display), serif" }}>Availability</h2>
          <p className="mt-1 text-sm text-[#6B7280]">Typical weekly schedule (read-only)</p>
          <div className="mt-4 overflow-x-auto rounded-[14px] border border-[#E5E7EB] bg-white">
            <table className="w-full min-w-[320px] text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F7F7F8]">
                  <th className="px-3 py-2 text-left font-medium text-[#6B7280]"></th>
                  {AVAILABILITY_GRID.map((r) => (
                    <th key={r.day} className="px-3 py-2 text-center font-medium text-[#1B2432]">{r.day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(["morning", "afternoon", "evening"] as const).map((slot) => (
                  <tr key={slot} className="border-b border-[#E5E7EB] last:border-0">
                    <td className="px-3 py-2 font-medium text-[#6B7280] capitalize">{slot}</td>
                    {AVAILABILITY_GRID.map((r) => (
                      <td key={r.day} className="px-3 py-2 text-center">
                        <span
                          className={`inline-block h-6 w-6 rounded ${
                            r[slot] ? "bg-[#0A6E5C]/20 text-[#0A6E5C]" : "bg-[#6B7280]/10 text-[#6B7280]/50"
                          }`}
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
          <h2 className="text-lg font-normal text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-display), serif" }}>Photos</h2>
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
          <h2 className="text-lg font-normal text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-display), serif" }}>Reviews</h2>
          <p className="mt-1 text-sm text-[#6B7280]">24 reviews · 4.9 average</p>
          <ul className="mt-6 space-y-6">
            {PLACEHOLDER_REVIEWS.map((review, i) => (
              <li
                key={i}
                className="rounded-[14px] border border-[#E5E7EB] bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-[#1B2432]">{review.reviewer}</span>
                  <span className="text-sm text-[#6B7280]">{review.date}</span>
                  <span className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className={`h-4 w-4 ${j < review.rating ? "fill-current" : "text-[#6B7280]/30"}`}
                      />
                    ))}
                  </span>
                </div>
                <p className="mt-2 text-[#6B7280] leading-relaxed">{review.text}</p>
                {review.response && (
                  <div className="mt-4 rounded-[14px] border-l-4 border-[#0A6E5C] bg-[#F7F7F8] pl-4 py-2">
                    <p className="text-sm font-medium text-[#1B2432]">Response from provider</p>
                    <p className="mt-1 text-sm text-[#6B7280]">{review.response}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="rounded-[14px] bg-[#0A6E5C] p-8 text-center text-white">
          <h2 className="text-xl font-normal" style={{ fontFamily: "var(--tiny-font-display), serif" }}>Ready to book?</h2>
          <p className="mt-2 text-white/90 text-sm" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>Send a request and {name} will respond within a few hours.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/services/book/${slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-[999px] h-12 bg-white px-5 font-semibold text-[#0A6E5C] transition-opacity hover:opacity-90"
              style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
            >
              Book Now
            </Link>
            <Link
              href={`/services/book/${slug}?meet=true`}
              className="inline-flex items-center justify-center gap-2 rounded-[999px] border-2 border-white/50 bg-transparent px-5 h-12 font-semibold text-white transition-opacity hover:opacity-90"
              style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
            >
              <Heart className="h-4 w-4" />
              Request Meet & Greet
            </Link>
          </div>
        </section>

        <p className="mt-8">
          <Link href="/services/search" className="text-sm text-[#6B7280] hover:text-[#1B2432] hover:underline">
            ← Back to search
          </Link>
        </p>
      </div>
    </div>
  );
}
