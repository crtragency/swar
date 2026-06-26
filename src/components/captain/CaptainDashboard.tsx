"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PACKAGES, DISCOUNT } from "@/lib/packages";
import DashboardBookingForm from "@/components/dashboard/DashboardBookingForm";

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

function todayStr() { return new Date().toISOString().slice(0, 10); }
function tomorrowStr() {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("ar-SA", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
};

export default function CaptainDashboard() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"trips" | "prices" | "new">("trips");

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

  const todayTrips = useMemo(() => trips.filter((t) => t.date === todayStr()), [trips]);
  const tomorrowTrips = useMemo(() => trips.filter((t) => t.date === tomorrowStr()), [trips]);
  const laterTrips = useMemo(() => trips.filter((t) => t.date > tomorrowStr()), [trips]);

  if (!authed) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050e1f] px-5">
        {/* animated sea waves background */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-x-0 rounded-[100%]"
              style={{
                height: "60vh",
                bottom: `${-20 + i * 8}%`,
                background: `rgba(33,192,192,${0.04 - i * 0.01})`,
                border: "1px solid rgba(33,192,192,0.08)",
              }}
              animate={{ y: [0, -12, 0], scale: [1, 1.01, 1] }}
              transition={{ duration: 6 + i * 2, repeat: Infinity, ease: "easeInOut", delay: i * 1.2 }}
            />
          ))}
        </motion.div>

        <motion.form
          onSubmit={(e) => { e.preventDefault(); load(); }}
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-sm rounded-[28px] bg-white/95 p-8 shadow-[0_24px_80px_rgba(0,0,0,.4)] backdrop-blur"
        >
          {/* Logo */}
          <div className="mb-5 flex justify-center">
            <img src="/icon.webp" alt="سوار البحرية" className="h-16 w-auto object-contain" />
          </div>
          <h1 className="text-center text-2xl font-extrabold text-[#0a1628]">لوحة الكابتن</h1>
          <p className="mt-1 text-center text-sm text-[#0a1628]/50">سوار البحرية — جدول الرحلات</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            className="cap-in mt-6"
            autoComplete="current-password"
          />
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm font-semibold text-red-600">
              {error}
            </motion.p>
          )}
          <button type="submit" disabled={loading} className="mt-5 w-full rounded-xl bg-[#0a1628] py-3 font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-50">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="inline-block">⚓</motion.span>
                جاري الدخول...
              </span>
            ) : "دخول"}
          </button>
          <style>{`.cap-in{width:100%;padding:12px 14px;background:#f0f4f8;border:1px solid #cbd5e1;border-radius:12px;outline:none;font-family:inherit;direction:ltr;text-align:center}.cap-in:focus{border-color:#0a1628;background:#e8eef4}`}</style>
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
        className="sticky top-0 z-10 border-b border-slate-800 bg-[#050e1f] text-white shadow-[0_4px_32px_rgba(0,0,0,.5)]"
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <img src="/icon.webp" alt="سوار البحرية" className="h-10 w-auto object-contain" />
            <div>
              <h1 className="text-base font-extrabold leading-none">لوحة الكابتن</h1>
              <p className="mt-0.5 text-xs text-white/40">سوار البحرية</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => load()} disabled={loading} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold transition-colors hover:bg-white/20 disabled:opacity-50">
              {loading ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="inline-block">⟳</motion.span> : "تحديث"}
            </button>
            <button onClick={() => { setAuthed(false); setPassword(""); setTrips([]); }} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold transition-colors hover:bg-white/20">خروج</button>
          </div>
        </div>
        {/* tabs */}
        <div className="mx-auto flex max-w-4xl gap-1 px-5 pb-3">
          {(["trips", "prices", "new"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`relative rounded-t-lg px-5 py-1.5 text-sm font-bold transition-colors ${tab === t ? "text-[#050e1f]" : "text-white/50 hover:text-white"}`}>
              {tab === t && <motion.span layoutId="cap-tab" className="absolute inset-0 rounded-t-lg bg-white" style={{ zIndex: -1 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
              {t === "trips" ? "⚓ الرحلات" : t === "prices" ? "💰 الأسعار" : "➕ حجز جديد"}
            </button>
          ))}
        </div>
      </motion.header>

      <div className="mx-auto max-w-4xl px-5 py-8">
        <AnimatePresence mode="wait">
          {tab === "trips" && (
            <motion.div key="trips" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
              {/* summary pills */}
              <motion.div className="mb-8 grid grid-cols-3 gap-4" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
                {[
                  { label: "رحلات اليوم", value: todayTrips.length, color: "from-emerald-500 to-teal-500" },
                  { label: "رحلات الغد", value: tomorrowTrips.length, color: "from-blue-500 to-cyan-500" },
                  { label: "رحلات لاحقة", value: laterTrips.length, color: "from-slate-400 to-slate-500" },
                ].map((p, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i} className={`rounded-2xl bg-gradient-to-br ${p.color} p-5 text-white shadow-lg`}>
                    <div className="text-3xl font-extrabold">{p.value}</div>
                    <div className="mt-1 text-xs text-white/75">{p.label}</div>
                  </motion.div>
                ))}
              </motion.div>
              <Section title="🌅 رحلات اليوم" trips={todayTrips} emptyMsg="لا توجد رحلات اليوم" highlight startIndex={3} />
              <Section title="🌤️ رحلات الغد" trips={tomorrowTrips} emptyMsg="لا توجد رحلات الغد" startIndex={10} />
              <Section title="📅 رحلات لاحقة" trips={laterTrips} emptyMsg="لا توجد رحلات لاحقة" grouped startIndex={17} />
            </motion.div>
          )}

          {tab === "prices" && (
            <motion.div key="prices" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
              {/* discount banner */}
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="mb-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-400 px-5 py-4 text-white shadow-lg"
              >
                <p className="font-extrabold">🏷️ {DISCOUNT.ar}</p>
                <p className="mt-0.5 text-sm text-white/80">خصم {DISCOUNT.pct}% مطبّق على الأسعار الظاهرة</p>
              </motion.div>

              <motion.div className="grid gap-4 sm:grid-cols-2" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
                {PACKAGES.map((pkg, i) => (
                  <motion.div key={pkg.id} variants={fadeUp} custom={i}
                    whileHover={{ y: -3, boxShadow: "0 12px 40px rgba(0,0,0,.10)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className="rounded-2xl bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xl">{pkg.emoji}</p>
                        <p className="mt-1 font-extrabold text-slate-800">{pkg.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{pkg.subtitle}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-slate-400 line-through">{pkg.oldPrice.toLocaleString()} ريال</p>
                        <p className="text-xl font-extrabold text-emerald-600">{pkg.price.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">{pkg.unit}</p>
                      </div>
                    </div>

                    {/* rows (durations) */}
                    {pkg.rows && pkg.rows.length > 1 && (
                      <div className="mt-3 space-y-1.5">
                        {pkg.rows.map((r, ri) => (
                          <div key={ri} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                            <span className="text-slate-600">{r.label}</span>
                            <span className="font-bold text-slate-800">{r.price.toLocaleString()} ريال</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* tiers (party) */}
                    {pkg.tiers && (
                      <div className="mt-3 space-y-1.5">
                        {pkg.tiers.map((tier, ti) => (
                          <div key={ti} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                            <span className="text-slate-600">{tier.name} — {tier.note}</span>
                            <span className="font-bold text-slate-800">{tier.price.toLocaleString()} ريال</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* addons */}
                    {pkg.addons && (
                      <div className="mt-3">
                        <p className="mb-1.5 text-xs font-bold text-slate-400">الإضافات</p>
                        <div className="flex flex-wrap gap-1.5">
                          {pkg.addons.map((a) => (
                            <span key={a.id} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                              {a.label} — <strong>{a.price.toLocaleString()} ريال</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                      <span>👥 {pkg.capacity}</span>
                      <span>⏱️ {pkg.baseDuration}</span>
                      {pkg.extraPerPerson && <span>➕ {pkg.extraPerPerson} ريال/شخص إضافي</span>}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {tab === "new" && (
            <motion.div key="new" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
              <DashboardBookingForm />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Section({ title, trips, emptyMsg, highlight, grouped, startIndex }: {
  title: string; trips: Trip[]; emptyMsg: string; highlight?: boolean; grouped?: boolean; startIndex: number;
}) {
  if (!grouped) {
    return (
      <div className="mb-10">
        <motion.h2
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: startIndex * 0.06 }}
          className={`mb-4 text-lg font-extrabold ${highlight ? "text-emerald-700" : "text-slate-700"}`}
        >
          {title}
        </motion.h2>
        {trips.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: startIndex * 0.06 + 0.1 }}
            className="rounded-2xl bg-white p-5 text-center text-sm text-slate-400 shadow-sm"
          >
            {emptyMsg}
          </motion.p>
        ) : (
          <motion.div
            className="grid gap-4"
            initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.09 } } }}
          >
            {trips.map((t, i) => <TripCard key={t.id} trip={t} index={startIndex + i} />)}
          </motion.div>
        )}
      </div>
    );
  }

  const byDate = trips.reduce<Record<string, Trip[]>>((acc, t) => {
    (acc[t.date] ??= []).push(t);
    return acc;
  }, {});

  return (
    <div className="mb-10">
      <motion.h2
        initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: startIndex * 0.06 }}
        className="mb-4 text-lg font-extrabold text-slate-700"
      >
        {title}
      </motion.h2>
      {trips.length === 0 ? (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: startIndex * 0.06 + 0.1 }}
          className="rounded-2xl bg-white p-5 text-center text-sm text-slate-400 shadow-sm">{emptyMsg}</motion.p>
      ) : (
        Object.entries(byDate).map(([date, ts], gi) => (
          <div key={date} className="mb-6">
            <motion.h3
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: (startIndex + gi * 3) * 0.06 }}
              className="mb-3 text-sm font-bold text-slate-400"
            >
              {formatDate(date)}
            </motion.h3>
            <motion.div className="grid gap-4" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.09 } } }}>
              {ts.map((t, i) => <TripCard key={t.id} trip={t} index={startIndex + gi * 3 + i} />)}
            </motion.div>
          </div>
        ))
      )}
    </div>
  );
}

function TripCard({ trip: t, index }: { trip: Trip; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      whileHover={{ y: -3, boxShadow: "0 12px 40px rgba(0,0,0,.10)" }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`rounded-2xl bg-white p-5 shadow-sm ${t.status === "confirmed" ? "border-r-4 border-emerald-400" : "border-r-4 border-amber-400"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="font-extrabold text-slate-800">{t.packageTitle}</p>
          {t.option && <p className="mt-0.5 text-sm text-slate-500">{t.option}</p>}
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_CLASS[t.status]}`}>{STATUS_LABEL[t.status]}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <InfoCell icon="🕐" label="وقت الانطلاق" value={t.departTime || "—"} />
        <InfoCell icon="👥" label="عدد الأشخاص" value={String(t.persons)} />
        <InfoCell icon="👤" label="اسم العميل" value={t.name} />
        <InfoCell icon="📞" label="الجوال" value={t.phone} ltr />
      </div>

      {t.addons.length > 0 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm">
          <span className="text-slate-400">إضافات: </span>
          <span className="text-slate-700">{t.addons.join("، ")}</span>
        </motion.p>
      )}

      {t.notes && (
        <button
          onClick={() => setOpen(!open)}
          className="mt-2 w-full rounded-xl bg-amber-50 px-3 py-2 text-right text-sm text-amber-700 transition-colors hover:bg-amber-100"
        >
          📝{" "}
          <AnimatePresence mode="wait">
            <motion.span key={open ? "open" : "closed"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {open ? t.notes : "ملاحظات — اضغط للعرض"}
            </motion.span>
          </AnimatePresence>
        </button>
      )}
    </motion.div>
  );
}

function InfoCell({ icon, label, value, ltr }: { icon: string; label: string; value: string; ltr?: boolean }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <div className="text-xs text-slate-400">{icon} {label}</div>
      <div className="mt-0.5 font-semibold text-slate-800" dir={ltr ? "ltr" : undefined}>{value}</div>
    </div>
  );
}
