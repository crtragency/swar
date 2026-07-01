"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ScheduleTrip = {
  id: string;
  date: string;
  departTime: string;
  packageTitle: string;
  name: string;
  phone?: string;
  persons?: number;
  status: "pending" | "confirmed" | "cancelled";
};

/* ── helpers ─────────────────────────────────────────────────────────── */
export function fmt12h(t: string) {
  if (!t || !t.includes(":")) return "—";
  const [h, m] = t.split(":").map(Number);
  const period = h < 12 ? "ص" : "م";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mm = m ? `:${String(m).padStart(2, "0")}` : "";
  return `${h12}${mm} ${period}`;
}

function toISO(d: Date) { return d.toISOString().slice(0, 10); }
function todayISO() { return new Date().toISOString().slice(0, 10); }

function getWeekSunday(ref: Date) {
  const d = new Date(ref);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(d: Date, n: number) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}
function formatDateAr(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("ar-SA", {
    weekday: "long", month: "long", day: "numeric",
  });
}

const DAY_SHORT = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

const HOUR_START = 6;
const HOUR_END = 23;
const HOUR_H = 58; // px per hour slot

const STATUS_COLORS: Record<ScheduleTrip["status"], { bg: string; ring: string; dot: string }> = {
  confirmed: { bg: "bg-emerald-500", ring: "ring-emerald-400", dot: "bg-emerald-400" },
  pending:   { bg: "bg-slate-500",   ring: "ring-slate-400",   dot: "bg-slate-400" },
  cancelled: { bg: "bg-red-500/60",  ring: "ring-red-400",     dot: "bg-red-400" },
};
const STATUS_AR: Record<ScheduleTrip["status"], string> = {
  confirmed: "مؤكد", pending: "قيد الانتظار", cancelled: "ملغي",
};

