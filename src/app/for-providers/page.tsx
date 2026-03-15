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
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto px-4 py-20 sm:px-6 lg:px-8" style={{ maxWidth: "var(--max-width)" }}>
        <div className="text-center">
          <h1
            className="font-normal tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
          >
            For providers
          </h1>
          <p className="mt-4 mx-auto max-w-xl text-lg" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Offer pet care on your terms. Free to join, 12% only when you earn. And 90% of our commission goes to rescue animal care. When you earn through Tinies, the tinies get fed, treated, and sheltered too.
          </p>
        </div>

        <section className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((item) => (
            <div
              key={item.title}
              className="rounded-[var(--radius-lg)] border p-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
              style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)", padding: "var(--space-card)" }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)]" style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}>
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-6 font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)", fontSize: "var(--text-lg)" }}>
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                {item.text}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-20">
          <h2
            className="flex items-center gap-2 font-normal"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
          >
            <HelpCircle className="h-5 w-5" style={{ color: "var(--color-primary)" }} />
            Frequently asked questions
          </h2>
          <ul className="mt-8 space-y-6">
            {FAQ.map((item) => (
              <li
                key={item.q}
                className="rounded-[var(--radius-lg)] border p-8"
                style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)", padding: "var(--space-card)" }}
              >
                <h3 className="font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>{item.q}</h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                  {item.a}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20 rounded-[var(--radius-lg)] px-8 py-14 text-center text-white sm:px-12 sm:py-16" style={{ backgroundColor: "var(--color-primary)" }}>
          <h2
            className="font-normal sm:text-2xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "white" }}
          >
            Ready to start earning?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm sm:text-base" style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(255,255,255,0.9)" }}>
            Create your provider profile in minutes. Set your schedule, your
            prices, and your cancellation policy.
          </p>
          <Link
            href="/dashboard/provider"
            className="mt-8 inline-flex h-12 items-center rounded-[var(--radius-pill)] bg-white px-8 font-semibold transition-opacity hover:opacity-95"
            style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", color: "var(--color-primary)" }}
          >
            Sign up as a provider
          </Link>
        </section>

        <p className="mt-16 text-center">
          <Link
            href="/"
            className="hover:underline"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
          >
            Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
