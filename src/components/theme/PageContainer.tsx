import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Max-width wrapper using `.theme-container` (Section 5 — theme).
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return <div className={cn("theme-container", className)}>{children}</div>;
}
