import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const ACTIVITY_TYPES = ["pee", "poo", "food", "water"] as const;

type WalkActivityPoint = { type: string; lat: number; lng: number; timestamp: number };

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { bookingId: string; type: string; lat: number; lng: number; timestamp: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { bookingId, type, lat, lng, timestamp } = body;
  if (
    !bookingId ||
    !ACTIVITY_TYPES.includes(type as (typeof ACTIVITY_TYPES)[number]) ||
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    !Number.isFinite(timestamp)
  ) {
    return NextResponse.json(
      { error: "Missing or invalid bookingId, type (pee|poo|food|water), lat, lng, timestamp" },
      { status: 400 }
    );
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      providerId: user.id,
      status: "active",
      serviceType: "walking",
      walkStartedAt: { not: null },
    },
    select: { id: true, walkActivities: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found or walk not in progress" }, { status: 404 });
  }

  const existing = (booking.walkActivities as WalkActivityPoint[] | null) ?? [];
  const next: WalkActivityPoint[] = [...existing, { type, lat, lng, timestamp }];

  await prisma.booking.update({
    where: { id: bookingId },
    data: { walkActivities: next },
  });

  return NextResponse.json({ ok: true });
}
