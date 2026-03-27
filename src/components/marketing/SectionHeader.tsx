import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type SectionHeaderProps = {
  eyebrow?: string;
  /** Eyebrow color — mock uses coral on verified providers. */
  eyebrowTone?: "primary" | "secondary";
  title: ReactNode;
  description?: ReactNode;
  align?: "start" | "center";
  className?: string;
  /** Use h1 for the page’s primary heading (one per page). Default h2. */
  titleAs?: "h1" | "h2";
};

/**
 * Eyebrow + display heading + optional body copy to open editorial sections.
 */
export function SectionHeader({
  eyebrow,
  eyebrowTone = "primary",
  title,
  description,
  align = "start",
  className,
  titleAs = "h2",
}: SectionHeaderProps) {
  const isCenter = align === "center";
  const eyebrowColor =
    eyebrowTone === "secondary" ? "var(--color-secondary)" : "var(--color-primary)";
  const TitleTag = titleAs === "h1" ? "h1" : "h2";
  return (
    <div
      className={cn(
        "max-w-3xl",
        isCenter && "mx-auto text-center",
        className
      )}
    >
      {eyebrow ? (
        <p className="theme-eyebrow mb-3" style={{ color: eyebrowColor }}>
          {eyebrow}
        </p>
      ) : null}
      <TitleTag
        className={cn(
          "theme-display text-[var(--display-md)]",
          isCenter && "mx-auto max-w-2xl"
        )}
        style={{ color: "var(--color-text)" }}
      >
        {title}
      </TitleTag>
      {description ? (
        <div
          className={cn(
            "mt-4 text-base leading-[1.75] sm:text-lg",
            isCenter && "mx-auto max-w-2xl"
          )}
          style={{
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-body)",
          }}
        >
          {description}
        </div>
      ) : null}
    </div>
  );
}
