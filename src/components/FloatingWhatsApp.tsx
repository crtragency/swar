import { waLink } from "@/lib/site";
import SocialIcon from "@/components/SocialIcon";

export default function FloatingWhatsApp() {
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا على واتساب"
      title="تواصل معنا على واتساب"
      className="group fixed bottom-5 left-5 z-[70] flex items-center gap-3 sm:bottom-7 sm:left-7"
    >
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-6px_rgba(37,211,102,0.6)] transition-transform duration-300 hover:scale-110">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" />
        <SocialIcon name="whatsapp" size={28} />
      </span>
      <span className="pointer-events-none hidden -translate-x-2 rounded-full bg-navy-900 px-4 py-2 text-sm font-bold text-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:block">
        احجز عبر واتساب
      </span>
    </a>
  );
}
