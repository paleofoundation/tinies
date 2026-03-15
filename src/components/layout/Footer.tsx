import { MapPin } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="px-4 py-14 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--color-primary-950)" }}
    >
      <div className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
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
            <p className="mt-2 text-sm max-w-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
              Trusted pet care and rescue adoption in Cyprus.
            </p>
          </div>
          <nav className="flex flex-wrap gap-8 sm:gap-12" aria-label="Footer">
            <div className="flex flex-col gap-3">
              <p
                className="text-xs font-semibold uppercase tracking-wider"
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                Services
              </p>
              <Link
                href="/services"
                className="text-sm transition-opacity hover:opacity-100 hover:underline"
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                Find care
              </Link>
              <Link
                href="/services/search"
                className="text-sm transition-opacity hover:opacity-100 hover:underline"
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                Search
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <p
                className="text-xs font-semibold uppercase tracking-wider"
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                Adopt
              </p>
              <Link
                href="/adopt"
                className="text-sm transition-opacity hover:opacity-100 hover:underline"
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                Adopt a Tiny
              </Link>
              <Link
                href="/adopt/happy-tails"
                className="text-sm transition-opacity hover:opacity-100 hover:underline"
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                Happy Tails
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <p
                className="text-xs font-semibold uppercase tracking-wider"
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                Company
              </p>
              <Link
                href="/giving"
                className="text-sm transition-opacity hover:opacity-100 hover:underline"
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                Giving
              </Link>
              <Link
                href="/how-it-works"
                className="text-sm transition-opacity hover:opacity-100 hover:underline"
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                How it works
              </Link>
              <Link
                href="/about"
                className="text-sm transition-opacity hover:opacity-100 hover:underline"
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                About
              </Link>
            </div>
          </nav>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t pt-10 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
          <p
            className="text-sm"
            style={{
              fontFamily: "var(--font-body), sans-serif",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            © {new Date().getFullYear()} Tinies. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(255,255,255,0.8)" }}>
            <MapPin className="h-4 w-4" />
            Cyprus
          </div>
        </div>
      </div>
    </footer>
  );
}
