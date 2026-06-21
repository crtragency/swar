"use client";

import { useEffect, useMemo, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { DISCOUNT, BANK, type Pkg } from "@/lib/packages";

const DEPART_TIMES = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
function timeLabel(t: string) {
  const h = parseInt(t.slice(0, 2), 10);
  const am = h < 12;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:00 ${am ? "ص" : "م"}`;
}

export default function BookingModal({ pkg, image, onClose }: { pkg: Pkg | null; image?: StaticImageData; onClose: () => void }) {
  const [rowIdx, setRowIdx] = useState(0);
  const [tierIdx, setTierIdx] = useState(0);
  const [persons, setPersons] = useState(2);
  const [addons, setAddons] = useState<Record<string, boolean>>({});
  const [date, setDate] = useState("");
  const [departTime, setDepartTime] = useState("09:00");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [payMethod, setPayMethod] = useState<"bank" | "arrival">("bank");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [doneId, setDoneId] = useState<string | null>(null);

  // reset when a new package opens
  useEffect(() => {
    if (pkg) {
      setRowIdx(0); setTierIdx(0); setPersons(Math.min(2, pkg.maxBase));
      setAddons({}); setDate(""); setDepartTime("09:00"); setName(""); setPhone("");
      setNotes(""); setPayMethod("bank"); setError(""); setDoneId(null); setSubmitting(false);
    }
  }, [pkg]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (pkg) document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [pkg, onClose]);

  const base = useMemo(() => {
    if (!pkg) return 0;
    if (pkg.tiers?.length) return pkg.tiers[tierIdx]?.price ?? pkg.price;
    if (pkg.rows?.length) return pkg.rows[rowIdx]?.price ?? pkg.price;
    return pkg.price;
  }, [pkg, rowIdx, tierIdx]);

  const addonsTotal = useMemo(() => {
    if (!pkg?.addons) return 0;
    return pkg.addons.reduce((s, a) => (addons[a.label] ? s + a.price : s), 0);
  }, [pkg, addons]);

  const extraPersons = pkg ? Math.max(0, persons - pkg.maxBase) : 0;
  const extraCost = pkg ? extraPersons * pkg.extraPerPerson : 0;
  const total = base + addonsTotal + extraCost;

  const selectedOption = useMemo(() => {
    if (!pkg) return "";
    if (pkg.tiers?.length) return pkg.tiers[tierIdx]?.name ?? "";
    if (pkg.rows?.length) return pkg.rows[rowIdx]?.label ?? "";
    return pkg.capacity;
  }, [pkg, rowIdx, tierIdx]);

  async function submit() {
    if (!pkg) return;
    setError("");
    if (!name.trim()) return setError("يرجى إدخال الاسم الكامل");
    if (!/^05\d{8}$/.test(phone.trim())) return setError("رقم الجوال غير صحيح — يبدأ بـ 05 ويتكوّن من 10 أرقام");
    if (!date) return setError("يرجى اختيار تاريخ الرحلة");
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id, packageTitle: pkg.title, option: selectedOption,
          persons, addons: pkg.addons?.filter((a) => addons[a.label]).map((a) => a.label) ?? [],
          date, departTime, name: name.trim(), phone: phone.trim(), notes: notes.trim(),
          payMethod, total,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذّر إتمام الحجز");
      setDoneId(data.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ، حاول مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {pkg && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-navy-950/80 p-3 backdrop-blur-md sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative my-4 w-full max-w-xl overflow-hidden rounded-[26px] bg-white shadow-2xl"
          >
            {/* header */}
            <div className="relative h-40 overflow-hidden">
              {image && <Image src={image} alt={pkg.title} fill sizes="600px" className="object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 to-navy-950/30" />
              <button type="button" onClick={onClose} aria-label="إغلاق" className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/30">✕</button>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="rounded-full bg-gold-400 px-3 py-1 text-xs font-extrabold text-navy-950">خصم {DISCOUNT.pct}%</span>
                <h3 className="mt-2 text-2xl font-extrabold text-white drop-shadow">{pkg.title}</h3>
              </div>
            </div>

            {doneId ? (
              <div className="p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-turquoise-500/15 text-3xl text-turquoise-600">✓</div>
                <h4 className="mt-4 text-2xl font-extrabold text-navy-900">تم استلام حجزك بنجاح!</h4>
                <p className="mt-2 text-navy-900/60">رقم الحجز: <span className="font-mono font-bold text-navy-900">{doneId}</span></p>
                <div className="mt-5 rounded-2xl bg-navy-50/70 p-5 text-start text-sm leading-loose text-navy-900/75">
                  <p>👥 عدد الأشخاص: {persons}</p>
                  <p>⏱️ الباقة: {selectedOption}</p>
                  <p>💳 طريقة الدفع: {payMethod === "bank" ? "تحويل بنكي" : "الدفع عند الوصول"}</p>
                  <p className="font-bold text-navy-900">الإجمالي: {total.toLocaleString()} ريال</p>
                </div>
                {payMethod === "bank" && <BankBox copied={copied} setCopied={setCopied} />}
                <p className="mt-4 text-sm text-navy-900/55">سيتواصل معك فريقنا قريباً لتأكيد الحجز 🌊</p>
                <button onClick={onClose} className="btn-ocean mt-6 w-full">تم</button>
              </div>
            ) : (
              <div className="max-h-[calc(100vh-13rem)] overflow-y-auto p-6 sm:p-7">
                <p className="rounded-2xl bg-navy-50/70 px-4 py-3 text-sm leading-relaxed text-navy-900/70">{pkg.yacht}</p>

                {/* duration / tier */}
                {pkg.tiers?.length ? (
                  <Field label="اختر الباقة">
                    <select value={tierIdx} onChange={(e) => setTierIdx(+e.target.value)} className="sw-in">
                      {pkg.tiers.map((t, i) => (<option key={t.name} value={i}>{t.name} — {t.price.toLocaleString()} ريال</option>))}
                    </select>
                  </Field>
                ) : pkg.rows && pkg.rows.length > 1 ? (
                  <Field label="اختر المدة / الوقت">
                    <select value={rowIdx} onChange={(e) => setRowIdx(+e.target.value)} className="sw-in">
                      {pkg.rows.map((r, i) => (<option key={r.label} value={i}>{r.label} — {r.price.toLocaleString()} ريال</option>))}
                    </select>
                  </Field>
                ) : null}

                {/* persons */}
                <Field label={`عدد الأشخاص (السعر الأساسي حتى ${pkg.maxBase})`}>
                  <div className="flex items-center gap-4">
                    <Stepper value={persons} min={1} max={pkg.maxPersons} onChange={setPersons} />
                    {extraPersons > 0 && (
                      <span className="text-sm font-semibold text-gold-600">+{extraCost.toLocaleString()} ريال ({extraPersons} إضافي × {pkg.extraPerPerson})</span>
                    )}
                  </div>
                </Field>

                {/* add-ons */}
                {pkg.addons?.length ? (
                  <div className="mt-5">
                    <p className="text-sm font-bold text-navy-900">إضافات اختيارية</p>
                    <div className="mt-2 grid gap-2">
                      {pkg.addons.map((a) => (
                        <label key={a.label} className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors ${addons[a.label] ? "border-turquoise-500 bg-turquoise-500/5" : "border-navy-50 bg-navy-50/40"}`}>
                          <span className="flex items-center gap-3 text-sm text-navy-900/80">
                            <input type="checkbox" checked={!!addons[a.label]} onChange={(e) => setAddons((p) => ({ ...p, [a.label]: e.target.checked }))} className="h-4 w-4 accent-turquoise-500" />
                            {a.label}
                          </span>
                          <span className="shrink-0 text-sm font-bold text-turquoise-600">+{a.price} ريال</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* details */}
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label="تاريخ الرحلة">
                    <input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} className="sw-in" />
                  </Field>
                  <Field label="وقت الانطلاق">
                    <select value={departTime} onChange={(e) => setDepartTime(e.target.value)} className="sw-in">
                      {DEPART_TIMES.map((t) => (<option key={t} value={t}>{timeLabel(t)}</option>))}
                    </select>
                  </Field>
                  <Field label="الاسم الكامل">
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="أدخل اسمك" className="sw-in" />
                  </Field>
                  <Field label="رقم الجوال">
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XXXXXXXX" className="sw-in" />
                  </Field>
                  <Field label="ملاحظات إضافية" full>
                    <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أي طلبات خاصة..." className="sw-in resize-none" />
                  </Field>
                </div>

                {/* payment method */}
                <p className="mt-5 text-sm font-bold text-navy-900">طريقة الدفع</p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {([["bank", "تحويل بنكي", "حوّل المبلغ على الآيبان"], ["arrival", "الدفع عند الوصول", "ادفع في يوم الرحلة"]] as const).map(([val, t, sub]) => (
                    <button key={val} type="button" onClick={() => setPayMethod(val)} className={`rounded-2xl border-2 p-4 text-center transition-all ${payMethod === val ? "border-turquoise-500 bg-turquoise-500/5" : "border-navy-50 bg-navy-50/40"}`}>
                      <div className="text-sm font-bold text-navy-900">{t}</div>
                      <div className="mt-1 text-xs text-navy-900/55">{sub}</div>
                    </button>
                  ))}
                </div>

                {payMethod === "bank" && <BankBox copied={copied} setCopied={setCopied} />}

                {/* total */}
                <div className="mt-5 flex items-center justify-between rounded-2xl bg-navy-900 px-5 py-4 text-white">
                  <span className="text-sm text-white/70">الإجمالي (شامل خصم {DISCOUNT.pct}%)</span>
                  <span className="text-2xl font-extrabold text-gold-400">{total.toLocaleString()} <span className="text-sm font-normal text-white/70">ريال</span></span>
                </div>

                {error && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}

                <button onClick={submit} disabled={submitting} className="btn-ocean mt-4 w-full disabled:opacity-60">
                  {submitting ? "جاري الإرسال..." : "تأكيد الحجز"}
                </button>
              </div>
            )}
            <style>{`.sw-in{width:100%;padding:11px 13px;background:#f0f8fb;border:1px solid rgba(11,92,140,.18);border-radius:12px;color:#0a1a2f;font-family:inherit;font-size:.92rem;outline:none;transition:border-color .2s,background .2s}.sw-in:focus{border-color:#21c0c0;background:#e8f6f8}`}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`mt-4 flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-sm font-semibold text-navy-900/70">{label}</span>
      {children}
    </label>
  );
}

function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className="flex h-9 w-9 items-center justify-center rounded-full border border-ocean-500/40 text-lg font-bold text-ocean-600 disabled:opacity-30">−</button>
      <span className="w-6 text-center text-lg font-extrabold text-navy-900">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className="flex h-9 w-9 items-center justify-center rounded-full border border-ocean-500/40 text-lg font-bold text-ocean-600 disabled:opacity-30">+</button>
    </div>
  );
}

function BankBox({ copied, setCopied }: { copied: boolean; setCopied: (v: boolean) => void }) {
  return (
    <div className="mt-4 rounded-2xl border border-ocean-500/20 bg-navy-50/50 p-5">
      <p className="text-sm font-bold text-navy-900">بيانات التحويل البنكي</p>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-navy-900/55">البنك</span><span className="font-bold text-navy-900">{BANK.bank}</span></div>
        <div className="flex justify-between"><span className="text-navy-900/55">اسم الحساب</span><span className="font-bold text-navy-900">{BANK.name}</span></div>
      </div>
      <button
        type="button"
        onClick={() => { navigator.clipboard?.writeText(BANK.iban); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="mt-3 w-full rounded-xl border border-dashed border-ocean-500/40 bg-white px-4 py-3 text-center font-mono text-sm font-bold tracking-wide text-navy-900 transition-colors hover:bg-navy-50"
      >
        {BANK.iban}
      </button>
      <p className="mt-1 text-center text-xs text-turquoise-600">{copied ? "تم نسخ الآيبان ✓" : "اضغط لنسخ الآيبان"}</p>
    </div>
  );
}
