import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tinies.app";

export const metadata: Metadata = {
  title: "Rescue partners | Tinies",
  description: "Verified rescue organisations listing animals for adoption on Tinies in Cyprus.",
  openGraph: {
    title: "Rescue partners | Tinies",
    description: "Verified rescue organisations listing animals for adoption on Tinies in Cyprus.",
    url: `${BASE_URL}/rescue`,
    siteName: "Tinies",
    type: "website",
  },
};

/** Placeholder until the full rescue directory ships; keeps the footer “Our rescue partners” link working. */
export default function RescuePartnersPlaceholderPage() {
  return (
    <div className="min-h-screen px-4 py-16 sm:px-6" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <div className="mx-auto max-w-xl text-center">
        <h1 className="font-normal" style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-3xl)" }}>
          Our rescue partners
        </h1>
        <p className="mt-4" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          A full directory is coming soon. For now, browse animals and open a listing to see the verified rescue caring for each animal.
        </p>
        <Link
          href="/adopt"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-[var(--radius-pill)] px-8 font-semibold text-white"
          style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-primary)" }}
        >
          Browse adoptable animals
        </Link>
      </div>
    </div>
  );
}
