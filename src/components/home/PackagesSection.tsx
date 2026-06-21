"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal, SectionHeading } from "./ui";
import { HERO_1, HERO_2, HERO_3 } from "./images";

const PACKAGES = [
  {
    title: "باقة العائلة",
    desc: "تجربة بحرية آمنة وممتعة مصممة للعائلات لقضاء أجمل الأوقات معاً.",
    image: HERO_1,
    items: ["يخت عائلي واسع", "أنشطة للأطفال", "وجبات خفيفة"],
  },
  {
    title: "باقة المغامرة",
    desc: "للباحثين عن الإثارة، رحلة غوص واستكشاف بين أعماق البحر الأحمر.",
    image: HERO_2,
    items: ["غوص بصحبة مدرب", "معدات احترافية", "استكشاف الشعاب"],
  },
  {
    title: "باقة المناسبات",
    desc: "احتفل بمناسباتك الخاصة على متن يخت فاخر بأجواء استثنائية.",
    image: HERO_3,
    items: ["تجهيز خاص للمناسبة", "ضيافة فاخرة", "تصوير احترافي"],
  },
];

export default function PackagesSection() {
  return (
    <section id="packages" className="relative bg-white py-24 sm:py-32">
      <div className="container-px">
        <SectionHeading
          eyebrow="اختر تجربتك"
          title="باقاتنا البحرية"
          description="باقات متكاملة صُممت بعناية لتلبي كل الأذواق وتمنحك تجربة بحرية فاخرة لا مثيل لها."
        />

        <div className="mt-16 space-y-7">
          {PACKAGES.map((pkg, i) => (
            <Reveal key={pkg.title} delay={i * 0.08}>
              <motion.article
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                className={`group grid overflow-hidden rounded-[32px] border border-navy-50 bg-navy-50/30 shadow-luxe md:grid-cols-2 ${
                  i % 2 === 1 ? "md:[direction:ltr]" : ""
                }`}
              >
                <div className="relative h-64 overflow-hidden md:h-auto md:[direction:rtl]">
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/30 to-transparent" />
                </div>

                <div className="flex flex-col justify-center p-8 sm:p-12 md:[direction:rtl]">
                  <span className="eyebrow mb-3">باقة {i + 1}</span>
                  <h3 className="text-3xl font-extrabold text-navy-900">
                    {pkg.title}
                  </h3>
                  <p className="mt-3 text-lg leading-relaxed text-navy-900/65">
                    {pkg.desc}
                  </p>
                  <ul className="mt-6 flex flex-wrap gap-3">
                    {pkg.items.map((it) => (
                      <li
                        key={it}
                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ocean-600 shadow-sm"
                      >
                        {it}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="#contact"
                    className="btn-ocean mt-8 w-fit text-sm"
                  >
                    احجز هذه الباقة
                  </Link>
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
