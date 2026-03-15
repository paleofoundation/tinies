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
    <div className="min-h-screen bg-[#F7F7F8] text-[#1B2432]">
      <section className="relative overflow-hidden px-4 pt-10 pb-12 sm:px-6 sm:pt-14 sm:pb-16 lg:px-8">
        <div className="absolute inset-0 bg-[#0A6E5C]/5 rounded-b-[3rem] sm:rounded-b-[4rem]" />
        <div className="relative mx-auto max-w-[1170px] text-center">
          <h1
            className="text-4xl font-normal tracking-tight text-[#1B2432] sm:text-5xl"
            style={{ fontFamily: "var(--tiny-font-display), serif" }}
          >
            Find trusted care for your tiny.
          </h1>
          <p className="mt-4 text-lg text-[#6B7280] max-w-xl mx-auto" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
            Dog walking, sitting, boarding, drop-ins, and daycare from verified providers in Cyprus.
          </p>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1170px]">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.type}
                href={`/services/search?type=${cat.type}`}
                className="group rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#0A6E5C]/10 text-[#0A6E5C] group-hover:bg-[#0A6E5C]/15">
                  <cat.icon className="h-6 w-6" />
                </div>
                <h2 className="mt-6 font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>{cat.name}</h2>
                <p className="mt-3 text-sm text-[#6B7280] leading-relaxed" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>{cat.description}</p>
                <p className="mt-3 text-sm font-semibold text-[#F45D48]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>{cat.priceRange}</p>
                <span className="mt-6 inline-flex items-center text-sm font-semibold text-[#0A6E5C] group-hover:underline" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                  Find providers →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-white rounded-t-[2rem]">
        <div className="mx-auto max-w-[1170px]">
          <h2
            className="text-2xl font-normal text-[#1B2432] text-center"
            style={{ fontFamily: "var(--tiny-font-display), serif" }}
          >
            How booking works
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0A6E5C]/10 text-[#0A6E5C]">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>{step.title}</h3>
                <p className="mt-2 text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8 border-t border-[#E5E7EB]">
        <div className="mx-auto max-w-[1170px]">
          <div className="flex flex-col gap-10 sm:flex-row sm:justify-around text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A6E5C]/15 text-[#0A6E5C]">
                <PawPrint className="h-6 w-6" />
              </div>
              <p className="font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>50+ Verified Providers</p>
              <p className="text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>Across Cyprus</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F45D48]/15 text-[#F45D48]">
                <Heart className="h-6 w-6" />
              </div>
              <p className="font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>100+ Happy Tinies</p>
              <p className="text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>Booked and cared for</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A6E5C]/15 text-[#0A6E5C]">
                <Leaf className="h-6 w-6" />
              </div>
              <p className="font-semibold text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>10% Supports Rescue</p>
              <p className="text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>Tinies Giving Fund</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
