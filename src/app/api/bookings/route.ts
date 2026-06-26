import { NextResponse } from "next/server";
import { addBooking, getBookings, updateBooking, type Booking } from "@/lib/store";

export const dynamic = "force-dynamic";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "sewar2026";
const CAPTAIN_PASSWORD = process.env.CAPTAIN_PASSWORD || "captain2026";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || "owner2026";

type Role = "admin" | "captain" | "owner" | null;

function getRole(req: Request): Role {
  const params = new URL(req.url).searchParams;
  const user = req.headers.get("x-admin-user") || params.get("user");
  const pass = req.headers.get("x-admin-password") || params.get("password");
  if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) return "admin";
  if (user === "captain" && pass === CAPTAIN_PASSWORD) return "captain";
  if (user === "owner" && pass === OWNER_PASSWORD) return "owner";
  return null;
}

function isAdmin(req: Request) {
  return getRole(req) === "admin";
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
  const role = getRole(req);
  if (!role) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const all = await getBookings();
    const today = new Date().toISOString().slice(0, 10);

    if (role === "captain") {
      // Captain sees only upcoming confirmed/pending trips (today + future), limited fields
      const upcoming = all
        .filter((b) => b.status !== "cancelled" && b.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date) || a.departTime.localeCompare(b.departTime))
        .map(({ id, packageTitle, option, persons, addons, date, departTime, name, phone, notes, status }) => ({
          id, packageTitle, option, persons, addons, date, departTime, name, phone, notes, status,
        }));
      return NextResponse.json({ bookings: upcoming, role: "captain" });
    }

    if (role === "owner") {
      // Owner sees everything for revenue analysis
      return NextResponse.json({ bookings: all, role: "owner" });
    }

    // admin
    return NextResponse.json({ bookings: all, role: "admin" });
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
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 422 });

  const patch: Partial<Booking> = {};
  if (body.status !== undefined) {
    if (!["pending", "confirmed", "cancelled"].includes(String(body.status))) {
      return NextResponse.json({ error: "bad status" }, { status: 422 });
    }
    patch.status = body.status as Booking["status"];
  }
  if (body.name !== undefined) patch.name = String(body.name);
  if (body.phone !== undefined) patch.phone = String(body.phone);
  if (body.date !== undefined) patch.date = String(body.date);
  if (body.departTime !== undefined) patch.departTime = String(body.departTime);
  if (body.persons !== undefined) patch.persons = Number(body.persons) || 1;
  if (body.option !== undefined) patch.option = String(body.option);
  if (body.payMethod !== undefined) patch.payMethod = body.payMethod === "arrival" ? "arrival" : "bank";
  if (body.payType !== undefined) patch.payType = body.payType === "deposit" ? "deposit" : "full";
  if (body.total !== undefined) patch.total = Number(body.total) || 0;
  if (body.notes !== undefined) patch.notes = String(body.notes);

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 422 });
  }
  try {
    await updateBooking(id, patch);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
