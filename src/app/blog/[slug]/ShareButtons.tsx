"use client";

import { useState } from "react";
import { MessageCircle, Facebook, Twitter, Link2, Check } from "lucide-react";

type Props = { title: string; url: string };

export function ShareButtons({ title, url }: Props) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(`${title} – Tinies`);

  const shareLinks = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      icon: MessageCircle,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: Facebook,
    },
    {
      label: "Twitter/X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: Twitter,
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="mt-12 pt-8 border-t border-[var(--color-border)]">
      <p className="text-sm font-semibold mb-3" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
        Share this article
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--color-background)] hover:border-[var(--color-primary)]"
          style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}
        >
          {copied ? <Check className="h-4 w-4 text-[var(--color-primary)]" /> : <Link2 className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy link"}
        </button>
        {shareLinks.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--color-background)] hover:border-[var(--color-primary)]"
            style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}
          >
            <Icon className="h-4 w-4" />
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
