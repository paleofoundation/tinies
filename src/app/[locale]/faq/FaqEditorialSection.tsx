import type { ReactNode } from "react";

const HOME_Y = "py-[clamp(4rem,8vw,8rem)]";
const HOME_INNER = "mx-auto w-full max-w-[1280px] px-6 lg:px-10";

type Props = {
  id: string;
  headingId: string;
  eyebrow: string;
  itemCount: number;
  accentColor: string;
  backgroundColor: string;
  children: ReactNode;
};

export function FaqEditorialSection({
  id,
  headingId,
  eyebrow,
  itemCount,
  accentColor,
  backgroundColor,
  children,
}: Props) {
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={HOME_Y}
      style={{ backgroundColor }}
    >
      <div className={HOME_INNER}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.36fr_1fr] lg:gap-14">
          <div className="lg:sticky lg:top-20 lg:self-start">
            <h2 id={headingId} className="flex flex-col gap-3">
              <span
                className="text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
                style={{ fontFamily: "var(--font-display), sans-serif", color: accentColor }}
              >
                {eyebrow}
              </span>
              <span
                className="text-[clamp(1.75rem,4vw,2.75rem)] font-black uppercase leading-[0.94] tracking-[-0.02em]"
                style={{ fontFamily: "var(--font-display), sans-serif", color: accentColor }}
              >
                {itemCount} answers
              </span>
            </h2>
          </div>
          <div className="flex flex-col gap-3">{children}</div>
        </div>
      </div>
    </section>
  );
}
