"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal, SectionHeading } from "./ui";

const IMAGES = [
  { src: "/images/hero-1.webp", alt: "لحظة بحرية على متن يخت سوار", span: "row-span-2" },
  { src: "/images/hero-2.webp", alt: "إبحار في مياه ثول الصافية", span: "" },
  { src: "/images/hero-3.webp", alt: "غروب ساحر فوق البحر الأحمر", span: "" },
  { src: "/images/hero-2.webp", alt: "متعة السباحة في عرض البحر", span: "" },
  { src: "/images/hero-3.webp", alt: "أجواء عائلية على متن الرحلة", span: "row-span-2" },
  { src: "/images/hero-1.webp", alt: "مغامرة بحرية لا تُنسى", span: "" },
];

export default function GallerySection() {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (active === null) return;
      if (e.key === "ArrowLeft") setActive((i) => ((i ?? 0) + 1) % IMAGES.length);
      if (e.key === "ArrowRight")
        setActive((i) => ((i ?? 0) - 1 + IMAGES.length) % IMAGES.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <section className="relative bg-navy-50/40 py-24 sm:py-32">
      <div className="container-px">
        <SectionHeading
          eyebrow="معرض الصور"
          title="أجمل لحظاتنا في البحر"
          description="لمحات من رحلاتنا البحرية الفاخرة، حيث تتحول كل لحظة إلى ذكرى لا تُنسى."
        />

        <div className="mt-16 grid auto-rows-[200px] grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
          {IMAGES.map((img, i) => (
            <Reveal
              key={i}
              delay={(i % 4) * 0.08}
              className={`${img.span} h-full`}
            >
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`عرض ${img.alt}`}
                className="group relative h-full w-full overflow-hidden rounded-3xl shadow-luxe"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-navy-950/0 transition-colors duration-500 group-hover:bg-navy-950/35" />
                <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-white/15 text-white backdrop-blur-md">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16zM11 8v6M8 11h6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-950/90 p-5 backdrop-blur-md"
          >
            <button
              type="button"
              aria-label="إغلاق"
              onClick={() => setActive(null)}
              className="absolute left-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/10"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <motion.div
              key={active}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative h-[70vh] w-full max-w-4xl overflow-hidden rounded-3xl"
            >
              <Image
                src={IMAGES[active].src}
                alt={IMAGES[active].alt}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
