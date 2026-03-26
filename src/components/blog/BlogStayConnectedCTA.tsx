import { Link } from "@/i18n/navigation";

/**
 * Full-width band from blog mock: teal background, coral + outline CTAs.
 */
export function BlogStayConnectedCTA() {
  return (
    <section
      className="mt-20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      style={{ backgroundColor: "var(--color-primary-900)" }}
    >
      <div className="theme-container mx-auto max-w-4xl text-center">
        <p
          className="text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-white/90"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          Stay connected
        </p>
        <h2
          className="mt-5 font-black uppercase leading-[0.92] tracking-tight"
          style={{
            fontFamily: "var(--font-display), sans-serif",
            fontSize: "clamp(2.25rem, 7vw, 3.85rem)",
          }}
        >
          <span className="block text-white">Stories that</span>
          <span className="block" style={{ color: "var(--color-primary-200)" }}>
            actually matter
          </span>
        </h2>
        <p
          className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg"
          style={{ fontFamily: "var(--font-body), sans-serif" }}
        >
          Rescue updates, adoption guides, and pet care tips from the Tinies team. No spam. Just real stories from
          Cyprus.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
          <Link
            href="/giving/become-a-guardian"
            className="inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-[var(--radius-pill)] px-8 py-3 text-center text-sm font-bold text-white transition-opacity hover:opacity-90 sm:w-auto"
            style={{
              fontFamily: "var(--font-body), sans-serif",
              backgroundColor: "var(--color-secondary)",
              boxShadow:
                "var(--shadow-md), 0 8px 28px color-mix(in srgb, var(--color-secondary) 42%, transparent)",
            }}
          >
            Become a Guardian
          </Link>
          <Link
            href="/adopt"
            className="inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-[var(--radius-pill)] border-2 border-white bg-transparent px-8 py-3 text-center text-sm font-bold text-white transition-opacity hover:opacity-90 sm:w-auto"
            style={{ fontFamily: "var(--font-body), sans-serif" }}
          >
            View all animals
          </Link>
        </div>
      </div>
    </section>
  );
}
