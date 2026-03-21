import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export const metadata: Metadata = {
  title: "Terms of Service | Tinies",
  description:
    "Terms of Service for Tinies — the pet care marketplace and adoption platform for Cyprus. Commission, bookings, adoption coordination, Tinies Giving, and your rights.",
  openGraph: {
    title: "Terms of Service | Tinies",
    description:
      "Terms of Service for Tinies — pet care bookings, rescue adoption tools, and Tinies Giving. Operated from Cyprus.",
    url: `${BASE_URL}/terms`,
    siteName: "Tinies",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Terms of Service | Tinies",
    description: "Terms of Service for Tinies — pet care and adoption platform (Cyprus).",
  },
};

const SECTIONS = [
  { id: "introduction", label: "Introduction" },
  { id: "definitions", label: "Definitions" },
  { id: "user-accounts", label: "User accounts" },
  { id: "services-marketplace", label: "Services marketplace" },
  { id: "adoption-services", label: "Adoption services" },
  { id: "tinies-giving", label: "Tinies Giving" },
  { id: "payments", label: "Payments" },
  { id: "provider-obligations", label: "Provider obligations" },
  { id: "user-conduct", label: "User conduct" },
  { id: "intellectual-property", label: "Intellectual property" },
  { id: "limitation-of-liability", label: "Limitation of liability" },
  { id: "dispute-resolution", label: "Dispute resolution" },
  { id: "changes-to-terms", label: "Changes to terms" },
  { id: "contact", label: "Contact" },
] as const;

