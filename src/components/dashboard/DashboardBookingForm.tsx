"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PACKAGES, BANK } from "@/lib/packages";

const DISCOUNT_PCT = 25; // mirrors settings default

const ALLDAY_PKG_IDS = new Set(["fish", "hour", "party", "vip"]);
const DEPART_TIMES_24H = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
const DEPART_TIMES_DAY = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

function getDepartTimes(pkgId?: string) {
  if (pkgId === "dolphin") return ["09:00"];
  if (pkgId && ALLDAY_PKG_IDS.has(pkgId)) return DEPART_TIMES_24H;
  return DEPART_TIMES_DAY;
}
function timeLabel(t: string) {
  const h = parseInt(t.slice(0, 2), 10);
  const am = h < 12;
  return `${h % 12 === 0 ? 12 : h % 12}:00 ${am ? "ص" : "م"}`;
}
function isWeekend(d: string) {
  if (!d) return false;
  const day = new Date(d + "T12:00:00").getDay();
  return day === 4 || day === 5 || day === 6;
}

export default function DashboardBookingForm() {
  const [pkgId, setPkgId] = useState(PACKAGES[0].id);
  const [rowIdx, setRowIdx] = useState(0);
  const [tierIdx, setTierIdx] = useState(0);
  const [persons, setPersons] = useState(2);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const [weekend, setWeekend] = useState(false);
  const [date, setDate] = useState("");
  const [departTime, setDepartTime] = useState("09:00");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [payMethod, setPayMethod] = useState<"bank" | "online" | "pos" | "cash">("bank");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [availRanges, setAvailRanges] = useState<Record<string, { startH: number; endH: number; label: string }[]>>({});

  const pkg = useMemo(() => PACKAGES.find((p) => p.id === pkgId) ?? PACKAGES[0], [pkgId]);

  useEffect(() => {
    setRowIdx(0); setTierIdx(0); setPersons(Math.min(2, pkg.maxBase));
    setQty({}); setToggles({}); setWeekend(false); setDate("");
    setDepartTime(pkg.id === "dolphin" ? "09:00" : "09:00");
    setError(""); setDoneId(null);
    fetch("/api/availability").then((r) => r.json()).then((d) => setAvailRanges(d.ranges ?? {})).catch(() => {});
  }, [pkgId, pkg.maxBase, pkg.id]);

  useEffect(() => {
    if (pkg.dayType) setWeekend(isWeekend(date));
  }, [date, pkg.dayType]);

  const baseOriginal = useMemo(() => {
    if (pkg.tiers?.length) return pkg.tiers[tierIdx]?.oldPrice ?? pkg.oldPrice;
    if (pkg.rows?.length) return pkg.rows[rowIdx]?.oldPrice ?? pkg.oldPrice;
    return pkg.oldPrice;
  }, [pkg, rowIdx, tierIdx]);

  const addonsTotal = useMemo(() => {
    if (!pkg.addons) return 0;
    return pkg.addons.reduce((s, a) => {
      if (a.stepper) return s + (qty[a.id] || 0) * a.price;
      return s + (toggles[a.id] ? a.price : 0);
    }, 0);
  }, [pkg, qty, toggles]);

  const extraPersons = Math.max(0, persons - pkg.maxBase);
  const extraCost = extraPersons * pkg.extraPerPerson;
  const dayTypeExtra = pkg.dayType && weekend ? pkg.dayType : 0;
  const subtotal = baseOriginal + addonsTotal + extraCost + dayTypeExtra;
  const seasonDiscount = Math.round((subtotal * DISCOUNT_PCT) / 100);
  const total = subtotal - seasonDiscount;
  const amountDue = total;

  // Duration of the currently selected option
  const selectedDuration = useMemo(() => {
    if (pkg.tiers?.length) return pkg.tiers[tierIdx]?.durationHours ?? pkg.durationHours;
    if (pkg.rows?.length) return pkg.rows[rowIdx]?.durationHours ?? pkg.durationHours;
    return pkg.durationHours;
  }, [pkg, rowIdx, tierIdx]);
  const extraHours = pkg.id === "swim" ? (qty["extra_hour"] || 0) : 0;
  const effectiveDuration = selectedDuration + extraHours;

  function toH(t: string) { const [h, m] = t.split(":").map(Number); return h + (m || 0) / 60; }
  const BUFFER = 1;
  const dateRanges = date ? (availRanges[date] ?? []) : [];

  function isTimeBlocked(t: string) {
    const tH = toH(t);
    const tEnd = tH + effectiveDuration + BUFFER;
    return dateRanges.some((r) => tH < r.endH && r.startH < tEnd);
  }

  // Staff can override but we show conflict warning
  const conflictRange = useMemo(() => {
    if (!date || !departTime) return null;
    const newStart = toH(departTime);
    const newEnd = newStart + effectiveDuration + BUFFER;
    return dateRanges.find((r) => newStart < r.endH && r.startH < newEnd) ?? null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, departTime, effectiveDuration, dateRanges]);

  const selectedOption = useMemo(() => {
    if (pkg.tiers?.length) return pkg.tiers[tierIdx]?.name ?? "";
    if (pkg.rows?.length) return pkg.rows[rowIdx]?.label ?? "";
    return pkg.baseDuration;
  }, [pkg, rowIdx, tierIdx]);

  const addonSummary = useMemo(() => {
    const out: string[] = [];
    pkg.addons?.forEach((a) => {
      if (a.stepper && (qty[a.id] || 0) > 0) out.push(`${a.label} ×${qty[a.id]}`);
      else if (!a.stepper && toggles[a.id]) out.push(a.label);
    });
    if (dayTypeExtra) out.push("نهاية الأسبوع");
    return out;
  }, [pkg, qty, toggles, dayTypeExtra]);

  async function submit() {
    setError("");
    if (!name.trim()) return setError("يرجى إدخال اسم العميل");
    if (!/^05\d{8}$/.test(phone.trim())) return setError("رقم الجوال غير صحيح — يبدأ بـ 05");
    if (!date) return setError("يرجى اختيار تاريخ الرحلة");
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id, packageTitle: pkg.title, option: selectedOption,
          persons, addons: addonSummary, date, departTime, durationHours: effectiveDuration,
          name: name.trim(), phone: phone.trim(), notes: notes.trim(),
          payMethod, payType: "full", deposit: 0,
          total, amountDue, promo: "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحجز");
      setDoneId(data.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setDoneId(null); setName(""); setPhone(""); setNotes(""); setDate("");
    setQty({}); setToggles({});
  }

  if (doneId) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">✓</div>
        <h3 className="text-xl font-extrabold text-slate-800">تم تسجيل الحجز!</h3>
        <p className="mt-2 font-mono text-sm text-slate-500">{doneId}</p>
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-right text-sm text-slate-700 space-y-1">
          <p>📦 {pkg.title}</p>
          <p>👤 {name} — {phone}</p>
          <p>📅 {date} · {timeLabel(departTime)}</p>
          <p>👥 {persons} أشخاص</p>
          <p className="font-bold">💰 الإجمالي: {total.toLocaleString()} ريال</p>
          <p>💳 {payMethod === "online" ? "دفع إلكتروني عبر الموقع" : payMethod === "pos" ? "نقطة بيع (POS)" : payMethod === "cash" ? "نقدي" : "تحويل بنكي"}</p>
        </div>
        {payMethod === "bank" && (
        <div className="mt-4 rounded-xl border border-slate-200 p-4 text-sm text-slate-600">
          <p className="font-bold text-slate-800">بيانات التحويل البنكي</p>
          <p className="mt-1">{BANK.bank} — {BANK.name}</p>
          <p className="mt-1 font-mono text-xs">{BANK.iban}</p>
        </div>
        )}
        <button onClick={reset} className="mt-6 w-full rounded-xl bg-slate-800 py-3 font-bold text-white hover:opacity-80">حجز جديد</button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="rounded-2xl bg-white p-6 shadow-sm" dir="rtl">
      <h3 className="mb-5 text-lg font-extrabold text-slate-800">➕ حجز جديد</h3>

      {/* package selector */}
      <label className="block">
        <span className="db-label">الباقة</span>
        <select value={pkgId} onChange={(e) => setPkgId(e.target.value)} className="db-in">
          {PACKAGES.map((p) => <option key={p.id} value={p.id}>{p.emoji} {p.title}</option>)}
        </select>
      </label>

      {/* duration / tier */}
      {pkg.tiers?.length ? (
        <label className="mt-3 block">
          <span className="db-label">الباقة الفرعية</span>
          <select value={tierIdx} onChange={(e) => setTierIdx(+e.target.value)} className="db-in">
            {pkg.tiers.map((t, i) => <option key={t.name} value={i}>{t.name} — {t.price.toLocaleString()} ريال</option>)}
          </select>
        </label>
      ) : pkg.rows && pkg.rows.length > 1 ? (
        <label className="mt-3 block">
          <span className="db-label">المدة / الوقت</span>
          <select value={rowIdx} onChange={(e) => setRowIdx(+e.target.value)} className="db-in">
            {pkg.rows.map((r, i) => <option key={r.label} value={i}>{r.label} — {r.price.toLocaleString()} ريال</option>)}
          </select>
        </label>
      ) : null}

      {/* persons */}
      <div className="mt-3">
        <span className="db-label block">عدد الأشخاص (الأساسيين: {pkg.maxBase})</span>
        <div className="flex items-center gap-4 mt-1">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setPersons(Math.max(1, persons - 1))} disabled={persons <= 1} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-lg font-bold disabled:opacity-30">−</button>
            <span className="w-8 text-center text-xl font-extrabold text-slate-800">{persons}</span>
            <button type="button" onClick={() => setPersons(Math.min(pkg.maxPersons, persons + 1))} disabled={persons >= pkg.maxPersons} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-lg font-bold disabled:opacity-30">+</button>
          </div>
          {extraPersons > 0 && <span className="text-sm text-amber-700 font-semibold">+{extraPersons} إضافي × {pkg.extraPerPerson} = {extraCost.toLocaleString()} ريال</span>}
        </div>
      </div>

      {/* addons */}
      {pkg.addons?.length ? (
        <div className="mt-4">
          <span className="db-label block mb-2">الإضافات</span>
          <div className="space-y-2">
            {pkg.addons.map((a) => a.stepper ? (
              <div key={a.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-sm">
                <span className="text-slate-700">{a.label} <span className="text-teal-600">(+{a.price} ريال)</span></span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setQty(p => ({ ...p, [a.id]: Math.max(0, (p[a.id] || 0) - 1) }))} className="h-7 w-7 rounded-full border border-slate-300 text-sm font-bold">−</button>
                  <span className="w-5 text-center font-bold">{qty[a.id] || 0}</span>
                  <button type="button" onClick={() => setQty(p => ({ ...p, [a.id]: Math.min(a.max ?? 4, (p[a.id] || 0) + 1) }))} className="h-7 w-7 rounded-full border border-slate-300 text-sm font-bold">+</button>
                </div>
              </div>
            ) : (
              <label key={a.id} className={`flex cursor-pointer items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-colors ${toggles[a.id] ? "bg-teal-50 border border-teal-300" : "bg-slate-50 border border-transparent"}`}>
                <span className="flex items-center gap-2 text-slate-700">
                  <input type="checkbox" checked={!!toggles[a.id]} onChange={(e) => setToggles(p => ({ ...p, [a.id]: e.target.checked }))} className="h-4 w-4 accent-teal-500" />
                  {a.label}
                </span>
                <span className="font-bold text-teal-700">+{a.price.toLocaleString()} ريال</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {/* date / time */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="db-label">تاريخ الرحلة</span>
          <input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} className="db-in" />
          {dateRanges.length > 0 && <p className="mt-1 text-xs text-slate-400">محجوز: {dateRanges.map((r) => r.label).join("، ")}</p>}
        </label>
        <label className="block">
          <span className="db-label">وقت الانطلاق</span>
          <select value={departTime} onChange={(e) => setDepartTime(e.target.value)} className={`db-in ${conflictRange ? "border-amber-400" : ""}`} disabled={pkg.id === "dolphin"}>
            {getDepartTimes(pkg.id).map((t) => {
              const blocked = isTimeBlocked(t);
              return <option key={t} value={t}>{timeLabel(t)}{blocked ? " — محجوز" : ""}</option>;
            })}
          </select>
          {conflictRange && <p className="mt-1 text-xs font-bold text-amber-600">⚠️ تعارض مع ({conflictRange.label} + ساعة تنظيف) — يمكنك المتابعة كمدير</p>}
        </label>
      </div>

      {/* weekend notice */}
      <AnimatePresence>
        {pkg.dayType && weekend && date && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            🌙 <strong>نهاية الأسبوع</strong> — رسوم إضافية +{pkg.dayType.toLocaleString()} ريال (خميس / جمعة / سبت)
          </motion.div>
        )}
      </AnimatePresence>

      {/* customer info */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="db-label">اسم العميل</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم الكامل" className="db-in" />
        </label>
        <label className="block">
          <span className="db-label">رقم الجوال</span>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XXXXXXXX" className="db-in" dir="ltr" />
        </label>
        <label className="col-span-2 block">
          <span className="db-label">ملاحظات</span>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أي طلبات خاصة..." className="db-in resize-none" />
        </label>
      </div>

      {/* payment method */}
      <div className="mt-4">
        <span className="db-label block mb-2">طريقة الدفع</span>
        <div className="grid grid-cols-3 gap-2">
          {([
            { val: "bank", icon: "💳", label: "تحويل بنكي" },
            { val: "cash", icon: "💵", label: "نقدي" },
            { val: "online", icon: "🌐", label: "عبر الموقع" },
            { val: "pos", icon: "🖥️", label: "نقطة بيع" },
          ] as const).map((m) => (
            <button key={m.val} type="button" onClick={() => setPayMethod(m.val)}
              className={`rounded-xl border-2 p-3 text-center text-sm transition-colors ${payMethod === m.val ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-slate-50"}`}>
              <div className="text-lg">{m.icon}</div>
              <div className="mt-0.5 text-xs font-bold text-slate-700">{m.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* total */}
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-800 px-5 py-4 text-white">
        <div>
          <span className="text-xs text-white/60">الإجمالي بعد الخصم</span>
        </div>
        <span className="text-2xl font-extrabold text-amber-400">{amountDue.toLocaleString()} <span className="text-sm font-normal text-white/60">ريال</span></span>
      </div>

      {error && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}

      <button onClick={submit} disabled={submitting} className="mt-4 w-full rounded-xl bg-slate-800 py-3.5 font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-50">
        {submitting ? "جاري التسجيل..." : "تسجيل الحجز"}
      </button>

      <style>{`.db-label{font-size:.8rem;font-weight:600;color:#64748b;margin-bottom:4px}.db-in{width:100%;padding:10px 13px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;color:#1e293b;font-family:inherit;font-size:.9rem;outline:none;transition:border-color .2s}.db-in:focus{border-color:#0d9488;background:#f0fdfa}`}</style>
    </motion.div>
  );
}
