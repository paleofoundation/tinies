import type { Metadata } from "next";
import {
  UserPlus,
  Users,
  Percent,
  Star,
  Calendar,
  HelpCircle,
} from "lucide-react";
import { EditorialButton, FAQStack, SectionHeader } from "@/components/marketing";
import { PageContainer, Section } from "@/components/theme";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "For Providers",
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

const FAQ_ITEMS = FAQ.map((item, index) => ({
  id: `for-providers-faq-${index}`,
  question: item.q,
  answer: item.a,
}));

export default function ForProvidersPage() {
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
            eyebrow="Providers"
            title="For providers (pet sitters & dog walkers)"
            description="Offer pet care on your terms. Free to join, 12% only when you earn. And 90% of our commission goes to rescue animal care. When you earn through Tinies, the tinies get fed, treated, and sheltered too."
            className="mx-auto max-w-2xl"
          />
        </PageContainer>
      </Section>

      <main>
        <Section background="surface" padded className="border-b border-[var(--color-border)]">
          <PageContainer>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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

        <Section background="background" padded className="border-b border-[var(--color-border)]">
          <PageContainer>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-6 w-6 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />
              <h2 className="theme-display text-[var(--display-md)]" style={{ color: "var(--color-text)" }}>
                Frequently asked questions
              </h2>
            </div>
            <FAQStack items={FAQ_ITEMS} className="mt-8" allowMultiple />
          </PageContainer>
        </Section>

        <Section background="primary" padded className="!py-14 sm:!py-16">
          <PageContainer>
            <div className="mx-auto max-w-lg text-center">
              <h2 className="theme-display text-[var(--display-md)] text-white" style={{ lineHeight: 1.05 }}>
                Ready to start earning?
              </h2>
              <p
                className="mx-auto mt-3 max-w-md text-sm sm:text-base"
                style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.9)" }}
              >
                Create your provider profile in minutes. Set your schedule, your prices, and your cancellation policy.
              </p>
              <div className="mt-8 flex justify-center">
                <EditorialButton
                  href="/dashboard/provider"
                  variant="secondary"
                  className="!border-transparent !bg-white !text-[var(--color-primary)] shadow-[var(--shadow-md)] hover:!bg-white/95"
                >
                  Sign up as a provider
                </EditorialButton>
              </div>
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
