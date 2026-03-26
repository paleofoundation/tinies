import type { Metadata } from "next";
import {
  Footprints,
  Home,
  Moon,
  Clock,
  Sun,
  Search,
  CreditCard,
  Camera,
  PawPrint,
  Heart,
  Leaf,
} from "lucide-react";
import { SectionHeader } from "@/components/marketing";
import { PageContainer, Section } from "@/components/theme";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pet Care Services | Tinies",
  description:
    "Find trusted care for your tiny. Dog walking, pet sitting, boarding, drop-in visits, and daycare from verified providers in Cyprus.",
};

const CATEGORIES = [
  { type: "walking", name: "Dog Walking", description: "Regular walks to keep your dog happy and healthy.", priceRange: "€10–25 per walk", icon: Footprints },
  { type: "sitting", name: "Pet Sitting", description: "Care at your home while you're away.", priceRange: "€25–50 per day", icon: Home },
  { type: "boarding", name: "Overnight Boarding", description: "Your pet stays with a verified carer overnight.", priceRange: "€30–60 per night", icon: Moon },
  { type: "drop_in", name: "Drop-In Visits", description: "20–30 min visits to feed, play, and check on your pet.", priceRange: "€10–20 per visit", icon: Clock },
  { type: "daycare", name: "Daycare", description: "Daytime care at the carer's home. Drop off and pick up same day.", priceRange: "€15–30 per day", icon: Sun },
] as const;

const HOW_IT_WORKS = [
  { icon: Search, title: "Search", text: "Filter by service, location, and availability. Every provider is ID-verified." },
  { icon: CreditCard, title: "Book", text: "Pay securely. Payment is only captured when your provider accepts." },
  { icon: Camera, title: "Relax", text: "Get photo updates and message your carer anytime." },
] as const;

export default function ServicesPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <Section
        background="transparent"
        padded
        className="theme-paper-grid border-b border-[var(--color-border)] !bg-[var(--color-primary-muted-05)]"
      >
        <PageContainer>
          <SectionHeader
            align="center"
            eyebrow="Pet care"
            title="Find trusted care for your tiny."
            description="Dog walking, sitting, boarding, drop-ins, and daycare from verified providers in Cyprus."
            className="mx-auto max-w-xl"
          />
        </PageContainer>
      </Section>

      <section className="px-4 py-20 sm:px-6 lg:px-8" style={{ paddingTop: "var(--space-section)", paddingBottom: "var(--space-section)" }}>
        <PageContainer>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.type}
                href={`/services/search?type=${cat.type}`}
                className="group rounded-[var(--radius-lg)] border p-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
                style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)", padding: "var(--space-card)" }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] group-hover:bg-[var(--color-primary-100)]" style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}>
                  <cat.icon className="h-6 w-6" />
                </div>
                <h2 className="mt-6 font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)", fontSize: "var(--text-lg)" }}>{cat.name}</h2>
                <p className="mt-3 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>{cat.description}</p>
                <p className="mt-3 text-sm font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-secondary)" }}>{cat.priceRange}</p>
                <span className="mt-6 inline-flex items-center text-sm font-semibold group-hover:underline" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}>
                  Find providers →
                </span>
              </Link>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="rounded-t-[2rem] bg-white px-4 py-20 sm:px-6 lg:px-8" style={{ paddingTop: "var(--space-section)", paddingBottom: "var(--space-section)" }}>
        <PageContainer>
          <h2
            className="text-center font-normal"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
          >
            How booking works
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}>
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>{step.title}</h3>
                <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>{step.text}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="border-t px-4 py-20 sm:px-6 lg:px-8" style={{ borderColor: "var(--color-border)", paddingTop: "var(--space-section)", paddingBottom: "var(--space-section)" }}>
        <PageContainer>
          <div className="flex flex-col gap-10 text-center sm:flex-row sm:justify-around">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-primary-100)", color: "var(--color-primary)" }}>
                <PawPrint className="h-6 w-6" />
              </div>
              <p className="font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>50+ Verified Providers</p>
              <p className="text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>Across Cyprus</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-secondary-100)", color: "var(--color-secondary)" }}>
                <Heart className="h-6 w-6" />
              </div>
              <p className="font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>100+ Happy Tinies</p>
              <p className="text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>Booked and cared for</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-primary-100)", color: "var(--color-primary)" }}>
                <Leaf className="h-6 w-6" />
              </div>
              <p className="font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>10% Supports Rescue</p>
              <p className="text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>Tinies Giving Fund</p>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
