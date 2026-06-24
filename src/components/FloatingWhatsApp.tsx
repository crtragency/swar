"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { useSettings, waLinkFrom } from "@/lib/settings";
import SocialIcon from "@/components/SocialIcon";

export default function FloatingWhatsApp() {
  const { t } = useI18n();
  const { whatsapp } = useSettings();
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  const send = () => {
    const text = msg.trim() || (t("wa.greeting") as string);
    window.open(waLinkFrom(whatsapp, text), "_blank", "noopener");
  };

  return (
    <div className="fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="w-[300px] overflow-hidden rounded-[22px] bg-white shadow-2xl ring-1 ring-black/5 sm:w-[330px]"
          >
            {/* header */}
            <div className="flex items-center gap-3 bg-[#075E54] p-4 text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
                <SocialIcon name="whatsapp" size={26} />
              </span>
              <div className="flex-1">
                <p className="font-bold leading-tight">{t("wa.title")}</p>
                <p className="flex items-center gap-1.5 text-xs text-white/80">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {t("wa.status")}
                </p>
              </div>
              <button type="button" aria-label="close" onClick={() => setOpen(false)} className="text-white/80 transition-colors hover:text-white">✕</button>
            </div>

            {/* chat body */}
            <div className="bg-[#ECE5DD] px-4 py-5" style={{ backgroundImage: "radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)", backgroundSize: "18px 18px" }}>
              <div className="relative max-w-[85%] rounded-2xl rounded-tr-sm bg-white px-4 py-3 text-sm leading-relaxed text-navy-900 shadow">
                {t("wa.greeting")}
                <span className="mt-1 block text-[10px] text-navy-900/40">{t("wa.title")}</span>
              </div>
            </div>

            {/* input */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex items-center gap-2 border-t border-black/5 bg-white p-3"
            >
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder={t("wa.placeholder")}
                className="flex-1 rounded-full bg-navy-50 px-4 py-2.5 text-sm text-navy-900 outline-none focus:bg-navy-50/70"
              />
              <button
                type="submit"
                aria-label={t("wa.send")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white transition-transform hover:scale-105"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("wa.open")}
        title={t("wa.open")}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-6px_rgba(37,211,102,0.6)] transition-transform duration-300 hover:scale-110"
      >
        {!open && <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" />}
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
        ) : (
          <SocialIcon name="whatsapp" size={30} />
        )}
      </button>
    </div>
  );
}
