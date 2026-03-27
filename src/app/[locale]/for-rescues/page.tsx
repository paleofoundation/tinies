import type { Metadata } from "next";
import { Globe, HandHeart, List, Shield } from "lucide-react";
import { EditorialButton, SectionHeader } from "@/components/marketing";
import { PageContainer, Section } from "@/components/theme";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "For Rescue Organisations",
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
      <Section
        className="theme-paper-grid border-b border-[var(--color-border)]"
        background="background"
        padded
      >
        <PageContainer>
          <SectionHeader
            align="center"
            titleAs="h1"
            eyebrow="Rescue partners"
            title="For rescue organisations"
            description="List your animals for free. Reach adopters across Cyprus and Europe. Manage applications through your dashboard. You run the adoptions — we give you the tools and the audience."
            className="mx-auto max-w-2xl"
          />
        </PageContainer>
      </Section>

      <main>
        <Section background="surface" padded className="border-b border-[var(--color-border)]">
          <PageContainer>
            <div className="grid gap-8 sm:grid-cols-2">
              {BENEFITS.map((item) => (
                <div
                  key={item.title}
                  className="theme-card rounded-[22px] p-8"
                  style={{ padding: "var(--space-card)" }}
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)]"
                    style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h2
                    className="mt-6 text-lg font-extrabold"
                    style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
                  >
                    {item.title}
                  </h2>
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}
                  >
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </PageContainer>
        </Section>

        <Section background="primary" padded className="!py-14 sm:!py-16">
          <PageContainer>
            <div className="mx-auto max-w-lg text-center">
              <h2 className="theme-display text-[var(--display-md)] text-white" style={{ lineHeight: 1.05 }}>
                Get your rescue on Tinies
              </h2>
              <p
                className="mx-auto mt-3 max-w-md text-sm sm:text-base"
                style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.9)" }}
              >
                Create your organisation profile, add your adoptable animals, and start receiving applications. You run the
                adoptions — we give you the platform.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <EditorialButton
                  href="/signup/rescue"
                  variant="secondary"
                  className="!border-transparent !bg-white !text-[var(--color-primary)] shadow-[var(--shadow-md)] hover:!bg-white/95"
                >
                  Sign up as a rescue
                </EditorialButton>
              </div>
              <p className="mt-5 text-sm" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.9)" }}>
                Already registered?{" "}
                <Link href="/login?next=/dashboard/rescue" className="font-semibold underline underline-offset-2 hover:opacity-95">
                  Sign in
                </Link>
              </p>
            </div>
          </PageContainer>
        </Section>

        <p className="py-12 text-center">
          <Link
            href="/"
            className="hover:underline"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}
          >
            Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
