import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type SectionBackground =
  | "transparent"
  | "background"
  | "surface"
  | "primary"
  | "primary-50"
  | "secondary";

const SECTION_BG: Record<SectionBackground, string | undefined> = {
  transparent: undefined,
  background: "var(--color-background)",
  surface: "var(--color-surface)",
  primary: "var(--color-primary)",
  "primary-50": "var(--color-primary-50)",
  secondary: "var(--color-secondary)",
};

export type SectionProps = {
  children: ReactNode;
  className?: string;
  /** When true, applies vertical padding from `--section-y`. */
  padded?: boolean;
  background?: SectionBackground;
};

/**
 * Section wrapper with optional background and `.theme-section` padding (Section 5 — theme).
 */
export function Section({
  children,
  className,
  padded = true,
  background = "transparent",
}: SectionProps) {
  const bg = SECTION_BG[background];
  return (
    <section
      className={cn(padded && "theme-section", className)}
      style={bg ? { backgroundColor: bg } : undefined}
    >
      {children}
    </section>
  );
}
