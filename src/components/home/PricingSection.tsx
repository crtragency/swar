"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal, SectionHeading } from "./ui";
import { PACKAGES, DISCOUNT } from "@/lib/packages";

const ACCENT: Record<string, string> = {
  turquoise: "from-turquoise-500 to-ocean-500",
  green: "from-emerald-500 to-teal-500",
  gold: "from-gold-500 to-gold-600",
  pink: "from-pink-500 to-rose-500",
  blue: "from-ocean-500 to-ocean-600",
  purple: "from-violet-600 to-purple-700",
};

export default function PricingSection() {
  return (
    <section id="pricing" className="relative overflow-hidden bg-ocean-gradient py-24 sm:py-32">
      <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-turquoise-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />

      <div className="container-px relative">
        <SectionHeading
          eyebrow="باقات الحجز"
          title="أسعار رحلات بحرية ثول"
          description="اختر الباقة التي تناسبك واحجز تجربتك البحرية الفاخرة بأفضل الأسعار وأرقى الخدمات."
          light
        />

        <Reveal>
          <div className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-6 py-3 text-center text-sm font-bold text-gold-400 sm:text-base">
            🌞 {DISCOUNT.ar}
          </div>
        </Reveal>

        <div className="mt-14 grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PACKAGES.map((pkg, i) => (
            <Reveal key={pkg.id} delay={(i % 3) * 0.08} className="h-full">
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                className={`relative flex h-full flex-col overflow-hidden rounded-[26px] p-7 ${
                  pkg.featured
                    ? "bg-white shadow-gold ring-2 ring-gold-400"
                    : "glass text-white"
                }`}
              >
                <span className="absolute left-5 top-5 rounded-full bg-red-500 px-3 py-1 text-xs font-extrabold text-white shadow-lg">
                  خصم {DISCOUNT.pct}%
                </span>

                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl ${ACCENT[pkg.accent]} ${pkg.featured ? "" : "shadow-lg"}`}>
                  {pkg.emoji}
                </span>

                <h3 className={`mt-5 text-xl font-extrabold ${pkg.featured ? "text-navy-900" : "text-white"}`}>
                  {pkg.title}
                </h3>
                <p className={`mt-1 text-sm leading-relaxed ${pkg.featured ? "text-navy-900/60" : "text-white/70"}`}>
                  {pkg.subtitle}
                </p>

                <div className="mt-5 flex items-end gap-2">
                  <span className={`text-xs ${pkg.featured ? "text-navy-900/50" : "text-white/55"}`}>يبدأ من</span>
                  <span className={`text-sm line-through ${pkg.featured ? "text-navy-900/40" : "text-white/45"}`}>
                    {pkg.oldPrice.toLocaleString()}
                  </span>
                  <span className={`text-3xl font-extrabold ${pkg.featured ? "text-navy-900" : "text-turquoise-400"}`}>
                    {pkg.price.toLocaleString()}
                  </span>
                  <span className={`text-sm font-semibold ${pkg.featured ? "text-navy-900/70" : "text-white/70"}`}>
                    {pkg.unit}
                  </span>
                </div>

                <p className={`mt-3 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${pkg.featured ? "bg-navy-50 text-ocean-600" : "bg-white/10 text-turquoise-400"}`}>
                  👥 {pkg.capacity}
                </p>

                <Link href="/booking" className={`mt-6 ${pkg.featured ? "btn-gold" : "btn-ocean"} w-full text-sm`}>
                  احجز الآن
                </Link>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
