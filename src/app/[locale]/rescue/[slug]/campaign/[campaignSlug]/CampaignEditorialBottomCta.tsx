"use client";

import Link from "next/link";

const HOME_INNER = "mx-auto w-full max-w-[1280px] px-6";

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[18px] w-[18px]" aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function CampaignEditorialBottomCta() {
  return (
    <section className="py-[clamp(4rem,8vw,8rem)] text-center text-white" style={{ backgroundColor: "var(--color-primary)" }}>
      <div className={HOME_INNER}>
        <p
          className="mb-4 text-[0.75rem] font-extrabold uppercase tracking-[0.08em]"
          style={{ fontFamily: "var(--font-display), sans-serif", color: "rgba(255, 255, 255, 0.6)" }}
        >
          Every euro counts
        </p>
        <h2
          className="mx-auto max-w-[900px] text-[clamp(2rem,6vw,3.75rem)] font-black uppercase leading-[0.94] tracking-[-0.04em]"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          <span className="block text-white">they can&apos;t ask</span>
          <span className="block" style={{ color: "rgba(255, 255, 255, 0.8)" }}>
            for help.
          </span>
        </h2>
        <p
          className="mx-auto mt-5 max-w-[500px] text-base leading-[1.7]"
          style={{ fontFamily: "var(--font-body), sans-serif", color: "rgba(255, 255, 255, 0.72)" }}
        >
          100 cats. One sanctuary. Zero government funding. Your donation is the difference between a full bowl and an empty one.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-[0.9375rem] font-bold transition-opacity hover:opacity-95"
            style={{
              fontFamily: "var(--font-body), sans-serif",
              backgroundColor: "#FFFFFF",
              color: "var(--color-secondary)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            }}
          >
            <HeartIcon />
            Donate now
          </button>
          <Link
            href="/giving"
            className="inline-flex items-center rounded-full border border-white/30 bg-transparent px-7 py-3.5 text-[0.875rem] font-semibold text-white transition-colors hover:bg-white/10"
            style={{ fontFamily: "var(--font-body), sans-serif" }}
          >
            See all campaigns
          </Link>
        </div>
      </div>
    </section>
  );
}
