import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export const metadata: Metadata = {
  title: "Privacy Policy | Tinies",
  description:
    "Privacy Policy for Tinies — how we collect, use, and protect your personal data under GDPR. Stripe, Twilio, Resend, Supabase, and your rights.",
  openGraph: {
    title: "Privacy Policy | Tinies",
    description:
      "How Tinies handles personal data: account information, bookings, payments via Stripe, and your GDPR rights. Cyprus / EU focus.",
    url: `${BASE_URL}/privacy`,
    siteName: "Tinies",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | Tinies",
    description: "Tinies privacy policy — GDPR, data processors, and your rights.",
  },
};

const SECTIONS = [
  { id: "introduction", label: "Introduction" },
  { id: "data-we-collect", label: "Data we collect" },
  { id: "how-we-use-data", label: "How we use data" },
  { id: "legal-basis", label: "Legal basis for processing" },
  { id: "data-sharing", label: "Data sharing" },
  { id: "international-transfers", label: "International transfers" },
  { id: "data-retention", label: "Data retention" },
  { id: "your-rights", label: "Your rights under GDPR" },
  { id: "exercising-rights", label: "How to exercise your rights" },
  { id: "cookies", label: "Cookies" },
  { id: "children", label: "Children" },
  { id: "changes", label: "Changes to this policy" },
  { id: "contact", label: "Contact" },
] as const;

