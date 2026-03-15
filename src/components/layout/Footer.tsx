import { MapPin } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#0A6E5C] text-white px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1170px]">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p
              className="text-xl text-white"
              style={{ fontFamily: "var(--tiny-font-display), serif" }}
            >
              tinies.app
            </p>
            <p className="mt-2 text-sm text-white/90">No matter the size.</p>
            <p className="mt-2 text-sm text-white/80 max-w-xs">
              Trusted pet care and rescue adoption in Cyprus.
            </p>
          </div>
          <nav className="flex flex-wrap gap-8 sm:gap-12" aria-label="Footer">
            <div className="flex flex-col gap-3">
              <p
                className="text-xs font-semibold uppercase tracking-wider text-white/80"
                style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
              >
                Services
              </p>
              <Link
                href="/services"
                className="text-sm text-white/90 transition-opacity hover:opacity-100 hover:underline"
                style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
              >
                Find care
              </Link>
              <Link
                href="/services/search"
                className="text-sm text-white/90 transition-opacity hover:opacity-100 hover:underline"
                style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
              >
                Search
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <p
                className="text-xs font-semibold uppercase tracking-wider text-white/80"
                style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
              >
                Adopt
              </p>
              <Link
                href="/adopt"
                className="text-sm text-white/90 transition-opacity hover:opacity-100 hover:underline"
                style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
              >
                Adopt a Tiny
              </Link>
              <Link
                href="/adopt/happy-tails"
                className="text-sm text-white/90 transition-opacity hover:opacity-100 hover:underline"
                style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
              >
                Happy Tails
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <p
                className="text-xs font-semibold uppercase tracking-wider text-white/80"
                style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
              >
                Company
              </p>
              <Link
                href="/giving"
                className="text-sm text-white/90 transition-opacity hover:opacity-100 hover:underline"
                style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
              >
                Giving
              </Link>
              <Link
                href="/how-it-works"
                className="text-sm text-white/90 transition-opacity hover:opacity-100 hover:underline"
                style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
              >
                How it works
              </Link>
              <Link
                href="/about"
                className="text-sm text-white/90 transition-opacity hover:opacity-100 hover:underline"
                style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
              >
                About
              </Link>
            </div>
          </nav>
        </div>
        <div className="mt-14 pt-10 border-t border-white/20 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p
            className="text-sm text-white/80"
            style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
          >
            © {new Date().getFullYear()} Tinies. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-white/80 text-sm" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
            <MapPin className="h-4 w-4" />
            Cyprus
          </div>
        </div>
      </div>
    </footer>
  );
}
