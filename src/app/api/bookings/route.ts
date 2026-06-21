import { NextResponse } from "next/server";
import { addBooking, getBookings, type Booking } from "@/lib/store";

export const dynamic = "force-dynamic";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "sewar2026";

function newId() {
  return "BK-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const date = String(body.date || "").trim();
  if (!name || !phone || !date) {
    return NextResponse.json({ error: "الحقول الأساسية مطلوبة" }, { status: 422 });
  }

  const booking: Booking = {
    id: newId(),
    createdAt: new Date().toISOString(),
    packageId: String(body.packageId || ""),
    packageTitle: String(body.packageTitle || ""),
    option: String(body.option || ""),
    persons: Number(body.persons) || 1,
    addons: Array.isArray(body.addons) ? body.addons.map(String) : [],
    date,
    departTime: String(body.departTime || ""),
    name,
    phone,
    notes: String(body.notes || ""),
    payMethod: body.payMethod === "arrival" ? "arrival" : "bank",
    total: Number(body.total) || 0,
    status: "pending",
  };

  try {
    await addBooking(booking);
  } catch {
    return NextResponse.json({ error: "تعذّر حفظ الحجز" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: booking.id });
}

export async function GET(req: Request) {
  const auth = req.headers.get("x-admin-password") || new URL(req.url).searchParams.get("password");
  if (auth !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const bookings = await getBookings();
    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
