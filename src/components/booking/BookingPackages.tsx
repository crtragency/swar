"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/home/ui";
import { PACKAGES, DISCOUNT, BANK, type Pkg } from "@/lib/packages";
import { waLink } from "@/lib/site";

const ACCENT: Record<string, { grad: string; text: string; soft: string }> = {
  turquoise: { grad: "from-turquoise-500 to-ocean-500", text: "text-turquoise-600", soft: "bg-turquoise-500/10" },
  green: { grad: "from-emerald-500 to-teal-500", text: "text-emerald-600", soft: "bg-emerald-500/10" },
  gold: { grad: "from-gold-500 to-gold-600", text: "text-gold-600", soft: "bg-gold-500/10" },
  pink: { grad: "from-pink-500 to-rose-500", text: "text-rose-600", soft: "bg-rose-500/10" },
  blue: { grad: "from-ocean-500 to-ocean-600", text: "text-ocean-600", soft: "bg-ocean-500/10" },
  purple: { grad: "from-violet-600 to-purple-700", text: "text-violet-600", soft: "bg-violet-500/10" },
};

function bookMessage(pkg: Pkg) {
  return `مرحباً سوار البحرية 🌊\nأرغب بحجز: ${pkg.emoji} ${pkg.title}\nالسعر يبدأ من ${pkg.price.toLocaleString()} ${pkg.unit} (بعد خصم ${DISCOUNT.pct}%)\nالسعة: ${pkg.capacity}\nبرجاء التواصل لتأكيد الموعد.`;
}

export default function BookingPackages() {
  return (
    <section className="relative bg-navy-50/40 py-20 sm:py-28">
      <div className="container-px">
        <Reveal>
          <div className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-1 rounded-3xl bg-gradient-to-l from-gold-600 to-gold-400 px-6 py-5 text-center text-navy-950 shadow-gold">
            <span className="text-lg font-extrabold sm:text-xl">🌞 {DISCOUNT.ar}</span>
            <span className="text-sm font-semibold opacity-80">{DISCOUNT.subAr}</span>
          </div>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-2">
          {PACKAGES.map((pkg, i) => (
            <Reveal key={pkg.id} delay={(i % 2) * 0.08} className="h-full">
              <PackageCard pkg={pkg} />
            </Reveal>
          ))}
        </div>

        {/* Bank details */}
        <Reveal>
          <div className="mt-16 overflow-hidden rounded-[28px] border border-ocean-500/15 bg-white p-8 shadow-luxe sm:p-10">
            <h3 className="flex items-center gap-3 text-2xl font-extrabold text-navy-900">
              🏦 بيانات التحويل البنكي
            </h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <BankRow label="البنك" value={BANK.bank} />
              <BankRow label="اسم الحساب" value={BANK.name} />
              <BankRow label="رقم الآيبان (IBAN)" value={BANK.iban} mono />
            </div>
            <p className="mt-6 rounded-2xl bg-gold-500/10 px-5 py-4 text-sm leading-relaxed text-gold-600">
              ⚠️ سياسة الإلغاء: في حال إلغاء الرحلة من قِبَل العميل لأي سبب، لا يُرد المبلغ المحوَّل ولا يُستبدل. في حال وجود مشكلة من طرفنا، يُرد المبلغ كاملاً.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function BankRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex flex-col items-start gap-1 rounded-2xl bg-navy-50/60 px-5 py-4 text-start transition-colors hover:bg-navy-50"
    >
      <span className="text-xs text-navy-900/50">{label}</span>
      <span className={`font-bold text-navy-900 ${mono ? "font-mono tracking-wide" : ""}`}>{value}</span>
      <span className="text-xs text-turquoise-600">{copied ? "✅ تم النسخ" : "اضغط للنسخ"}</span>
    </button>
  );
}

