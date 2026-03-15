import type { Metadata } from "next";
import {
  Search,
  CreditCard,
  Camera,
  Star,
  Heart,
  FileCheck,
  Plane,
  MapPin,
  Home,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works | Tinies Pet Care & Adoption",
  description:
    "Tinies is a marketplace connecting pet owners with independent providers, and adopters with rescues and transport. We don't provide services ourselves — we give you the platform, payments, and tools.",
};

const OWNER_STEPS = [
  {
    icon: Search,
    title: "Search verified providers",
    text: "Find independent carers near you by service type, location, and availability. Every provider is ID-verified and reviewed. Tinies lists them; they provide the care.",
  },
  {
    icon: CreditCard,
    title: "Book securely",
    text: "Pay with card through Tinies. Payment is only captured when your provider accepts. Cancel for free if plans change before acceptance.",
  },
  {
    icon: Camera,
    title: "Get updates",
    text: "Receive photo and message updates during the booking. For walks, track the route in real time if the carer has started the walk.",
  },
  {
    icon: Star,
    title: "Leave reviews",
    text: "After the stay, leave a star rating and review to help other owners and build your carer's reputation.",
  },
] as const;

const ADOPTER_STEPS = [
  {
    icon: Heart,
    title: "Browse animals",
    text: "Explore adoptable dogs and cats listed by rescue organisations on Tinies. Filter by species, age, and destination country.",
  },
  {
    icon: FileCheck,
    title: "Apply",
    text: "Submit an application with your home situation, experience, and vet reference. The rescue reviews and approves — they run their own adoption process.",
  },
  {
    icon: Plane,
    title: "Rescue and transport handle logistics",
    text: "The rescue and transport providers handle vet prep, vaccinations, microchip, EU pet passport, and transport. Tinies gives you the platform to connect and pay; they do the coordination.",
  },
  {
    icon: MapPin,
    title: "Track progress",
    text: "Follow each step in your dashboard — from vet completion to transport booked to departure and arrival.",
  },
  {
    icon: Home,
    title: "Welcome your tiny home",
    text: "Check-ins at 1 week, 1 month, and 3 months. Share your story for Happy Tails and inspire the next adoption.",
  },
] as const;

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto px-4 py-20 sm:px-6 lg:px-8" style={{ maxWidth: "var(--max-width)" }}>
        <h1
          className="font-normal tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
        >
          How it works
        </h1>
        <p className="mt-2 max-w-2xl text-lg" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          Tinies is a marketplace. We connect pet owners with independent service providers, and adopters with rescue organisations and transport providers. We don&apos;t walk dogs, sit pets, or run adoptions ourselves — we provide the platform, handle payment, and take a small commission so we can fund rescue animal care.
        </p>

        {/* For Pet Owners */}
        <section className="mt-20">
          <h2
            className="font-normal"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
          >
            For pet owners
          </h2>
          <p className="mt-2" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Book trusted care in a few clicks.
          </p>
          <ul className="mt-10 space-y-8">
            {OWNER_STEPS.map((step, i) => (
              <li
                key={step.title}
                className="flex gap-4 rounded-[var(--radius-lg)] border p-8 sm:gap-6"
                style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)", padding: "var(--space-card)" }}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:h-14 sm:w-14" style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}>
                  <step.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <div>
                  <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}>
                    Step {i + 1}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                    {step.title}
                  </h3>
                  <p className="mt-2 leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)", fontSize: "var(--text-base)" }}>
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Link
              href="/services/search"
              className="inline-flex h-12 items-center rounded-[var(--radius-pill)] px-8 font-semibold text-white transition-opacity hover:opacity-90"
              style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", backgroundColor: "var(--color-primary)" }}
            >
              Find care
            </Link>
          </div>
        </section>

        {/* For Adopters */}
        <section className="mt-20">
          <h2
            className="font-normal"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
          >
            For adopters
          </h2>
          <p className="mt-2 max-w-2xl" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Rescue organisations list animals available for adoption. Transport providers offer their logistics services. You browse, apply, and connect — all through Tinies. We provide the platform and payment; rescues and transport providers run their side. Think of it like Airbnb: we don&apos;t own the homes.
          </p>
          <ul className="mt-10 space-y-8">
            {ADOPTER_STEPS.map((step, i) => (
              <li
                key={step.title}
                className="flex gap-4 rounded-[var(--radius-lg)] border p-8 sm:gap-6"
                style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)", padding: "var(--space-card)" }}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:h-14 sm:w-14" style={{ backgroundColor: "var(--color-secondary-50)", color: "var(--color-secondary)" }}>
                  <step.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <div>
                  <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-secondary)" }}>
                    Step {i + 1}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                    {step.title}
                  </h3>
                  <p className="mt-2 leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)", fontSize: "var(--text-base)" }}>
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Link
              href="/adopt"
              className="inline-flex h-12 items-center rounded-[var(--radius-pill)] px-8 font-semibold text-white transition-opacity hover:opacity-90"
              style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", backgroundColor: "var(--color-secondary)" }}
            >
              Browse animals
            </Link>
          </div>
        </section>

        <p className="mt-20 text-center">
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
