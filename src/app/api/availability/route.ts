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
  const normalized = ((h % 24) + 24) % 24;
  let hh = Math.floor(normalized);
  let mm = Math.round((normalized - hh) * 60);
  if (mm === 60) { hh = (hh + 1) % 24; mm = 0; }
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function addDaysISO(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function tripLabel(startTime: string, tripEndH: number): string {
  return `${startTime}–${fromH(tripEndH)}${tripEndH >= 24 ? " (اليوم التالي)" : ""}`;
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
      const tripEndH = startH + dur;
      const blockedEndH = tripEndH + BUFFER_HOURS;
      const label = tripLabel(b.departTime, tripEndH);

      for (let dayOffset = 0; dayOffset <= Math.floor(blockedEndH / 24); dayOffset++) {
        const segmentStart = dayOffset === 0 ? startH : 0;
        const segmentEnd = Math.min(24, blockedEndH - dayOffset * 24);
        if (segmentEnd <= segmentStart) continue;

        const dateKey = addDaysISO(b.date, dayOffset);
        if (!ranges[dateKey]) ranges[dateKey] = [];
        ranges[dateKey].push({ startH: segmentStart, endH: segmentEnd, label });
      }
    }

    return NextResponse.json({ ranges, bufferHours: BUFFER_HOURS });
  } catch {
    return NextResponse.json({ ranges: {}, bufferHours: BUFFER_HOURS });
  }
}
