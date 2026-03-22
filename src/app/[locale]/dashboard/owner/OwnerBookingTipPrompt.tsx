"use client";

import { useEffect, useState } from "react";
import { TipForm } from "./TipForm";

function storageKey(bookingId: string) {
  return `tinies-tip-skip-${bookingId}`;
}

export function OwnerBookingTipPrompt({
  bookingId,
  providerName,
  returnPath,
}: {
  bookingId: string;
  providerName: string;
  returnPath: string;
}) {
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.sessionStorage.getItem(storageKey(bookingId))) {
        setSkipped(true);
      }
    } catch {
      /* ignore */
    }
  }, [bookingId]);

  function skip() {
    try {
      window.sessionStorage.setItem(storageKey(bookingId), "1");
    } catch {
      /* ignore */
    }
    setSkipped(true);
  }

  if (skipped) return null;

  return (
    <section
      className="mt-10 rounded-[var(--radius-xl)] border p-6 sm:p-8"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="text-lg font-semibold sm:text-xl" style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}>
          Was {providerName} amazing? Leave a tip!
        </h2>
        <button
          type="button"
          onClick={skip}
          className="shrink-0 text-left text-sm font-semibold underline sm:text-right"
          style={{ color: "var(--color-primary)" }}
        >
          Skip
        </button>
      </div>
      <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
        100% of your tip goes directly to {providerName}. Tinies takes no cut.
      </p>
      <div className="mt-4">
        <TipForm bookingId={bookingId} providerName={providerName} returnPath={returnPath} variant="inline" onClose={skip} />
      </div>
    </section>
  );
}
