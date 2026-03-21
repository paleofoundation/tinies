import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { FaqEntry } from "@/components/faq/FaqEntry";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

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
  title: "FAQ | Tinies",
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
      <main className="mx-auto px-4 py-14 sm:px-6 sm:py-20 lg:px-8" style={{ maxWidth: "var(--max-width)" }}>
        <p className="text-sm font-medium" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}>
          Help
        </p>
        <h1
          className="mt-2 font-normal tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
        >
          Frequently asked questions
        </h1>
        <p className="mt-3 max-w-2xl text-lg" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          Quick answers about finding care, becoming a provider, adoption, and how Tinies Giving works. Still stuck?{" "}
          <Link href="/contact" className="font-semibold underline-offset-2 hover:underline" style={{ color: "var(--color-primary)" }}>
            Contact us
          </Link>
          .
        </p>

        <div className="mt-14 flex flex-col gap-16">
          <section aria-labelledby="faq-owners">
            <h2
              id="faq-owners"
              className="font-normal"
              style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
            >
              For pet owners
            </h2>
            <div className="mt-6 flex flex-col gap-3">
              <FaqEntry question="How do I find a pet sitter near me?">
                <p>
                  Search by service type and location on{" "}
                  <Link href="/services" className="font-medium underline-offset-2 hover:underline" style={{ color: "var(--color-primary)" }}>
                    Find Care
                  </Link>
                  . All providers are verified with government ID before they appear in search.
                </p>
              </FaqEntry>
              <FaqEntry question="How much does it cost?">
                <p>
                  Providers set their own rates. Tinies adds a 12% service fee. 90% of that fee goes directly to animal rescue.
                </p>
              </FaqEntry>
              <FaqEntry question="What happens if something goes wrong?">
                <p>
                  The Tinies Guarantee covers vet costs up to EUR 2,000 and property damage up to EUR 500. Full details on our{" "}
                  <Link href="/terms" className="font-medium underline-offset-2 hover:underline" style={{ color: "var(--color-primary)" }}>
                    Terms
                  </Link>{" "}
                  page.
                </p>
              </FaqEntry>
              <FaqEntry question="Can I meet the provider before booking?">
                <p>
                  Yes! Request a free meet-and-greet from any provider&apos;s profile when you browse{" "}
                  <Link href="/services" className="font-medium underline-offset-2 hover:underline" style={{ color: "var(--color-primary)" }}>
                    local pet care
                  </Link>
                  .
                </p>
              </FaqEntry>
              <FaqEntry question="How do cancellations work?">
                <p>
                  Each provider chooses a cancellation policy (Flexible, Moderate, or Strict). The policy is shown before you book.
                </p>
              </FaqEntry>
              <FaqEntry question="Is my payment secure?">
                <p>All payments are processed through Stripe. Your card details are never stored on our servers.</p>
              </FaqEntry>
            </div>
          </section>

          <section aria-labelledby="faq-providers">
            <h2
              id="faq-providers"
              className="font-normal"
              style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
            >
              For service providers
            </h2>
            <div className="mt-6 flex flex-col gap-3">
              <FaqEntry question="How do I become a provider?">
                <p>
                  Sign up, complete your profile, and upload your ID for verification. You&apos;ll appear in search within 24–48 hours. Start from{" "}
                  <Link href="/for-providers" className="font-medium underline-offset-2 hover:underline" style={{ color: "var(--color-primary)" }}>
                    Become a Provider
                  </Link>
                  .
                </p>
              </FaqEntry>
              <FaqEntry question="How much can I earn?">
                <p>You keep 88% of every booking. Set your own rates based on your area and experience.</p>
              </FaqEntry>
              <FaqEntry question="When do I get paid?">
                <p>
                  Weekly payouts every Monday via Stripe, for the previous week&apos;s completed bookings. Minimum payout: EUR 20.
                </p>
              </FaqEntry>
              <FaqEntry question={"What's the cancellation policy?"}>
                <p>
                  You choose: Flexible, Moderate, or Strict. Provider cancellations always result in a full refund to the owner.
                </p>
              </FaqEntry>
            </div>
          </section>

          <section aria-labelledby="faq-adopters">
            <h2
              id="faq-adopters"
              className="font-normal"
              style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
            >
              For adopters
            </h2>
            <div className="mt-6 flex flex-col gap-3">
              <FaqEntry question="How does international adoption work?">
                <p>
                  We coordinate everything: vet preparation, EU pet passport, transport, and customs. You pay one transparent fee. Browse animals on{" "}
                  <Link href="/adopt" className="font-medium underline-offset-2 hover:underline" style={{ color: "var(--color-primary)" }}>
                    Adopt
                  </Link>
                  .
                </p>
              </FaqEntry>
              <FaqEntry question="How long does the adoption process take?">
                <p>
                  Typically 4–8 weeks from approved application to arrival, depending on destination country requirements.
                </p>
              </FaqEntry>
              <FaqEntry question="Can I adopt from outside Europe?">
                <p>Currently we coordinate adoptions to the UK and EU countries. More destinations coming soon.</p>
              </FaqEntry>
              <FaqEntry question={"What's included in the adoption fee?"}>
                <p>
                  Vet preparation, vaccinations, microchip, spay/neuter, EU pet passport, transport, and Tinies coordination.
                </p>
              </FaqEntry>
            </div>
          </section>

          <section aria-labelledby="faq-giving">
            <h2
              id="faq-giving"
              className="font-normal"
              style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
            >
              About Tinies Giving
            </h2>
            <div className="mt-6 flex flex-col gap-3">
              <FaqEntry question="Where does the money go?">
                <p>
                  90% of our commission goes directly to rescue animal care. Every euro is tracked on our{" "}
                  <Link href="/giving" className="font-medium underline-offset-2 hover:underline" style={{ color: "var(--color-primary)" }}>
                    Giving
                  </Link>{" "}
                  page.
                </p>
              </FaqEntry>
              <FaqEntry question="What is a Tinies Guardian?">
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
              </FaqEntry>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
