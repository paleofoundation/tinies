"use client";

import { useEffect, useState } from "react";

const eur = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type Props = {
  /** Total donated in cents */
  totalCents: number;
  className?: string;
};

export function GivingAnimatedTotal({ totalCents, className }: Props) {
  const targetEur = totalCents / 100;
  const [displayEur, setDisplayEur] = useState(0);

  useEffect(() => {
    const durationMs = 1800;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setDisplayEur(targetEur * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [targetEur]);

  return (
    <span
      className={className}
      style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-secondary)" }}
      aria-live="polite"
    >
      {eur.format(displayEur)}
    </span>
  );
}
