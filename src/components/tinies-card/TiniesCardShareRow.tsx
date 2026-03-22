"use client";

import { Facebook, Link2, MessageCircle } from "lucide-react";

type Props = {
  shareUrl: string;
  title: string;
};

export function TiniesCardShareRow({ shareUrl, title }: Props) {
  const encoded = encodeURIComponent(shareUrl);
  const text = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
        Share this card
      </span>
      <a
        href={`https://wa.me/?text=${text}%20${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] border px-3 py-2 text-sm font-semibold hover:opacity-90"
        style={{
          borderColor: "var(--color-border)",
          color: "var(--color-primary)",
          fontFamily: "var(--font-body), sans-serif",
        }}
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        WhatsApp
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] border px-3 py-2 text-sm font-semibold hover:opacity-90"
        style={{
          borderColor: "var(--color-border)",
          color: "var(--color-primary)",
          fontFamily: "var(--font-body), sans-serif",
        }}
      >
        <Facebook className="h-4 w-4" aria-hidden />
        Facebook
      </a>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(shareUrl);
          } catch {
            /* ignore */
          }
        }}
        className="inline-flex items-center gap-1.5 rounded-[var(--radius-lg)] border px-3 py-2 text-sm font-semibold hover:opacity-90"
        style={{
          borderColor: "var(--color-border)",
          color: "var(--color-text)",
          fontFamily: "var(--font-body), sans-serif",
        }}
      >
        <Link2 className="h-4 w-4" aria-hidden />
        Copy link
      </button>
    </div>
  );
}
