import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  question: string;
  children: ReactNode;
};

/** Native disclosure accordion item; works without JavaScript. */
export function FaqEntry({ question, children }: Props) {
  return (
    <details
      className="group border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm open:shadow-[var(--shadow-md)] rounded-[var(--radius-lg)] transition-shadow"
    >
      <summary
        className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden"
        style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}
      >
        <span>{question}</span>
        <ChevronDown
          className="h-5 w-5 shrink-0 text-[var(--color-primary)] transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div
        className="border-t border-[var(--color-border)] px-5 pb-5 pt-4 text-sm leading-relaxed"
        style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
      >
        {children}
      </div>
    </details>
  );
}
