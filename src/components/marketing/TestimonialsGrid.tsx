import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { SectionBackground } from "@/components/theme";

const BG: Record<Exclude<SectionBackground, "transparent">, string> = {
  background: "var(--color-background)",
  surface: "var(--color-surface)",
  primary: "var(--color-primary)",
  "primary-50": "var(--color-primary-50)",
  secondary: "var(--color-secondary)",
};

export type TestimonialsGridProps = {
  intro?: ReactNode;
  children: ReactNode;
  background?: Exclude<SectionBackground, "transparent">;
  className?: string;
};

/**
 * Two-column testimonial layout on a tinted background.
 */
export function TestimonialsGrid({
  intro,
  children,
  background = "primary-50",
  className,
}: TestimonialsGridProps) {
  return (
    <div
      className={cn("w-full py-12 sm:py-16", className)}
      style={{ backgroundColor: BG[background] }}
    >
      <div className="theme-container">
        {intro ? <div className="mb-10 max-w-2xl">{intro}</div> : null}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {children}
        </div>
      </div>
    </div>
  );
}
