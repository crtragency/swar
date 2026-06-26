import { NextRequest, NextResponse } from "next/server";
import { getBookings } from "@/lib/store";

export const dynamic = "force-dynamic";

// Each departure time slot can hold ONE trip only (one group at a time).
// Returns: { slots: { "2026-06-26": ["07:00", "14:00"] } }
export async function GET(_req: NextRequest) {
  try {
    const bookings = await getBookings();
    const slots: Record<string, string[]> = {};
    for (const b of bookings) {
      if (b.status === "cancelled") continue;
      if (!b.departTime) continue;
      if (!slots[b.date]) slots[b.date] = [];
      if (!slots[b.date].includes(b.departTime)) slots[b.date].push(b.departTime);
    }
    return NextResponse.json({ slots });
  } catch {
    return NextResponse.json({ slots: {} });
  }
}
