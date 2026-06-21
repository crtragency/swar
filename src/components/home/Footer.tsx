"use client";

import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./ui";
import { LOGO } from "./images";
import { NAV, CONTACT, BOOK_CTA, waLink } from "@/lib/site";

const SOCIALS = [
  { label: "انستغرام", href: "#", icon: InstagramIcon },
  { label: "تويتر", href: "#", icon: TwitterIcon },
  { label: "واتساب", href: waLink(), icon: WhatsappIcon },
  { label: "سناب شات", href: "#", icon: SnapIcon },
];

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative overflow-hidden bg-navy-950 pt-20 text-white"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gold-line" />
      <div className="pointer-events-none absolute -right-40 top-0 h-96 w-96 rounded-full bg-ocean-500/10 blur-3xl" />

      <div className="container-px relative">
        <Reveal>
          <div className="mb-16 flex flex-col items-center gap-6 rounded-[32px] bg-gradient-to-l from-ocean-600 to-turquoise-500 px-8 py-12 text-center shadow-luxe sm:flex-row sm:justify-between sm:text-start">
            <div>
              <h3 className="text-2xl font-extrabold sm:text-3xl">
                جاهز لتجربة بحرية لا تُنسى؟
              </h3>
              <p className="mt-2 text-white/85">
                احجز رحلتك الآن واستمتع بخصم 25% على جميع الرحلات بمناسبة بداية موسم الصيف.
              </p>
            </div>
            <Link href="/booking" className="btn-gold shrink-0 text-base">
              {BOOK_CTA}
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-12 pb-14 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <span className="inline-flex h-16 items-center rounded-2xl bg-white px-4 shadow-md">
              <Image src={LOGO} alt="شعار سوار البحرية" className="h-10 w-auto" />
            </span>
            <p className="mt-5 leading-relaxed text-white/65">
              رحلات بحرية فاخرة في ثول على ساحل البحر الأحمر. عِش معنا متعة بحرية لا
              تُنسى وخُض تجربة بحرية لا مثيل لها.
            </p>
            <div className="mt-6 flex gap-3">
              {SOCIALS.map((soc) => (
                <Link
                  key={soc.label}
                  href={soc.href}
                  aria-label={soc.label}
                  target={soc.href.startsWith("http") ? "_blank" : undefined}
                  rel={soc.href.startsWith("http") ? "noopener" : undefined}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-all hover:-translate-y-1 hover:border-gold-400 hover:text-gold-400"
                >
                  <soc.icon />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-lg font-bold">روابط سريعة</h4>
            <ul className="mt-5 flex flex-col gap-3">
              {NAV.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-white/65 transition-colors hover:text-gold-400">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold">تواصل معنا</h4>
            <ul className="mt-5 flex flex-col gap-4 text-white/65">
              <li className="flex items-start gap-3">
                <PinIcon />
                <span>{CONTACT.location}</span>
              </li>
              <li className="flex items-center gap-3">
                <PhoneIcon />
                <a dir="ltr" href={CONTACT.phoneHref} className="hover:text-gold-400">
                  {CONTACT.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MailIcon />
                <a href={`mailto:${CONTACT.email}`} className="hover:text-gold-400">
                  {CONTACT.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Language + hours */}
          <div>
            <h4 className="text-lg font-bold">اللغة</h4>
            <div className="mt-5 inline-flex rounded-full border border-white/15 bg-white/5 p-1">
              <span className="rounded-full bg-gold-400 px-5 py-2 text-sm font-bold text-navy-950">
                العربية
              </span>
              <button
                type="button"
                className="rounded-full px-5 py-2 text-sm font-bold text-white/70 transition-colors hover:text-white"
              >
                EN
              </button>
            </div>
            <h4 className="mt-8 text-lg font-bold">أوقات العمل</h4>
            <p className="mt-4 text-white/65">يومياً من 8 صباحاً حتى 10 مساءً</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-px flex flex-col items-center justify-between gap-3 py-6 text-sm text-white/55 sm:flex-row">
          <p>© {new Date().getFullYear()} {CONTACT.brand} · {CONTACT.brandEn}. جميع الحقوق محفوظة.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white">سياسة الخصوصية</Link>
            <Link href="#" className="hover:text-white">الشروط والأحكام</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------- icons ---------- */
function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function TwitterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function WhatsappIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1112 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.7 1-.3.2-.5.1a6.5 6.5 0 01-1.9-1.2 7.2 7.2 0 01-1.3-1.7c-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4c0-.1-.5-1.3-.7-1.7s-.4-.4-.5-.4h-.5a1 1 0 00-.7.3A3 3 0 006 8.7c0 1.7 1.3 3.4 1.5 3.6s2.5 3.8 6 5.1c2.9 1.1 2.9.7 3.5.7s1.7-.7 2-1.4.3-1.3.2-1.4-.3-.2-.5-.3z" />
    </svg>
  );
}
function SnapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c2.6 0 4.6 2 4.7 4.6v1.6c.4.2.9.1 1.3-.1.6-.2 1.2.6.7 1.1-.4.4-1 .6-1.5.8-.3.1-.5.3-.4.6.3 1.2 1.2 2.2 2.4 2.6.4.1.6.6.3.9-.6.6-1.5.8-2.3 1 .1.4.2.8.5.9.3.2.7.2 1 .2.5 0 .6.7.1.9-1 .4-2.1.2-3 .8-.6.4-1 1.1-1.8 1.3-1 .3-2-.3-3-.3s-2 .6-3 .3c-.8-.2-1.2-.9-1.8-1.3-.9-.6-2-.4-3-.8-.5-.2-.4-.9.1-.9.3 0 .7 0 1-.2.3-.1.4-.5.5-.9-.8-.2-1.7-.4-2.3-1-.3-.3-.1-.8.3-.9 1.2-.4 2.1-1.4 2.4-2.6.1-.3-.1-.5-.4-.6-.5-.2-1.1-.4-1.5-.8-.5-.5.1-1.3.7-1.1.4.2.9.3 1.3.1V6.6C7.4 4 9.4 2 12 2z" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D7B36B" strokeWidth="2" className="mt-0.5 shrink-0">
      <path d="M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D7B36B" strokeWidth="2" className="shrink-0">
      <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.7a2 2 0 01-.4 2.1L8.1 9.9a16 16 0 006 6l1.4-1.2a2 2 0 012.1-.4c.9.3 1.8.5 2.7.6a2 2 0 011.7 2z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D7B36B" strokeWidth="2" className="shrink-0">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  );
}
