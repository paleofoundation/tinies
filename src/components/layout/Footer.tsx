import { MapPin } from "lucide-react";
import Link from "next/link";

const FOOTER_COLUMNS = [
  {
    title: "For Pet Owners",
    links: [
      { href: "/services", label: "Find Care" },
      { href: "/how-it-works", label: "How It Works" },
      { href: "/adopt", label: "Adopt" },
    ],
  },
  {
    title: "For Providers",
    links: [
      { href: "/for-providers", label: "Become a Provider" },
      { href: "/how-it-works", label: "How It Works" },
    ],
  },
  {
    title: "For Rescues",
    links: [
      { href: "/dashboard/rescue/listings/new", label: "List Your Animals" },
      { href: "/for-rescues", label: "For Rescues" },
      { href: "/rescue", label: "Our rescue partners" },
    ],
  },
  {
    title: "Giving",
    links: [
      { href: "/giving", label: "Tinies Giving" },
      { href: "/giving/become-a-guardian", label: "Become a Guardian" },
      { href: "/give", label: "Donate" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/blog", label: "Blog" },
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
      { href: "mailto:hello@tinies.app", label: "Contact" },
    ],
  },
] as const;

export function Footer() {
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
              Book a walk. Help a tiny.
            </p>
            <p className="mt-2 max-w-xs text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              Trusted pet care and rescue adoption in Cyprus.
            </p>
          </div>
          <nav
            className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5"
            aria-label="Footer"
          >
            {FOOTER_COLUMNS.map((col) => (
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
                {col.links.map((link) => (
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
                ))}
              </div>
            ))}
          </nav>
        </div>
        <div
          className="mt-14 flex flex-col gap-4 border-t pt-10 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "rgba(255,255,255,0.2)" }}
        >
          <p
            className="text-sm"
            style={{
              fontFamily: "var(--font-body), sans-serif",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            © {new Date().getFullYear()} Tinies. All rights reserved.
          </p>
          <div
            className="flex items-center gap-2 text-sm"
            style={{
              fontFamily: "var(--font-body), sans-serif",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <MapPin className="h-4 w-4" />
            Cyprus
          </div>
        </div>
      </div>
    </footer>
  );
}
