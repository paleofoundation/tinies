"use client";

import { useState } from "react";
import { Check } from "lucide-react";

type Props = {
  shareUrl: string;
  shareTitle: string;
};

export function RescueProfileShareEditorial({ shareUrl, shareTitle }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  const encUrl = encodeURIComponent(shareUrl);
  const wa = `https://wa.me/?text=${encodeURIComponent(`${shareTitle} — ${shareUrl}`)}`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`;

  const btnClass =
    "flex flex-1 items-center justify-center rounded-xl border border-[rgba(10,128,128,0.15)] px-2 py-2.5 text-[0.75rem] font-semibold text-[rgba(28,28,28,0.7)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]";

  return (
    <div
      className="rounded-[20px] border border-[rgba(10,128,128,0.15)] bg-[var(--color-background)] p-6 shadow-[0_2px_8px_rgba(10,128,128,0.06)]"
    >
      <div
        className="mb-3.5 text-[0.8125rem] font-bold uppercase tracking-[0.06em]"
        style={{ color: "rgba(28, 28, 28, 0.5)", fontFamily: "var(--font-body), sans-serif" }}
      >
        Share this organisation
      </div>
      <div className="flex gap-2.5">
        <a href={wa} target="_blank" rel="noopener noreferrer" className={btnClass} style={{ fontFamily: "var(--font-body), sans-serif" }}>
          WhatsApp
        </a>
        <a href={fb} target="_blank" rel="noopener noreferrer" className={btnClass} style={{ fontFamily: "var(--font-body), sans-serif" }}>
          Facebook
        </a>
        <button
          type="button"
          onClick={() => void copyLink()}
          className={`${btnClass} gap-1.5`}
          style={{ fontFamily: "var(--font-body), sans-serif" }}
        >
          {copied ? <Check className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--color-success, #16A34A)" }} aria-hidden /> : null}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