const bodyStyle = { fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" } as const;
const headingStyle = { fontFamily: "var(--font-heading), serif", color: "var(--color-text)" } as const;

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <article className="mx-auto px-4 py-14 sm:px-6 sm:py-20" style={{ maxWidth: "42rem" }}>
        <header className="border-b pb-10" style={{ borderColor: "var(--color-border)" }}>
          <h1
            className="text-3xl font-normal tracking-tight sm:text-4xl"
            style={{ ...headingStyle, fontSize: "var(--text-3xl)" }}
          >
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm" style={{ ...bodyStyle, color: "var(--color-text-muted)" }}>
            Last updated: [DATE]
          </p>
        </header>

        <nav className="mt-10" aria-label="Table of contents">
          <h2 className="text-lg font-normal" style={{ ...headingStyle, fontSize: "var(--text-lg)" }}>
            Contents
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed" style={bodyStyle}>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <Link href={`#${s.id}`} className="underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-primary)]" style={{ color: "var(--color-primary)" }}>
                  {s.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-14 space-y-12 text-sm leading-relaxed sm:text-base sm:leading-relaxed">
          <section id="introduction" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              Introduction
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>
                This Privacy Policy explains how <strong style={{ color: "var(--color-text)" }}>[COMPANY NAME]</strong> (&quot;Tinies&quot;,
                &quot;we&quot;, &quot;us&quot;) collects, uses, stores, and shares personal data when you use tinies.app and related services
                (the &quot;Platform&quot;).
              </p>
              <p>
                We are committed to protecting your privacy and complying with the EU General Data Protection Regulation
                (&quot;GDPR&quot;) and applicable Cyprus law. This policy should be read together with our{" "}
                <Link href="/terms" className="underline" style={{ color: "var(--color-primary)" }}>
                  Terms of Service
                </Link>
                .
              </p>
            </div>
          </section>

          <section id="data-we-collect" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              Data we collect
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>Depending on how you use Tinies, we may process:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Account information</strong> — name, email address, phone
                  number (if provided), password (stored securely via our authentication provider; we do not store your plain
                  password in our own database), role (owner, provider, rescue, adopter, etc.), and profile details.
                </li>
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Pet profiles</strong> — information you add about pets (name,
                  species, breed, age, photos, notes) for bookings or your account.
                </li>
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Booking history</strong> — services booked, dates, messages
                  related to bookings, reviews, and dispute or claim information where applicable.
                </li>
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Payment information</strong> — we use{" "}
                  <strong style={{ color: "var(--color-text)" }}>Stripe</strong> to process payments. We do not store full card
                  numbers on our servers; Stripe collects and processes card data according to its own privacy policy.
                </li>
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Location</strong> — approximate or district-level location and
                  addresses you provide for search, service areas, or logistics (for example adoption or meet-and-greet).
                </li>
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Device and browser information</strong> — IP address, browser
                  type, device type, and similar technical data used for security, analytics, and service improvement.
                </li>
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Photos and documents</strong> — images you upload (for example
                  pet photos, provider verification ID, rescue logos) and, where applicable, documents for verification or
                  adoption.
                </li>
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Adoption applications</strong> — information submitted in
                  application forms, shared with the relevant Rescue Organisation as needed to process your application.
                </li>
              </ul>
            </div>
          </section>

          <section id="how-we-use-data" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              How we use data
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>We use personal data to:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Provide, operate, and secure the Platform;</li>
                <li>Create and manage accounts, and authenticate users;</li>
                <li>Facilitate Bookings between Owners and Providers, including payments and payouts;</li>
                <li>Send service-related notifications (for example booking updates, security alerts) by email or SMS where you
                  have provided contact details;</li>
                <li>Facilitate adoption listings, applications, and coordination features;</li>
                <li>Operate Tinies Giving, round-up donations, and Guardian subscriptions as described on the Platform;</li>
                <li>Improve the Platform, analyse usage trends, and prevent fraud and abuse;</li>
                <li>Comply with legal obligations and enforce our Terms.</li>
              </ul>
            </div>
          </section>

          <section id="legal-basis" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              Legal basis for processing
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>Under GDPR we rely on one or more of the following:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Performance of a contract</strong> — processing necessary to
                  provide the services you request (for example processing a Booking or adoption application).
                </li>
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Legitimate interests</strong> — for example fraud prevention,
                  network security, improving the Platform, and direct communications related to your account, where not
                  overridden by your rights.
                </li>
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Consent</strong> — where we ask for consent (for example
                  certain marketing messages or non-essential cookies), you may withdraw consent at any time.
                </li>
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Legal obligation</strong> — where we must retain or disclose
                  data to comply with law, tax, or regulatory requirements.
                </li>
              </ul>
            </div>
          </section>

          <section id="data-sharing" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              Data sharing
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>We share personal data only as needed to run the Platform:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Stripe</strong> — payment processing, payouts, and related
                  fraud checks.
                </li>
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Twilio</strong> — SMS messages (for example OTP or notifications)
                  where enabled.
                </li>
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Resend</strong> — transactional and service emails.
                </li>
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Supabase</strong> — authentication, database, and file storage
                  for the Platform. We configure services with <strong style={{ color: "var(--color-text)" }}>EU data residency</strong>{" "}
                  where available for customer data.
                </li>
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Rescue Organisations</strong> — adoption application details you
                  submit are shared with the organisation listing the animal so they can review your application.
                </li>
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Providers and Owners</strong> — limited information is shared
                  between parties to a Booking (for example name, contact details, and pet information) as needed to perform the
                  service.
                </li>
              </ul>
              <p>
                We <strong style={{ color: "var(--color-text)" }}>do not sell</strong> your personal data.
              </p>
            </div>
          </section>

          <section id="international-transfers" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              International transfers
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>
                Where we use processors that may process data outside the European Economic Area (for example Stripe or other
                US-based providers), we rely on appropriate safeguards such as{" "}
                <strong style={{ color: "var(--color-text)" }}>Standard Contractual Clauses</strong> approved by the European
                Commission, or other mechanisms permitted under GDPR. You may request more information about transfers by
                contacting us.
              </p>
              <p>
                Supabase and core Platform data are configured for <strong style={{ color: "var(--color-text)" }}>EU</strong>{" "}
                hosting where we use EU regions; specific subprocessors may still involve transfers as described in their
                documentation.
              </p>
            </div>
          </section>

          <section id="data-retention" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              Data retention
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>
                We keep account and profile data while your account is active. If you ask us to delete your account, we will
                delete or anonymise personal data unless we must retain certain information to comply with law or defend legal
                claims.
              </p>
              <p>
                Booking, payment, and accounting records may be retained for up to{" "}
                <strong style={{ color: "var(--color-text)" }}>seven (7) years</strong> where required for tax, audit, or
                regulatory purposes.
              </p>
            </div>
          </section>

          <section id="your-rights" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              Your rights under GDPR
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>If you are in the EEA or UK, you may have the right to:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Access</strong> — obtain confirmation of processing and a copy of
                  your personal data;
                </li>
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Rectification</strong> — correct inaccurate data;
                </li>
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Erasure</strong> — request deletion in certain circumstances;
                </li>
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Portability</strong> — receive data you provided in a structured,
                  machine-readable format where technically feasible;
                </li>
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Restriction</strong> — limit processing in certain cases;
                </li>
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Object</strong> — object to processing based on legitimate
                  interests, including profiling in some cases;
                </li>
                <li>
                  <strong style={{ color: "var(--color-text)" }}>Withdraw consent</strong> — where processing is based on consent,
                  without affecting prior lawful processing.
                </li>
              </ul>
              <p>You may also lodge a complaint with a supervisory authority in your country.</p>
            </div>
          </section>

          <section id="exercising-rights" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              How to exercise your rights
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>
                Email{" "}
                <a href="mailto:hello@tinies.app" className="underline" style={{ color: "var(--color-primary)" }}>
                  hello@tinies.app
                </a>{" "}
                with your request. We may need to verify your identity before responding. We aim to respond within one month,
                subject to extension for complex requests as allowed by law.
              </p>
            </div>
          </section>

          <section id="cookies" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              Cookies
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>
                We use cookies and similar technologies sparingly: for example{" "}
                <strong style={{ color: "var(--color-text)" }}>session and authentication</strong> cookies (and related storage)
                so you can stay logged in securely, and <strong style={{ color: "var(--color-text)" }}>analytics</strong> via{" "}
                <strong style={{ color: "var(--color-text)" }}>Google Analytics 4 (GA4)</strong> to understand how the Platform is
                used. You can control cookies through your browser settings; blocking essential cookies may affect functionality.
              </p>
            </div>
          </section>

          <section id="children" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              Children
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>
                Tinies is not intended for children under <strong style={{ color: "var(--color-text)" }}>16</strong>. We do not
                knowingly collect personal data from children under 16. If you believe we have done so, please contact us and we
                will take steps to delete the information.
              </p>
            </div>
          </section>

          <section id="changes" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              Changes to this policy
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>
                We may update this Privacy Policy from time to time. We will post the new version on this page and change the
                &quot;Last updated&quot; date. Where required, we will notify you by email or through the Platform.
              </p>
            </div>
          </section>

          <section id="contact" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              Contact
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>
                Privacy questions:{" "}
                <a href="mailto:hello@tinies.app" className="underline" style={{ color: "var(--color-primary)" }}>
                  hello@tinies.app
                </a>
              </p>
              <p>
                <strong style={{ color: "var(--color-text)" }}>Data Protection Officer:</strong> [TBD]
              </p>
            </div>
          </section>
        </div>

        <p className="mt-16 text-sm" style={{ ...bodyStyle, color: "var(--color-text-muted)" }}>
          <Link href="/" className="underline hover:opacity-90" style={{ color: "var(--color-primary)" }}>
            ← Back to home
          </Link>
        </p>
      </article>
    </div>
  );
}
