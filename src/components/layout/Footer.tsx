import { MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSiteSocialUrls } from "@/lib/site-settings/queries";
import { FooterSocialLinks } from "./FooterSocialLinks";
import { LanguageSwitcher } from "./LanguageSwitcher";

export async function Footer() {
  const t = await getTranslations("footer");
  const socialUrls = await getSiteSocialUrls();

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
        { href: "/giving/donate", label: t("links.donate") },
      ],
    },
    {
      title: t("columns.company"),
      links: [
        { href: "/about", label: t("links.about") },
        { href: "/blog", label: t("links.blog") },
        { href: "/faq", label: t("links.faq") },
        { href: "/contact", label: t("links.contact") },
        { href: "/terms", label: t("links.terms") },
        { href: "/privacy", label: t("links.privacy") },
      ],
    },
  ] as const;

  const linkClass =
    "text-[0.875rem] text-[rgba(28,28,28,0.7)] transition-colors hover:text-[#1C1C1C] hover:underline";

  return (
    <footer
      className="border-t bg-[var(--color-background)]"
      style={{ borderColor: "rgba(10, 128, 128, 0.15)" }}
    >
      <div className="mx-auto max-w-[1280px] px-6 py-10">
        <div
          className="grid gap-8"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
        >
          <div className="min-w-0">
            <p
              className="font-extrabold uppercase"
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                color: "var(--color-primary)",
              }}
            >
              {t("brandWordmark")}
            </p>
            <p
              className="mt-3 max-w-[280px]"
              style={{
                fontFamily: "var(--font-body), sans-serif",
                fontSize: "0.875rem",
                lineHeight: 1.8,
                color: "rgba(28, 28, 28, 0.7)",
              }}
            >
              {t("brandLead")}
            </p>
            <FooterSocialLinks urls={socialUrls} />
          </div>

          <nav aria-label="Footer" className="contents">
            {columns.map((col) => (
              <div key={col.title} className="flex min-w-0 flex-col gap-3">
                <p
                  className="text-[0.875rem] font-bold"
                  style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}
                >
                  {col.title}
                </p>
                {col.links.map((link) => (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    className={linkClass}
                    style={{ fontFamily: "var(--font-body), sans-serif" }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>

        <div
          className="mt-10 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
          style={{ borderColor: "rgba(10, 128, 128, 0.15)" }}
        >
          <p
            className="text-[0.75rem]"
            style={{
              fontFamily: "var(--font-body), sans-serif",
              color: "rgba(28, 28, 28, 0.5)",
            }}
          >
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <LanguageSwitcher />
            <div
              className="flex items-center gap-2 text-[0.875rem]"
              style={{
                fontFamily: "var(--font-body), sans-serif",
                color: "rgba(28, 28, 28, 0.7)",
              }}
            >
              <MapPin className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />
              {t("cyprus")}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
