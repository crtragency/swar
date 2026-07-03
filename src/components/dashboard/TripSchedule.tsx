"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PACKAGES, deriveDuration } from "@/lib/packages";

export type ScheduleTrip = {
  id: string;
  date: string;
  departTime: string;
  packageTitle: string;
  name: string;
  phone?: string;
  persons?: number;
  status: "pending" | "confirmed" | "cancelled";
  // تفاصيل إضافية تظهر في نافذة التفاصيل
  packageId?: string;
  option?: string;
  addons?: string[];
  notes?: string;
  total?: number;
  paid?: number;
  payMethod?: "bank" | "online" | "pos" | "cash";
  payType?: "full" | "deposit";
  deposit?: number;
  promo?: string;
  createdAt?: string;
};

const PAY_METHOD_AR: Record<NonNullable<ScheduleTrip["payMethod"]>, string> = {
  bank: "💳 تحويل بنكي", online: "🌐 دفع عبر الموقع", pos: "🖥️ نقطة بيع (POS)", cash: "💵 نقدي",
};

function fmtSar(n: number) { return `${n.toLocaleString("ar-SA")} ريال`; }

function fmtHours(h: number) {
  if (h === 0.5) return "نصف ساعة";
  if (h === 1) return "ساعة واحدة";
  if (h === 1.5) return "ساعة ونصف";
  if (h === 2) return "ساعتان";
  if (h <= 10) return `${h} ساعات`;
  return `${h} ساعة`;
}

/* ── helpers ─────────────────────────────────────────────────────────── */
export function fmt12h(t: string) {
  if (!t || !t.includes(":")) return "—";
  const [h, m] = t.split(":").map(Number);
  const period = h < 12 ? "ص" : "م";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mm = m ? `:${String(m).padStart(2, "0")}` : "";
  return `${h12}${mm} ${period}`;
}

function todayISO() { return new Date().toISOString().slice(0, 10); }