/* ── component ──────────────────────────────────────────────────────── */
export default function TripSchedule({ trips }: { trips: ScheduleTrip[] }) {
  const [weekRef, setWeekRef] = useState(() => new Date());
  const [selected, setSelected] = useState<ScheduleTrip | null>(null);
  const [view, setView] = useState<"calendar" | "list">("calendar");

  const sunday = useMemo(() => getWeekSunday(weekRef), [weekRef]);
  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(sunday, i)),
    [sunday]
  );

  const today = todayISO();

  /* upcoming sorted */
  const upcoming = useMemo(() =>
    [...trips]
      .filter((t) => t.status !== "cancelled" && t.date >= today)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.departTime || "").localeCompare(b.departTime || "");
      }),
    [trips, today]
  );

  /* trips by day for calendar */
  const byDay = useMemo(() => {
    const m: Record<string, ScheduleTrip[]> = {};
    for (const t of trips) { (m[t.date] ??= []).push(t); }
    return m;
  }, [trips]);

  const hours = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i);

  function toH(t: string) {
    if (!t) return -1;
    const [h, m] = t.split(":").map(Number);
    return h + (m || 0) / 60;
  }

  /* ── render ── */
  return (
    <div dir="rtl">
      {/* ── top controls ── */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {/* view toggle */}
        <div className="flex rounded-xl overflow-hidden border border-slate-200">
          {(["calendar", "list"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-5 py-2 text-sm font-bold transition-colors ${view === v ? "bg-[#0e1c2f] text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
              {v === "calendar" ? "📅 الجدول الأسبوعي" : "📋 القادمة"}
            </button>
          ))}
        </div>

        {view === "calendar" && (
          <div className="flex items-center gap-2 mr-auto">
            <button onClick={() => setWeekRef(new Date())}
              className="rounded-xl bg-[#0e1c2f] px-4 py-2 text-sm font-bold text-white hover:opacity-80 transition-opacity">
              اليوم
            </button>
            <button onClick={() => setWeekRef(addDays(weekRef, -7))}
              className="rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
              ‹
            </button>
            <span className="text-sm font-bold text-slate-700 min-w-[120px] text-center">
              {sunday.toLocaleDateString("ar-SA", { month: "long", day: "numeric" })}
              {" — "}
              {addDays(sunday, 6).toLocaleDateString("ar-SA", { month: "long", day: "numeric", year: "numeric" })}
            </span>
            <button onClick={() => setWeekRef(addDays(weekRef, 7))}
              className="rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
              ›
            </button>
          </div>
        )}
      </div>

      {/* ── CALENDAR VIEW ── */}
      {view === "calendar" && (
        <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: "#0e1c2f" }}>
          {/* day headers */}
          <div className="grid border-b border-white/10" style={{ gridTemplateColumns: "52px repeat(7, 1fr)" }}>
            <div className="border-l border-white/10" />
            {weekDays.map((d, i) => {
              const iso = toISO(d);
              const isToday = iso === today;
              const count = (byDay[iso] ?? []).filter(t => t.status !== "cancelled").length;
              return (
                <div key={i} className={`py-3 text-center border-l border-white/10 ${isToday ? "bg-white/8" : ""}`}>
                  <div className={`text-xs font-bold mb-1 ${isToday ? "text-teal-400" : "text-white/50"}`}>
                    {DAY_SHORT[d.getDay()]}
                  </div>
                  <div className={`text-lg font-extrabold ${isToday ? "text-white" : "text-white/70"}`}>
                    {d.getDate()}
                  </div>
                  {count > 0 && (
                    <div className="mt-1 mx-auto flex justify-center gap-0.5">
                      {Array.from({ length: Math.min(count, 4) }).map((_, ci) => (
                        <div key={ci} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* time grid */}
          <div className="overflow-y-auto" style={{ maxHeight: "70vh" }}>
            <div className="relative" style={{ height: (HOUR_END - HOUR_START + 1) * HOUR_H }}>

              {/* hour lines + labels */}
              {hours.map((h) => {
                const top = (h - HOUR_START) * HOUR_H;
                return (
                  <div key={h} className="absolute inset-x-0 flex" style={{ top, height: HOUR_H }}>
                    {/* hour label */}
                    <div className="w-[52px] flex-shrink-0 flex items-start justify-center pt-1.5">
                      <span className="text-[10px] font-bold text-white/30">{fmt12h(`${String(h).padStart(2,"0")}:00`)}</span>
                    </div>
                    {/* 7 day cells */}
                    {weekDays.map((d, di) => {
                      const iso = toISO(d);
                      const isToday = iso === today;
                      return (
                        <div key={di}
                          className={`flex-1 border-t border-white/6 border-l border-white/6 ${isToday ? "bg-white/[0.025]" : ""}`}
                        />
                      );
                    })}
                  </div>
                );
              })}

              {/* current time line */}
              {(() => {
                const now = new Date();
                const todayIso = toISO(now);
                const todayIdx = weekDays.findIndex((d) => toISO(d) === todayIso);
                if (todayIdx === -1) return null;
                const curH = now.getHours() + now.getMinutes() / 60;
                if (curH < HOUR_START || curH > HOUR_END) return null;
                const top = (curH - HOUR_START) * HOUR_H;
                const colW = `calc((100% - 52px) / 7)`;
                const leftOffset = `calc(52px + ${(6 - todayIdx)} * ${colW})`;
                return (
                  <div className="absolute z-20 pointer-events-none" style={{ top: top - 1, left: leftOffset, width: colW }}>
                    <div className="h-0.5 bg-red-400 w-full rounded" />
                    <div className="absolute right-0 -top-1 w-2.5 h-2.5 rounded-full bg-red-400 -translate-y-0" />
                  </div>
                );
              })()}

              {/* trip blocks */}
              {weekDays.map((d, di) => {
                const iso = toISO(d);
                const dayTrips = (byDay[iso] ?? []).sort((a, b) => (a.departTime || "").localeCompare(b.departTime || ""));
                return dayTrips.map((t) => {
                  const h = toH(t.departTime);
                  if (h < HOUR_START || h > HOUR_END) return null;
                  const top = (h - HOUR_START) * HOUR_H + 4;
                  const colW = `calc((100% - 52px) / 7)`;
                  // RTL: أحد on right side (di=0 rightmost), سبت on left (di=6 leftmost)
                  const rightOffset = `calc(52px + ${di} * ${colW} + 2px)`;
                  const c = STATUS_COLORS[t.status];
                  return (
                    <motion.button
                      key={t.id}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.04, zIndex: 30 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      onClick={() => setSelected(t)}
                      className={`absolute rounded-lg px-2 py-1.5 text-white text-right overflow-hidden shadow-lg ring-1 ${c.bg} ${c.ring} cursor-pointer`}
                      style={{
                        top,
                        right: rightOffset,
                        width: `calc(${colW} - 4px)`,
                        minHeight: HOUR_H - 10,
                        zIndex: 10,
                      }}
                    >
                      <div className="font-bold text-[11px] leading-tight truncate">{t.name}</div>
                      <div className="text-[10px] text-white/70 truncate mt-0.5">{t.packageTitle}</div>
                      <div className="text-[10px] text-white/60 mt-0.5">{fmt12h(t.departTime)}</div>
                    </motion.button>
                  );
                });
              })}
            </div>
          </div>

          {/* legend */}
          <div className="flex items-center gap-5 px-4 py-3 border-t border-white/10">
            {(["confirmed", "pending", "cancelled"] as const).map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[s].dot}`} />
                <span className="text-xs text-white/50">{STATUS_AR[s]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === "list" && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {upcoming.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <div className="text-4xl mb-3">⚓</div>
              <p className="font-bold text-slate-400">لا توجد رحلات قادمة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((t, i) => {
                const isToday = t.date === today;
                const c = STATUS_COLORS[t.status];
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -2, boxShadow: "0 12px 40px rgba(0,0,0,.10)" }}
                    className="rounded-2xl bg-white p-5 shadow-sm overflow-hidden relative cursor-pointer"
                    onClick={() => setSelected(t)}
                  >
                    {/* accent bar */}
                    <div className={`absolute right-0 top-0 bottom-0 w-1 ${c.bg}`} />
                    <div className="pr-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {isToday && (
                              <span className="rounded-full bg-teal-50 text-teal-700 px-2 py-0.5 text-xs font-extrabold">اليوم</span>
                            )}
                            {i === 0 && !isToday && (
                              <span className="rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 text-xs font-extrabold">القادمة</span>
                            )}
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold text-white ${c.bg}`}>{STATUS_AR[t.status]}</span>
                          </div>
                          <p className="mt-1.5 font-extrabold text-slate-800 text-base">{t.packageTitle}</p>
                          <p className="text-sm text-slate-500 mt-0.5">{t.name}</p>
                        </div>
                        <div className="text-left shrink-0">
                          <div className="text-2xl font-extrabold text-slate-800 leading-none">{fmt12h(t.departTime)}</div>
                          <div className="text-xs text-slate-400 mt-1">{formatDateAr(t.date)}</div>
                        </div>
                      </div>
                      {t.phone && (
                        <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
                          {t.phone && <span dir="ltr">📞 {t.phone}</span>}
                          {t.persons && <span>👥 {t.persons} أشخاص</span>}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* ── Trip detail popup ── */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 24 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden"
            >
              {/* header */}
              <div className={`px-5 pt-5 pb-4 ${STATUS_COLORS[selected.status].bg}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-white/70 font-bold">{STATUS_AR[selected.status]}</p>
                    <p className="text-lg font-extrabold text-white mt-1">{selected.packageTitle}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-white/60 hover:text-white text-xl leading-none mt-1">✕</button>
                </div>
              </div>
              {/* body */}
              <div className="px-5 py-4 space-y-3" dir="rtl">
                <Row label="العميل" value={selected.name} />
                <Row label="التاريخ" value={formatDateAr(selected.date)} />
                <Row label="وقت الانطلاق" value={fmt12h(selected.departTime)} />
                {selected.phone && <Row label="الجوال" value={selected.phone} ltr />}
                {selected.persons && <Row label="الأشخاص" value={`${selected.persons} أشخاص`} />}
              </div>
              <div className="px-5 pb-5">
                <button onClick={() => setSelected(null)}
                  className="w-full rounded-xl bg-slate-800 py-2.5 text-sm font-bold text-white hover:opacity-80 transition-opacity">
                  إغلاق
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-2.5">
      <span className="text-xs font-bold text-slate-400">{label}</span>
      <span className="font-semibold text-slate-800 text-sm" dir={ltr ? "ltr" : undefined}>{value}</span>
    </div>
  );
}
