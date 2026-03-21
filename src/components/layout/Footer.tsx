import { MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";

export async function Footer() {
  const t = await getTranslations("footer");

  const columns = [
    {
      title: t("columns.forPetOwners"),
      links: [
        { href: "/services", label: t("links.findCare") },
        { href: "/how-it-works", label: t("links.howItWorks") },
        { href: "/adopt", label: t("links.adopt") },
        { href: "/adopt/tinies-who-made-it", label: t("links.tiniesWhoMadeIt") },
      ],
    },
    {
      title: t("columns.forProviders"),
      links: [
        { href: "/for-providers", label: t("links.becomeProvider") },
        { href: "/how-it-works", label: t("links.howItWorks") },
      ],
    },
    {
      title: t("columns.forRescues"),
      links: [
        { href: "/dashboard/rescue/listings/new", label: t("links.listAnimals") },
        { href: "/for-rescues", label: t("links.forRescues") },
        { href: "/rescue", label: t("links.rescuePartners") },
      ],
    },
    {
      title: t("columns.giving"),
      links: [
        { href: "/giving", label: t("links.tiniesGiving") },
        { href: "/giving/become-a-guardian", label: t("links.becomeGuardian") },
        { href: "/give", label: t("links.donate") },
      ],
    },
    {
      title: t("columns.company"),
      links: [
        { href: "/about", label: t("links.about") },
        { href: "/blog", label: t("links.blog") },
        { href: "/terms", label: t("links.terms") },
        { href: "/privacy", label: t("links.privacy") },
        { href: "mailto:hello@tinies.app", label: t("links.contact"), external: true },
      ],
    },
  ] as const;

  return (
    <footer
      className="px-4 py-14 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--color-primary-900)" }}
    >
      <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p
              className="text-xl text-white"
              style={{ fontFamily: "var(--font-heading), serif" }}
            >
              tinies.app
            </p>
            <p
              className="mt-2 text-lg italic text-white"
              style={{ fontFamily: "var(--font-heading), serif" }}
            >
              {t("brandSubtitle")}
            </p>
            <p className="mt-2 max-w-xs text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              {t("brandDescription")}
            </p>
          </div>
          <nav
            className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5"
            aria-label="Footer"
          >
            {columns.map((col) => (
              <div key={col.title} className="flex flex-col gap-3">
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{
                    fontFamily: "var(--font-body), sans-serif",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {col.title}
                </p>
                {col.links.map((link) =>
                  "external" in link && link.external ? (
                    <a
                      key={link.href + link.label}
                      href={link.href}
                      className="text-sm transition-opacity hover:opacity-100 hover:underline"
                      style={{
                        fontFamily: "var(--font-body), sans-serif",
                        color: "rgba(255,255,255,0.9)",
                      }}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href + link.label}
                      href={link.href}
                      className="text-sm transition-opacity hover:opacity-100 hover:underline"
                      style={{
                        fontFamily: "var(--font-body), sans-serif",
                        color: "rgba(255,255,255,0.9)",
                      }}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            ))}
          </nav>
        </div>
        <div
          className="mt-14 flex flex-col gap-4 border-t pt-10 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
          style={{ borderColor: "rgba(255,255,255,0.2)" }}
        >
          <p
            className="text-sm"
            style={{
              fontFamily: "var(--font-body), sans-serif",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <LanguageSwitcher />
            <div
              className="flex items-center gap-2 text-sm"
              style={{
                fontFamily: "var(--font-body), sans-serif",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              <MapPin className="h-4 w-4" />
              {t("cyprus")}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
