"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

const BORDER_TEAL_15 = "rgba(10, 128, 128, 0.15)";

type Props = {
  images: string[];
  initials: string;
};

export function ProviderGalleryClient({ images, initials }: Props) {
  const [active, setActive] = useState(0);
  const safeIndex = images.length > 0 ? Math.min(active, images.length - 1) : 0;
  const current = images[safeIndex] ?? null;
  const showThumbs = images.length > 1;

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (images.length <= 1) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActive((i) => (i + 1) % images.length);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActive((i) => (i - 1 + images.length) % images.length);
      }
    },
    [images.length]
  );

  return (
    <div onKeyDown={onKeyDown} role="region" aria-label="Provider photos" tabIndex={0}>
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "clamp(300px, 35vw, 440px)" }}
      >
        {current ? (
          <Image
            src={current}
            alt=""
            fill
            className="object-cover object-top"
            sizes="(max-width: 1024px) 100vw, 752px"
            priority={safeIndex === 0}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-5xl font-bold text-white"
            style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-primary)" }}
            aria-hidden
          >
            {initials}
          </div>
        )}
        {images.length > 0 ? (
          <div
            className="absolute bottom-3 right-3 rounded-full px-3 py-1.5 text-[0.6875rem] font-semibold text-white backdrop-blur-[4px]"
            style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          >
            {safeIndex + 1} / {images.length}
          </div>
        ) : null}
      </div>
      {showThumbs ? (
        <div
          className="flex gap-2 overflow-x-auto px-4 py-3"
          style={{ scrollbarGutter: "stable" }}
        >
          {images.map((url, i) => {
            const isActive = i === safeIndex;
            return (
              <button
                key={`${url}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                className={`relative h-[54px] w-[72px] shrink-0 overflow-hidden rounded-[10px] border-2 transition-colors hover:border-[var(--color-primary)] ${
                  isActive ? "border-[var(--color-primary)]" : "border-transparent"
                }`}
                style={{ outline: "none" }}
                aria-label={`Show photo ${i + 1}`}
                aria-current={isActive ? "true" : undefined}
              >
                <Image src={url} alt="" fill className="object-cover object-top" sizes="72px" />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
