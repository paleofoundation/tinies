import { Link } from "@/i18n/navigation";

/**
 * Teal band: coral primary CTA + white outline secondary (editorial blog mock v2).
 */
export function BlogStayConnectedCTA() {
  return (
    <section
      className="text-center text-white"
      style={{
        backgroundColor: "var(--color-primary)",
        paddingBlock: "clamp(4rem, 8vw, 8rem)",
      }}
    >
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-10">
        <p
          className="mb-4 text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
          style={{
            fontFamily: "var(--font-display), sans-serif",
            color: "rgba(255, 255, 255, 0.6)",
          }}
        >
          Stay connected
        </p>
        <h2
          className="font-black uppercase leading-[0.94] tracking-[-0.04em]"
          style={{
            fontFamily: "var(--font-display), sans-serif",
            fontSize: "clamp(2rem, 6vw, 3.75rem)",
          }}
        >
          <span className="block text-white">stories that</span>
          <span className="block" style={{ color: "rgba(255, 255, 255, 0.8)" }}>
            actually matter
          </span>
        </h2>
        <p
          className="mx-auto mt-5 max-w-[480px] text-base leading-[1.7]"
          style={{
            fontFamily: "var(--font-body), sans-serif",
            color: "rgba(255, 255, 255, 0.72)",
          }}
        >
          Rescue updates, adoption guides, and pet care tips from the Tinies team. No spam. Just real stories from
          Cyprus.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/giving/become-a-guardian"
            className="inline-flex items-center justify-center rounded-full px-9 py-4 text-base font-bold text-white transition-transform duration-200 hover:-translate-y-0.5"
            style={{
              fontFamily: "var(--font-body), sans-serif",
              backgroundColor: "var(--color-secondary)",
              boxShadow: "0 6px 24px rgba(244, 93, 72, 0.35)",
            }}
          >
            Become a Guardian
          </Link>
          <Link
            href="/adopt"
            className="inline-flex items-center justify-center rounded-full border-2 border-white bg-transparent px-9 py-4 text-base font-bold text-white transition-colors duration-200 hover:bg-white/10"
            style={{ fontFamily: "var(--font-body), sans-serif" }}
          >
            View all animals
          </Link>
        </div>
      </div>
    </section>
  );
}
