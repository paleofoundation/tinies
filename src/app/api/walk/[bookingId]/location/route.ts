import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  elapsedMinutesSince,
  totalRouteDistanceKm,
  type WalkRoutePoint,
} from "@/lib/walk/route-metrics";

type RouteContext = { params: Promise<{ bookingId: string }> };

/**
 * Provider: append one GPS sample to walk_route while walk is active.
 * Body: { lat, lng, timestamp } (timestamp = epoch ms from client).
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const { bookingId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { lat: number; lng: number; timestamp: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { lat, lng, timestamp } = body;
  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    !Number.isFinite(timestamp)
  ) {
    return NextResponse.json(
      { error: "Invalid lat, lng, or timestamp" },
      { status: 400 }
    );
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: "Coordinates out of range" }, { status: 400 });
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      providerId: user.id,
      status: "active",
      serviceType: "walking",
      walkStartedAt: { not: null },
    },
    select: { id: true, walkRoute: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found or walk not in progress" }, { status: 404 });
  }

  const existing = (booking.walkRoute as WalkRoutePoint[] | null) ?? [];
  const point: WalkRoutePoint = { lat, lng, timestamp };
  const last = existing[existing.length - 1];
  const duplicate =
    last &&
    last.lat === point.lat &&
    last.lng === point.lng &&
    Math.abs(last.timestamp - point.timestamp) < 5000;
  const next: WalkRoutePoint[] = duplicate ? existing : [...existing, point];

  if (!duplicate) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { walkRoute: next },
    });
  }

  const distanceKm = totalRouteDistanceKm(next);
  return NextResponse.json({
    ok: true,
    pointCount: next.length,
    distanceKm,
  });
}

/**
 * Owner: poll walk progress (and completed route after walk ends).
 * Returns route, activities, timing, and derived distance / elapsed for UI.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  const { bookingId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      ownerId: user.id,
      serviceType: "walking",
    },
    select: {
      walkRoute: true,
      walkActivities: true,
      walkStartedAt: true,
      walkEndedAt: true,
      status: true,
      walkDistanceKm: true,
      walkDurationMinutes: true,
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const walkRoute = (booking.walkRoute ?? []) as WalkRoutePoint[];
  const walkActivities = (booking.walkActivities ?? []) as {
    type: string;
    lat: number;
    lng: number;
    timestamp: number;
  }[];

  const liveDistanceKm =
    booking.status === "active" && booking.walkStartedAt && !booking.walkEndedAt
      ? totalRouteDistanceKm(walkRoute)
      : (booking.walkDistanceKm ?? totalRouteDistanceKm(walkRoute));

  const elapsedMinutes =
    booking.status === "active" && booking.walkStartedAt && !booking.walkEndedAt
      ? elapsedMinutesSince(booking.walkStartedAt)
      : booking.walkDurationMinutes ?? 0;

  return NextResponse.json({
    walkRoute,
    walkActivities,
    walkStartedAt: booking.walkStartedAt?.toISOString() ?? null,
    walkEndedAt: booking.walkEndedAt?.toISOString() ?? null,
    status: booking.status,
    distanceKm: Math.round(liveDistanceKm * 1000) / 1000,
    elapsedMinutes,
    walkDurationMinutes: booking.walkDurationMinutes,
    walkDistanceKm: booking.walkDistanceKm,
  });
}
