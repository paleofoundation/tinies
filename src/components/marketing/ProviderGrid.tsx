import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ProviderGridProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Two-column card grid for provider cards on marketing pages.
 */
export function ProviderGrid({ children, className }: ProviderGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8",
        className
      )}
    >
      {children}
    </div>
  );
}
