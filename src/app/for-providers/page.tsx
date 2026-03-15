import type { Metadata } from "next";
import {
  UserPlus,
  Users,
  Percent,
  Star,
  Calendar,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "For Providers | Join Tinies",
  description:
    "List your pet care services for free. We bring you customers, take only 12% when you earn, and help you build your reputation with reviews. Flexible schedule — sign up today.",
};

const BENEFITS = [
  {
    icon: UserPlus,
    title: "Free to list",
    text: "Create your profile, set your services and prices, and go live. No monthly fees or upfront costs.",
  },
  {
    icon: Users,
    title: "We bring you customers",
    text: "Pet owners search by location and service type. You get booking requests that match your availability and preferences.",
  },
  {
    icon: Percent,
    title: "12% only when you earn",
    text: "We take a 12% commission on completed bookings. No booking, no fee. You keep 88% of what you earn.",
  },
  {
    icon: Star,
    title: "Build your reputation",
    text: "Reviews from verified owners appear on your profile. Stand out with great ratings and repeat clients.",
  },
  {
    icon: Calendar,
    title: "Flexible schedule",
    text: "Set your own availability by day and time. Accept or decline requests. You're in control.",
  },
] as const;

const FAQ = [
  {
    q: "How do I get verified?",
    a: "Upload a government-issued ID. Our team reviews it within 24–48 hours. Once verified, your profile appears in search and you can receive bookings.",
  },
  {
    q: "When do I get paid?",
    a: "Payouts run weekly (minimum €20). After a booking is completed, your earnings minus commission are included in the next payout to your bank account via Stripe.",
  },
  {
    q: "What if I need to cancel?",
    a: "If you cancel, the owner gets a full refund. We track cancellation rates; high rates can affect your profile. Choose a cancellation policy (Flexible, Moderate, or Strict) that works for you.",
  },
  {
    q: "Can I offer more than one service?",
    a: "Yes. You can offer walking, sitting, boarding, drop-in visits, and daycare. Set a base price and optional extra-pet price per service.",
  },
] as const;

export default function ForProvidersPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#1B2432]">
      <main className="mx-auto max-w-[1170px] px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1
            className="text-3xl font-normal tracking-tight text-[#1B2432] sm:text-4xl"
            style={{ fontFamily: "var(--tiny-font-display), serif" }}
          >
            For providers
          </h1>
          <p className="mt-4 text-lg text-[#6B7280] max-w-xl mx-auto" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
            Offer pet care on your terms. Free to join, 12% only when you earn. And 90% of our commission goes to rescue animal care. When you earn through Tinies, the tinies get fed, treated, and sheltered too.
          </p>
        </div>

        <section className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((item) => (
            <div
              key={item.title}
              className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#0A6E5C]/10 text-[#0A6E5C]">
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-6 font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                {item.title}
              </h2>
              <p className="mt-3 text-sm text-[#6B7280] leading-relaxed" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                {item.text}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-20">
          <h2
            className="flex items-center gap-2 text-xl font-normal text-[#1B2432]"
            style={{ fontFamily: "var(--tiny-font-display), serif" }}
          >
            <HelpCircle className="h-5 w-5 text-[#0A6E5C]" />
            Frequently asked questions
          </h2>
          <ul className="mt-8 space-y-6">
            {FAQ.map((item) => (
              <li
                key={item.q}
                className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
              >
                <h3 className="font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>{item.q}</h3>
                <p className="mt-3 text-sm text-[#6B7280] leading-relaxed" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                  {item.a}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20 rounded-[14px] bg-[#0A6E5C] px-8 py-14 text-center text-white sm:px-12 sm:py-16">
          <h2
            className="text-xl font-normal sm:text-2xl"
            style={{ fontFamily: "var(--tiny-font-display), serif" }}
          >
            Ready to start earning?
          </h2>
          <p className="mt-3 text-white/90 text-sm sm:text-base max-w-md mx-auto" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
            Create your provider profile in minutes. Set your schedule, your
            prices, and your cancellation policy.
          </p>
          <Link
            href="/dashboard/provider"
            className="mt-8 inline-flex items-center rounded-[999px] bg-white px-6 h-12 font-semibold text-[#0A6E5C] transition-opacity hover:opacity-95"
            style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
          >
            Sign up as a provider
          </Link>
        </section>

        <p className="mt-16 text-center">
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
