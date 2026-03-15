import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Owner Dashboard | Tinies",
  description: "Your pet care bookings and pets.",
};

export default function OwnerDashboardPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto px-4 py-20 sm:px-6 sm:py-20" style={{ maxWidth: "var(--max-width)" }}>
        <h1 className="font-normal" style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}>Owner dashboard</h1>
        <p className="mt-2" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          Your bookings and pets will appear here.
        </p>
        <p className="mt-6">
          <Link href="/" className="font-semibold hover:underline" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-primary)" }}>
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
