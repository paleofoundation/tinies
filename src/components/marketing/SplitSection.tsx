import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type SplitSectionProps = {
  /** Content in the narrower column (0.88fr when not reversed). */
  narrow: ReactNode;
  /** Content in the wider column (1.12fr when not reversed). */
  wide: ReactNode;
  /** Swap column order and which side is wider on large screens. */
  reverse?: boolean;
  className?: string;
};

/**
 * Asymmetric two-column layout: 0.88fr / 1.12fr on large screens.
 */
export function SplitSection({
  narrow,
  wide,
  reverse = false,
  className,
}: SplitSectionProps) {
  return (
    <div
      className={cn(
        "grid items-center gap-10 lg:gap-14",
        reverse
          ? "lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]"
          : "lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]",
        className
      )}
    >
      {reverse ? (
        <>
          <div className="min-w-0">{wide}</div>
          <div className="min-w-0">{narrow}</div>
        </>
      ) : (
        <>
          <div className="min-w-0">{narrow}</div>
          <div className="min-w-0">{wide}</div>
        </>
      )}
    </div>
  );
}
