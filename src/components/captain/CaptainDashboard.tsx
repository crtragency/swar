"use client";

import { useMemo, useState } from "react";

type Trip = {
  id: string;
  packageTitle: string;
  option: string;
  persons: number;
  addons: string[];
  date: string;
  departTime: string;
  name: string;
  phone: string;
  notes: string;
  status: "pending" | "confirmed" | "cancelled";
};

const STATUS_LABEL: Record<Trip["status"], string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  cancelled: "ملغي",
};
const STATUS_CLASS: Record<Trip["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

function today() { return new Date().toISOString().slice(0, 10); }
function tomorrow() {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export default function CaptainDashboard() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load(pass = password) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings?user=captain&password=${encodeURIComponent(pass)}`, { cache: "no-store" });
      if (res.status === 401) throw new Error("كلمة المرور غير صحيحة");
      if (!res.ok) throw new Error("تعذّر تحميل الرحلات");
      const data = await res.json();
      setTrips(data.bookings ?? []);
      setAuthed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ");
    } finally {
      setLoading(false);
    }
  }

  const todayTrips = useMemo(() => trips.filter((t) => t.date === today()), [trips]);
  const tomorrowTrips = useMemo(() => trips.filter((t) => t.date === tomorrow()), [trips]);
  const laterTrips = useMemo(() => trips.filter((t) => t.date > tomorrow()), [trips]);

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1628] px-5">
        <form
          onSubmit={(e) => { e.preventDefault(); load(); }}
          className="w-full max-w-sm rounded-[24px] bg-white p-8 shadow-2xl"
        >
          <div className="mb-2 text-center text-4xl">⚓</div>
          <h1 className="text-center text-2xl font-extrabold text-[#0a1628]">لوحة الكابتن</h1>
          <p className="mt-1 text-center text-sm text-[#0a1628]/55">سوار البحرية — جدول الرحلات</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            className="cap-in mt-6"
            autoComplete="current-password"
          />
          {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="mt-5 w-full rounded-xl bg-[#0a1628] py-3 font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-50">
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
          <style>{`.cap-in{width:100%;padding:12px 14px;background:#f0f4f8;border:1px solid #cbd5e1;border-radius:12px;outline:none;font-family:inherit}.cap-in:focus{border-color:#0a1628}`}</style>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-[#0a1628] text-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚓</span>
            <div>
              <h1 className="text-lg font-extrabold">لوحة الكابتن</h1>
              <p className="text-xs text-white/50">سوار البحرية — جدول الرحلات القادمة</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => load()} disabled={loading} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20 disabled:opacity-50">{loading ? "..." : "تحديث"}</button>
            <button onClick={() => { setAuthed(false); setPassword(""); setTrips([]); }} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20">خروج</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-8">
        {/* summary pills */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <Pill label="رحلات اليوم" value={todayTrips.length} color="bg-emerald-500" />
          <Pill label="رحلات الغد" value={tomorrowTrips.length} color="bg-blue-500" />
          <Pill label="رحلات لاحقة" value={laterTrips.length} color="bg-slate-400" />
        </div>

        <Section title="🌅 رحلات اليوم" trips={todayTrips} emptyMsg="لا توجد رحلات اليوم" highlight />
        <Section title="🌤️ رحلات الغد" trips={tomorrowTrips} emptyMsg="لا توجد رحلات الغد" />
        <Section title="📅 رحلات لاحقة" trips={laterTrips} emptyMsg="لا توجد رحلات لاحقة" grouped />
      </div>
    </div>
  );
}

function Pill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
      <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full ${color} text-lg font-extrabold text-white`}>{value}</div>
      <div className="text-xs font-semibold text-slate-500">{label}</div>
    </div>
  );
}

function Section({ title, trips, emptyMsg, highlight, grouped }: {
  title: string; trips: Trip[]; emptyMsg: string; highlight?: boolean; grouped?: boolean;
}) {
  if (!grouped) {
    return (
      <div className="mb-8">
        <h2 className={`mb-4 text-lg font-extrabold ${highlight ? "text-emerald-700" : "text-slate-700"}`}>{title}</h2>
        {trips.length === 0 ? (
          <p className="rounded-2xl bg-white p-5 text-center text-sm text-slate-400 shadow-sm">{emptyMsg}</p>
        ) : (
          <div className="grid gap-4">
            {trips.map((t) => <TripCard key={t.id} trip={t} />)}
          </div>
        )}
      </div>
    );
  }

  // group by date
  const byDate = trips.reduce<Record<string, Trip[]>>((acc, t) => {
    (acc[t.date] ??= []).push(t);
    return acc;
  }, {});

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-lg font-extrabold text-slate-700">{title}</h2>
      {trips.length === 0 ? (
        <p className="rounded-2xl bg-white p-5 text-center text-sm text-slate-400 shadow-sm">{emptyMsg}</p>
      ) : (
        Object.entries(byDate).map(([date, ts]) => (
          <div key={date} className="mb-6">
            <h3 className="mb-3 text-sm font-bold text-slate-500">{formatDate(date)}</h3>
            <div className="grid gap-4">{ts.map((t) => <TripCard key={t.id} trip={t} />)}</div>
          </div>
        ))
      )}
    </div>
  );
}

function TripCard({ trip: t }: { trip: Trip }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl bg-white p-5 shadow-sm ${t.status === "confirmed" ? "border-r-4 border-emerald-400" : "border-r-4 border-amber-400"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="font-extrabold text-slate-800">{t.packageTitle}</p>
          {t.option && <p className="mt-0.5 text-sm text-slate-500">{t.option}</p>}
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_CLASS[t.status]}`}>{STATUS_LABEL[t.status]}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Info icon="🕐" label="وقت الانطلاق" value={t.departTime || "—"} />
        <Info icon="👥" label="عدد الأشخاص" value={String(t.persons)} />
        <Info icon="👤" label="اسم العميل" value={t.name} />
        <Info icon="📞" label="الجوال" value={t.phone} ltr />
      </div>

      {t.addons.length > 0 && (
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm">
          <span className="text-slate-400">إضافات: </span>
          <span className="text-slate-700">{t.addons.join("، ")}</span>
        </p>
      )}

      {t.notes && (
        <button onClick={() => setOpen(!open)} className="mt-2 w-full rounded-xl bg-amber-50 px-3 py-2 text-right text-sm text-amber-700 hover:bg-amber-100">
          📝 {open ? t.notes : "ملاحظات (اضغط للعرض)"}
        </button>
      )}
    </div>
  );
}

function Info({ icon, label, value, ltr }: { icon: string; label: string; value: string; ltr?: boolean }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <div className="text-xs text-slate-400">{icon} {label}</div>
      <div className="mt-0.5 font-semibold text-slate-800" dir={ltr ? "ltr" : undefined}>{value}</div>
    </div>
  );
}
