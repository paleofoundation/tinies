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
      className={cn("border-y", className)}
      style={{
        backgroundColor: "rgba(241, 249, 249, 0.6)",
        borderColor: "rgba(10, 128, 128, 0.15)",
      }}
    >
      <div className="mx-auto w-full max-w-[1280px] px-6 py-[clamp(2.5rem,4vw,3rem)] lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.34fr)_1fr] lg:gap-14">
          <div className="min-w-0">
            <p
              className="mb-3 font-extrabold uppercase leading-none"
              style={{
                color: "var(--color-primary)",
                fontFamily: "var(--font-display), sans-serif",
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
              }}
            >
              {label}
            </p>
            {description ? (
              <p
                className="text-sm leading-relaxed sm:text-base"
                style={{
                  color: "rgba(28, 28, 28, 0.7)",
                  fontFamily: "var(--font-body), sans-serif",
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
