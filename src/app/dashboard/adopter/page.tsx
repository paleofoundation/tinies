import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { getAdopterApplications } from "./actions";
import { AdopterDashboardClient } from "./AdopterDashboardClient";

export const metadata: Metadata = {
  title: "Adopter Dashboard | Tinies",
  description: "Your adoption applications and status.",
};

export default async function AdopterDashboardPage() {
  const { applications, error } = await getAdopterApplications();

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
    >
      <main
        className="mx-auto px-4 py-20 sm:px-6 sm:py-20"
        style={{ maxWidth: "var(--max-width)" }}
      >
        <h1
          className="font-normal"
          style={{
            fontFamily: "var(--font-heading), serif",
            fontSize: "var(--text-2xl)",
            color: "var(--color-text)",
          }}
        >
          Adopter dashboard
        </h1>
        <p className="mt-2" style={{ color: "var(--color-text-secondary)" }}>
          Your adoption applications and their status. The rescue will be in touch.
        </p>

        {error && (
          <p className="mt-4 text-sm" style={{ color: "var(--color-error)" }}>
            {error}
          </p>
        )}

        {applications.length === 0 && !error && (
          <div
            className="mt-10 rounded-[var(--radius-lg)] border p-8 text-center"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <p className="text-lg" style={{ color: "var(--color-text-secondary)" }}>
              You haven&apos;t submitted any adoption applications yet.
            </p>
            <Link
              href="/adopt"
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-[var(--radius-pill)] px-6 font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <Heart className="h-5 w-5" />
              Browse adoptable animals
            </Link>
          </div>
        )}

        {applications.length > 0 && (
          <AdopterDashboardClient applications={applications} />
        )}

        <p className="mt-10">
          <Link
            href="/"
            className="text-sm hover:underline"
            style={{ color: "var(--color-text-secondary)" }}
          >
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
