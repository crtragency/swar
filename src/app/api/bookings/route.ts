import { NextResponse } from "next/server";
import { addBooking, getBookings, updateStatus, type Booking } from "@/lib/store";

export const dynamic = "force-dynamic";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "sewar2026";

function isAdmin(req: Request) {
  const params = new URL(req.url).searchParams;
  const user = req.headers.get("x-admin-user") || params.get("user");
  const pass = req.headers.get("x-admin-password") || params.get("password");
  return user === ADMIN_USERNAME && pass === ADMIN_PASSWORD;
}

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
    payType: body.payType === "deposit" ? "deposit" : "full",
    deposit: Number(body.deposit) || 0,
    amountDue: Number(body.amountDue) || Number(body.total) || 0,
    promo: String(body.promo || ""),
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
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const bookings = await getBookings();
    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const id = String(body.id || "");
  const status = body.status as Booking["status"];
  if (!id || !["pending", "confirmed", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "bad request" }, { status: 422 });
  }
  try {
    await updateStatus(id, status);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
