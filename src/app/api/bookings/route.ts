import { NextResponse } from "next/server";
import { addBooking, getBookings, updateBooking, type Booking } from "@/lib/store";
import { deriveDuration } from "@/lib/packages";

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

const NOTIFICATION_EMAILS = ["sewarmarine0@gmail.com", "sewarmarine@gmail.com"];

async function sendBookingNotification(b: Booking) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // silently skip if not configured

  const payLabel = b.payMethod === "bank"
    ? (b.payType === "deposit" ? `تحويل بنكي — مقدّم 50% (${b.deposit.toLocaleString()} ريال)` : "تحويل بنكي — كامل")
    : "عند الوصول (كاش)";

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f0f8fb;font-family:'Segoe UI',Arial,sans-serif;direction:rtl">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
        <!-- header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0b5c8c,#21c0c0);padding:32px 36px;text-align:center">
            <p style="margin:0;font-size:32px">⚓</p>
            <h1 style="margin:8px 0 4px;color:#fff;font-size:22px;font-weight:800">حجز جديد — سوار البحرية</h1>
            <p style="margin:0;color:rgba(255,255,255,.75);font-size:14px">${b.id}</p>
          </td>
        </tr>
        <!-- body -->
        <tr>
          <td style="padding:32px 36px">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${row("📦 الباقة", b.packageTitle)}
              ${b.option ? row("🔹 الخيار", b.option) : ""}
              ${row("👤 الاسم", b.name)}
              ${row("📞 الجوال", b.phone)}
              ${row("📅 تاريخ الرحلة", b.date)}
              ${b.departTime ? row("🕐 وقت الانطلاق", b.departTime) : ""}
              ${row("👥 عدد الأشخاص", String(b.persons))}
              ${b.addons.length ? row("➕ الإضافات", b.addons.join("، ")) : ""}
              ${row("💳 الدفع", payLabel)}
              ${row("💰 الإجمالي", `${b.total.toLocaleString()} ريال`)}
              ${b.promo ? row("🎟️ كود الخصم", b.promo) : ""}
              ${b.notes ? row("📝 الملاحظات", b.notes) : ""}
            </table>
            <div style="margin-top:28px;padding:16px 20px;background:#e8f6f8;border-radius:12px;border-right:4px solid #21c0c0">
              <p style="margin:0;font-size:13px;color:#0b5c8c">يُرجى مراجعة اللوحة الإدارية لتأكيد الحجز أو التواصل مع العميل.</p>
            </div>
          </td>
        </tr>
        <!-- footer -->
        <tr>
          <td style="background:#f8fbfc;padding:20px 36px;text-align:center;border-top:1px solid #e5eef2">
            <p style="margin:0;font-size:12px;color:#9ab">سوار البحرية · ثول · المملكة العربية السعودية</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  function row(label: string, value: string) {
    return `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0f4f6;font-size:13px;color:#6b7a8d;width:160px;vertical-align:top">${label}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0f4f6;font-size:14px;color:#1a2a3a;font-weight:600">${value}</td>
    </tr>`;
  }

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "سوار البحرية <noreply@sewarmarine.com>",
        to: NOTIFICATION_EMAILS,
        subject: `⚓ حجز جديد — ${b.packageTitle} · ${b.name}`,
        html,
      }),
    });
  } catch {
    // non-blocking — booking is already saved
  }
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

  const departTime = String(body.departTime || "").trim();

  // ── Time-range conflict check ───────────────────────────────────────────────
  // Trips must not overlap including a 1-hour cleaning buffer after each trip.
  // Staff (captain/owner) can override via dashboard.
  const isStaff = !!getRole(req);
  const incomingPackageId = String(body.packageId || "");
  const incomingOption = String(body.option || "");
  const incomingDur = Number(body.durationHours) || deriveDuration(incomingPackageId, incomingOption);
  const BUFFER = 1;

  function toH(t: string) { const [h, m] = t.split(":").map(Number); return h + (m || 0) / 60; }

  if (!isStaff && departTime) {
    try {
      const existing = await getBookings();
      const newStart = toH(departTime);
      const newEnd = newStart + incomingDur + BUFFER;

      const conflict = existing.find((b) => {
        if (b.date !== date || b.status === "cancelled" || !b.departTime) return false;
        const bStart = toH(b.departTime);
        const bDur = deriveDuration(b.packageId, b.option);
        const bEnd = bStart + bDur + BUFFER;
        // overlap: [newStart, newEnd) ∩ [bStart, bEnd) ≠ ∅
        return newStart < bEnd && bStart < newEnd;
      });

      if (conflict) {
        const cDur = deriveDuration(conflict.packageId, conflict.option);
        const cEndH = toH(conflict.departTime) + cDur;
        const cEndHHMM = `${String(Math.floor(cEndH)).padStart(2, "0")}:00`;
        return NextResponse.json(
          {
            error: `يوجد تعارض مع رحلة أخرى في هذا اليوم. القارب غير متاح حتى ${cEndHHMM} (+ ساعة تنظيف). يُرجى اختيار وقت آخر.`,
            conflict: true,
          },
          { status: 409 },
        );
      }
    } catch {
      // best-effort — allow through if store read fails
    }
  }
  // ────────────────────────────────────────────────────────────────────────────

  const booking: Booking = {
    id: newId(),
    createdAt: new Date().toISOString(),
    packageId: String(body.packageId || ""),
    packageTitle: String(body.packageTitle || ""),
    option: String(body.option || ""),
    persons: Number(body.persons) || 1,
    addons: Array.isArray(body.addons) ? body.addons.map(String) : [],
    date,
    departTime,
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

  // fire-and-forget email — never blocks the booking response
  void sendBookingNotification(booking);

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
