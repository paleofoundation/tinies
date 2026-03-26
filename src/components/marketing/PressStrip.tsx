import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type PressStripProps = {
  /** Eyebrow label above the logos. */
  label?: string;
  children: ReactNode;
  className?: string;
};

/**
 * “Seen on” style logo row for editorial pages.
 */
export function PressStrip({ label = "Seen on", children, className }: PressStripProps) {
  return (
    <div className={cn("theme-container py-10 sm:py-12", className)}>
      <p
        className="theme-eyebrow mb-6 text-center"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </p>
      <div
        className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {children}
      </div>
    </div>
  );
}
