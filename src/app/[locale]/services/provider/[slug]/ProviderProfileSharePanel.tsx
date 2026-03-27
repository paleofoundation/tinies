"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

const BORDER_TEAL_15 = "rgba(10, 128, 128, 0.15)";

type Props = {
  shareUrl: string;
  shareTitle: string;
};

export function ProviderProfileSharePanel({ shareUrl, shareTitle }: Props) {
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
    "flex flex-1 items-center justify-center rounded-xl border px-3 py-3 text-sm font-semibold transition-colors hover:border-[var(--color-primary)]";
  const btnStyle = {
    fontFamily: "var(--font-body), sans-serif",
    borderColor: BORDER_TEAL_15,
    color: "var(--color-text)",
    backgroundColor: "var(--color-background)",
  } as const;

  return (
    <div
      className="rounded-[20px] border bg-white p-6"
      style={{ borderColor: BORDER_TEAL_15, boxShadow: "0 2px 8px rgba(10, 128, 128, 0.06)" }}
    >
      <p
        className="text-[0.8125rem] font-bold uppercase tracking-[0.06em]"
        style={{ fontFamily: "var(--font-body)", color: "rgba(28,28,28,0.5)" }}
      >
        Share this provider
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <a href={wa} target="_blank" rel="noopener noreferrer" className={btnClass} style={btnStyle}>
          WhatsApp
        </a>
        <a href={fb} target="_blank" rel="noopener noreferrer" className={btnClass} style={btnStyle}>
          Facebook
        </a>
        <button type="button" onClick={() => void copyLink()} className={btnClass} style={btnStyle}>
          {copied ? (
            <>
              <Check className="mr-1 h-4 w-4 shrink-0" style={{ color: "var(--color-success)" }} aria-hidden />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-1 h-4 w-4 shrink-0" aria-hidden />
              Copy link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
