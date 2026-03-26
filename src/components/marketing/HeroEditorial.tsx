import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const HERO_CONTAINER = "mx-auto w-full max-w-[1280px] px-6 lg:px-10";

export type HeroEditorialProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
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
 * Full-width editorial hero: eyebrow, display title, media
 * with offset frame + overlap card, and stacked actions.
 */
export function HeroEditorial({
  eyebrow,
  title,
  description,
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
      <div
        className="pointer-events-none absolute left-[7%] top-16 hidden h-16 w-16 rounded-[28px] border lg:block"
        style={{ borderColor: "rgba(10, 128, 128, 0.15)", backgroundColor: "var(--color-primary-50)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[9%] top-24 hidden h-9 w-24 rounded-full lg:block"
        style={{ backgroundColor: "rgba(244, 93, 72, 0.12)" }}
        aria-hidden
      />

      <div className={cn(HERO_CONTAINER, "relative z-[1] pb-24 pt-10")}>
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-12">
          <div className="min-w-0">
            {eyebrow ? (
              <p
                className="mb-4 font-extrabold uppercase leading-none"
                style={{
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-display), sans-serif",
                  fontSize: "0.75rem",
                  letterSpacing: "0.08em",
                }}
              >
                {eyebrow}
              </p>
            ) : null}
            <h1
              className="max-w-[720px] font-black uppercase leading-[0.94] tracking-[-0.04em]"
              style={{
                color: "var(--color-text)",
                fontFamily: "var(--font-display), sans-serif",
                fontSize: "clamp(3rem, 9vw, 6.1rem)",
              }}
            >
              {title}
            </h1>
            {description ? (
              <div
                className="mt-6 max-w-[560px] leading-[1.7]"
                style={{
                  color: "rgba(28, 28, 28, 0.7)",
                  fontFamily: "var(--font-body), sans-serif",
                  fontWeight: 400,
                  fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                }}
              >
                {description}
              </div>
            ) : null}
            {actions ? <div className="mt-8 flex w-full max-w-3xl flex-col gap-6">{actions}</div> : null}
          </div>

          <div className="relative min-h-[280px] w-full lg:min-h-0 lg:h-[clamp(340px,50vw,620px)]">
            <div
              className={cn(
                "relative aspect-[4/3] w-full overflow-hidden rounded-[28px] lg:absolute lg:right-0 lg:top-0 lg:aspect-auto lg:h-[76%] lg:w-[86%]"
              )}
              style={{
                backgroundColor: "var(--color-primary-100)",
                boxShadow: "0 8px 32px rgba(10, 128, 128, 0.1)",
              }}
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
