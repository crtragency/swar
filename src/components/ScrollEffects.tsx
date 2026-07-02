"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";

// Top scroll-progress bar + back-to-top button with progress ring.
export default function ScrollEffects() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 26, restDelta: 0.001 });
  const [visible, setVisible] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      setPct(p);
      setVisible(window.scrollY > 600);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const R = 20;
  const C = 2 * Math.PI * R;

  return (
    <>
      {/* progress bar */}
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-[90] h-1 origin-right bg-gradient-to-l from-gold-500 via-turquoise-500 to-ocean-600"
        style={{ scaleX }}
      />

      {/* back to top */}
      <AnimatePresence>
        {visible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 16 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="العودة لأعلى الصفحة"
            className="fixed bottom-24 left-5 z-[80] grid h-12 w-12 place-items-center rounded-full bg-white text-navy-900 shadow-luxe ring-1 ring-navy-900/10 transition-colors hover:bg-navy-50 sm:bottom-6"
          >
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 48 48" aria-hidden>
              <circle cx="24" cy="24" r={R} fill="none" stroke="rgba(10,26,47,0.1)" strokeWidth="3" />
              <circle
                cx="24" cy="24" r={R} fill="none"
                stroke="url(#swGrad)" strokeWidth="3" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
              />
              <defs>
                <linearGradient id="swGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#d4a938" />
                </linearGradient>
              </defs>
            </svg>
            <span className="relative text-lg">↑</span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
