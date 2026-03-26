import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type PressStripProps = {
  label?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

/**
 * “Seen on” editorial strip: left copy, right logo badges (mock layout).
 */
export function PressStrip({
  label = "Seen on",
  description,
  children,
  className,
}: PressStripProps) {
  return (
    <section
      className={cn("border-y border-[var(--color-border)]", className)}
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-primary-50) 65%, var(--color-background))",
      }}
    >
      <div className="theme-container py-10 sm:py-12 lg:py-14">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.34fr)_1fr] lg:gap-14">
          <div className="min-w-0">
            <p className="theme-eyebrow mb-3" style={{ color: "var(--color-primary)" }}>
              {label}
            </p>
            {description ? (
              <p
                className="text-sm leading-relaxed sm:text-base"
                style={{
                  color: "var(--color-text-secondary)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {description}
              </p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{children}</div>
        </div>
      </div>
    </section>
  );
}
