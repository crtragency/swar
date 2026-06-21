"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ALL_PHOTOS } from "@/components/home/images";

export default function MediaGallery() {
  const [active, setActive] = useState<number | null>(null);
  const count = ALL_PHOTOS.length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (active === null) return;
      if (e.key === "ArrowLeft") setActive((i) => ((i ?? 0) + 1) % count);
      if (e.key === "ArrowRight") setActive((i) => ((i ?? 0) - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, count]);

  return (
    <section className="bg-navy-50/40 py-20 sm:py-28">
      <div className="container-px">
        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
          {ALL_PHOTOS.map((src, i) => (
            <motion.button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 8) * 0.04 }}
              className="group relative block w-full overflow-hidden rounded-2xl shadow-luxe"
              aria-label={`صورة ${i + 1} من معرض سوار البحرية`}
            >
              <Image src={src} alt={`من معرض سوار البحرية ${i + 1}`} sizes="(max-width:768px) 50vw, 25vw" className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-105" placeholder="blur" />
              <span className="absolute inset-0 bg-navy-950/0 transition-colors duration-500 group-hover:bg-navy-950/25" />
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-950/92 p-5 backdrop-blur-md"
          >
            <button type="button" aria-label="إغلاق" onClick={() => setActive(null)} className="absolute left-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/10">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
            <button type="button" aria-label="السابق" onClick={(e) => { e.stopPropagation(); setActive((i) => ((i ?? 0) - 1 + count) % count); }} className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/10 sm:flex">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" aria-label="التالي" onClick={(e) => { e.stopPropagation(); setActive((i) => ((i ?? 0) + 1) % count); }} className="absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/10 sm:flex">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <motion.div
              key={active}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative h-[78vh] w-full max-w-4xl"
            >
              <Image src={ALL_PHOTOS[active]} alt={`من معرض سوار البحرية ${active + 1}`} fill sizes="90vw" className="object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
