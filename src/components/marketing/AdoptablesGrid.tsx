import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type AdoptablesGridProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Responsive grid for adoptable animal cards (four columns on large screens).
 */
export function AdoptablesGrid({ children, className }: AdoptablesGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6",
        className
      )}
    >
      {children}
    </div>
  );
}
