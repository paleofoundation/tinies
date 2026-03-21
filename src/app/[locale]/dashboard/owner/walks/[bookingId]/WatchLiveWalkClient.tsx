"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { WalkTracker } from "@/components/maps/WalkTracker";

type WalkActivity = { type: string; lat: number; lng: number; timestamp: number };

type WalkLocationPoll = {
  walkRoute: { lat: number; lng: number; timestamp: number }[];
  walkActivities: WalkActivity[];
  walkStartedAt: string | null;
  walkEndedAt: string | null;
  status: string;
};

const POLL_INTERVAL_MS = 15 * 1000;

export function WatchLiveWalkClient({
  bookingId,
  initialRoute,
  initialWalkActivities = [],
  initialStartedAt,
  initialEndedAt,
  initialStatus,
}: {
  bookingId: string;
  initialRoute: { lat: number; lng: number; timestamp: number }[];
  initialWalkActivities?: WalkActivity[];
  initialStartedAt: Date | null;
  initialEndedAt: Date | null;
  initialStatus: string;
}) {
  const [route, setRoute] = useState(initialRoute);
  const [walkActivities, setWalkActivities] = useState<WalkActivity[]>(initialWalkActivities);
  const [startedAt, setStartedAt] = useState<Date | null>(
    initialStartedAt ? new Date(initialStartedAt) : null
  );
  const [endedAt, setEndedAt] = useState<Date | null>(
    initialEndedAt ? new Date(initialEndedAt) : null
  );
  const [status, setStatus] = useState(initialStatus);

  const fetchRoute = useCallback(async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const res = await fetch(`${origin}/api/walk/${bookingId}/location`, {
      credentials: "include",
    });
    if (!res.ok) return;
    const data = (await res.json()) as WalkLocationPoll;
    setRoute(data.walkRoute);
    setWalkActivities(data.walkActivities);
    setStartedAt(data.walkStartedAt ? new Date(data.walkStartedAt) : null);
    setEndedAt(data.walkEndedAt ? new Date(data.walkEndedAt) : null);
    setStatus(data.status);
  }, [bookingId]);

  useEffect(() => {
    if (status === "active" && !endedAt) {
      const interval = setInterval(fetchRoute, POLL_INTERVAL_MS);
      return () => clearInterval(interval);
    }
  }, [status, endedAt, fetchRoute]);

  const isLive = status === "active" && !endedAt;
  const currentPosition =
    isLive && route.length > 0
      ? { lat: route[route.length - 1].lat, lng: route[route.length - 1].lng }
      : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/dashboard/owner?tab=bookings"
            className="text-sm font-medium hover:underline"
            style={{ color: "var(--color-primary)" }}
          >
            ← Back to bookings
          </Link>
          {isLive && (
            <span
              className="rounded-full bg-[var(--color-secondary)]/20 px-2.5 py-0.5 text-xs font-semibold"
              style={{ color: "var(--color-secondary)" }}
            >
              Live
            </span>
          )}
        </div>
        <h1
          className="font-normal"
          style={{
            fontFamily: "var(--font-heading), serif",
            fontSize: "var(--text-xl)",
            color: "var(--color-text)",
          }}
        >
          {isLive ? "Watch live walk" : "Walk summary"}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {isLive ? "Route updates every 15 seconds." : "This walk has ended."}
        </p>
        <div className="mt-6">
          <WalkTracker
            route={route}
            currentPosition={currentPosition}
            startedAt={startedAt}
            endedAt={endedAt}
            walkActivities={walkActivities}
            showPositionMarker={isLive}
          />
        </div>
      </main>
    </div>
  );
}
