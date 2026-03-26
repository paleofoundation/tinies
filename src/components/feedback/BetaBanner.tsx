"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { useFeedbackUI } from "@/components/feedback/feedback-ui-context";

const DISMISS_KEY = "tinies-beta-banner-dismissed";

export function BetaBanner() {
  const t = useTranslations("feedback");
  const { openFeedback } = useFeedbackUI();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const dismissed = window.localStorage.getItem(DISMISS_KEY);
      setVisible(dismissed !== "1");
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="relative z-[60] w-full border-b border-[var(--color-border)]"
      style={{
        backgroundColor: "var(--color-primary-50)",
        color: "var(--color-primary)",
        fontFamily: "var(--font-body), sans-serif",
      }}
      role="region"
      aria-label="Beta notice"
    >
      <div className="theme-container relative flex items-center justify-center py-2.5 pl-3 pr-12 text-center text-xs sm:py-2 sm:text-sm">
        <p className="max-w-4xl leading-snug">
          {t("betaBannerText")}
          <button
            type="button"
            onClick={openFeedback}
            className="font-semibold underline decoration-1 underline-offset-2 hover:opacity-90"
            style={{ color: "var(--color-primary)" }}
          >
            {t("betaBannerLink")}
          </button>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-2 top-1/2 flex h-8 w-8 shrink-0 -translate-y-1/2 items-center justify-center rounded-lg hover:bg-[var(--color-primary-100)]"
          aria-label={t("betaBannerDismiss")}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
