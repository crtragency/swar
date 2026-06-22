"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionHeading } from "./ui";
import type { Review } from "@/lib/reviews";

export default function TestimonialsSlider({
  reviews,
  rating,
  total,
  source,
  reviewsUrl,
}: {
  reviews: Review[];
  rating: number | null;
  total: number | null;
  source: "google" | "fallback";
  reviewsUrl: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % reviews.length), 5000);
    return () => clearInterval(id);
  }, [reviews.length]);

  const review = reviews[index];
  const initials = review.name.trim().charAt(0) || "★";

  return (
    <section className="relative overflow-hidden bg-navy-950 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(11,92,140,0.3),transparent_60%)]" />
      <div className="container-px relative">
        <SectionHeading
          eyebrow="آراء العملاء"
          title="آراء العملاء"
          description="ثقة عملائنا هي بوصلتنا نحو التميز. تقييمات حقيقية من عملائنا على خرائط Google."
          light
        />

        {/* Google rating badge */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href={reviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 backdrop-blur-md transition-colors hover:border-gold-400/50"
          >
            <GoogleG />
            <span className="text-sm font-bold text-white">تقييمات Google</span>
            {rating != null && (
              <span className="flex items-center gap-1 text-sm font-bold text-gold-400">
                {rating.toFixed(1)} <Star size={14} />
              </span>
            )}
            {total != null && <span className="text-sm text-white/60">({total} تقييم)</span>}
          </a>
        </div>

        <div className="relative mx-auto mt-12 max-w-3xl">
          <span className="mx-auto mb-6 block text-center font-serif text-8xl leading-none text-gold-400/40">”</span>

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

                <p className="text-xl font-medium leading-relaxed text-white/90 sm:text-2xl">{review.text}</p>

                <div className="mt-8 flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-ocean-500 to-turquoise-500 text-xl font-extrabold text-white ring-2 ring-gold-400/40">
                    {initials}
                  </span>
                  <div className="text-start">
                    <p className="text-lg font-bold text-white">{review.name}</p>
                    <p className="text-sm text-turquoise-400">{review.when || "عميل سوار البحرية"}</p>
                  </div>
                </div>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div className="mt-10 flex items-center justify-center gap-3">
            {reviews.map((r, i) => (
              <button key={i} type="button" aria-label={`رأي ${i + 1}`} aria-current={i === index} onClick={() => setIndex(i)} className="h-2.5">
                <span className={`block h-2.5 rounded-full transition-all duration-500 ${i === index ? "w-10 bg-gold-400" : "w-2.5 bg-white/30"}`} />
              </button>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a href={reviewsUrl} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm">
              اقرأ كل التقييمات على Google
            </a>
            {source === "fallback" && (
              <p className="mt-3 text-xs text-white/40">يتم عرض التقييمات الكاملة على Google.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Star({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#D7B36B">
      <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z" />
    </svg>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 010-4.2V7.06H2.18a11 11 0 000 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 002.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  );
}
