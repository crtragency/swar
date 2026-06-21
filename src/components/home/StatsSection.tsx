"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Reveal } from "./ui";

const STATS = [
  { value: 12, suffix: "", label: "سنة خبرة" },
  { value: 97, suffix: "%", label: "رضا العملاء" },
  { value: 8, suffix: "k", label: "رحلات مكتملة" },
  { value: 19, suffix: "k", label: "مسافرون سعداء" },
];

function Counter({
  value,
  suffix,
  start,
}: {
  value: number;
  suffix: string;
  start: boolean;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const duration = 1800;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, value]);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative overflow-hidden bg-ocean-gradient py-20 sm:py-24">
      <div className="pointer-events-none absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-turquoise-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />

      <div ref={ref} className="container-px relative">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.1}>
              <div className="flex flex-col items-center text-center">
                <div className="mb-2 bg-gradient-to-b from-white to-gold-400 bg-clip-text font-cairo text-5xl font-extrabold text-transparent sm:text-6xl lg:text-7xl">
                  <Counter
                    value={stat.value}
                    suffix={stat.suffix}
                    start={inView}
                  />
                </div>
                <span className="h-1 w-12 rounded-full bg-gold-400" />
                <p className="mt-3 text-base font-semibold text-white/85 sm:text-lg">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
