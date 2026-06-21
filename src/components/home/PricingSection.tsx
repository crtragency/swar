"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal, SectionHeading } from "./ui";

const PLANS = [
  {
    name: "رحلة بحرية قصيرة",
    duration: "ساعتان",
    price: "490",
    oldPrice: "650",
    discount: "25%",
    image: "/images/hero-2.webp",
    features: [
      "جولة بحرية على متن يخت فاخر",
      "مشروبات ترحيبية",
      "طاقم خدمة متكامل",
      "سترات نجاة لجميع الركاب",
    ],
    featured: false,
  },
  {
    name: "رحلة بحرية مميزة",
    duration: "نصف يوم",
    price: "990",
    oldPrice: "1300",
    discount: "30%",
    image: "/images/hero-1.webp",
    features: [
      "جولة بحرية ممتدة في ثول",
      "وجبة غداء بحرية فاخرة",
      "معدات سباحة وغوص",
      "جلسة تصوير احترافية",
      "طاقم خدمة خاص",
    ],
    featured: true,
  },
  {
    name: "رحلة اليوم الكامل",
    duration: "يوم كامل",
    price: "1790",
    oldPrice: "2200",
    discount: "20%",
    image: "/images/hero-3.webp",
    features: [
      "تجربة بحرية متكاملة طوال اليوم",
      "وجبات ومشروبات فاخرة",
      "رحلة غوص بصحبة مدرب",
      "نقاط توقف للسباحة والاستجمام",
    ],
    featured: false,
  },
];

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

        <div className="mt-16 grid items-stretch gap-7 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.1} className="h-full">
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                className={`relative flex h-full flex-col overflow-hidden rounded-[28px] ${
                  plan.featured
                    ? "bg-white shadow-gold ring-2 ring-gold-400 lg:-translate-y-4"
                    : "glass"
                }`}
              >
                {plan.featured && (
                  <span className="absolute right-0 top-6 z-10 rounded-l-full bg-gradient-to-l from-gold-600 to-gold-400 px-5 py-1.5 text-sm font-bold text-navy-950">
                    الأكثر تميزاً
                  </span>
                )}

                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={plan.image}
                    alt={plan.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
                  <span className="absolute right-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-extrabold text-white shadow-lg">
                    خصم {plan.discount}
                  </span>
                  <div className="absolute bottom-4 right-5">
                    <h3
                      className={`text-2xl font-extrabold ${
                        plan.featured ? "text-white" : "text-white"
                      }`}
                    >
                      {plan.name}
                    </h3>
                    <p className="text-sm text-white/80">{plan.duration}</p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-7">
                  <div className="flex items-end gap-2">
                    <span
                      className={`text-4xl font-extrabold ${
                        plan.featured ? "text-navy-900" : "text-white"
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={`text-base font-semibold ${
                        plan.featured ? "text-navy-900/70" : "text-white/70"
                      }`}
                    >
                      ر.س
                    </span>
                    <span
                      className={`mr-1 text-base line-through ${
                        plan.featured ? "text-navy-900/40" : "text-white/45"
                      }`}
                    >
                      {plan.oldPrice}
                    </span>
                  </div>

                  <ul className="mt-6 flex flex-1 flex-col gap-3">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className={`flex items-start gap-3 text-[15px] ${
                          plan.featured ? "text-navy-900/80" : "text-white/85"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            plan.featured
                              ? "bg-turquoise-500 text-white"
                              : "bg-turquoise-500/20 text-turquoise-400"
                          }`}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M20 6L9 17l-5-5"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="#contact"
                    className={`mt-8 ${plan.featured ? "btn-gold" : "btn-ocean"} w-full`}
                  >
                    احجز الآن
                  </Link>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
