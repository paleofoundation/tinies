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
      label: "Twitter",
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
    <div className="mt-12 pt-8 border-t border-[#E5E7EB]">
      <p className="text-sm font-semibold text-[#1B2432] mb-3" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
        Share this article
      </p>
      <div className="flex flex-wrap items-center gap-3">
        {shareLinks.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[999px] border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#1B2432] transition-colors hover:bg-[#F7F7F8] hover:border-[#0A6E5C]/30"
            style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
          >
            <Icon className="h-4 w-4" />
            {label}
          </a>
        ))}
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-2 rounded-[999px] border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#1B2432] transition-colors hover:bg-[#F7F7F8] hover:border-[#0A6E5C]/30"
          style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
        >
          {copied ? <Check className="h-4 w-4 text-[#0A6E5C]" /> : <Link2 className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
