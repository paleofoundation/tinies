"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LABELS: Record<string, string> = {
  en: "English",
  el: "Ελληνικά",
  ru: "Русский",
};

export function LanguageSwitcher() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <label className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
      <span className="sr-only sm:not-sr-only sm:text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
        {t("language")}
      </span>
      <select
        value={locale}
        aria-label={t("language")}
        onChange={(e) => {
          const next = e.target.value;
          router.replace(pathname, { locale: next });
        }}
        className="max-w-[200px] rounded-[var(--radius-lg)] border px-2 py-1.5 text-sm"
        style={{
          fontFamily: "var(--font-body), sans-serif",
          borderColor: "rgba(255,255,255,0.35)",
          backgroundColor: "rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.95)",
        }}
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {LABELS[loc] ?? loc}
          </option>
        ))}
      </select>
    </label>
  );
}