function daysUntil(iso: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(iso + "T00:00:00"); target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function formatDateAr(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

const STATUS_COLORS: Record<ScheduleTrip["status"], { bar: string; badge: string }> = {
  confirmed: { bar: "bg-emerald-500", badge: "bg-emerald-500 text-white" },
  pending:   { bar: "bg-amber-400",   badge: "bg-amber-100 text-amber-700" },
  cancelled: { bar: "bg-red-400",     badge: "bg-red-100 text-red-600" },
};
const STATUS_AR: Record<ScheduleTrip["status"], string> = {
  confirmed: "مؤكد", pending: "قيد الانتظار", cancelled: "ملغي",
};

/* ── countdown chip ──────────────────────────────────────────────────── */
function CountdownChip({ days }: { days: number }) {
  if (days < 0) return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-400">انتهت</span>;
  if (days === 0) return (
    <span className="rounded-full bg-teal-500 px-3 py-1 text-xs font-extrabold text-white animate-pulse">اليوم 🚤</span>
  );
  if (days === 1) return (
    <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-extrabold text-white">غداً</span>
  );
  return (
    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-extrabold text-white">
      بعد {days} {days <= 10 ? "أيام" : "يوم"}
    </span>
  );
}

/* ── main component ─────────────────────────────────────────────────── */
export default function TripSchedule({ trips }: { trips: ScheduleTrip[] }) {
  const [selected, setSelected] = useState<ScheduleTrip | null>(null);
  const today = todayISO();

  const upcoming = useMemo(() =>
    [...trips]
      .filter((t) => t.status !== "cancelled" && t.date >= today)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.departTime || "").localeCompare(b.departTime || "");
      }),
    [trips, today]
  );

  if (upcoming.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
        <div className="text-5xl mb-4">⚓</div>
        <p className="font-bold text-slate-400 text-lg">لا توجد رحلات قادمة</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-3">
      {upcoming.map((t, i) => {
        const days = daysUntil(t.date);
        const c = STATUS_COLORS[t.status];
        const isToday = days === 0;
        const isTomorrow = days === 1;
        const isSoon = days <= 3;

        return (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -2, boxShadow: "0 14px 44px rgba(0,0,0,.10)" }}
            className={`relative rounded-2xl bg-white shadow-sm overflow-hidden cursor-pointer ${isToday ? "ring-2 ring-teal-400" : isTomorrow ? "ring-2 ring-orange-400" : ""}`}
            onClick={() => setSelected(t)}
          >
            {/* accent bar */}
            <div className={`absolute right-0 top-0 bottom-0 w-1.5 ${c.bar}`} />

            <div className="pr-4 pl-5 py-4">
              <div className="flex items-start justify-between gap-3">
                {/* right side: info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <CountdownChip days={days} />
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${c.badge}`}>
                      {STATUS_AR[t.status]}
                    </span>
                    {isSoon && days > 1 && (
                      <span className="rounded-full bg-amber-50 text-amber-600 px-2 py-0.5 text-xs font-bold">قريبة</span>
                    )}
                  </div>
                  <p className="font-extrabold text-slate-800 text-base leading-tight">{t.packageTitle}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{t.name}</p>
                  {(t.phone || t.persons) && (
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      {t.phone && <span dir="ltr">📞 {t.phone}</span>}
                      {t.persons && <span>👥 {t.persons} أشخاص</span>}
                    </div>
                  )}
                </div>

                {/* left side: time + date */}
                <div className="text-left shrink-0">
                  <div className={`text-2xl font-extrabold leading-none ${isToday ? "text-teal-600" : isTomorrow ? "text-orange-500" : "text-slate-800"}`}>
                    {fmt12h(t.departTime)}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 text-left">{formatDateAr(t.date)}</div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* detail popup */}
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
              className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className={`px-5 pt-5 pb-4 shrink-0 ${STATUS_COLORS[selected.status].bar} bg-opacity-90`} style={{ background: selected.status === "confirmed" ? "#10b981" : selected.status === "pending" ? "#f59e0b" : "#ef4444" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CountdownChip days={daysUntil(selected.date)} />
                      <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold text-white">{STATUS_AR[selected.status]}</span>
                    </div>
                    <p className="text-lg font-extrabold text-white">{selected.packageTitle}</p>
                    {selected.option && <p className="text-sm text-white/80 mt-0.5">{selected.option}</p>}
                  </div>
                  <button onClick={() => setSelected(null)} className="text-white/70 hover:text-white text-xl leading-none mt-1">✕</button>
                </div>
              </div>
              <div className="px-5 py-4 space-y-3 overflow-y-auto" dir="rtl">
                {(() => {
                  const pkg = selected.packageId ? PACKAGES.find((p) => p.id === selected.packageId) : undefined;
                  const duration = pkg ? deriveDuration(pkg.id, selected.option ?? "") : undefined;
                  return (
                    <>
                      {[
                        { label: "العميل", value: selected.name || "—" },
                        { label: "الجوال", value: selected.phone || "—", ltr: !!selected.phone },
                        { label: "التاريخ", value: formatDateAr(selected.date) },
                        { label: "وقت الانطلاق", value: fmt12h(selected.departTime) },
                        { label: "الأشخاص", value: selected.persons ? `${selected.persons} أشخاص` : "—" },
                        { label: "نوع الرحلة", value: pkg ? `${pkg.emoji} ${selected.packageTitle}` : selected.packageTitle || "—" },
                        { label: "الخيار / الفئة", value: selected.option || pkg?.baseDuration || "—" },
                        ...(duration ? [{ label: "مدة الرحلة", value: `⏱️ ${fmtHours(duration)}` }] : []),
                      ].map((r) => (
                        <div key={r.label} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-2.5">
                          <span className="text-xs font-bold text-slate-400 shrink-0">{r.label}</span>
                          <span className="font-semibold text-slate-800 text-sm text-left" dir={"ltr" in r && r.ltr ? "ltr" : undefined}>{r.value}</span>
                        </div>
                      ))}

                      {/* الإضافات — تظهر دائماً */}
                      <div className="rounded-xl bg-teal-50 px-4 py-3">
                        <div className="text-xs font-bold text-teal-600 mb-2">➕ الإضافات</div>
                        {selected.addons && selected.addons.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {selected.addons.map((a, i) => (
                              <span key={i} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-teal-700 shadow-sm">{a}</span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400">لا توجد إضافات على هذا الحجز</p>
                        )}
                      </div>

                      {/* يشمل الباقة */}
                      {pkg?.includes && pkg.includes.length > 0 && (
                        <div className="rounded-xl bg-indigo-50 px-4 py-3">
                          <div className="text-xs font-bold text-indigo-600 mb-2">🎁 يشمل الباقة</div>
                          <ul className="space-y-1">
                            {pkg.includes.map((inc, i) => (
                              <li key={i} className="text-sm text-slate-700">{inc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* الدفع */}
                {selected.total !== undefined && (
                  <div className="rounded-xl bg-slate-800 px-4 py-3 space-y-2 text-white">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-white/50">الإجمالي</span>
                      <span className="font-extrabold text-amber-400">{fmtSar(selected.total)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-white/50">المدفوع</span>
                      <span className="font-bold text-emerald-400">{fmtSar(selected.paid ?? 0)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-white/50">المتبقي</span>
                      <span className={`font-bold ${Math.max(0, selected.total - (selected.paid ?? 0)) > 0 ? "text-orange-400" : "text-emerald-400"}`}>
                        {fmtSar(Math.max(0, selected.total - (selected.paid ?? 0)))}
                      </span>
                    </div>
                    {selected.payMethod && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-white/50">طريقة الدفع</span>
                        <span className="text-sm font-semibold">{PAY_METHOD_AR[selected.payMethod]}</span>
                      </div>
                    )}
                    {selected.payType && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-white/50">نوع الدفع</span>
                        <span className="text-sm font-semibold">{selected.payType === "deposit" ? `عربون${selected.deposit ? ` (${fmtSar(selected.deposit)})` : ""}` : "دفع كامل"}</span>
                      </div>
                    )}
                    {selected.promo && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-white/50">كود الخصم</span>
                        <span className="text-sm font-semibold" dir="ltr">{selected.promo}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ملاحظات — تظهر دائماً */}
                <div className="rounded-xl bg-amber-50 px-4 py-3">
                  <div className="text-xs font-bold text-amber-600 mb-1">📝 ملاحظات</div>
                  {selected.notes ? (
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{selected.notes}</p>
                  ) : (
                    <p className="text-sm text-slate-400">لا توجد ملاحظات</p>
                  )}
                </div>

                {/* مرجع الحجز */}
                <div className="flex items-center justify-between gap-3 px-1 text-xs text-slate-400">
                  <span className="font-mono" dir="ltr">{selected.id}</span>
                  {selected.createdAt && <span>{new Date(selected.createdAt).toLocaleString("ar-SA")}</span>}
                </div>
              </div>
              <div className="px-5 pb-5 pt-1 shrink-0">
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
