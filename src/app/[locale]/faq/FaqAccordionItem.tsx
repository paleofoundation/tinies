import type { ReactNode } from "react";

const BORDER_TEAL_15 = "rgba(10, 128, 128, 0.15)";

type Props = {
  question: string;
  accentColor: string;
  children: ReactNode;
};

export function FaqAccordionItem({ question, accentColor, children }: Props) {
  return (
    <details
      className="group rounded-[22px] border bg-[var(--color-background)] shadow-[0_2px_8px_rgba(10,128,128,0.06)] transition-shadow open:shadow-[0_4px_16px_rgba(10,128,128,0.08)]"
      style={{ borderColor: BORDER_TEAL_15 }}
    >
      <summary
        className="flex cursor-pointer list-none items-center justify-between gap-4 px-[22px] py-[18px] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden"
      >
        <span className="text-base font-semibold" style={{ color: "#1C1C1C", fontFamily: "var(--font-body), sans-serif" }}>
          {question}
        </span>
        <span
          className="inline-flex shrink-0 select-none text-[1.5rem] font-light leading-none transition-transform duration-200 group-open:rotate-45"
          style={{ color: accentColor, fontFamily: "var(--font-display), sans-serif" }}
          aria-hidden
        >
          +
        </span>
      </summary>
      <div
        className="border-t px-[22px] pb-5 pt-4 text-[0.875rem] leading-[1.8]"
        style={{
          borderColor: BORDER_TEAL_15,
          fontFamily: "var(--font-body), sans-serif",
          color: "rgba(28, 28, 28, 0.7)",
        }}
      >
        {children}
      </div>
    </details>
  );
}