function PackageCard({ pkg }: { pkg: Pkg }) {
  const a = ACCENT[pkg.accent];
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className={`flex h-full flex-col overflow-hidden rounded-[28px] bg-white shadow-luxe ${
        pkg.featured ? "ring-2 ring-gold-400" : "border border-navy-50"
      }`}
    >
      {/* header */}
      <div className={`relative bg-gradient-to-l ${a.grad} p-7 text-white`}>
        {pkg.featured && (
          <span className="absolute left-6 top-6 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold text-navy-950">
            الأكثر تميزاً
          </span>
        )}
        <span className="text-4xl">{pkg.emoji}</span>
        <h3 className="mt-3 text-2xl font-extrabold">{pkg.title}</h3>
        <p className="mt-1 text-sm text-white/85">{pkg.subtitle}</p>
        <div className="mt-5 flex items-end gap-2">
          <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-extrabold">خصم {DISCOUNT.pct}%</span>
          <span className="text-sm text-white/70 line-through">{pkg.oldPrice.toLocaleString()}</span>
          <span className="text-4xl font-extrabold">{pkg.price.toLocaleString()}</span>
          <span className="text-sm font-semibold text-white/85">{pkg.unit}</span>
        </div>
        <p className="mt-2 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">👥 {pkg.capacity}</p>
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-7">
        <p className="rounded-2xl bg-navy-50/70 px-4 py-3 text-sm leading-relaxed text-navy-900/70">
          ⚓ {pkg.yacht}
        </p>

        {pkg.rows && (
          <ul className="mt-5 flex flex-col gap-2">
            {pkg.rows.map((r) => (
              <li key={r.label} className="flex items-center justify-between gap-3 rounded-xl bg-navy-50/50 px-4 py-3">
                <span className="text-sm text-navy-900/70">{r.label}</span>
                <span className="shrink-0 font-bold text-navy-900">
                  {r.oldPrice && <span className="me-2 text-xs text-navy-900/40 line-through">{r.oldPrice.toLocaleString()}</span>}
                  <span className={a.text}>{r.price.toLocaleString()}</span>
                  <span className="ms-1 text-xs font-normal text-navy-900/50">ريال</span>
                </span>
              </li>
            ))}
          </ul>
        )}

        {pkg.tiers && (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {pkg.tiers.map((t) => (
              <div key={t.name} className="rounded-2xl border border-navy-50 bg-navy-50/40 p-4 text-center">
                <div className="text-base font-extrabold text-navy-900">{t.name}</div>
                <div className="mt-1">
                  <span className="text-xs text-navy-900/40 line-through">{t.oldPrice.toLocaleString()}</span>{" "}
                  <span className={`text-xl font-extrabold ${a.text}`}>{t.price.toLocaleString()}</span>
                  <span className="text-xs text-navy-900/50"> ريال</span>
                </div>
                <div className="mt-1 text-[11px] text-navy-900/45">{t.note}</div>
                <ul className="mt-3 space-y-1 text-right text-xs text-navy-900/65">
                  {t.items.map((it) => (
                    <li key={it}>✦ {it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {pkg.addons && (
          <>
            <p className={`mt-5 text-sm font-bold ${a.text}`}>✨ إضافات اختيارية</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {pkg.addons.map((ad) => (
                <li key={ad.label} className="rounded-full bg-navy-50/70 px-3 py-1.5 text-xs font-semibold text-navy-900/70">
                  {ad.label} <span className={a.text}>+{ad.price} ريال</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {pkg.includes && (
          <>
            <p className={`mt-5 text-sm font-bold ${a.text}`}>✅ يشمل الباقة</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {pkg.includes.map((inc) => (
                <span key={inc} className="rounded-xl bg-navy-50/50 px-3 py-2 text-xs font-medium text-navy-900/70">
                  {inc}
                </span>
              ))}
            </div>
          </>
        )}

        {pkg.note && (
          <p className="mt-5 rounded-2xl bg-gold-500/10 px-4 py-3 text-xs leading-relaxed text-gold-600">💡 {pkg.note}</p>
        )}

        <a
          href={waLink(bookMessage(pkg))}
          target="_blank"
          rel="noopener"
          className={`mt-auto pt-6`}
        >
          <span className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l ${a.grad} py-4 font-bold text-white shadow-lg transition-transform hover:scale-[1.02]`}>
            احجز الآن عبر واتساب
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2z" /></svg>
          </span>
        </a>
      </div>
    </motion.article>
  );
}
