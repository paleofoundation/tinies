import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

type WalkPoint = { lat: number; lng: number; timestamp: number };

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { bookingId: string; lat: number; lng: number; timestamp: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { bookingId, lat, lng, timestamp } = body;
  if (
    !bookingId ||
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    !Number.isFinite(timestamp)
  ) {
    return NextResponse.json(
      { error: "Missing or invalid bookingId, lat, lng, timestamp" },
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
    select: { id: true, walkRoute: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found or not in progress" }, { status: 404 });
  }

  const existing = (booking.walkRoute as WalkPoint[] | null) ?? [];
  const next: WalkPoint[] = [...existing, { lat, lng, timestamp }];

  await prisma.booking.update({
    where: { id: bookingId },
    data: { walkRoute: next },
  });

  return NextResponse.json({ ok: true });
}
