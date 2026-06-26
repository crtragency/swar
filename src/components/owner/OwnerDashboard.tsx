"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Booking } from "@/lib/store";

function thisMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function lastMonth() {
  const d = new Date(); d.setMonth(d.getMonth() - 1);
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

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

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
    const byPkg: Record<string, number> = {};
    confirmed.forEach((b) => { byPkg[b.packageTitle] = (byPkg[b.packageTitle] ?? 0) + b.total; });
    const pkgList = Object.entries(byPkg).sort((a, b) => b[1] - a[1]);
    return { total: bookings.length, confirmed: confirmed.length, pending: pending.length, cancelled: cancelled.length, totalRevenue, thisMonthRevenue, lastMonthRevenue, todayRevenue, cash, bank, pendingRevenue, pkgList };
  }, [bookings]);

  if (!authed) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5" style={{ background: "linear-gradient(160deg,#020d18 0%,#051e30 45%,#082840 100%)" }}>
        {/* animated ocean glow layers */}
        <motion.div className="pointer-events-none absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
          {/* soft teal glow */}
          <motion.div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 80% 60% at 50% 70%, rgba(13,148,136,0.18) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* gold accent top-right */}
          <motion.div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 50% 40% at 85% 15%, rgba(202,153,60,0.10) 0%, transparent 60%)" }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          {/* floating light dots */}
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-teal-300/20"
              style={{ width: 3 + (i % 3), height: 3 + (i % 3), left: `${10 + i * 12}%`, top: `${15 + (i % 4) * 18}%` }}
              animate={{ y: [-16, 16, -16], opacity: [0.15, 0.5, 0.15] }}
              transition={{ duration: 5 + i * 0.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
            />
          ))}
          {/* horizontal shimmer line */}
          <motion.div
            className="absolute left-0 right-0 h-px"
            style={{ top: "55%", background: "linear-gradient(90deg, transparent, rgba(13,148,136,0.25), transparent)" }}
            animate={{ scaleX: [0.6, 1.2, 0.6], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.form
          onSubmit={(e) => { e.preventDefault(); load(); }}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-sm rounded-[28px] bg-white p-8 shadow-[0_32px_80px_rgba(0,0,0,.6),0_0_0_1px_rgba(13,148,136,0.15)] backdrop-blur"
        >
          <div className="mb-5 flex justify-center">
            <img src="/icon.webp" alt="سوار البحرية" className="h-16 w-auto object-contain" />
          </div>
          <h1 className="text-center text-2xl font-extrabold text-[#1a0a2e]">لوحة المالك</h1>
          <p className="mt-1 text-center text-sm text-[#1a0a2e]/50">سوار البحرية — الإيرادات والحجوزات</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            className="own-in mt-6"
            autoComplete="current-password"
          />
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm font-semibold text-red-600">
              {error}
            </motion.p>
          )}
          <button type="submit" disabled={loading} className="mt-5 w-full rounded-xl bg-[#1a0a2e] py-3 font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-50">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="inline-block">👑</motion.span>
                جاري الدخول...
              </span>
            ) : "دخول"}
          </button>
          <style>{`.own-in{width:100%;padding:12px 14px;background:#f5f0ff;border:1px solid #c4b5fd;border-radius:12px;outline:none;font-family:inherit;direction:ltr;text-align:center}.own-in:focus{border-color:#7c3aed;background:#ede9fe}`}</style>
        </motion.form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* header */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-10 text-white shadow-[0_4px_32px_rgba(0,0,0,.5)]" style={{ background: "linear-gradient(135deg,#020d18,#051e30)" }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <img src="/icon.webp" alt="سوار البحرية" className="h-10 w-auto object-contain" />
            <div>
              <h1 className="text-base font-extrabold leading-none">لوحة المالك</h1>
              <p className="mt-0.5 text-xs text-white/40">سوار البحرية — الإيرادات والتقارير</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => load()} disabled={loading} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold transition-colors hover:bg-white/20 disabled:opacity-50">
              {loading ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="inline-block">⟳</motion.span> : "تحديث"}
            </button>
            <button onClick={() => { setAuthed(false); setPassword(""); setBookings([]); }} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold transition-colors hover:bg-white/20">خروج</button>
          </div>
        </div>
        {/* tabs */}
        <div className="mx-auto flex max-w-5xl gap-1 px-5 pb-3">
          {(["overview", "bookings"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative rounded-t-lg px-5 py-1.5 text-sm font-bold transition-colors ${tab === t ? "text-[#1a0a2e]" : "text-white/50 hover:text-white"}`}
            >
              {tab === t && (
                <motion.span layoutId="owner-tab-bg" className="absolute inset-0 rounded-t-lg bg-white" style={{ zIndex: -1 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
              {t === "overview" ? "نظرة عامة" : `جميع الحجوزات (${bookings.length})`}
            </button>
          ))}
        </div>
      </motion.header>

      <div className="mx-auto max-w-5xl px-5 py-8">
        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              {/* revenue cards */}
              <Label>الإيرادات (مؤكدة فقط)</Label>
              <motion.div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
                {[
                  { label: "إجمالي الإيرادات", value: `${fmt(stats.totalRevenue)} ريال`, sub: `${stats.confirmed} حجز مؤكد`, grad: "from-purple-600 to-violet-700" },
                  { label: "هذا الشهر", value: `${fmt(stats.thisMonthRevenue)} ريال`, grad: "from-violet-500 to-purple-600" },
                  { label: "الشهر الماضي", value: `${fmt(stats.lastMonthRevenue)} ريال`, grad: "from-indigo-500 to-violet-600" },
                  { label: "اليوم", value: `${fmt(stats.todayRevenue)} ريال`, grad: "from-blue-500 to-indigo-600" },
                ].map((c, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i} whileHover={{ y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`rounded-2xl bg-gradient-to-br ${c.grad} p-5 text-white shadow-lg`}>
                    <div className="text-xs text-white/70">{c.label}</div>
                    <div className="mt-1 text-xl font-extrabold leading-tight">{c.value}</div>
                    {c.sub && <div className="mt-1 text-xs text-white/60">{c.sub}</div>}
                  </motion.div>
                ))}
              </motion.div>

              {/* booking counts */}
              <Label>إحصاءات الحجوزات</Label>
              <motion.div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
                {[
                  { label: "إجمالي الحجوزات", value: stats.total, color: "text-slate-800" },
                  { label: "مؤكدة", value: stats.confirmed, color: "text-emerald-600" },
                  { label: "قيد الانتظار", value: stats.pending, color: "text-amber-600", sub: `${fmt(stats.pendingRevenue)} ريال` },
                  { label: "ملغية", value: stats.cancelled, color: "text-red-500" },
                ].map((c, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i + 4} whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="text-xs text-slate-400">{c.label}</div>
                    <div className={`mt-1 text-3xl font-extrabold ${c.color}`}>{c.value}</div>
                    {c.sub && <div className="mt-0.5 text-xs text-slate-400">{c.sub}</div>}
                  </motion.div>
                ))}
              </motion.div>

              {/* payment methods */}
              <Label>طرق الدفع (مؤكدة)</Label>
              <motion.div className="mb-8 grid grid-cols-2 gap-4" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
                {[
                  { icon: "💳", label: "تحويل بنكي", value: stats.bank },
                  { icon: "💵", label: "عند الوصول (كاش)", value: stats.cash },
                ].map((p, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i + 8} whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="text-xs text-slate-400">{p.icon} {p.label}</div>
                    <div className="mt-1 text-2xl font-extrabold text-slate-800">{fmt(p.value)} ريال</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* revenue by package */}
              {stats.pkgList.length > 0 && (
                <>
                  <Label>الإيرادات حسب الباقة</Label>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm"
                  >
                    {stats.pkgList.map(([pkg, rev], i) => {
                      const pct = stats.totalRevenue ? Math.round((rev / stats.totalRevenue) * 100) : 0;
                      return (
                        <motion.div
                          key={pkg}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.35 + i * 0.07 }}
                          className={`flex items-center gap-4 px-5 py-4 ${i < stats.pkgList.length - 1 ? "border-b border-slate-100" : ""}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-semibold text-slate-800">{pkg}</div>
                            <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100">
                              <motion.div
                                className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-violet-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, delay: 0.4 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                              />
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-extrabold text-slate-800">{fmt(rev)} ريال</div>
                            <div className="text-xs text-slate-400">{pct}%</div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </motion.div>
          )}

          {tab === "bookings" && (
            <motion.div key="bookings" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              {bookings.length === 0 ? (
                <p className="rounded-2xl bg-white p-8 text-center text-slate-400 shadow-sm">لا توجد حجوزات</p>
              ) : (
                <motion.div className="grid gap-4 lg:grid-cols-2" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
                  {bookings.map((b, i) => (
                    <motion.div
                      key={b.id}
                      variants={fadeUp}
                      custom={i}
                      whileHover={{ y: -3, boxShadow: "0 12px 40px rgba(0,0,0,.09)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 24 }}
                      className="rounded-2xl bg-white p-5 shadow-sm"
                    >
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
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">{children}</p>;
}

function BInfo({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="font-semibold text-slate-800" dir={ltr ? "ltr" : undefined}>{value}</div>
    </div>
  );
}
