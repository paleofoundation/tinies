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
    text: "Structured applications, clear status updates, and check-ins at 1 week, 1 month, and 3 months. Tinies who made it celebrates every adoption. We don't coordinate vet prep or transport for you — we connect you with adopters and transport providers who do.",
  },
] as const;

export default function ForRescuesPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto px-4 py-20 sm:px-6 lg:px-8" style={{ maxWidth: "var(--max-width)" }}>
        <div className="text-center">
          <h1
            className="font-normal tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
          >
            For rescue organisations
          </h1>
          <p className="mt-4 mx-auto max-w-xl text-lg" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            List your animals for free. Reach adopters across Cyprus and Europe. Manage applications through your dashboard. You run the adoptions — we give you the tools and the audience.
          </p>
        </div>

        <section className="mt-20 grid gap-8 sm:grid-cols-2">
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

        <section className="mt-20 rounded-[var(--radius-lg)] px-8 py-14 text-center text-white sm:px-12 sm:py-16" style={{ backgroundColor: "var(--color-primary)" }}>
          <h2
            className="font-normal sm:text-2xl"
            style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "white" }}
          >
            Get your rescue on Tinies
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm sm:text-base" style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(255,255,255,0.9)" }}>
            Create your organisation profile, add your adoptable animals, and
            start receiving applications. You run the adoptions — we give you the platform.
          </p>
          <Link
            href="/signup/rescue"
            className="mt-8 inline-flex h-12 items-center rounded-[var(--radius-pill)] bg-white px-8 font-semibold transition-opacity hover:opacity-95"
            style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", color: "var(--color-primary)" }}
          >
            Sign up as a rescue
          </Link>
          <p className="mt-5 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(255,255,255,0.9)" }}>
            Already registered?{" "}
            <Link href="/login?next=/dashboard/rescue" className="font-semibold underline underline-offset-2 hover:opacity-95">
              Sign in
            </Link>
          </p>
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
