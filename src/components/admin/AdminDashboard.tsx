"use client";

import { useMemo, useState } from "react";
import type { Booking } from "@/lib/store";

const STATUS_LABEL: Record<Booking["status"], string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  cancelled: "ملغي",
};
const STATUS_CLASS: Record<Booking["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminDashboard() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | Booking["status"]>("all");
  const [editing, setEditing] = useState<Booking | null>(null);

  async function load(u = username, p = password) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings?user=${encodeURIComponent(u)}&password=${encodeURIComponent(p)}`, { cache: "no-store" });
      if (res.status === 401) throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة");
      if (!res.ok) throw new Error("تعذّر تحميل الحجوزات");
      const data = await res.json();
      setBookings(data.bookings ?? []);
      setAuthed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ");
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }

  async function setStatus(id: string, status: Booking["status"]) {
    setBookings((bs) => bs.map((b) => (b.id === id ? { ...b, status } : b)));
    try {
      await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-user": username, "x-admin-password": password },
        body: JSON.stringify({ id, status }),
      });
    } catch {
      /* optimistic; refresh to resync if needed */
    }
  }

  async function saveEdit(updated: Booking) {
    setBookings((bs) => bs.map((b) => (b.id === updated.id ? updated : b)));
    setEditing(null);
    try {
      await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-user": username, "x-admin-password": password },
        body: JSON.stringify({
          id: updated.id, name: updated.name, phone: updated.phone, date: updated.date,
          departTime: updated.departTime, persons: updated.persons, option: updated.option,
          payMethod: updated.payMethod, payType: updated.payType, total: updated.total,
          notes: updated.notes, status: updated.status,
        }),
      });
    } catch {
      /* optimistic */
    }
  }

  const shown = useMemo(
    () => (filter === "all" ? bookings : bookings.filter((b) => b.status === filter)),
    [bookings, filter]
  );
  const revenue = useMemo(() => bookings.reduce((s, b) => s + (b.total || 0), 0), [bookings]);

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-950 px-5">
        <form
          onSubmit={(e) => { e.preventDefault(); load(); }}
          className="w-full max-w-sm rounded-[24px] bg-white p-8 shadow-2xl"
        >
          <div className="mb-2 text-center text-3xl">⚓</div>
          <h1 className="text-center text-2xl font-extrabold text-navy-900">لوحة تحكم سوار البحرية</h1>
          <p className="mt-1 text-center text-sm text-navy-900/55">سجّل الدخول لإدارة الحجوزات</p>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="اسم المستخدم" className="ad-in mt-5" autoComplete="username" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" className="ad-in mt-3" autoComplete="current-password" />
          {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-ocean mt-5 w-full disabled:opacity-60">
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
          <style>{`.ad-in{width:100%;padding:12px 14px;background:#f0f8fb;border:1px solid rgba(11,92,140,.18);border-radius:12px;outline:none}.ad-in:focus{border-color:#21c0c0;background:#e8f6f8}`}</style>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50/40">
      {/* dashboard top bar */}
      <header className="sticky top-0 z-10 border-b border-navy-100 bg-navy-950 text-white">
        <div className="container-px flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚓</span>
            <div>
              <h1 className="text-lg font-extrabold">لوحة تحكم الحجوزات</h1>
              <p className="text-xs text-white/55">سوار البحرية</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => load()} disabled={loading} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold transition-colors hover:bg-white/20 disabled:opacity-60">{loading ? "..." : "تحديث"}</button>
            <button onClick={() => { setAuthed(false); setPassword(""); setBookings([]); }} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold transition-colors hover:bg-white/20">خروج</button>
          </div>
        </div>
      </header>

      <div className="container-px py-8">
        {/* stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="إجمالي الحجوزات" value={String(bookings.length)} />
          <Stat label="قيد الانتظار" value={String(bookings.filter((b) => b.status === "pending").length)} />
          <Stat label="مؤكدة" value={String(bookings.filter((b) => b.status === "confirmed").length)} />
          <Stat label="إجمالي القيمة" value={`${revenue.toLocaleString()} ريال`} />
        </div>

        {/* filters */}
        <div className="mt-6 flex flex-wrap gap-2">
          {(["all", "pending", "confirmed", "cancelled"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${filter === f ? "bg-navy-900 text-white" : "bg-white text-navy-900/70 hover:bg-navy-100"}`}>
              {f === "all" ? "الكل" : STATUS_LABEL[f]}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="mt-8 rounded-[24px] border border-navy-100 bg-white p-12 text-center text-navy-900/50">لا توجد حجوزات.</div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {shown.map((b) => (
              <div key={b.id} className="rounded-[22px] border border-navy-100 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-extrabold text-navy-900">{b.packageTitle}</h3>
                    <p className="font-mono text-xs text-navy-900/45">{b.id}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_CLASS[b.status]}`}>{STATUS_LABEL[b.status]}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <Info label="العميل" value={b.name} />
                  <Info label="الجوال" value={b.phone} ltr />
                  <Info label="التاريخ" value={b.date} ltr />
                  <Info label="وقت الانطلاق" value={b.departTime} ltr />
                  <Info label="عدد الأشخاص" value={String(b.persons)} />
                  <Info label="الخيار" value={b.option || "—"} />
                  <Info label="الدفع" value={b.payMethod === "bank" ? (b.payType === "deposit" ? "تحويل بنكي (مقدّم 50%)" : "تحويل بنكي") : "عند الوصول"} />
                  <Info label="الإجمالي" value={`${b.total.toLocaleString()} ريال`} />
                  {b.payType === "deposit" && b.deposit > 0 && <Info label="المقدّم المطلوب" value={`${b.deposit.toLocaleString()} ريال`} />}
                  {b.promo && <Info label="كود الخصم" value={b.promo} />}
                </div>

                {b.addons.length > 0 && (
                  <p className="mt-3 text-sm"><span className="text-navy-900/50">الإضافات: </span><span className="text-navy-900/80">{b.addons.join("، ")}</span></p>
                )}
                {b.notes && <p className="mt-3 rounded-xl bg-navy-50/60 px-3 py-2 text-sm text-navy-900/70">📝 {b.notes}</p>}
                <div className="mt-4 flex items-center justify-between gap-2 border-t border-navy-100 pt-3">
                  <span className="text-xs text-navy-900/40">{new Date(b.createdAt).toLocaleString("ar-SA")}</span>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setEditing(b)} className="rounded-lg bg-ocean-600 px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90">تعديل</button>
                    {b.status !== "confirmed" && (
                      <button onClick={() => setStatus(b.id, "confirmed")} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90">تأكيد</button>
                    )}
                    {b.status !== "cancelled" && (
                      <button onClick={() => setStatus(b.id, "cancelled")} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90">إلغاء</button>
                    )}
                    {b.status !== "pending" && (
                      <button onClick={() => setStatus(b.id, "pending")} className="rounded-lg bg-navy-100 px-3 py-1.5 text-xs font-bold text-navy-700 transition-colors hover:bg-navy-200">إرجاع</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && <EditModal booking={editing} onClose={() => setEditing(null)} onSave={saveEdit} />}
    </div>
  );
}

function EditModal({ booking, onClose, onSave }: { booking: Booking; onClose: () => void; onSave: (b: Booking) => void }) {
  const [form, setForm] = useState<Booking>(booking);
  const set = <K extends keyof Booking>(k: K, v: Booking[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div onClick={onClose} className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-navy-950/80 p-4 backdrop-blur-md">
      <div onClick={(e) => e.stopPropagation()} className="my-6 w-full max-w-lg rounded-[24px] bg-white p-7 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-navy-900">تعديل الحجز</h3>
          <button onClick={onClose} aria-label="إغلاق" className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-50 text-navy-700">✕</button>
        </div>
        <p className="mt-1 font-mono text-xs text-navy-900/45">{booking.id}</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <EditField label="اسم العميل"><input value={form.name} onChange={(e) => set("name", e.target.value)} className="ed-in" /></EditField>
          <EditField label="رقم الجوال"><input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="ed-in" dir="ltr" /></EditField>
          <EditField label="التاريخ"><input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className="ed-in" /></EditField>
          <EditField label="وقت الانطلاق"><input value={form.departTime} onChange={(e) => set("departTime", e.target.value)} className="ed-in" dir="ltr" /></EditField>
          <EditField label="عدد الأشخاص"><input type="number" min={1} value={form.persons} onChange={(e) => set("persons", Number(e.target.value) || 1)} className="ed-in" /></EditField>
          <EditField label="الإجمالي (ريال)"><input type="number" min={0} value={form.total} onChange={(e) => set("total", Number(e.target.value) || 0)} className="ed-in" /></EditField>
          <EditField label="الخيار / الباقة" full><input value={form.option} onChange={(e) => set("option", e.target.value)} className="ed-in" /></EditField>
          <EditField label="طريقة الدفع">
            <select value={form.payMethod} onChange={(e) => set("payMethod", e.target.value as Booking["payMethod"])} className="ed-in">
              <option value="bank">تحويل بنكي</option>
              <option value="arrival">عند الوصول</option>
            </select>
          </EditField>
          <EditField label="نوع الدفع">
            <select value={form.payType} onChange={(e) => set("payType", e.target.value as Booking["payType"])} className="ed-in">
              <option value="full">كامل</option>
              <option value="deposit">مقدّم 50%</option>
            </select>
          </EditField>
          <EditField label="الحالة" full>
            <select value={form.status} onChange={(e) => set("status", e.target.value as Booking["status"])} className="ed-in">
              <option value="pending">قيد الانتظار</option>
              <option value="confirmed">مؤكد</option>
              <option value="cancelled">ملغي</option>
            </select>
          </EditField>
          <EditField label="ملاحظات" full><textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} className="ed-in resize-none" /></EditField>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={() => onSave(form)} className="btn-ocean flex-1">حفظ التعديلات</button>
          <button onClick={onClose} className="flex-1 rounded-xl bg-navy-50 py-3 font-bold text-navy-700">إلغاء</button>
        </div>
        <style>{`.ed-in{width:100%;padding:11px 13px;background:#f0f8fb;border:1px solid rgba(11,92,140,.18);border-radius:12px;outline:none;font-family:inherit}.ed-in:focus{border-color:#21c0c0;background:#e8f6f8}`}</style>
      </div>
    </div>
  );
}

function EditField({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-sm font-semibold text-navy-900/70">{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-navy-100 bg-white p-5">
      <div className="text-xs text-navy-900/50">{label}</div>
      <div className="mt-1 text-2xl font-extrabold text-navy-900">{value}</div>
    </div>
  );
}

function Info({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="rounded-xl bg-navy-50/50 px-3 py-2">
      <div className="text-xs text-navy-900/45">{label}</div>
      <div className="font-semibold text-navy-900" dir={ltr ? "ltr" : undefined}>{value}</div>
    </div>
  );
}
