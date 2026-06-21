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

const PROMO_CODES: Record<string, number> = { SEWAR10: 10 };
const CANCEL_POLICY =
  "في حال إلغاء الرحلة من قِبَل العميل لأي سبب، لا يُرد المبلغ المحوَّل ولا يُستبدل. في حال وجود مشكلة من طرفنا، يُرد المبلغ كاملاً.";

export default function BookingModal({ pkg, image, onClose }: { pkg: Pkg | null; image?: StaticImageData; onClose: () => void }) {
  const [rowIdx, setRowIdx] = useState(0);
  const [tierIdx, setTierIdx] = useState(0);
  const [persons, setPersons] = useState(2);
  const [qty, setQty] = useState<Record<string, number>>({}); // stepper add-ons
  const [toggles, setToggles] = useState<Record<string, boolean>>({}); // toggle add-ons
  const [weekend, setWeekend] = useState(false);
  const [date, setDate] = useState("");
  const [departTime, setDepartTime] = useState("09:00");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoPct, setPromoPct] = useState(0);
  const [promoMsg, setPromoMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [payMethod, setPayMethod] = useState<"bank" | "arrival">("bank");
  const [payType, setPayType] = useState<"full" | "deposit">("full");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [doneId, setDoneId] = useState<string | null>(null);

  useEffect(() => {
    if (pkg) {
      setRowIdx(0); setTierIdx(0); setPersons(Math.min(2, pkg.maxBase));
      setQty({}); setToggles({}); setWeekend(false); setDate(""); setDepartTime("09:00");
      setName(""); setPhone(""); setNotes(""); setPromoCode(""); setPromoPct(0); setPromoMsg(null);
      setPayMethod("bank"); setPayType("full"); setError(""); setDoneId(null); setSubmitting(false);
    }
  }, [pkg]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (pkg) document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [pkg, onClose]);

  // ── price model (mirrors the original: discount applies to the whole subtotal) ──
  const baseOriginal = useMemo(() => {
    if (!pkg) return 0;
    if (pkg.tiers?.length) return pkg.tiers[tierIdx]?.oldPrice ?? pkg.oldPrice;
    if (pkg.rows?.length) return pkg.rows[rowIdx]?.oldPrice ?? pkg.oldPrice;
    return pkg.oldPrice;
  }, [pkg, rowIdx, tierIdx]);

  const addonsTotal = useMemo(() => {
    if (!pkg?.addons) return 0;
    return pkg.addons.reduce((sum, a) => {
      if (a.stepper) return sum + (qty[a.id] || 0) * a.price;
      return sum + (toggles[a.id] ? a.price : 0);
    }, 0);
  }, [pkg, qty, toggles]);

  const extraPersons = pkg ? Math.max(0, persons - pkg.maxBase) : 0;
  const extraCost = pkg ? extraPersons * pkg.extraPerPerson : 0;
  const dayTypeExtra = pkg?.dayType && weekend ? pkg.dayType : 0;

  const subtotal = baseOriginal + addonsTotal + extraCost + dayTypeExtra;
  const seasonDiscount = Math.round((subtotal * DISCOUNT.pct) / 100);
  const afterSeason = subtotal - seasonDiscount;
  const promoDiscount = promoPct ? Math.round((afterSeason * promoPct) / 100) : 0;
  const total = afterSeason - promoDiscount;
  const deposit = Math.ceil(total / 2);
  const amountDue = payMethod === "bank" && payType === "deposit" ? deposit : total;

  const selectedOption = useMemo(() => {
    if (!pkg) return "";
    if (pkg.tiers?.length) return pkg.tiers[tierIdx]?.name ?? "";
    if (pkg.rows?.length) return pkg.rows[rowIdx]?.label ?? "";
    return pkg.baseDuration;
  }, [pkg, rowIdx, tierIdx]);

  const addonSummary = useMemo(() => {
    if (!pkg?.addons) return [] as string[];
    const out: string[] = [];
    pkg.addons.forEach((a) => {
      if (a.stepper && (qty[a.id] || 0) > 0) out.push(`${a.label} ×${qty[a.id]}`);
      else if (!a.stepper && toggles[a.id]) out.push(a.label);
    });
    if (dayTypeExtra) out.push("نهاية الأسبوع");
    return out;
  }, [pkg, qty, toggles, dayTypeExtra]);

  function applyPromo() {
    const code = promoCode.trim().toUpperCase();
    if (PROMO_CODES[code] !== undefined) {
      setPromoPct(PROMO_CODES[code]);
      setPromoMsg({ ok: true, text: `تم تطبيق الخصم! خصم ${PROMO_CODES[code]}% إضافي` });
    } else {
      setPromoPct(0);
      setPromoMsg({ ok: false, text: "كود الخصم غير صحيح" });
    }
  }

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
          persons, addons: addonSummary, date, departTime,
          name: name.trim(), phone: phone.trim(), notes: notes.trim(),
          payMethod, payType: payMethod === "bank" ? payType : "full",
          deposit: payMethod === "bank" && payType === "deposit" ? deposit : 0,
          total, amountDue, promo: promoPct ? `${promoCode.toUpperCase()} (${promoPct}%)` : "",
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
                  <p>💳 طريقة الدفع: {payMethod === "bank" ? `تحويل بنكي${payType === "deposit" ? " — دفعة مقدمة 50%" : ""}` : "الدفع عند الوصول"}</p>
                  <p className="font-bold text-navy-900">المبلغ المطلوب: {amountDue.toLocaleString()} ريال {payType === "deposit" && payMethod === "bank" ? `(من إجمالي ${total.toLocaleString()})` : ""}</p>
                </div>
                {payMethod === "bank" && <BankBox copied={copied} setCopied={setCopied} />}
                <p className="mt-4 text-sm text-navy-900/55">سيتواصل معك فريقنا قريباً لتأكيد الحجز 🌊</p>
                <button onClick={onClose} className="btn-ocean mt-6 w-full">تم</button>
              </div>
            ) : (
              <div className="max-h-[calc(100vh-13rem)] overflow-y-auto p-6 sm:p-7">
                {/* base info */}
                <div className="grid grid-cols-2 gap-3">
                  <BaseInfo label="عدد الأشخاص الأساسيين" value={`${pkg.maxBase} أشخاص`} />
                  <BaseInfo label="مدة الرحلة" value={pkg.baseDuration} />
                </div>
                <p className="mt-3 rounded-2xl bg-navy-50/70 px-4 py-3 text-sm leading-relaxed text-navy-900/70">{pkg.yacht}</p>

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

                {/* day type */}
                {pkg.dayType ? (
                  <Field label="نوع اليوم">
                    <select value={weekend ? "weekend" : "weekday"} onChange={(e) => setWeekend(e.target.value === "weekend")} className="sw-in">
                      <option value="weekday">وسط الأسبوع</option>
                      <option value="weekend">نهاية الأسبوع (+{pkg.dayType} ريال)</option>
                    </select>
                  </Field>
                ) : null}

                {/* persons */}
                <Field label={`عدد الأشخاص (السعر الأساسي حتى ${pkg.maxBase})`}>
                  <div className="flex items-center gap-4">
                    <Stepper value={persons} min={1} max={pkg.maxPersons} onChange={setPersons} />
                    {extraPersons > 0 && (
                      <span className="text-sm font-semibold text-gold-600">{extraPersons} إضافي × {pkg.extraPerPerson} = +{extraCost.toLocaleString()} ريال</span>
                    )}
                  </div>
                </Field>

                {/* add-ons */}
                {pkg.addons?.length ? (
                  <div className="mt-5">
                    <p className="text-sm font-bold text-navy-900">✨ إضافات اختيارية — اختر ما يناسبك</p>
                    <div className="mt-2 grid gap-2">
                      {pkg.addons.map((a) =>
                        a.stepper ? (
                          <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-navy-50 bg-navy-50/40 px-4 py-3">
                            <span className="text-sm text-navy-900/80">{a.label} <span className="text-turquoise-600">(+{a.price} ريال/وحدة)</span></span>
                            <Stepper value={qty[a.id] || 0} min={0} max={a.max ?? 4} small onChange={(v) => setQty((p) => ({ ...p, [a.id]: v }))} />
                          </div>
                        ) : (
                          <label key={a.id} className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors ${toggles[a.id] ? "border-turquoise-500 bg-turquoise-500/5" : "border-navy-50 bg-navy-50/40"}`}>
                            <span className="flex items-center gap-3 text-sm text-navy-900/80">
                              <input type="checkbox" checked={!!toggles[a.id]} onChange={(e) => setToggles((p) => ({ ...p, [a.id]: e.target.checked }))} className="h-4 w-4 accent-turquoise-500" />
                              {a.label}
                            </span>
                            <span className="shrink-0 text-sm font-bold text-turquoise-600">+{a.price} ريال</span>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                ) : null}

                {/* details */}
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label="تاريخ الرحلة"><input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} className="sw-in" /></Field>
                  <Field label="وقت الانطلاق"><select value={departTime} onChange={(e) => setDepartTime(e.target.value)} className="sw-in">{DEPART_TIMES.map((t) => (<option key={t} value={t}>{timeLabel(t)}</option>))}</select></Field>
                  <Field label="الاسم الكامل"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="أدخل اسمك" className="sw-in" /></Field>
                  <Field label="رقم الجوال"><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XXXXXXXX" className="sw-in" /></Field>
                  <Field label="ملاحظات إضافية" full><textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أي طلبات خاصة..." className="sw-in resize-none" /></Field>
                </div>

                {/* discount code */}
                <Field label="كود الخصم (اختياري)">
                  <div className="flex gap-2">
                    <input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="أدخل الكود" className="sw-in flex-1 text-center font-bold uppercase tracking-widest" style={{ direction: "ltr" }} />
                    <button type="button" onClick={applyPromo} className="rounded-xl bg-navy-900 px-5 font-bold text-white">تطبيق</button>
                  </div>
                </Field>
                {promoMsg && <p className={`-mt-2 text-sm font-semibold ${promoMsg.ok ? "text-emerald-600" : "text-red-600"}`}>{promoMsg.text}</p>}

                {/* price breakdown */}
                <div className="mt-5 space-y-2 rounded-2xl bg-navy-50/60 p-5 text-sm">
                  <Line label="المجموع قبل الخصم" value={`${subtotal.toLocaleString()} ريال`} />
                  <Line label={`خصم موسم الصيف (${DISCOUNT.pct}%)`} value={`− ${seasonDiscount.toLocaleString()} ريال`} green />
                  {promoDiscount > 0 && <Line label={`كود خصم (${promoPct}%)`} value={`− ${promoDiscount.toLocaleString()} ريال`} green />}
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

                {/* deposit option (bank only) */}
                {payMethod === "bank" && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {([["full", "المبلغ كاملاً", `${total.toLocaleString()} ريال`], ["deposit", "دفعة مقدمة 50%", `${deposit.toLocaleString()} ريال الآن`]] as const).map(([val, t, sub]) => (
                      <button key={val} type="button" onClick={() => setPayType(val)} className={`rounded-2xl border-2 p-3 text-center transition-all ${payType === val ? "border-gold-400 bg-gold-400/5" : "border-navy-50 bg-navy-50/40"}`}>
                        <div className="text-sm font-bold text-navy-900">{t}</div>
                        <div className="mt-1 text-xs text-navy-900/55">{sub}</div>
                      </button>
                    ))}
                  </div>
                )}

                {payMethod === "bank" && <BankBox copied={copied} setCopied={setCopied} />}

                {/* total */}
                <div className="mt-5 flex items-center justify-between rounded-2xl bg-navy-900 px-5 py-4 text-white">
                  <div>
                    <span className="block text-sm text-white/70">{payMethod === "bank" && payType === "deposit" ? "المطلوب الآن (50%)" : "الإجمالي"}</span>
                    {payMethod === "bank" && payType === "deposit" && <span className="text-xs text-white/45">من إجمالي {total.toLocaleString()} ريال</span>}
                  </div>
                  <span className="text-2xl font-extrabold text-gold-400">{amountDue.toLocaleString()} <span className="text-sm font-normal text-white/70">ريال</span></span>
                </div>

                {/* cancellation policy */}
                <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-relaxed text-red-700"><strong className="block">⚠️ سياسة الإلغاء</strong>{CANCEL_POLICY}</p>

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

function BaseInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-turquoise-500/8 border border-turquoise-500/20 px-4 py-3 text-center">
      <div className="text-xs text-navy-900/55">{label}</div>
      <div className="mt-0.5 font-extrabold text-turquoise-600">{value}</div>
    </div>
  );
}

function Line({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-navy-900/65">{label}</span>
      <span className={`font-bold ${green ? "text-emerald-600" : "text-navy-900"}`}>{value}</span>
    </div>
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

function Stepper({ value, min, max, onChange, small }: { value: number; min: number; max: number; onChange: (v: number) => void; small?: boolean }) {
  const sz = small ? "h-8 w-8 text-base" : "h-9 w-9 text-lg";
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className={`flex ${sz} items-center justify-center rounded-full border border-ocean-500/40 font-bold text-ocean-600 disabled:opacity-30`}>−</button>
      <span className="w-6 text-center text-lg font-extrabold text-navy-900">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className={`flex ${sz} items-center justify-center rounded-full border border-ocean-500/40 font-bold text-ocean-600 disabled:opacity-30`}>+</button>
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
