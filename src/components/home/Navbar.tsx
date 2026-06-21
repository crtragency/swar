"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LOGO } from "./images";
import { NAV, BOOK_CTA } from "@/lib/site";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Solid background on inner pages (no hero) or after scroll.
  const solid = scrolled || !isHome;

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid
          ? "bg-navy-950/90 py-2.5 shadow-luxe backdrop-blur-xl"
          : "bg-transparent py-4"
      }`}
    >
      <nav className="container-px flex items-center justify-between gap-4">
        {/* Logo — kept on a clean white pill, natural aspect ratio, never cropped */}
        <Link href="/" aria-label="سوار البحرية" className="shrink-0">
          <span className="flex h-12 items-center rounded-2xl bg-white px-3 shadow-md ring-1 ring-black/5 sm:h-14 sm:px-4">
            <Image
              src={LOGO}
              alt="شعار سوار البحرية"
              priority
              className="h-8 w-auto sm:h-10"
            />
          </span>
        </Link>

        {/* Desktop menu */}
        <ul className="hidden items-center gap-6 lg:flex xl:gap-7">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`group relative text-[15px] font-semibold transition-colors ${
                    active ? "text-gold-400" : "text-white/90 hover:text-white"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-1.5 right-0 h-0.5 bg-gold-400 transition-all duration-300 ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* CTA + mobile toggle */}
        <div className="flex items-center gap-3">
          <Link href="/booking" className="btn-gold hidden text-sm sm:inline-flex">
            {BOOK_CTA}
          </Link>
          <button
            type="button"
            aria-label="القائمة"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white lg:hidden"
          >
            <span className="relative block h-4 w-5">
              <span className={`absolute right-0 block h-0.5 w-5 bg-white transition-all ${open ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute right-0 top-1.5 block h-0.5 w-5 bg-white transition-all ${open ? "opacity-0" : "opacity-100"}`} />
              <span className={`absolute right-0 block h-0.5 w-5 bg-white transition-all ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
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
            <ul className="container-px mt-3 flex flex-col gap-1 rounded-3xl bg-navy-950/95 p-4 backdrop-blur-xl">
              {NAV.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-2xl px-4 py-3 font-semibold transition-colors hover:bg-white/10 ${
                      pathname === item.href ? "text-gold-400" : "text-white/90"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2">
                <Link href="/booking" onClick={() => setOpen(false)} className="btn-gold w-full">
                  {BOOK_CTA}
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
