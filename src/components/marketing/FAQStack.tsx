"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export type FAQStackItem = {
  id: string;
  question: string;
  answer: string;
};

export type FAQStackProps = {
  items: readonly FAQStackItem[];
  /** When false, opening one item closes the others. */
  allowMultiple?: boolean;
  className?: string;
};

/**
 * Accordion FAQ list with animated expand/collapse.
 */
export function FAQStack({
  items,
  allowMultiple = false,
  className,
}: FAQStackProps) {
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(() => new Set());

  function toggle(id: string) {
    setOpenIds((prev) => {
      if (allowMultiple) {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      }
      if (prev.has(id)) {
        return new Set();
      }
      return new Set([id]);
    });
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {items.map((item) => {
        const open = openIds.has(item.id);
        const panelId = `faq-panel-${item.id}`;
        const buttonId = `faq-trigger-${item.id}`;
        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-background)] shadow-[var(--shadow-sm)]"
          >
            <button
              id={buttonId}
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => toggle(item.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--color-primary-50)]"
            >
              <span
                className="text-base font-semibold sm:text-lg"
                style={{
                  color: "var(--color-text)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {item.question}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-300 ease-out",
                  open && "rotate-180"
                )}
                style={{ color: "var(--color-primary)" }}
                aria-hidden
              />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <p
                  className="px-5 pb-5 pt-0 text-sm leading-relaxed sm:text-base"
                  style={{
                    color: "var(--color-text-secondary)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
