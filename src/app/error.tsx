"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
    >
      <div className="text-center max-w-md">
        <h1
          className="text-2xl font-normal"
          style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
        >
          Something went wrong
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          We couldn’t complete that action. Please try again.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-6 py-3 font-semibold text-white hover:opacity-90"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-[var(--radius-pill)] border-2 border-[var(--color-border)] px-6 py-3 font-semibold hover:opacity-90"
            style={{ color: "var(--color-text)" }}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
