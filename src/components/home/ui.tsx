"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  light?: boolean;
  align?: "center" | "start";
}) {
  return (
    <div
      className={`flex max-w-3xl flex-col gap-4 ${
        align === "center" ? "mx-auto items-center text-center" : "items-start text-start"
      }`}
    >
      {eyebrow && (
        <Reveal>
          <span className="eyebrow">
            <span className="h-px w-8 bg-gradient-to-l from-turquoise-500 to-transparent" />
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2
          className={`heading-lg text-balance ${light ? "text-white" : "text-navy-900"}`}
        >
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.1}>
          <p
            className={`text-lg leading-relaxed ${
              light ? "text-white/75" : "text-navy-900/65"
            }`}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
