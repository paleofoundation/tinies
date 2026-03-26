"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { getBookingUpdates } from "@/lib/bookings/update-actions";
import type { BookingUpdateFeedItem } from "@/lib/bookings/booking-update-types";

const POLL_MS = 30_000;

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((s) => s.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

type Props = {
  bookingId: string;
  pollWhileActive: boolean;
};

export function BookingUpdatesFeed({ bookingId, pollWhileActive }: Props) {
  const [updates, setUpdates] = useState<BookingUpdateFeedItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await getBookingUpdates(bookingId);
    if (res.error) {
      setLoadError(res.error);
      return;
    }
    setLoadError(null);
    setUpdates(res.updates);
  }, [bookingId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!pollWhileActive) return;
    const id = setInterval(() => void load(), POLL_MS);
    return () => clearInterval(id);
  }, [pollWhileActive, load]);

  if (loadError && updates.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--color-error)", fontFamily: "var(--font-body), sans-serif" }}>
        {loadError}
      </p>
    );
  }

  if (updates.length === 0) {
    return (
      <p className="text-sm italic" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body), sans-serif" }}>
        When your carer sends photos or notes, they&apos;ll appear here.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {updates.map((u) => (
        <article
          key={u.id}
          className="overflow-hidden rounded-[var(--radius-xl)] border"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", boxShadow: "var(--shadow-sm)" }}
        >
          <div
            className="flex items-center gap-3 border-b px-4 py-3"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-primary-muted-06)" }}
          >
            <div
              className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
            >
              {u.providerAvatarUrl ? (
                <Image src={u.providerAvatarUrl} alt="" fill className="object-cover" sizes="40px" unoptimized={u.providerAvatarUrl.includes("supabase")} />
              ) : (
                initials(u.providerName)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                {u.providerName}
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body), sans-serif" }}>
                {formatWhen(u.createdAt)}
              </p>
            </div>
          </div>
          {u.photos.length > 0 && (
            <div className={`grid gap-1 p-2 ${u.photos.length === 1 ? "grid-cols-1" : u.photos.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
              {u.photos.map((src) => (
                <div key={src} className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-background)]">
                  <Image src={src} alt="Update from your pet carer" fill className="object-cover" sizes="(max-width:640px) 50vw, 200px" unoptimized={src.includes("supabase")} />
                </div>
              ))}
            </div>
          )}
          <div className="px-4 py-3">
            {u.text ? (
              <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
                {u.text}
              </p>
            ) : null}
            {u.videoUrl ? (
              <p className="mt-2 text-sm">
                <a
                  href={u.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline-offset-2 hover:underline"
                  style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
                >
                  Watch video →
                </a>
              </p>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
