import type { Metadata } from "next";
import { Mail, MessageCircle, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";
const HELLO_EMAIL = "hello@tinies.app";

export const metadata: Metadata = {
  title: "Contact Us | Tinies",
  description:
    "Get in touch with Tinies for help with bookings, adoption, partnerships, or press. We reply by email as soon as we can.",
  openGraph: {
    title: "Contact Us | Tinies",
    description: "Contact Tinies — pet care and adoption in Cyprus.",
    url: `${BASE_URL}/contact`,
    siteName: "Tinies",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Tinies",
    description: "Get in touch with the Tinies team.",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto px-4 py-14 sm:px-6 sm:py-20 lg:px-8" style={{ maxWidth: "var(--max-width)" }}>
        <p className="text-sm font-medium" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}>
          Tinies
        </p>
        <h1
          className="mt-2 font-normal tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)", color: "var(--color-text)" }}
        >
          Contact us
        </h1>
        <p className="mt-3 max-w-2xl text-lg" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          Questions about pet care, adoption, or Tinies Giving? Send us an email — we read every message. For quick answers, see our{" "}
          <Link href="/faq" className="font-semibold underline-offset-2 hover:underline" style={{ color: "var(--color-primary)" }}>
            FAQ
          </Link>
          .
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          <div
            className="rounded-[var(--radius-lg)] border p-8"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              boxShadow: "var(--shadow-md)",
              padding: "var(--space-card)",
            }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)]"
              style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}
            >
              <Mail className="h-6 w-6" aria-hidden />
            </div>
            <h2
              className="mt-6 font-normal"
              style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
            >
              Email
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              The best way to reach us. We aim to respond within a few business days.
            </p>
            <a
              href={`mailto:${HELLO_EMAIL}`}
              className="mt-4 inline-flex font-semibold underline-offset-2 hover:underline"
              style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}
            >
              {HELLO_EMAIL}
            </a>
          </div>

          <div
            className="rounded-[var(--radius-lg)] border p-8"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              boxShadow: "var(--shadow-md)",
              padding: "var(--space-card)",
            }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)]"
              style={{ backgroundColor: "rgba(244, 93, 72, 0.12)", color: "var(--color-secondary)" }}
            >
              <MessageCircle className="h-6 w-6" aria-hidden />
            </div>
            <h2
              className="mt-6 font-normal"
              style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
            >
              Help centre
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              Owners, providers, adopters, and supporters — organised by topic.
            </p>
            <Link
              href="/faq"
              className="mt-4 inline-flex font-semibold underline-offset-2 hover:underline"
              style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-secondary)" }}
            >
              Read the FAQ →
            </Link>
          </div>
        </div>

        <div
          className="mt-10 flex flex-wrap items-center gap-2 rounded-[var(--radius-lg)] border px-6 py-4 text-sm"
          style={{
            fontFamily: "var(--font-body), sans-serif",
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text-secondary)",
          }}
        >
          <MapPin className="h-4 w-4 shrink-0 text-[var(--color-primary)]" aria-hidden />
          <span>
            Tinies is based in <span style={{ color: "var(--color-text)" }}>Cyprus</span>, serving local pet care and international adoption from the island.
          </span>
        </div>
      </main>
    </div>
  );
}
