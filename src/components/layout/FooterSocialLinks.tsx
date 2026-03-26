import type { ReactNode } from "react";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { SiteSocialUrls } from "@/lib/site-settings/queries";

function IconX({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 4l16 16M20 4L4 20" />
    </svg>
  );
}

type Props = {
  urls: SiteSocialUrls;
};

export async function FooterSocialLinks({ urls }: Props) {
  const t = await getTranslations("footer.social");

  const ring =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-opacity";
  const ringStyle = {
    borderColor: "rgba(255,255,255,0.35)",
    color: "rgba(255,255,255,0.92)",
  } as const;

  const items: {
    key: keyof SiteSocialUrls;
    href: string | null;
    label: string;
    icon: ReactNode;
  }[] = [
    { key: "linkedIn", href: urls.linkedIn, label: t("linkedIn"), icon: <Linkedin className="h-5 w-5" strokeWidth={1.5} aria-hidden /> },
    { key: "facebook", href: urls.facebook, label: t("facebook"), icon: <Facebook className="h-5 w-5" strokeWidth={1.5} aria-hidden /> },
    { key: "x", href: urls.x, label: t("x"), icon: <IconX className="h-5 w-5" /> },
    {
      key: "instagram",
      href: urls.instagram,
      label: t("instagram"),
      icon: <Instagram className="h-5 w-5" strokeWidth={1.5} aria-hidden />,
    },
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
              className={`${ring} hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`}
              style={{ ...ringStyle, outlineColor: "rgba(255,255,255,0.6)" }}
              aria-label={label}
            >
              {icon}
            </a>
          </li>
        ) : (
          <li key={key}>
            <span
              className={`${ring} opacity-45`}
              style={ringStyle}
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
