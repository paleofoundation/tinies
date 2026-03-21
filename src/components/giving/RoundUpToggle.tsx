"use client";

import { useEffect, useMemo, useRef } from "react";
import { Heart } from "lucide-react";
import { computeRoundUpCents } from "@/lib/booking-utils";

function formatEurLiteral(cents: number): string {
  return `EUR ${(cents / 100).toFixed(2)}`;
}

export type RoundUpToggleProps = {
  bookingTotalCents: number;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  preferredCharityName: string | null;
  /** Persist opt-in/out (fire-and-forget from parent). */
  onPersistPreference?: (enabled: boolean) => void | Promise<void>;
  /** Current round-up amount in cents when enabled, else 0 — for parent form sync. */
  onRoundUpChange?: (enabled: boolean, roundUpAmountCents: number) => void;
  disabled?: boolean;
};

export function RoundUpToggle({
  bookingTotalCents,
  enabled,
  onEnabledChange,
  preferredCharityName,
  onPersistPreference,
  onRoundUpChange,
  disabled = false,
}: RoundUpToggleProps) {
  const roundUpCents = useMemo(() => {
    if (bookingTotalCents <= 0) return 0;
    return computeRoundUpCents(bookingTotalCents);
  }, [bookingTotalCents]);

  const bookingLiteral = formatEurLiteral(bookingTotalCents);
  const chargedIfOnLiteral = formatEurLiteral(bookingTotalCents + roundUpCents);
  const roundUpLiteral = formatEurLiteral(roundUpCents);

  const destinationWhenOn = preferredCharityName
    ? `${roundUpLiteral} goes to ${preferredCharityName}`
    : `${roundUpLiteral} goes to animal rescue in Cyprus`;

  const roundUpChangeRef = useRef(onRoundUpChange);
  roundUpChangeRef.current = onRoundUpChange;
  useEffect(() => {
    roundUpChangeRef.current?.(enabled, enabled ? roundUpCents : 0);
  }, [enabled, roundUpCents]);

  function toggle() {
    if (disabled || bookingTotalCents <= 0) return;
    const next = !enabled;
    onEnabledChange(next);
    void onPersistPreference?.(next);
  }

  if (bookingTotalCents <= 0) {
    return null;
  }

  return (
    <div
      className="rounded-[var(--radius-xl)] border p-5 sm:p-6"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: enabled ? "var(--color-primary-50)" : "var(--color-surface)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)]"
            style={{
              backgroundColor: enabled ? "var(--color-primary)" : "var(--color-primary-100)",
              color: enabled ? "var(--color-background)" : "var(--color-primary)",
            }}
            aria-hidden
          >
            <Heart className="h-5 w-5" fill={enabled ? "currentColor" : "none"} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-snug" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
              Round up to support animal rescue?
            </p>
            <p className="mt-2 text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              {enabled ? (
                <>
                  Your {bookingLiteral} booking becomes {chargedIfOnLiteral}, and{" "}
                  <span className="font-semibold" style={{ color: "var(--color-text)" }}>{destinationWhenOn}</span>.
                </>
              ) : (
                <>
                  Your booking total is {bookingLiteral}. Turn on to pay {chargedIfOnLiteral} total — {roundUpLiteral} would go to{" "}
                  {preferredCharityName ?? "animal rescue in Cyprus"}.
                </>
              )}
            </p>
            {enabled && roundUpCents > 0 && (
              <p className="mt-3 text-xs" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}>
                Round-up: <span className="font-semibold tabular-nums" style={{ color: "var(--color-primary)" }}>{roundUpLiteral}</span> — not part of your
                sitter&apos;s payout or platform commission; it goes to Tinies Giving.
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={enabled ? "Round-up enabled" : "Round-up disabled"}
          disabled={disabled}
          onClick={toggle}
          className="relative h-9 w-[3.25rem] shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:opacity-50"
          style={{
            backgroundColor: enabled ? "var(--color-primary)" : "var(--color-neutral-200)",
          }}
        >
          <span
            className="absolute top-1 left-1 h-7 w-7 rounded-full shadow-sm transition-transform duration-200 ease-out"
            style={{
              backgroundColor: "var(--color-background)",
              transform: enabled ? "translateX(1.25rem)" : "translateX(0)",
            }}
          />
        </button>
      </div>
    </div>
  );
}
