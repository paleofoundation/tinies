"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MapPin, Square } from "lucide-react";
import { startWalk, endWalk, cancelAcceptedBookingAsProvider } from "./actions";
import { SendBookingUpdateModal } from "./SendBookingUpdateModal";
import { WalkTracker } from "@/components/maps/WalkTracker";
import type { ProviderBookingCard } from "@/lib/utils/provider-helpers";

const TRACK_INTERVAL_MS = 30 * 1000;
const API_URL = typeof window !== "undefined" ? window.location.origin : "";

type WalkPoint = { lat: number; lng: number; timestamp: number };
type WalkActivity = { type: string; lat: number; lng: number; timestamp: number };

export function ActiveWalkCard({ booking }: { booking: ProviderBookingCard }) {
  const router = useRouter();
  const [batteryWarningOpen, setBatteryWarningOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [route, setRoute] = useState<WalkPoint[]>([]);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [activities, setActivities] = useState<WalkActivity[]>([]);
  const [ending, setEnding] = useState(false);
  const [providerCancelling, setProviderCancelling] = useState(false);
  const [sendUpdateOpen, setSendUpdateOpen] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<Date | null>(null);

  const isWalking = booking.serviceType === "walking" && booking.status === "accepted";
  const isActive = booking.status === "active" && booking.walkStartedAt;

  const sendPoint = useCallback(
    async (lat: number, lng: number) => {
      try {
        const res = await fetch(`${API_URL}/api/walk/${booking.id}/location`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            lat,
            lng,
            timestamp: Date.now(),
          }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          console.error("sendPoint failed", data.error ?? res.status);
        }
      } catch (e) {
        console.error("sendPoint failed", e);
      }
    },
    [booking.id]
  );

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setStarting(true);
    startWalk(booking.id).then((result) => {
      if (result.error) {
        setStarting(false);
        toast.error(result.error);
        return;
      }
      setBatteryWarningOpen(false);
      startedAtRef.current = new Date();
      setRoute([]);
      setCurrentPosition(null);
      setActivities([]);
      setTracking(true);
      setStarting(false);
      router.refresh();

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const point: WalkPoint = { lat: latitude, lng: longitude, timestamp: Date.now() };
          setCurrentPosition({ lat: latitude, lng: longitude });
          setRoute([point]);
          sendPoint(latitude, longitude);
        },
        () => {},
        { enableHighAccuracy: true }
      );

      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentPosition({ lat: latitude, lng: longitude });
        },
        (err) => {
          toast.error("GPS error: " + (err.message || "Could not get position."));
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      watchIdRef.current = watchId;

      const interval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            const point: WalkPoint = { lat: latitude, lng: longitude, timestamp: Date.now() };
            setRoute((prev) => [...prev, point]);
            sendPoint(latitude, longitude);
          },
          () => {},
          { enableHighAccuracy: true }
        );
      }, TRACK_INTERVAL_MS);
      intervalRef.current = interval;
    });
  }, [booking.id, router, sendPoint]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setEnding(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        sendPoint(pos.coords.latitude, pos.coords.longitude).then(() => {
          endWalk(booking.id).then((result) => {
            setEnding(false);
            setTracking(false);
            if (result.error) toast.error(result.error);
            else toast.success("Walk ended.");
            router.refresh();
          });
        });
      },
      () => {
        endWalk(booking.id).then((result) => {
          setEnding(false);
          setTracking(false);
          if (result.error) toast.error(result.error);
          else toast.success("Walk ended.");
          router.refresh();
        });
      }
    );
  }, [booking.id, router, sendPoint]);

  const clearGeolocation = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleProviderCancelBooking = useCallback(async () => {
    if (
      !confirm(
        "Cancel this walk booking? The owner receives a full refund and will be notified."
      )
    )
      return;
    setProviderCancelling(true);
    clearGeolocation();
    const result = await cancelAcceptedBookingAsProvider(booking.id);
    setProviderCancelling(false);
    setTracking(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Booking cancelled. Refund initiated.");
    router.refresh();
  }, [booking.id, clearGeolocation, router]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (booking.serviceType !== "walking") return null;

  const recordActivity = async (type: string) => {
      const pos = currentPosition ?? (route.length > 0 ? { lat: route[route.length - 1].lat, lng: route[route.length - 1].lng } : null);
      if (!pos) {
        toast.error("Waiting for GPS…");
        return;
      }
      const ts = Date.now();
      try {
        const res = await fetch(`${API_URL}/api/walks/activity`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ bookingId: booking.id, type, lat: pos.lat, lng: pos.lng, timestamp: ts }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          toast.error(data.error ?? "Failed to record");
          return;
        }
        setActivities((prev) => [...prev, { type, lat: pos.lat, lng: pos.lng, timestamp: ts }]);
      } catch (e) {
        toast.error("Failed to record activity");
      }
    };

  if (tracking || (isActive && !booking.walkEndedAt)) {
    const startedAt = startedAtRef.current ?? (booking.walkStartedAt ? new Date(booking.walkStartedAt) : null);
    const displayRoute = route.length > 0 ? route : (booking.walkRoute ?? []);
    const displayActivities = activities.length > 0 ? activities : (booking.walkActivities ?? []);
    return (
      <li
        className="rounded-[var(--radius-lg)] border p-4"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium" style={{ color: "var(--color-text)" }}>
            Walk in progress · {booking.petNames.join(", ")}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSendUpdateOpen(true)}
              disabled={ending || providerCancelling}
              className="rounded-[var(--radius-lg)] border border-[var(--color-primary)] px-3 py-1.5 text-sm font-semibold hover:bg-[var(--color-primary-50)] disabled:opacity-50"
              style={{ color: "var(--color-primary)" }}
            >
              Send update
            </button>
            <button
              type="button"
              onClick={handleProviderCancelBooking}
              disabled={ending || providerCancelling}
              className="rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] disabled:opacity-50"
            >
              {providerCancelling ? "Cancelling…" : "Cancel booking"}
            </button>
            <button
              type="button"
              onClick={stopTracking}
              disabled={ending || providerCancelling}
              className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] border-2 border-[var(--color-error)] px-3 py-1.5 text-sm font-semibold text-[var(--color-error)] hover:bg-[var(--color-error)]/10 disabled:opacity-50"
            >
              <Square className="h-4 w-4" />
              End Walk
            </button>
          </div>
        </div>
        <SendBookingUpdateModal
          bookingId={booking.id}
          open={sendUpdateOpen}
          onClose={() => setSendUpdateOpen(false)}
          headline={`${booking.petNames.join(", ")} · share a moment with their family`}
        />
        <div className="mt-4">
          <WalkTracker
            route={displayRoute}
            currentPosition={currentPosition}
            startedAt={startedAt}
            walkActivities={displayActivities}
            trackingActive
            showPositionMarker
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>Tap to log:</span>
          <button type="button" onClick={() => recordActivity("pee")} className="rounded-[var(--radius-lg)] border px-3 py-1.5 text-sm hover:bg-[var(--color-background)]" style={{ borderColor: "var(--color-border)" }} title="Pee break">🐾 Pee</button>
          <button type="button" onClick={() => recordActivity("poo")} className="rounded-[var(--radius-lg)] border px-3 py-1.5 text-sm hover:bg-[var(--color-background)]" style={{ borderColor: "var(--color-border)" }} title="Poo">💩 Poo</button>
          <button type="button" onClick={() => recordActivity("food")} className="rounded-[var(--radius-lg)] border px-3 py-1.5 text-sm hover:bg-[var(--color-background)]" style={{ borderColor: "var(--color-border)" }} title="Food">🍽️ Food</button>
          <button type="button" onClick={() => recordActivity("water")} className="rounded-[var(--radius-lg)] border px-3 py-1.5 text-sm hover:bg-[var(--color-background)]" style={{ borderColor: "var(--color-border)" }} title="Water">💧 Water</button>
        </div>
      </li>
    );
  }

  if (isWalking) {
    return (
      <li
        className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border p-4"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div>
          <p className="font-medium" style={{ color: "var(--color-text)" }}>{booking.ownerName} · {booking.petNames.join(", ")} · Dog walking</p>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{new Date(booking.startDatetime).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-[var(--color-primary)]/15" style={{ color: "var(--color-primary)" }}>{booking.status}</span>
          <button
            type="button"
            onClick={handleProviderCancelBooking}
            disabled={starting || providerCancelling}
            className="rounded-[var(--radius-lg)] border border-[var(--color-error)]/50 px-3 py-2 text-sm font-semibold text-[var(--color-error)] hover:bg-[var(--color-error)]/10 disabled:opacity-70"
          >
            {providerCancelling ? "Cancelling…" : "Cancel booking"}
          </button>
          <button
            type="button"
            onClick={() => setBatteryWarningOpen(true)}
            disabled={starting || providerCancelling}
            className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
          >
            <MapPin className="h-4 w-4" />
            {starting ? "Starting…" : "Start Walk"}
          </button>
        </div>
        {batteryWarningOpen && (
          <div className="w-full rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50 p-4" style={{ borderColor: "var(--color-border)" }}>
            <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>GPS tracking uses battery. Keep your phone charged.</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={startTracking}
                disabled={starting}
                className="rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
              >
                Start walk
              </button>
              <button
                type="button"
                onClick={() => setBatteryWarningOpen(false)}
                className="rounded-[var(--radius-lg)] border px-3 py-1.5 text-sm font-medium hover:bg-[var(--color-surface)]"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </li>
    );
  }

  return null;
}
