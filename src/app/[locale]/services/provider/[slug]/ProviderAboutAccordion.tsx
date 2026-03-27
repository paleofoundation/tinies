"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const BORDER_TEAL_15 = "rgba(10, 128, 128, 0.15)";

export type AboutAccordionSection = {
  id: string;
  title: string;
  body: string;
};

type Props = {
  sections: AboutAccordionSection[];
  defaultOpenId: string;
};

export function ProviderAboutAccordion({ sections, defaultOpenId }: Props) {
  const initialOpen = defaultOpenId && sections.some((s) => s.id === defaultOpenId) ? defaultOpenId : sections[0]?.id ?? null;
  const [openId, setOpenId] = useState<string | null>(initialOpen);

  if (sections.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {sections.map((s) => {
        const open = openId === s.id;
        return (
          <div
            key={s.id}
            className="overflow-hidden rounded-[14px] border"
            style={{ borderColor: BORDER_TEAL_15 }}
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : s.id)}
              className="flex w-full items-center justify-between gap-3 px-[18px] py-3.5 text-left text-[0.875rem] font-semibold transition-colors"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text)",
                backgroundColor: open ? "var(--color-primary-50)" : "var(--color-background)",
              }}
              aria-expanded={open}
            >
              <span>{s.title}</span>
              <Plus
                className="h-5 w-5 shrink-0 transition-transform"
                style={{
                  color: "var(--color-primary)",
                  transform: open ? "rotate(45deg)" : undefined,
                }}
                aria-hidden
              />
            </button>
            {open ? (
              <div
                className="px-[18px] pb-4 pt-1 text-[0.875rem] leading-[1.7] whitespace-pre-wrap"
                style={{ fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.7)" }}
              >
                {s.body}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
