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
  /** Editorial mock: intro left, 2×2 grid right, coral background. */
  layout?: "stacked" | "editorialSide";
  className?: string;
};

/**
 * Testimonials: stacked intro + grid, or editorial side-by-side on large screens.
 */
export function TestimonialsGrid({
  intro,
  children,
  background = "primary-50",
  layout = "stacked",
  className,
}: TestimonialsGridProps) {
  const editorial = layout === "editorialSide";

  return (
    <div
      className={cn("w-full py-[clamp(4rem,8vw,8rem)]", className)}
      style={{ backgroundColor: BG[background] }}
    >
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-10">
        {editorial ? (
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-14">
            {intro ? <div className="min-w-0 max-w-lg">{intro}</div> : null}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">{children}</div>
          </div>
        ) : (
          <>
            {intro ? <div className="mb-10 max-w-2xl">{intro}</div> : null}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">{children}</div>
          </>
        )}
      </div>
    </div>
  );
}
