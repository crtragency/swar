"use client";

import { useMemo, useState } from "react";
import type { Booking } from "@/lib/store";

function thisMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function lastMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function today() { return new Date().toISOString().slice(0, 10); }

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

function fmt(n: number) { return n.toLocaleString("ar-SA"); }

export default function OwnerDashboard() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "bookings">("overview");

  async function load(pass = password) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings?user=owner&password=${encodeURIComponent(pass)}`, { cache: "no-store" });
      if (res.status === 401) throw new Error("كلمة المرور غير صحيحة");
      if (!res.ok) throw new Error("تعذّر تحميل البيانات");
      const data = await res.json();
      setBookings(data.bookings ?? []);
      setAuthed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ");
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const cm = thisMonth();
    const lm = lastMonth();
    const td = today();
    const confirmed = bookings.filter((b) => b.status === "confirmed");
    const pending = bookings.filter((b) => b.status === "pending");
    const cancelled = bookings.filter((b) => b.status === "cancelled");
    const totalRevenue = confirmed.reduce((s, b) => s + b.total, 0);
    const thisMonthRevenue = confirmed.filter((b) => b.date.startsWith(cm)).reduce((s, b) => s + b.total, 0);
    const lastMonthRevenue = confirmed.filter((b) => b.date.startsWith(lm)).reduce((s, b) => s + b.total, 0);
    const todayRevenue = confirmed.filter((b) => b.date === td).reduce((s, b) => s + b.total, 0);
    const cash = confirmed.filter((b) => b.payMethod === "arrival").reduce((s, b) => s + b.total, 0);
    const bank = confirmed.filter((b) => b.payMethod === "bank").reduce((s, b) => s + b.total, 0);
    const pendingRevenue = pending.reduce((s, b) => s + b.total, 0);

    // revenue by package
    const byPkg: Record<string, number> = {};
    confirmed.forEach((b) => {
      byPkg[b.packageTitle] = (byPkg[b.packageTitle] ?? 0) + b.total;
    });
    const pkgList = Object.entries(byPkg).sort((a, b) => b[1] - a[1]);

    return {
      total: bookings.length,
      confirmed: confirmed.length,
      pending: pending.length,
      cancelled: cancelled.length,
      totalRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      todayRevenue,
      cash,
      bank,
      pendingRevenue,
      pkgList,
    };
  }, [bookings]);

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a0a2e] px-5">
        <form
          onSubmit={(e) => { e.preventDefault(); load(); }}
          className="w-full max-w-sm rounded-[24px] bg-white p-8 shadow-2xl"
        >
          <div className="mb-2 text-center text-4xl">👑</div>
          <h1 className="text-center text-2xl font-extrabold text-[#1a0a2e]">لوحة المالك</h1>
          <p className="mt-1 text-center text-sm text-[#1a0a2e]/55">سوار البحرية — الإيرادات والحجوزات</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            className="own-in mt-6"
            autoComplete="current-password"
          />
          {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="mt-5 w-full rounded-xl bg-[#1a0a2e] py-3 font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-50">
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
          <style>{`.own-in{width:100%;padding:12px 14px;background:#f5f0ff;border:1px solid #c4b5fd;border-radius:12px;outline:none;font-family:inherit}.own-in:focus{border-color:#7c3aed}`}</style>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-[#1a0a2e] text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <h1 className="text-lg font-extrabold">لوحة المالك</h1>
              <p className="text-xs text-white/50">سوار البحرية — الإيرادات والحجوزات</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => load()} disabled={loading} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20 disabled:opacity-50">{loading ? "..." : "تحديث"}</button>
            <button onClick={() => { setAuthed(false); setPassword(""); setBookings([]); }} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20">خروج</button>
          </div>
        </div>
        <div className="mx-auto flex max-w-5xl gap-1 px-5 pb-3">
          <TabBtn active={tab === "overview"} onClick={() => setTab("overview")}>نظرة عامة</TabBtn>
          <TabBtn active={tab === "bookings"} onClick={() => setTab("bookings")}>جميع الحجوزات</TabBtn>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8">
        {tab === "overview" && (
          <>
            {/* revenue cards */}
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">الإيرادات (مؤكدة فقط)</h2>
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <RevCard label="إجمالي الإيرادات" value={`${fmt(stats.totalRevenue)} ريال`} sub={`${stats.confirmed} حجز مؤكد`} color="bg-purple-600" />
              <RevCard label="هذا الشهر" value={`${fmt(stats.thisMonthRevenue)} ريال`} color="bg-violet-500" />
              <RevCard label="الشهر الماضي" value={`${fmt(stats.lastMonthRevenue)} ريال`} color="bg-indigo-500" />
              <RevCard label="اليوم" value={`${fmt(stats.todayRevenue)} ريال`} color="bg-blue-500" />
            </div>

            {/* booking counts */}
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">إحصاءات الحجوزات</h2>
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="إجمالي الحجوزات" value={stats.total} />
              <StatCard label="مؤكدة" value={stats.confirmed} color="text-emerald-600" />
              <StatCard label="قيد الانتظار" value={stats.pending} color="text-amber-600" sub={`${fmt(stats.pendingRevenue)} ريال`} />
              <StatCard label="ملغية" value={stats.cancelled} color="text-red-500" />
            </div>

            {/* payment methods */}
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">طرق الدفع (مؤكدة)</h2>
            <div className="mb-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="text-xs text-slate-400">💳 تحويل بنكي</div>
                <div className="mt-1 text-2xl font-extrabold text-slate-800">{fmt(stats.bank)} ريال</div>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="text-xs text-slate-400">💵 عند الوصول (كاش)</div>
                <div className="mt-1 text-2xl font-extrabold text-slate-800">{fmt(stats.cash)} ريال</div>
              </div>
            </div>

            {/* revenue by package */}
            {stats.pkgList.length > 0 && (
              <>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">الإيرادات حسب الباقة</h2>
                <div className="rounded-2xl bg-white shadow-sm">
                  {stats.pkgList.map(([pkg, rev], i) => {
                    const pct = stats.totalRevenue ? Math.round((rev / stats.totalRevenue) * 100) : 0;
                    return (
                      <div key={pkg} className={`flex items-center gap-4 px-5 py-4 ${i < stats.pkgList.length - 1 ? "border-b border-slate-100" : ""}`}>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-800">{pkg}</div>
                          <div className="mt-1 h-2 rounded-full bg-slate-100">
                            <div className="h-2 rounded-full bg-purple-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-extrabold text-slate-800">{fmt(rev)} ريال</div>
                          <div className="text-xs text-slate-400">{pct}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {tab === "bookings" && (
          <>
            <h2 className="mb-4 text-lg font-extrabold text-slate-700">جميع الحجوزات ({bookings.length})</h2>
            {bookings.length === 0 ? (
              <p className="rounded-2xl bg-white p-8 text-center text-slate-400 shadow-sm">لا توجد حجوزات</p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {bookings.map((b) => (
                  <div key={b.id} className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-extrabold text-slate-800">{b.packageTitle}</p>
                        <p className="font-mono text-xs text-slate-400">{b.id}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_CLASS[b.status]}`}>{STATUS_LABEL[b.status]}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <BInfo label="العميل" value={b.name} />
                      <BInfo label="الجوال" value={b.phone} ltr />
                      <BInfo label="التاريخ" value={b.date} ltr />
                      <BInfo label="الانطلاق" value={b.departTime || "—"} ltr />
                      <BInfo label="الأشخاص" value={String(b.persons)} />
                      <BInfo label="الإجمالي" value={`${fmt(b.total)} ريال`} />
                      <BInfo label="الدفع" value={b.payMethod === "bank" ? "تحويل بنكي" : "كاش عند الوصول"} />
                      {b.payType === "deposit" && <BInfo label="المقدّم" value={`${fmt(b.deposit)} ريال`} />}
                    </div>
                    {b.notes && <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">📝 {b.notes}</p>}
                    <p className="mt-3 text-xs text-slate-400">{new Date(b.createdAt).toLocaleString("ar-SA")}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TabBtn({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`rounded-t-lg px-4 py-1.5 text-sm font-bold transition-colors ${active ? "bg-white text-[#1a0a2e]" : "text-white/60 hover:text-white"}`}>
      {children}
    </button>
  );
}

function RevCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className={`rounded-2xl p-5 text-white ${color}`}>
      <div className="text-xs text-white/70">{label}</div>
      <div className="mt-1 text-xl font-extrabold leading-tight">{value}</div>
      {sub && <div className="mt-1 text-xs text-white/70">{sub}</div>}
    </div>
  );
}

function StatCard({ label, value, color = "text-slate-800", sub }: { label: string; value: number; color?: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`mt-1 text-3xl font-extrabold ${color}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

function BInfo({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="font-semibold text-slate-800" dir={ltr ? "ltr" : undefined}>{value}</div>
    </div>
  );
}
