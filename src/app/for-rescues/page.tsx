import type { Metadata } from "next";
import { Globe, HandHeart, List, Shield } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "For Rescue Organisations | Tinies",
  description:
    "List your animals for free. Reach adopters across Cyprus and Europe. Manage applications through your dashboard. You run the adoptions — we give you the tools and the audience.",
};

const BENEFITS = [
  {
    icon: List,
    title: "List your animals for free",
    text: "You post your own adoption listings. You set the details, the fees, and the process. Tinies gives you the platform and the audience — rescues run their own adoptions.",
  },
  {
    icon: Globe,
    title: "Reach adopters across Cyprus and Europe",
    text: "Your adoptable animals appear on Tinies for families in Cyprus, the UK, Germany, and across the EU. No extra cost. Just list and manage applications from your dashboard.",
  },
  {
    icon: HandHeart,
    title: "You run the adoptions",
    text: "Tinies provides the listing platform, application management tools, and payment infrastructure. You decide who adopts, you work with transport providers, and you stay in control of every placement.",
  },
  {
    icon: Shield,
    title: "Tools and audience, not middlemen",
    text: "Structured applications, clear status updates, and check-ins at 1 week, 1 month, and 3 months. Happy Tails stories celebrate every adoption. We don't coordinate vet prep or transport for you — we connect you with adopters and transport providers who do.",
  },
] as const;

export default function ForRescuesPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#1B2432]">
      <main className="mx-auto max-w-[1170px] px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1
            className="text-3xl font-normal tracking-tight text-[#1B2432] sm:text-4xl"
            style={{ fontFamily: "var(--tiny-font-display), serif" }}
          >
            For rescue organisations
          </h1>
          <p className="mt-4 text-lg text-[#6B7280] max-w-xl mx-auto" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
            List your animals for free. Reach adopters across Cyprus and Europe. Manage applications through your dashboard. You run the adoptions — we give you the tools and the audience.
          </p>
        </div>

        <section className="mt-20 grid gap-8 sm:grid-cols-2">
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

        <section className="mt-20 rounded-[14px] bg-[#0A6E5C] px-8 py-14 text-center text-white sm:px-12 sm:py-16">
          <h2
            className="text-xl font-normal sm:text-2xl"
            style={{ fontFamily: "var(--tiny-font-display), serif" }}
          >
            Get your rescue on Tinies
          </h2>
          <p className="mt-3 text-white/90 text-sm sm:text-base max-w-md mx-auto" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
            Create your organisation profile, add your adoptable animals, and
            start receiving applications. You run the adoptions — we give you the platform.
          </p>
          <Link
            href="/dashboard/rescue"
            className="mt-8 inline-flex items-center rounded-[999px] bg-white px-6 h-12 font-semibold text-[#0A6E5C] transition-opacity hover:opacity-95"
            style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
          >
            Sign up as a rescue
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
