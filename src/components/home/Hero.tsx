"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

const SLIDES = [
  { src: "/images/hero-1.webp", alt: "رحلة بحرية فاخرة في ثول" },
  { src: "/images/hero-2.webp", alt: "يخت يبحر في مياه البحر الأحمر" },
  { src: "/images/hero-3.webp", alt: "غروب الشمس على متن رحلة سوار البحرية" },
];

const AUTOPLAY_MS = 3000;

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      AUTOPLAY_MS,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="hero"
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-navy-950"
      aria-roledescription="عرض شرائح"
    >
      {/* Slides */}
      <AnimatePresence>
        {SLIDES.map(
          (slide, i) =>
            i === index && (
              <motion.div
                key={slide.src}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <motion.div
                  initial={{ scale: 1.04 }}
                  animate={{ scale: 1.18 }}
                  transition={{ duration: AUTOPLAY_MS / 1000 + 4, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    className="object-cover"
                  />
                </motion.div>
              </motion.div>
            ),
        )}
      </AnimatePresence>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/55 to-navy-950/70" />
      <div className="absolute inset-0 bg-gradient-to-l from-navy-950/60 via-transparent to-navy-950/30" />

      {/* Content */}
      <div className="container-px relative z-10 flex h-full flex-col items-start justify-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-white/5 px-5 py-2 text-sm font-semibold text-gold-400 backdrop-blur-md"
        >
          <span className="h-2 w-2 rounded-full bg-gold-400" />
          سوار · رحلات بحرية فاخرة في ثول
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl font-cairo text-4xl font-extrabold leading-[1.15] text-white text-balance drop-shadow-lg sm:text-6xl lg:text-7xl"
        >
          عِش معنا متعة بحرية لا تُنسى
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.9 }}
          className="mt-6 max-w-xl text-lg font-medium text-white/85 sm:text-2xl"
        >
          خُض تجربة بحرية لا مثيل لها
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.78, duration: 0.9 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Link href="#adventures" className="btn-gold text-base">
            المزيد
          </Link>
          <Link href="#pricing" className="btn-outline text-base">
            الحجوزات
          </Link>
        </motion.div>
      </div>

      {/* Dot indicators only */}
      <div className="absolute inset-x-0 bottom-10 z-10 flex items-center justify-center gap-3">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`الشريحة ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className="group relative h-2.5"
          >
            <span
              className={`block h-2.5 rounded-full transition-all duration-500 ${
                i === index
                  ? "w-10 bg-gold-400"
                  : "w-2.5 bg-white/50 group-hover:bg-white"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-9 left-8 z-10 hidden flex-col items-center gap-2 text-white/70 lg:flex"
      >
        <span className="text-xs tracking-widest">اسحب للأسفل</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          className="h-8 w-px bg-gradient-to-b from-white/70 to-transparent"
        />
      </motion.div>
    </section>
  );
}