const bodyStyle = { fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" } as const;
const headingStyle = { fontFamily: "var(--font-heading), serif", color: "var(--color-text)" } as const;

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <article className="mx-auto px-4 py-14 sm:px-6 sm:py-20" style={{ maxWidth: "42rem" }}>
        <header className="border-b pb-10" style={{ borderColor: "var(--color-border)" }}>
          <h1
            className="text-3xl font-normal tracking-tight sm:text-4xl"
            style={{ ...headingStyle, fontSize: "var(--text-3xl)" }}
          >
            Terms of Service
          </h1>
          <p className="mt-3 text-sm" style={{ ...bodyStyle, color: "var(--color-text-muted)" }}>
            Last updated: [DATE]
          </p>
          <p className="mt-2 text-sm" style={bodyStyle}>
            Effective date: [DATE]
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
                Welcome to Tinies (&quot;Tinies&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;). Tinies is operated by{" "}
                <strong style={{ color: "var(--color-text)" }}>[COMPANY NAME]</strong>, a company registered in{" "}
                <strong style={{ color: "var(--color-text)" }}>Cyprus</strong>.
              </p>
              <p>
                These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Tinies website, applications,
                and related services (together, the &quot;Platform&quot;). By creating an account or using the Platform, you
                agree to these Terms. If you do not agree, do not use Tinies.
              </p>
            </div>
          </section>

          <section id="definitions" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              Definitions
            </h2>
            <ul className="mt-4 list-disc space-y-3 pl-5" style={bodyStyle}>
              <li>
                <strong style={{ color: "var(--color-text)" }}>Platform</strong> — the Tinies website, apps, and services we
                provide to connect users.
              </li>
              <li>
                <strong style={{ color: "var(--color-text)" }}>Services</strong> — pet care services offered by Providers
                (such as walking, sitting, boarding, drop-ins, daycare) and adoption-related tools and coordination offered
                through Tinies.
              </li>
              <li>
                <strong style={{ color: "var(--color-text)" }}>Provider</strong> — a registered user who offers paid pet care
                Services through the Platform.
              </li>
              <li>
                <strong style={{ color: "var(--color-text)" }}>Owner</strong> — a registered user who books Services for their
                pets.
              </li>
              <li>
                <strong style={{ color: "var(--color-text)" }}>Rescue Organisation</strong> — a registered organisation that
                lists animals for adoption and manages applications through the Platform.
              </li>
              <li>
                <strong style={{ color: "var(--color-text)" }}>Adopter</strong> — a user who applies to adopt an animal listed
                on the Platform, including international adopters where applicable.
              </li>
              <li>
                <strong style={{ color: "var(--color-text)" }}>Booking</strong> — a confirmed arrangement between an Owner and a
                Provider for Services, facilitated and paid through the Platform where applicable.
              </li>
              <li>
                <strong style={{ color: "var(--color-text)" }}>Commission</strong> — the fee Tinies retains from completed
                Bookings, calculated as a percentage of the booking value as described on the Platform (currently{" "}
                <strong style={{ color: "var(--color-text)" }}>12%</strong> of each completed booking, deducted from the amount
                otherwise payable to the Provider).
              </li>
            </ul>
          </section>

          <section id="user-accounts" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              User accounts
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>
                You must be legally able to enter a binding contract in your jurisdiction. You may need to meet additional
                eligibility requirements for certain roles (for example, Provider verification).
              </p>
              <p>
                You agree to provide accurate, current information and to keep it updated. You are responsible for maintaining
                the confidentiality of your login credentials and for all activity under your account. Notify us promptly at{" "}
                <a href="mailto:hello@tinies.app" className="underline" style={{ color: "var(--color-primary)" }}>
                  hello@tinies.app
                </a>{" "}
                if you suspect unauthorised access.
              </p>
            </div>
          </section>

          <section id="services-marketplace" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              Services marketplace
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>
                Tinies provides a marketplace that connects Owners and Providers. Providers set their own prices, availability,
                and (where applicable) cancellation policies. Tinies charges Commission on completed Bookings as described on the
                Platform.
              </p>
              <p>
                The booking process (including requests, acceptance windows, payment authorisation, and completion) is as
                described in the Platform and related help materials. Cancellation and refund treatment depends on the
                Provider&apos;s stated policy tier (for example, Flexible, Moderate, or Strict) and the timing of cancellation;
                details are shown at booking and in your account.
              </p>
              <p>
                The <strong style={{ color: "var(--color-text)" }}>Tinies Guarantee</strong> (where offered) is a
                platform-level consumer protection programme with its own terms, limits, and claims process as published on
                the Platform. It does not replace insurance and does not cover every situation; please read the Guarantee
                description carefully.
              </p>
            </div>
          </section>

          <section id="adoption-services" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              Adoption services
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>
                Tinies provides tools for Rescue Organisations to list animals, receive applications, and manage adoption
                workflows. For international adoptions, Tinies may offer coordination services and charge fees as disclosed at
                application or checkout. Fees, scope, and any pass-through costs (for example veterinary or transport arranged
                by third parties) will be described where you transact.
              </p>
              <p>
                <strong style={{ color: "var(--color-text)" }}>Tinies is not the rescue organisation.</strong> Adoption
                decisions, animal welfare, home checks, and legal transfer of ownership remain the responsibility of the Rescue
                Organisation and the adopter. Tinies does not guarantee that any application will result in a match or an
                adoption.
              </p>
            </div>
          </section>

          <section id="tinies-giving" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              Tinies Giving
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>
                Tinies Giving includes allocations from platform revenue to support registered animal charities, optional
                round-up donations at checkout, and Guardian subscriptions, as described on the Giving pages. A portion of
                Commission revenue is allocated to the Giving Fund for distribution to eligible charities in line with our
                published transparency materials.
              </p>
              <p>
                <strong style={{ color: "var(--color-text)" }}>Tinies is not a charity.</strong> We facilitate donations and
                distributions to <strong style={{ color: "var(--color-text)" }}>registered charities</strong> where applicable.
                Tax treatment of donations depends on your circumstances and local law; we do not provide tax advice.
              </p>
            </div>
          </section>

          <section id="payments" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              Payments
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>
                Payments are processed by our payment partner <strong style={{ color: "var(--color-text)" }}>Stripe</strong>.
                All prices and charges on the Platform are in <strong style={{ color: "var(--color-text)" }}>euros (EUR)</strong>{" "}
                unless we clearly state otherwise.
              </p>
              <p>
                Refunds for pet care Bookings follow the applicable cancellation policy and Platform rules (including timing and
                provider response). Where a Booking is cancelled or declined in line with those rules, authorised payments may
                be voided or refunded as described at checkout and in your booking confirmation.
              </p>
            </div>
          </section>

          <section id="provider-obligations" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              Provider obligations
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>
                Providers must complete verification steps we require (for example identity checks) before appearing in search
                where applicable. Providers must describe Services, pricing, and policies honestly, perform Bookings with
                reasonable care and professionalism, and comply with applicable laws and animal welfare standards.
              </p>
            </div>
          </section>

          <section id="user-conduct" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              User conduct
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>
                You must not use the Platform unlawfully, harass others, misrepresent yourself, upload malware, scrape the
                Platform without permission, or circumvent security. You must not solicit or arrange payment outside the
                Platform to avoid fees where Bookings are required to go through Tinies.
              </p>
            </div>
          </section>

          <section id="intellectual-property" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              Intellectual property
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>
                Tinies owns the Platform, branding, and our proprietary materials. You receive a limited, revocable licence to
                use the Platform in line with these Terms. You retain ownership of content you upload (such as photos and
                descriptions); you grant Tinies a licence to host, display, and use that content to operate and promote the
                Platform as reasonably required.
              </p>
            </div>
          </section>

          <section id="limitation-of-liability" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              Limitation of liability
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>
                To the fullest extent permitted by law, Tinies provides the Platform &quot;as is&quot;. We are a marketplace and
                technology provider; we do not employ Providers and are not responsible for their conduct, nor for the
                accuracy of listings by Rescue Organisations. We are not liable for indirect or consequential losses, loss of
                profit, or loss of data, except where such exclusion is not allowed by law.
              </p>
              <p>
                Nothing in these Terms limits liability for death or personal injury caused by negligence, fraud, or other
                liability that cannot be limited under applicable law. Where liability can be capped, our aggregate liability
                arising out of or relating to the Platform in any twelve-month period is limited to the greater of (a) the fees
                you paid to Tinies in that period for the specific service giving rise to the claim, or (b) one hundred euros
                (EUR 100), except where a higher minimum applies by law.
              </p>
            </div>
          </section>

          <section id="dispute-resolution" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              Dispute resolution
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>
                If a dispute arises, you agree to contact us first so we can try to resolve it through the Platform&apos;s
                support and mediation tools where available.
              </p>
              <p>
                These Terms are governed by the laws of <strong style={{ color: "var(--color-text)" }}>Cyprus</strong>. The
                courts of Cyprus shall have exclusive jurisdiction, subject to any mandatory rights you may have as a consumer
                in your country of residence.
              </p>
            </div>
          </section>

          <section id="changes-to-terms" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              Changes to terms
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>
                We may update these Terms from time to time. We will post the revised Terms on this page and update the
                &quot;Last updated&quot; date. Where changes are material, we will provide notice as required by law (for example
                by email or a notice on the Platform). Continued use after the effective date of changes constitutes acceptance
                of the updated Terms, except where your explicit consent is required.
              </p>
            </div>
          </section>

          <section id="contact" className="scroll-mt-24">
            <h2 className="text-xl font-normal sm:text-2xl" style={{ ...headingStyle, fontSize: "var(--text-xl)" }}>
              Contact
            </h2>
            <div className="mt-4 space-y-4" style={bodyStyle}>
              <p>
                Questions about these Terms:{" "}
                <a href="mailto:hello@tinies.app" className="underline" style={{ color: "var(--color-primary)" }}>
                  hello@tinies.app
                </a>
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
