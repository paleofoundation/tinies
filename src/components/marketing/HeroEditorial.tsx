import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type HeroEditorialProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Centered line above the grid (e.g. beta note) — matches editorial mock. */
  insetBetaNotice?: string;
  /** Optional texture or tint behind content (e.g. `theme-paper-grid`). */
  bleedClassName?: string;
  image: {
    src: string;
    alt: string;
    priority?: boolean;
  };
  /** Card or panel overlapping the hero image (bottom-left on large screens). */
  overlappingCard?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

/**
 * Full-width editorial hero: optional inset beta line, eyebrow, display title, media
 * with Claude-style offset frame + overlap card, and stacked actions.
 */
export function HeroEditorial({
  eyebrow,
  title,
  description,
  insetBetaNotice,
  bleedClassName,
  image,
  overlappingCard,
  actions,
  className,
}: HeroEditorialProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        bleedClassName ?? "bg-[var(--color-background)]",
        className
      )}
    >
      {/* Floating accents — editorial mock */}
      <div
        className="pointer-events-none absolute left-[5%] top-20 hidden h-16 w-16 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-primary-50)] lg:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[6%] top-28 hidden h-9 w-24 rounded-full bg-[var(--color-secondary-muted-12)] lg:block"
        aria-hidden
      />

      <div className="theme-container relative z-[1] pt-6 pb-16 sm:pt-8 sm:pb-20 lg:pb-24">
        {insetBetaNotice ? (
          <p
            className="mb-6 text-center text-sm"
            style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body)" }}
          >
            {insetBetaNotice}
          </p>
        ) : null}

        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-12">
          <div className="min-w-0">
            {eyebrow ? (
              <p
                className="mb-4 text-[12px] font-extrabold uppercase leading-none tracking-[0.08em]"
                style={{
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-display)",
                  marginTop: 0,
                  marginInline: 0,
                }}
              >
                {eyebrow}
              </p>
            ) : null}
            <h1
              className="theme-display max-w-[720px] text-[var(--display-hero-mock)] leading-[0.92]"
              style={{ color: "var(--color-text)" }}
            >
              {title}
            </h1>
            {description ? (
              <div
                className="mt-6 max-w-[560px] text-[clamp(1rem,2.5vw,1.25rem)] leading-[1.7]"
                style={{
                  color: "var(--color-text-secondary)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                }}
              >
                {description}
              </div>
            ) : null}
            {actions ? (
              <div className="mt-8 flex w-full max-w-3xl flex-col gap-6">{actions}</div>
            ) : null}
          </div>

          <div className="relative min-h-[280px] w-full lg:min-h-0 lg:h-[clamp(340px,50vw,620px)]">
            <div
              className={cn(
                "relative aspect-[4/3] w-full overflow-hidden rounded-[28px] shadow-[var(--shadow-lg)]",
                "lg:absolute lg:right-0 lg:top-0 lg:aspect-auto lg:h-[76%] lg:w-[86%]"
              )}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={image.priority}
                className="object-cover"
                sizes="(min-width: 1024px) 38vw, 100vw"
              />
            </div>
            {overlappingCard ? (
              <div
                className={cn(
                  "relative z-[2] mx-auto w-[min(100%,340px)] px-0 sm:px-1",
                  "-mt-8 sm:-mt-10",
                  "lg:absolute lg:bottom-8 lg:left-0 lg:mt-0 lg:max-w-[340px]"
                )}
              >
                {overlappingCard}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
