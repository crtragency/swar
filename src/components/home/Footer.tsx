"use client";

import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./ui";
import { LOGO } from "./images";
import { NAV, CONTACT, BOOK_CTA, SOCIALS } from "@/lib/site";
import SocialIcon from "@/components/SocialIcon";

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

        <div className="grid gap-12 pb-14 md:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="lg:col-span-1">
            <span className="inline-flex h-16 items-center rounded-2xl bg-white px-4 shadow-md">
              <Image src={LOGO} alt="شعار سوار البحرية" className="h-10 w-auto" />
            </span>
            <p className="mt-5 leading-relaxed text-white/65">
              رحلات بحرية فاخرة في ثول على ساحل البحر الأحمر. عِش معنا متعة بحرية لا
              تُنسى وخُض تجربة بحرية لا مثيل لها.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {SOCIALS.map((soc) => (
                <a
                  key={soc.key}
                  href={soc.href}
                  aria-label={soc.label}
                  title={soc.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-all hover:-translate-y-1 hover:border-gold-400 hover:text-gold-400"
                >
                  <SocialIcon name={soc.key} />
                </a>
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

/* ---------- contact icons ---------- */
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
