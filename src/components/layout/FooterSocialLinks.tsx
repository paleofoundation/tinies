import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import type { SiteSocialUrls } from "@/lib/site-settings/queries";

const iconWrapClass = "h-5 w-5 shrink-0 text-[var(--color-primary)]";
const stroke = 1.8;

function LinkedInGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={iconWrapClass} aria-hidden stroke="currentColor" strokeWidth={stroke}>
      <path d="M7 9v8" />
      <path d="M11 17v-4.2a2.8 2.8 0 0 1 5.6 0V17" />
      <path d="M7 7.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z" />
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
    </svg>
  );
}

function FacebookGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={iconWrapClass} aria-hidden stroke="currentColor" strokeWidth={stroke}>
      <path d="M14 8h2.5V4.8c-.44-.06-1.4-.18-2.54-.18-2.52 0-4.25 1.54-4.25 4.38V11H7v3.6h2.7V20h3.3v-5.4h2.64L16.1 11H13V9.38c0-1.04.28-1.76 1-1.76Z" />
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
    </svg>
  );
}

function XGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={iconWrapClass} aria-hidden stroke="currentColor" strokeWidth={stroke}>
      <path d="M5 5l14 14" />
      <path d="M19 5 5 19" />
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
    </svg>
  );
}

function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={iconWrapClass} aria-hidden stroke="currentColor" strokeWidth={stroke}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

type Props = {
  urls: SiteSocialUrls;
};

const ring =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
const ringBorder = { borderColor: "rgba(10, 128, 128, 0.15)" } as const;

export async function FooterSocialLinks({ urls }: Props) {
  const t = await getTranslations("footer.social");

  const items: {
    key: keyof SiteSocialUrls;
    href: string | null;
    label: string;
    icon: ReactNode;
  }[] = [
    { key: "linkedIn", href: urls.linkedIn, label: t("linkedIn"), icon: <LinkedInGlyph /> },
    { key: "facebook", href: urls.facebook, label: t("facebook"), icon: <FacebookGlyph /> },
    { key: "x", href: urls.x, label: t("x"), icon: <XGlyph /> },
    { key: "instagram", href: urls.instagram, label: t("instagram"), icon: <InstagramGlyph /> },
  ];

  return (
    <ul className="mt-5 flex list-none flex-wrap gap-3 p-0" role="list">
      {items.map(({ key, href, label, icon }) =>
        href ? (
          <li key={key}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={ring}
              style={{ ...ringBorder, outlineColor: "var(--color-primary)" }}
              aria-label={label}
            >
              {icon}
            </a>
          </li>
        ) : (
          <li key={key}>
            <span
              className={`${ring} opacity-45`}
              style={ringBorder}
              title={t("notLinked")}
              aria-label={`${label} — ${t("notLinked")}`}
            >
              {icon}
            </span>
          </li>
        )
      )}
    </ul>
  );
}
