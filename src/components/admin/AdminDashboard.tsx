"use client";

import { useState } from "react";
import type { Booking } from "@/lib/store";

const STATUS_LABEL: Record<Booking["status"], string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  cancelled: "ملغي",
};
const STATUS_CLASS: Record<Booking["status"], string> = {
  pending: "bg-gold-400/15 text-gold-600",
  confirmed: "bg-emerald-500/15 text-emerald-600",
  cancelled: "bg-red-500/15 text-red-600",
};

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load(pw = password) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings?password=${encodeURIComponent(pw)}`, { cache: "no-store" });
      if (res.status === 401) throw new Error("كلمة المرور غير صحيحة");
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

  if (!authed) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-5">
        <form
          onSubmit={(e) => { e.preventDefault(); load(); }}
          className="w-full max-w-sm rounded-[24px] border border-navy-50 bg-white p-8 shadow-luxe"
        >
          <h1 className="text-2xl font-extrabold text-navy-900">لوحة تحكم الحجوزات</h1>
          <p className="mt-1 text-sm text-navy-900/55">أدخل كلمة المرور للوصول إلى الحجوزات.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            className="mt-5 w-full rounded-xl border border-ocean-500/20 bg-navy-50/50 px-4 py-3 outline-none focus:border-turquoise-500"
          />
          {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-ocean mt-5 w-full disabled:opacity-60">
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container-px py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-navy-900">الحجوزات</h1>
          <p className="text-sm text-navy-900/55">إجمالي {bookings.length} حجز</p>
        </div>
        <button onClick={() => load()} disabled={loading} className="btn-gold text-sm disabled:opacity-60">
          {loading ? "..." : "تحديث"}
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="mt-10 rounded-[24px] border border-navy-50 bg-white p-12 text-center text-navy-900/50">
          لا توجد حجوزات بعد.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {bookings.map((b) => (
            <div key={b.id} className="rounded-[22px] border border-navy-50 bg-white p-6 shadow-sm">
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
                <Info label="الدفع" value={b.payMethod === "bank" ? "تحويل بنكي" : "عند الوصول"} />
                <Info label="الإجمالي" value={`${b.total.toLocaleString()} ريال`} />
              </div>

              {b.addons.length > 0 && (
                <div className="mt-3">
                  <span className="text-xs text-navy-900/50">الإضافات: </span>
                  <span className="text-sm text-navy-900/80">{b.addons.join("، ")}</span>
                </div>
              )}
              {b.notes && (
                <p className="mt-3 rounded-xl bg-navy-50/60 px-3 py-2 text-sm text-navy-900/70">📝 {b.notes}</p>
              )}
              <p className="mt-3 text-xs text-navy-900/40">{new Date(b.createdAt).toLocaleString("ar-SA")}</p>
            </div>
          ))}
        </div>
      )}
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
