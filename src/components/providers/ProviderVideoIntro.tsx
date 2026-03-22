"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import type { ResolvedListingVideo } from "@/lib/adoption/listing-video";

type Props = {
  providerName: string;
  video: ResolvedListingVideo;
};

function youtubeThumb(embedSrc: string): string | null {
  const m = embedSrc.match(/\/embed\/([^?]+)/);
  return m?.[1] ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
}

export function ProviderVideoIntro({ providerName, video }: Props) {
  const [open, setOpen] = useState(false);
  const thumb = video.kind === "youtube" ? youtubeThumb(video.embedSrc) : null;

  return (
    <section className="mt-12" aria-labelledby="video-intro-heading">
      <h2
        id="video-intro-heading"
        className="font-normal"
        style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
      >
        Meet {providerName}
      </h2>
      <div className="mt-4 overflow-hidden rounded-[var(--radius-xl)] border" style={{ borderColor: "var(--color-border)" }}>
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative flex aspect-video w-full items-center justify-center bg-black text-left transition-opacity hover:opacity-95"
            aria-label={`Play video introduction from ${providerName}`}
          >
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element -- dynamic YouTube thumb
              <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-teal-900 opacity-90" aria-hidden />
            )}
            <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-lg" style={{ color: "var(--color-primary)" }}>
              <Play className="ml-1 h-8 w-8 fill-current" aria-hidden />
            </span>
          </button>
        ) : video.kind === "youtube" ? (
          <div className="aspect-video w-full bg-black">
            <iframe
              title={`Video introduction — ${providerName}`}
              src={`${video.embedSrc}?autoplay=1`}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <video src={video.src} controls autoPlay className="aspect-video w-full bg-black object-contain" />
        )}
      </div>
    </section>
  );
}
