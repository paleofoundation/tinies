import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { FaqAccordionItem } from "./FaqAccordionItem";
import { FaqEditorialSection } from "./FaqEditorialSection";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

const HOME_INNER = "mx-auto w-full max-w-[1280px] px-6 lg:px-10";
const BORDER_TEAL_15 = "rgba(10, 128, 128, 0.15)";

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I find a pet sitter near me?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Search by service type and location. All providers are verified with government ID.",
      },
    },
    {
      "@type": "Question",
      name: "How much does it cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Providers set their own rates. Tinies adds a 12% service fee. 90% of that fee goes directly to animal rescue.",
      },
    },
    {
      "@type": "Question",
      name: "What happens if something goes wrong?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Tinies Guarantee covers vet costs up to EUR 2,000 and property damage up to EUR 500. Full details on our Terms page.",
      },
    },
    {
      "@type": "Question",
      name: "Can I meet the provider before booking?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Request a free meet-and-greet from any provider's profile.",
      },
    },
    {
      "@type": "Question",
      name: "How do cancellations work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each provider chooses a cancellation policy (Flexible, Moderate, or Strict). The policy is shown before you book.",
      },
    },
    {
      "@type": "Question",
      name: "Is my payment secure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "All payments are processed through Stripe. Your card details are never stored on our servers.",
      },
    },
    {
      "@type": "Question",
      name: "How do I become a provider?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sign up, complete your profile, upload your ID for verification. You'll appear in search within 24-48 hours.",
      },
    },
    {
      "@type": "Question",
      name: "How much can I earn?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You keep 88% of every booking. Set your own rates based on your area and experience.",
      },
    },
    {
      "@type": "Question",
      name: "When do I get paid?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Weekly payouts every Monday via Stripe, for the previous week's completed bookings. Minimum payout: EUR 20.",
      },
    },
    {
      "@type": "Question",
      name: "What's the cancellation policy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You choose: Flexible, Moderate, or Strict. Provider cancellations always result in a full refund to the owner.",
      },
    },
    {
      "@type": "Question",
      name: "How does international adoption work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We coordinate everything: vet preparation, EU pet passport, transport, and customs. You pay one transparent fee.",
      },
    },
    {
      "@type": "Question",
      name: "How long does the adoption process take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Typically 4-8 weeks from approved application to arrival, depending on destination country requirements.",
      },
    },
    {
      "@type": "Question",
      name: "Can I adopt from outside Europe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Currently we coordinate adoptions to the UK and EU countries. More destinations coming soon.",
      },
    },
    {
      "@type": "Question",
      name: "What's included in the adoption fee?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Vet preparation, vaccinations, microchip, spay/neuter, EU pet passport, transport, and Tinies coordination.",
      },
    },
    {
      "@type": "Question",
      name: "Where does the money go?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "90% of our commission goes directly to rescue animal care. Every euro is tracked on our Giving page.",
      },
    },
    {
      "@type": "Question",
      name: "What is a Tinies Guardian?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A monthly supporter who gives EUR 3-10/month to rescue animals. 100% goes directly to animal rescue.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers for pet owners, service providers, adopters, and supporters — bookings, payouts, adoption, Tinies Giving, and more.",
  openGraph: {
    title: "FAQ | Tinies",
    description: "Common questions about pet care bookings, provider payouts, adoption, and Tinies Giving.",
    url: `${BASE_URL}/faq`,
    siteName: "Tinies",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ | Tinies",
    description: "Common questions about Tinies pet care and adoption in Cyprus.",
  },
};

