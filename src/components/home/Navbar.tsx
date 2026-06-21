"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

const MENU = [
  { label: "رحلات بحرية في ثول", href: "#adventures" },
  { label: "من نحن", href: "#about" },
  { label: "الحجوزات", href: "#pricing" },
  { label: "المدونة", href: "#blog" },
  { label: "التواصل", href: "#contact" },
  { label: "الوسائط", href: "#gallery" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-navy-950/90 py-3 shadow-luxe backdrop-blur-xl"
          : "bg-transparent py-5"
      }`}
    >
      <nav className="container-px flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="#hero" className="flex items-center gap-3" aria-label="سوار">
          <span className="relative block h-12 w-12 overflow-hidden rounded-full ring-1 ring-white/20 sm:h-14 sm:w-14">
            <Image
              src="/images/logo.webp"
              alt="شعار سوار"
              fill
              sizes="56px"
              className="object-cover"
              priority
            />
          </span>
          <span className="hidden text-xl font-extrabold tracking-tight text-white sm:block">
            سوار
          </span>
        </Link>

        {/* Desktop menu */}
        <ul className="hidden items-center gap-7 lg:flex">
          {MENU.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="group relative text-[15px] font-semibold text-white/90 transition-colors hover:text-white"
              >
                {item.label}
                <span className="absolute -bottom-1.5 right-0 h-0.5 w-0 bg-gold-400 transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA + mobile toggle */}
        <div className="flex items-center gap-3">
          <Link href="#contact" className="btn-gold hidden text-sm sm:inline-flex">
            اطلب عرض سعر
          </Link>
          <button
            type="button"
            aria-label="القائمة"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white lg:hidden"
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute right-0 block h-0.5 w-5 bg-white transition-all ${
                  open ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute right-0 top-1.5 block h-0.5 w-5 bg-white transition-all ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute right-0 block h-0.5 w-5 bg-white transition-all ${
                  open ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden lg:hidden"
          >
            <ul className="container-px mt-4 flex flex-col gap-1 rounded-3xl bg-navy-950/95 p-4 backdrop-blur-xl">
              {MENU.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 font-semibold text-white/90 transition-colors hover:bg-white/10"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2">
                <Link
                  href="#contact"
                  onClick={() => setOpen(false)}
                  className="btn-gold w-full"
                >
                  اطلب عرض سعر
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
