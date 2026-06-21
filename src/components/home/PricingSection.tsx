"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal, SectionHeading } from "./ui";
import { PACKAGES, DISCOUNT } from "@/lib/packages";
import { HOME_IMAGES } from "./homeImages";

export default function PricingSection() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const amount = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section id="pricing" className="relative overflow-hidden bg-navy-950 py-24 sm:py-32">
      <div className="container-px relative">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="باقات الحجز"
            title="أسعار رحلات بحرية ثول"
            description="اختر الباقة التي تناسبك واحجز تجربتك البحرية الفاخرة بأفضل الأسعار."
            light
            align="start"
          />
          <div className="hidden gap-3 sm:flex">
            <button type="button" aria-label="السابق" onClick={() => scroll(1)} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-gold-400 hover:text-gold-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" aria-label="التالي" onClick={() => scroll(-1)} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-gold-400 hover:text-gold-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>

        <Reveal>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/5 px-5 py-2.5 text-sm font-bold text-gold-400">
            {DISCOUNT.ar}
          </div>
        </Reveal>

        <div
          ref={trackRef}
          dir="rtl"
          className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {PACKAGES.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              data-card
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
              className={`group relative flex w-[300px] shrink-0 snap-start flex-col overflow-hidden rounded-[26px] bg-white sm:w-[340px] ${
                pkg.featured ? "ring-2 ring-gold-400" : ""
              }`}
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={HOME_IMAGES.pricing[i]}
                  alt={pkg.title}
                  fill
                  sizes="340px"
                  className="object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/20 to-transparent" />
                <span className="absolute right-4 top-4 rounded-full bg-gold-400 px-3 py-1 text-xs font-extrabold text-navy-950">
                  خصم {DISCOUNT.pct}%
                </span>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="text-xl font-extrabold text-white drop-shadow">{pkg.title}</h3>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <p className="text-sm leading-relaxed text-navy-900/60">{pkg.subtitle}</p>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-xs text-navy-900/45">يبدأ من</span>
                  <span className="text-sm text-navy-900/40 line-through">{pkg.oldPrice.toLocaleString()}</span>
                  <span className="text-3xl font-extrabold text-navy-900">{pkg.price.toLocaleString()}</span>
                  <span className="text-sm font-semibold text-navy-900/60">{pkg.unit}</span>
                </div>
                <p className="mt-3 w-fit rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold text-ocean-600">{pkg.capacity}</p>
                <Link href="/booking" className="btn-ocean mt-6 w-full text-sm">احجز الآن</Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
