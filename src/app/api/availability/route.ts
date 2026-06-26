import { NextRequest, NextResponse } from "next/server";
import { getBookings } from "@/lib/store";

export const dynamic = "force-dynamic";

// Hard limit: the boat fits 11 persons
export const BOAT_CAPACITY = 11;

export async function GET(_req: NextRequest) {
  try {
    const bookings = await getBookings();
    // Count persons per date (pending + confirmed only)
    const usage: Record<string, number> = {};
    for (const b of bookings) {
      if (b.status === "cancelled") continue;
      usage[b.date] = (usage[b.date] ?? 0) + (b.persons || 0);
    }
    return NextResponse.json({ usage, capacity: BOAT_CAPACITY });
  } catch {
    return NextResponse.json({ usage: {}, capacity: BOAT_CAPACITY });
  }
}