export default function FaqPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <main>
        <div
          className="border-b bg-[var(--color-background)] pt-[clamp(3rem,6vw,5rem)] pb-[clamp(2.5rem,5vw,4rem)]"
          style={{ borderColor: BORDER_TEAL_15 }}
        >
          <div className={HOME_INNER}>
            <p
              className="text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
              style={{ fontFamily: "var(--font-display), sans-serif", color: "var(--color-secondary)" }}
            >
              Help
            </p>
            <h1
              className="mt-4 max-w-[1100px] text-[clamp(2.5rem,8vw,5.5rem)] font-black uppercase leading-[0.94] tracking-[-0.04em]"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              <span className="block" style={{ color: "#1C1C1C" }}>
                frequently asked
              </span>
              <span className="block" style={{ color: "var(--color-primary)" }}>
                questions
              </span>
            </h1>
            <p
              className="mt-5 max-w-[560px] text-[1.125rem] leading-[1.7]"
              style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(28, 28, 28, 0.7)" }}
            >
              Quick answers about finding care, becoming a provider, adoption, and how Tinies Giving works. Still stuck?{" "}
              <Link href="/contact" className="font-semibold underline-offset-2 hover:underline" style={{ color: "var(--color-primary)" }}>
                Contact us
              </Link>
              .
            </p>
          </div>
        </div>

        <nav
          aria-label="FAQ sections"
          className="border-b"
          style={{ backgroundColor: "var(--color-primary-50)", borderColor: BORDER_TEAL_15 }}
        >
          <div className={`${HOME_INNER} flex flex-wrap gap-2 py-4`}>
            <a
              href="#owners"
              className="rounded-full border bg-[var(--color-background)] px-[18px] py-2 text-[0.8125rem] font-semibold transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              style={{
                borderColor: BORDER_TEAL_15,
                color: "rgba(28, 28, 28, 0.7)",
                fontFamily: "var(--font-body), sans-serif",
              }}
            >
              For pet owners
            </a>
            <a
              href="#providers"
              className="rounded-full border bg-[var(--color-background)] px-[18px] py-2 text-[0.8125rem] font-semibold transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              style={{
                borderColor: BORDER_TEAL_15,
                color: "rgba(28, 28, 28, 0.7)",
                fontFamily: "var(--font-body), sans-serif",
              }}
            >
              For providers
            </a>
            <a
              href="#adopters"
              className="rounded-full border bg-[var(--color-background)] px-[18px] py-2 text-[0.8125rem] font-semibold transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              style={{
                borderColor: BORDER_TEAL_15,
                color: "rgba(28, 28, 28, 0.7)",
                fontFamily: "var(--font-body), sans-serif",
              }}
            >
              For adopters
            </a>
            <a
              href="#giving"
              className="rounded-full border bg-[var(--color-background)] px-[18px] py-2 text-[0.8125rem] font-semibold transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              style={{
                borderColor: BORDER_TEAL_15,
                color: "rgba(28, 28, 28, 0.7)",
                fontFamily: "var(--font-body), sans-serif",
              }}
            >
              Tinies Giving
            </a>
          </div>
        </nav>

        <FaqEditorialSection
          id="owners"
          headingId="faq-owners"
          eyebrow="For pet owners"
          itemCount={6}
          accentColor="var(--color-primary)"
          backgroundColor="var(--color-background)"
        >
          <FaqAccordionItem question="How do I find a pet sitter near me?" accentColor="var(--color-primary)">
            <p>
              Search by service type and location on{" "}
              <Link href="/services" className="font-medium underline-offset-2 hover:underline" style={{ color: "var(--color-primary)" }}>
                Find Care
              </Link>
              . All providers are verified with government ID before they appear in search.
            </p>
          </FaqAccordionItem>
          <FaqAccordionItem question="How much does it cost?" accentColor="var(--color-primary)">
            <p>Providers set their own rates. Tinies adds a 12% service fee. 90% of that fee goes directly to animal rescue.</p>
          </FaqAccordionItem>
          <FaqAccordionItem question="What happens if something goes wrong?" accentColor="var(--color-primary)">
            <p>
              The Tinies Guarantee covers vet costs up to EUR 2,000 and property damage up to EUR 500. Full details on our{" "}
              <Link href="/terms" className="font-medium underline-offset-2 hover:underline" style={{ color: "var(--color-primary)" }}>
                Terms
              </Link>{" "}
              page.
            </p>
          </FaqAccordionItem>
          <FaqAccordionItem question="Can I meet the provider before booking?" accentColor="var(--color-primary)">
            <p>
              Yes! Request a free meet-and-greet from any provider&apos;s profile when you browse{" "}
              <Link href="/services" className="font-medium underline-offset-2 hover:underline" style={{ color: "var(--color-primary)" }}>
                local pet care
              </Link>
              .
            </p>
          </FaqAccordionItem>
          <FaqAccordionItem question="How do cancellations work?" accentColor="var(--color-primary)">
            <p>Each provider chooses a cancellation policy (Flexible, Moderate, or Strict). The policy is shown before you book.</p>
          </FaqAccordionItem>
          <FaqAccordionItem question="Is my payment secure?" accentColor="var(--color-primary)">
            <p>All payments are processed through Stripe. Your card details are never stored on our servers.</p>
          </FaqAccordionItem>
        </FaqEditorialSection>

        <FaqEditorialSection
          id="providers"
          headingId="faq-providers"
          eyebrow="For service providers"
          itemCount={4}
          accentColor="var(--color-secondary)"
          backgroundColor="var(--color-primary-50)"
        >
          <FaqAccordionItem question="How do I become a provider?" accentColor="var(--color-secondary)">
            <p>
              Sign up, complete your profile, and upload your ID for verification. You&apos;ll appear in search within 24–48 hours. Start from{" "}
              <Link href="/for-providers" className="font-medium underline-offset-2 hover:underline" style={{ color: "var(--color-primary)" }}>
                Become a Provider
              </Link>
              .
            </p>
          </FaqAccordionItem>
          <FaqAccordionItem question="How much can I earn?" accentColor="var(--color-secondary)">
            <p>You keep 88% of every booking. Set your own rates based on your area and experience.</p>
          </FaqAccordionItem>
          <FaqAccordionItem question="When do I get paid?" accentColor="var(--color-secondary)">
            <p>Weekly payouts every Monday via Stripe, for the previous week&apos;s completed bookings. Minimum payout: EUR 20.</p>
          </FaqAccordionItem>
          <FaqAccordionItem question={"What's the cancellation policy?"} accentColor="var(--color-secondary)">
            <p>You choose: Flexible, Moderate, or Strict. Provider cancellations always result in a full refund to the owner.</p>
          </FaqAccordionItem>
        </FaqEditorialSection>

        <FaqEditorialSection
          id="adopters"
          headingId="faq-adopters"
          eyebrow="For adopters"
          itemCount={4}
          accentColor="var(--color-primary)"
          backgroundColor="var(--color-background)"
        >
          <FaqAccordionItem question="How does international adoption work?" accentColor="var(--color-primary)">
            <p>
              We coordinate everything: vet preparation, EU pet passport, transport, and customs. You pay one transparent fee. Browse animals on{" "}
              <Link href="/adopt" className="font-medium underline-offset-2 hover:underline" style={{ color: "var(--color-primary)" }}>
                Adopt
              </Link>
              .
            </p>
          </FaqAccordionItem>
          <FaqAccordionItem question="How long does the adoption process take?" accentColor="var(--color-primary)">
            <p>Typically 4–8 weeks from approved application to arrival, depending on destination country requirements.</p>
          </FaqAccordionItem>
          <FaqAccordionItem question="Can I adopt from outside Europe?" accentColor="var(--color-primary)">
            <p>Currently we coordinate adoptions to the UK and EU countries. More destinations coming soon.</p>
          </FaqAccordionItem>
          <FaqAccordionItem question={"What's included in the adoption fee?"} accentColor="var(--color-primary)">
            <p>Vet preparation, vaccinations, microchip, spay/neuter, EU pet passport, transport, and Tinies coordination.</p>
          </FaqAccordionItem>
        </FaqEditorialSection>

        <FaqEditorialSection
          id="giving"
          headingId="faq-giving"
          eyebrow="About Tinies Giving"
          itemCount={2}
          accentColor="var(--color-secondary)"
          backgroundColor="var(--color-primary-50)"
        >
          <FaqAccordionItem question="Where does the money go?" accentColor="var(--color-secondary)">
            <p>
              90% of our commission goes directly to rescue animal care. Every euro is tracked on our{" "}
              <Link href="/giving" className="font-medium underline-offset-2 hover:underline" style={{ color: "var(--color-primary)" }}>
                Giving
              </Link>{" "}
              page.
            </p>
          </FaqAccordionItem>
          <FaqAccordionItem question="What is a Tinies Guardian?" accentColor="var(--color-secondary)">
            <p>
              A monthly supporter who gives EUR 3–10/month to rescue animals. 100% goes directly to animal rescue.{" "}
              <Link
                href="/giving/become-a-guardian"
                className="font-medium underline-offset-2 hover:underline"
                style={{ color: "var(--color-primary)" }}
              >
                Become a Guardian
              </Link>{" "}
              to sign up.
            </p>
          </FaqAccordionItem>
        </FaqEditorialSection>

        <section
          className="border-y"
          style={{ backgroundColor: "var(--color-primary-50)", borderColor: BORDER_TEAL_15 }}
        >
          <div className={`${HOME_INNER} flex flex-wrap items-start justify-center gap-x-10 gap-y-3 py-10`}>
            <div className="min-w-[140px] max-w-[220px] text-center">
              <p className="text-[0.8125rem] font-bold" style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}>
                ✓ EUR 2,000 guarantee
              </p>
              <p className="mt-1 text-[0.75rem] leading-snug" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
                Vet and damage coverage on eligible bookings.
              </p>
            </div>
            <div className="min-w-[140px] max-w-[220px] text-center">
              <p className="text-[0.8125rem] font-bold" style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}>
                ✓ ID-verified providers
              </p>
              <p className="mt-1 text-[0.75rem] leading-snug" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
                Government ID checked before anyone goes live.
              </p>
            </div>
            <div className="min-w-[140px] max-w-[220px] text-center">
              <p className="text-[0.8125rem] font-bold" style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}>
                ✓ 90% to rescue
              </p>
              <p className="mt-1 text-[0.75rem] leading-snug" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
                Most of our service fee funds rescue animals.
              </p>
            </div>
            <div className="min-w-[140px] max-w-[220px] text-center">
              <p className="text-[0.8125rem] font-bold" style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}>
                ✓ Secure payments
              </p>
              <p className="mt-1 text-[0.75rem] leading-snug" style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}>
                Encrypted checkout powered by Stripe.
              </p>
            </div>
          </div>
        </section>

        <section
          className="py-[clamp(4rem,8vw,8rem)] text-center"
          style={{ backgroundColor: "var(--color-primary)", color: "#FFFFFF" }}
        >
          <div className={HOME_INNER}>
            <p
              className="text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
              style={{ fontFamily: "var(--font-display), sans-serif", color: "rgba(255, 255, 255, 0.6)" }}
            >
              Still have questions?
            </p>
            <h2
              className="mx-auto mt-4 max-w-[900px] text-[clamp(2rem,6vw,3.75rem)] font-black uppercase leading-[0.94] tracking-[-0.03em]"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              <span className="block text-white">we&apos;re here</span>
              <span className="block" style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                to help.
              </span>
            </h2>
            <p
              className="mx-auto mt-5 max-w-[480px] text-base leading-[1.7]"
              style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(255, 255, 255, 0.72)" }}
            >
              Our team can point you to the right page, walk through bookings or adoption, or help with your account.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full px-8 py-3 text-[0.9375rem] font-semibold transition-opacity hover:opacity-90"
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  backgroundColor: "#FFFFFF",
                  color: "var(--color-primary)",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                }}
              >
                Contact us
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-full border border-white bg-transparent px-8 py-3 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-white/10"
                style={{ fontFamily: "var(--font-body), sans-serif" }}
              >
                Find care
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
