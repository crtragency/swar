"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionHeading } from "./ui";

const REVIEWS = [
  {
    name: "عبدالله الحربي",
    role: "رجل أعمال",
    initials: "ع",
    rating: 5,
    text: "تجربة بحرية فاخرة بكل ما تحمله الكلمة من معنى. الخدمة كانت راقية والطاقم محترف، وقضينا يوماً لا يُنسى على متن اليخت.",
  },
  {
    name: "نورة القحطاني",
    role: "مصممة",
    initials: "ن",
    rating: 5,
    text: "أجمل رحلة بحرية خضتها في ثول. التنظيم رائع والمناظر خلابة، بالتأكيد سأكرر التجربة مع سوار مرة أخرى.",
  },
  {
    name: "فهد العتيبي",
    role: "مهندس",
    initials: "ف",
    rating: 5,
    text: "اخترنا باقة العائلة وكانت مثالية للأطفال والكبار. اهتمام بأدق التفاصيل وأمان عالٍ. شكراً لفريق سوار على هذه المتعة.",
  },
  {
    name: "سارة الدوسري",
    role: "طبيبة",
    initials: "س",
    rating: 5,
    text: "احتفلنا بمناسبة خاصة على متن اليخت، والأجواء كانت ساحرة. ضيافة فاخرة وخدمة استثنائية تستحق كل تقدير.",
  },
];

export default function TestimonialsSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % REVIEWS.length),
      5000,
    );
    return () => clearInterval(id);
  }, []);

  const review = REVIEWS[index];

  return (
    <section className="relative overflow-hidden bg-navy-950 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(11,92,140,0.3),transparent_60%)]" />
      <div className="container-px relative">
        <SectionHeading
          eyebrow="شهادات النجاح"
          title="آراء العملاء"
          description="ثقة عملائنا هي بوصلتنا نحو التميز. اطلع على تجاربهم البحرية معنا."
          light
        />

        <div className="relative mx-auto mt-16 max-w-3xl">
          {/* Quote mark */}
          <span className="mx-auto mb-8 block text-center font-serif text-8xl leading-none text-gold-400/40">
            ”
          </span>

          <div className="relative min-h-[260px]">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={index}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-6 flex gap-1.5">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} />
                  ))}
                </div>

                <p className="text-xl font-medium leading-relaxed text-white/90 sm:text-2xl">
                  {review.text}
                </p>

                <div className="mt-8 flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-ocean-500 to-turquoise-500 text-xl font-extrabold text-white ring-2 ring-gold-400/40">
                    {review.initials}
                  </span>
                  <div className="text-start">
                    <p className="text-lg font-bold text-white">{review.name}</p>
                    <p className="text-sm text-turquoise-400">{review.role}</p>
                  </div>
                </div>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="mt-10 flex items-center justify-center gap-3">
            {REVIEWS.map((r, i) => (
              <button
                key={r.name}
                type="button"
                aria-label={`رأي ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className="h-2.5"
              >
                <span
                  className={`block h-2.5 rounded-full transition-all duration-500 ${
                    i === index ? "w-10 bg-gold-400" : "w-2.5 bg-white/30"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Star() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#D7B36B">
      <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z" />
    </svg>
  );
}
