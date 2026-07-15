import { NextRequest, NextResponse } from "next/server";
import { getBookings } from "@/lib/store";
import { bookingDuration } from "@/lib/packages";

export const dynamic = "force-dynamic";

const BUFFER_HOURS = 1; // cleaning/rest time between trips

// Convert "HH:MM" to decimal hours (e.g. "09:30" → 9.5)
function toH(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h + (m || 0) / 60;
}

// Convert decimal hours to "HH:MM"
function fromH(h: number): string {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export type BlockedRange = { startH: number; endH: number; label: string };

// Returns: { ranges: { "2026-06-26": [{startH, endH, label}] } }
// endH already includes the 1-hour cleaning buffer.
// Any new trip [newStart, newStart+newDur) must not overlap [startH, endH).
export async function GET(_req: NextRequest) {
  try {
    const bookings = await getBookings();
    const ranges: Record<string, BlockedRange[]> = {};

    for (const b of bookings) {
      if (b.status === "cancelled") continue;
      if (!b.departTime) continue;
      const startH = toH(b.departTime);
      const dur = bookingDuration(b);
      const endH = startH + dur + BUFFER_HOURS;
      if (!ranges[b.date]) ranges[b.date] = [];
      ranges[b.date].push({ startH, endH, label: `${b.departTime}–${fromH(startH + dur)}` });
    }

    return NextResponse.json({ ranges, bufferHours: BUFFER_HOURS });
  } catch {
    return NextResponse.json({ ranges: {}, bufferHours: BUFFER_HOURS });
  }
}
