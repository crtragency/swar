"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { motion } from "framer-motion";
import { Reveal } from "@/components/home/ui";
import { PACKAGES, DISCOUNT, BANK, type Pkg } from "@/lib/packages";
import { waLink } from "@/lib/site";
import { ALL_PHOTOS, FISHING, HERO_SUNSET, MARINA_BOAT, CABIN } from "@/components/home/images";

const PKG_IMAGE: Record<string, StaticImageData> = {
  swim: ALL_PHOTOS[1],
  fish: FISHING,
  hour: ALL_PHOTOS[6],
  party: ALL_PHOTOS[9],
  dolphin: MARINA_BOAT,
  vip: HERO_SUNSET,
};

function bookMessage(pkg: Pkg) {
  return `مرحباً سوار البحرية 🌊\nأرغب بحجز: ${pkg.title}\nالسعر يبدأ من ${pkg.price.toLocaleString()} ${pkg.unit} (بعد خصم ${DISCOUNT.pct}%)\nالسعة: ${pkg.capacity}\nبرجاء التواصل لتأكيد الموعد.`;
}

export default function BookingPackages() {
  return (
    <section className="relative bg-navy-50/40 py-20 sm:py-28">
      <div className="container-px">
        <Reveal>
          <div className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-1 rounded-3xl border border-gold-400/40 bg-white px-6 py-5 text-center shadow-luxe">
            <span className="text-lg font-extrabold text-navy-900 sm:text-xl">{DISCOUNT.ar}</span>
            <span className="text-sm font-semibold text-navy-900/55">{DISCOUNT.subAr}</span>
          </div>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-2">
          {PACKAGES.map((pkg, i) => (
            <Reveal key={pkg.id} delay={(i % 2) * 0.08} className="h-full">
              <PackageCard pkg={pkg} image={PKG_IMAGE[pkg.id] ?? CABIN} />
            </Reveal>
          ))}
        </div>

        {/* Bank details */}
        <Reveal>
          <div className="mt-16 overflow-hidden rounded-[28px] border border-ocean-500/15 bg-white p-8 shadow-luxe sm:p-10">
            <h3 className="text-2xl font-extrabold text-navy-900">بيانات التحويل البنكي</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <BankRow label="البنك" value={BANK.bank} />
              <BankRow label="اسم الحساب" value={BANK.name} />
              <BankRow label="رقم الآيبان (IBAN)" value={BANK.iban} mono />
            </div>
            <p className="mt-6 rounded-2xl bg-navy-50/70 px-5 py-4 text-sm leading-relaxed text-navy-900/70">
              سياسة الإلغاء: في حال إلغاء الرحلة من قِبَل العميل لأي سبب، لا يُرد المبلغ المحوَّل ولا يُستبدل. في حال وجود مشكلة من طرفنا، يُرد المبلغ كاملاً.
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
      <span className="text-xs text-turquoise-600">{copied ? "تم النسخ ✓" : "اضغط للنسخ"}</span>
    </button>
  );
}

function PackageCard({ pkg, image }: { pkg: Pkg; image: StaticImageData }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className={`flex h-full flex-col overflow-hidden rounded-[28px] bg-white shadow-luxe ${
        pkg.featured ? "ring-2 ring-gold-400" : "border border-navy-50"
      }`}
    >
      {/* photo header */}
      <div className="relative h-56 overflow-hidden">
        <Image src={image} alt={pkg.title} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/35 to-transparent" />
        <span className="absolute right-5 top-5 rounded-full bg-gold-400 px-3 py-1 text-xs font-extrabold text-navy-950">
          خصم {DISCOUNT.pct}%
        </span>
        {pkg.featured && (
          <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold text-navy-950">
            الأكثر تميزاً
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-6">
          <h3 className="text-2xl font-extrabold text-white drop-shadow">{pkg.title}</h3>
          <p className="mt-1 text-sm text-white/85">{pkg.subtitle}</p>
        </div>
      </div>

      {/* price strip */}
      <div className="flex items-end justify-between gap-2 border-b border-navy-50 px-6 py-4">
        <div className="flex items-end gap-2">
          <span className="text-xs text-navy-900/45">يبدأ من</span>
          <span className="text-sm text-navy-900/40 line-through">{pkg.oldPrice.toLocaleString()}</span>
          <span className="text-3xl font-extrabold text-navy-900">{pkg.price.toLocaleString()}</span>
          <span className="text-sm font-semibold text-navy-900/60">{pkg.unit}</span>
        </div>
        <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold text-ocean-600">{pkg.capacity}</span>
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-6">
        <p className="rounded-2xl bg-navy-50/70 px-4 py-3 text-sm leading-relaxed text-navy-900/70">{pkg.yacht}</p>

        {pkg.rows && (
          <ul className="mt-5 flex flex-col gap-2">
            {pkg.rows.map((r) => (
              <li key={r.label} className="flex items-center justify-between gap-3 rounded-xl bg-navy-50/50 px-4 py-3">
                <span className="text-sm text-navy-900/70">{r.label}</span>
                <span className="shrink-0 font-bold text-navy-900">
                  {r.oldPrice && <span className="me-2 text-xs text-navy-900/40 line-through">{r.oldPrice.toLocaleString()}</span>}
                  <span className="text-turquoise-600">{r.price.toLocaleString()}</span>
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
                  <span className="text-xl font-extrabold text-turquoise-600">{t.price.toLocaleString()}</span>
                  <span className="text-xs text-navy-900/50"> ريال</span>
                </div>
                <div className="mt-1 text-[11px] text-navy-900/45">{t.note}</div>
                <ul className="mt-3 space-y-1 text-right text-xs text-navy-900/65">
                  {t.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {pkg.addons && (
          <>
            <p className="mt-5 text-sm font-bold text-navy-900">إضافات اختيارية</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {pkg.addons.map((ad) => (
                <li key={ad.label} className="rounded-full bg-navy-50/70 px-3 py-1.5 text-xs font-semibold text-navy-900/70">
                  {ad.label} <span className="text-turquoise-600">+{ad.price} ريال</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {pkg.includes && (
          <>
            <p className="mt-5 text-sm font-bold text-navy-900">يشمل الباقة</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {pkg.includes.map((inc) => (
                <span key={inc} className="rounded-xl bg-navy-50/50 px-3 py-2 text-xs font-medium text-navy-900/70">{inc}</span>
              ))}
            </div>
          </>
        )}

        {pkg.note && (
          <p className="mt-5 rounded-2xl bg-navy-50/70 px-4 py-3 text-xs leading-relaxed text-navy-900/65">{pkg.note}</p>
        )}

        <a href={waLink(bookMessage(pkg))} target="_blank" rel="noopener" className="mt-auto pt-6">
          <span className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-ocean-600 to-turquoise-500 py-4 font-bold text-white shadow-lg transition-transform hover:scale-[1.02]">
            احجز الآن عبر واتساب
          </span>
        </a>
      </div>
    </motion.article>
  );
}
