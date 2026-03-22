"use client";

import { useEffect } from "react";

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin dashboard error boundary", error);
  }, [error]);

  return (
    <div className="min-h-screen px-4 py-20" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto max-w-lg text-center" style={{ maxWidth: "var(--max-width)" }}>
        <h1 className="font-normal" style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)" }}>
          Something went wrong
        </h1>
        <p className="mt-3 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          The admin dashboard hit an unexpected error. You can try again, or return home.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-12 items-center justify-center rounded-[var(--radius-pill)] px-6 font-semibold text-white transition-opacity hover:opacity-90"
            style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-primary)" }}
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-[var(--radius-pill)] border-2 px-6 font-semibold transition-opacity hover:opacity-90"
            style={{ fontFamily: "var(--font-body), sans-serif", borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
          >
            Home
          </a>
        </div>
      </main>
    </div>
  );
}
