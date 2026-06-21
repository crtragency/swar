"use client";

import Image, { type StaticImageData } from "next/image";
import { motion } from "framer-motion";

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image: StaticImageData;
}) {
  return (
    <section className="relative flex h-[56vh] min-h-[420px] w-full items-center justify-center overflow-hidden bg-navy-950">
      <motion.div
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image src={image} alt={title} fill priority sizes="100vw" className="object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/55 to-navy-950/70" />

      <div className="container-px relative z-10 flex flex-col items-center text-center">
        {eyebrow && (
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-white/5 px-5 py-2 text-sm font-semibold text-gold-400 backdrop-blur-md"
          >
            <span className="h-2 w-2 rounded-full bg-gold-400" />
            {eyebrow}
          </motion.span>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl font-cairo text-4xl font-extrabold leading-tight text-white text-balance drop-shadow-lg sm:text-6xl"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.8 }}
            className="mt-5 max-w-2xl text-lg text-white/85"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}
