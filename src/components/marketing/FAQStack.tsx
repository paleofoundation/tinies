"use client";

import { ChevronDown, Plus } from "lucide-react";
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
  /** Editorial mock: 22px radius, teal + icon, tighter gaps. */
  variant?: "default" | "editorial";
  className?: string;
};

/**
 * Accordion FAQ list with animated expand/collapse.
 */
export function FAQStack({
  items,
  allowMultiple = false,
  variant = "default",
  className,
}: FAQStackProps) {
  const editorial = variant === "editorial";
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
    <div className={cn(editorial ? "flex flex-col gap-4" : "flex flex-col gap-3", className)}>
      {items.map((item) => {
        const open = openIds.has(item.id);
        const panelId = `faq-panel-${item.id}`;
        const buttonId = `faq-trigger-${item.id}`;
        return (
          <div
            key={item.id}
            className={cn(
              "overflow-hidden bg-[var(--color-background)]",
              editorial
                ? "rounded-[22px] border shadow-[0_2px_8px_rgba(10,128,128,0.06)]"
                : "rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]"
            )}
            style={editorial ? { borderColor: "rgba(10, 128, 128, 0.15)" } : undefined}
          >
            <button
              id={buttonId}
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => toggle(item.id)}
              className={cn(
                "flex w-full items-center justify-between gap-4 text-left transition-colors",
                editorial ? "px-6 py-5 hover:bg-[var(--color-primary-muted-06)]" : "px-5 py-4 hover:bg-[var(--color-primary-50)]"
              )}
            >
              <span
                className={cn(
                  "font-semibold",
                  editorial ? "text-base sm:text-lg" : "text-base sm:text-lg"
                )}
                style={{
                  color: "var(--color-text)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {item.question}
              </span>
              {editorial ? (
                <Plus
                  className={cn(
                    "h-6 w-6 shrink-0 transition-transform duration-200 ease-out",
                    open && "rotate-45"
                  )}
                  strokeWidth={2}
                  style={{ color: "var(--color-primary)" }}
                  aria-hidden
                />
              ) : (
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform duration-300 ease-out",
                    open && "rotate-180"
                  )}
                  style={{ color: "var(--color-primary)" }}
                  aria-hidden
                />
              )}
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
                  className={cn(
                    "pb-5 pt-0 text-sm leading-relaxed sm:text-base",
                    editorial ? "px-6" : "px-5"
                  )}
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
