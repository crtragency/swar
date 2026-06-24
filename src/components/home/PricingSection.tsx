"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal } from "./ui";
import { PACKAGES as DEFAULT_PACKAGES, pkgText, type Pkg } from "@/lib/packages";
import { HOME_IMAGES } from "./homeImages";
import { useI18n, pick } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";

export default function PricingSection({ packages }: { packages?: Pkg[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { t, locale } = useI18n();
  const { discountPct } = useSettings();
  const sar = pick(locale, "ريال", "SAR");
  const PACKAGES = packages && packages.length ? packages : DEFAULT_PACKAGES;

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const amount = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-gradient-to-b from-white via-white to-navy-50/60 py-24 sm:py-32"
    >
      {/* faint nautical accents */}
      <div className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-turquoise-500/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-gold-500/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-gold-400/50 to-transparent" />

      <div className="container-px relative">
        {/* header */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <Reveal>
              <span className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.25em] text-turquoise-600">
                <span className="h-px w-10 bg-gradient-to-l from-turquoise-500 to-transparent" />
                {t("pricing.eyebrow")}
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-4 font-cairo text-4xl font-extrabold leading-[1.15] text-navy-900 sm:text-5xl">
                {t("pricing.title")}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 text-lg leading-relaxed text-navy-900/60">{t("pricing.desc")}</p>
            </Reveal>
          </div>

          {/* arrows */}
          <Reveal delay={0.1}>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="السابق"
                onClick={() => scroll(1)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-navy-900/15 text-navy-900 transition-all hover:border-gold-500 hover:bg-gold-500 hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button
                type="button"
                aria-label="التالي"
                onClick={() => scroll(-1)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-navy-900/15 text-navy-900 transition-all hover:border-gold-500 hover:bg-gold-500 hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </Reveal>
        </div>

        {/* discount line */}
        <Reveal>
          <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-gold-400/40 bg-gold-400/10 px-5 py-3">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-gold-500 text-xs font-extrabold text-white">٪</span>
            <span className="text-sm font-bold text-navy-900 sm:text-[15px]">
              {pick(locale, "خصم", "Save")} <span className="text-gold-600">{discountPct}%</span> {t("pricing.discount")}
            </span>
          </div>
        </Reveal>

        {/* cards */}
        <div
          ref={trackRef}
          dir="rtl"
          className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {PACKAGES.map((pkg, i) => (
            <motion.article
              key={pkg.id}
              data-card
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative flex w-[290px] shrink-0 snap-start flex-col overflow-hidden rounded-[26px] bg-white shadow-[0_18px_50px_-24px_rgba(10,26,47,0.45)] ring-1 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_70px_-28px_rgba(10,26,47,0.5)] sm:w-[330px] ${
                pkg.featured ? "ring-2 ring-gold-400" : "ring-navy-900/5"
              }`}
            >
              {/* image */}
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={HOME_IMAGES.pricing[i % HOME_IMAGES.pricing.length]}
                  alt={pkgText(locale, pkg, "title")}
                  fill
                  sizes="330px"
                  className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.08]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/25 to-transparent" />

                {/* discount ribbon */}
                <span className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-navy-900 shadow-md backdrop-blur">
                  {t("pricing.save")} {discountPct}%
                </span>
                {pkg.featured && (
                  <span className="absolute left-4 top-4 rounded-full bg-gold-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                    {pick(locale, "الأكثر طلباً", "Most popular")}
                  </span>
                )}

                <h3 className="absolute inset-x-0 bottom-0 p-5 text-2xl font-extrabold leading-tight text-white drop-shadow">
                  {pkgText(locale, pkg, "title")}
                </h3>
              </div>

              {/* body */}
              <div className="flex flex-1 flex-col p-6">
                <p className="min-h-[44px] text-sm leading-relaxed text-navy-900/55">{pkgText(locale, pkg, "subtitle")}</p>

                <div className="my-5 h-px bg-navy-900/5" />

                <div className="flex items-end justify-between gap-3">
                  <div>
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-navy-900/40">{t("pricing.from")}</span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-cairo text-4xl font-black leading-none text-navy-900">{pkg.price.toLocaleString()}</span>
                      <span className="text-sm font-semibold text-navy-900/55">{pkgText(locale, pkg, "unit")}</span>
                    </div>
                    <span className="text-xs text-navy-900/35 line-through">{pkg.oldPrice.toLocaleString()} {sar}</span>
                  </div>
                  <span className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-3 py-1.5 text-xs font-semibold text-navy-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-turquoise-500" />
                    {pkgText(locale, pkg, "capacity")}
                  </span>
                </div>

                <Link
                  href="/booking"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 py-3.5 font-bold text-white transition-colors duration-300 hover:bg-gold-500 hover:text-navy-950"
                >
                  {t("cta.book")}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        <Reveal>
          <div className="mt-10 text-center">
            <Link href="/booking" className="inline-flex items-center gap-2 font-bold text-navy-900 transition-colors hover:text-gold-600">
              {t("pricing.viewAll")}
              <span className="text-gold-500">←</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
