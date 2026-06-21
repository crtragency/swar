"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Reveal, SectionHeading } from "./ui";

const ADVENTURES = [
  {
    title: "رحلات اليخوت الفاخرة",
    desc: "أبحر على متن أفخم اليخوت واستمتع بخدمة متكاملة على مياه البحر الأحمر.",
    image: "/images/hero-1.webp",
    tag: "الأكثر طلباً",
  },
  {
    title: "الغوص واستكشاف الشعاب",
    desc: "اكتشف عالماً مدهشاً تحت الماء بين الشعاب المرجانية والكائنات البحرية.",
    image: "/images/hero-2.webp",
    tag: "مغامرة",
  },
  {
    title: "رحلات الغروب الرومانسية",
    desc: "لحظات ساحرة مع غروب الشمس على متن رحلة بحرية لا تُنسى.",
    image: "/images/hero-3.webp",
    tag: "تجربة مميزة",
  },
];

export default function AdventureSection() {
  return (
    <section id="adventures" className="relative bg-white py-24 sm:py-32">
      <div className="container-px">
        <SectionHeading
          eyebrow="استكشف معنا"
          title="أقسام المغامرات"
          description="باقة متنوعة من التجارب البحرية الفاخرة المصممة لتمنحك أرقى لحظات المتعة والاستكشاف."
        />

        <div className="mt-16 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {ADVENTURES.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.1}>
              <motion.article
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 250, damping: 20 }}
                className="group relative h-[440px] overflow-hidden rounded-[28px] shadow-luxe"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                />
                {/* overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent transition-opacity duration-500 group-hover:from-navy-950/95" />

                <span className="absolute right-5 top-5 rounded-full border border-gold-400/50 bg-navy-950/40 px-4 py-1.5 text-xs font-bold text-gold-400 backdrop-blur-md">
                  {item.tag}
                </span>

                <div className="absolute inset-x-0 bottom-0 p-7">
                  <h3 className="text-2xl font-extrabold text-white drop-shadow">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-h-0 overflow-hidden text-white/80 opacity-0 transition-all duration-500 group-hover:max-h-28 group-hover:opacity-100">
                    {item.desc}
                  </p>
                  <span className="mt-4 inline-flex translate-y-3 items-center gap-2 text-sm font-bold text-turquoise-400 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    اكتشف المزيد
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M19 12H5M11 6l-6 6 6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
