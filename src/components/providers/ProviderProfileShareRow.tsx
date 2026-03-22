"use client";

import { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";

type Props = {
  shareUrl: string;
  shareTitle: string;
};

export function ProviderProfileShareRow({ shareUrl, shareTitle }: Props) {
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

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span
        className="flex items-center gap-2 text-sm font-medium"
        style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}
      >
        <Link2 className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />
        Share this provider
      </span>
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 items-center rounded-[var(--radius-pill)] border px-4 text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}
      >
        WhatsApp
      </a>
      <a
        href={fb}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 items-center rounded-[var(--radius-pill)] border px-4 text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}
      >
        Facebook
      </a>
      <button
        type="button"
        onClick={() => void copyLink()}
        className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-pill)] border px-4 text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text)", fontFamily: "var(--font-body), sans-serif" }}
      >
        {copied ? (
          <Check className="h-4 w-4" style={{ color: "var(--color-success, #16A34A)" }} aria-hidden />
        ) : (
          <Copy className="h-4 w-4" aria-hidden />
        )}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
