import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

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
  /** Card or panel that overlaps the hero image on large screens. */
  overlappingCard?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

/**
 * Full-width editorial hero: eyebrow, display title, media, optional overlapping card.
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
      <div className="theme-container relative z-[1] py-12 sm:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
          <div className="min-w-0">
            {eyebrow ? (
              <p
                className="theme-eyebrow mb-4"
                style={{ color: "var(--color-primary)" }}
              >
                {eyebrow}
              </p>
            ) : null}
            <h1
              className="theme-display text-[var(--display-xl)]"
              style={{ color: "var(--color-text)" }}
            >
              {title}
            </h1>
            {description ? (
              <div
                className="mt-5 max-w-xl text-base leading-[1.75] sm:text-lg"
                style={{
                  color: "var(--color-text-secondary)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {description}
              </div>
            ) : null}
            {actions ? (
              <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>
            ) : null}
          </div>

          <div className="relative min-w-0">
            <div
              className={cn(
                "relative aspect-[4/3] w-full overflow-hidden rounded-[22px] shadow-[var(--shadow-md)] lg:aspect-[5/4]",
                overlappingCard && "lg:pb-14"
              )}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={image.priority}
                className="object-cover"
                sizes="(min-width: 1024px) 42vw, 100vw"
              />
            </div>
            {overlappingCard ? (
              <div className="relative z-[2] mx-auto -mt-10 w-[min(100%,380px)] px-2 lg:absolute lg:bottom-0 lg:left-1/2 lg:mt-0 lg:w-[min(100%,340px)] lg:-translate-x-1/2 lg:px-0">
                {overlappingCard}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
