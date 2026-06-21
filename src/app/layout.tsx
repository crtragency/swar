import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import heroOg from "../../الهيرو الاولي.webp";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sewar-marine.com"),
  title: {
    default: "سوار | رحلات بحرية فاخرة في ثول والبحر الأحمر",
    template: "%s | سوار البحرية",
  },
  description:
    "عِش معنا متعة بحرية لا تُنسى وخُض تجربة بحرية لا مثيل لها مع سوار، رحلات اليخوت والمغامرات البحرية الفاخرة في ثول على ساحل البحر الأحمر.",
  keywords: [
    "رحلات بحرية",
    "ثول",
    "البحر الأحمر",
    "يخوت",
    "سياحة بحرية",
    "سوار",
  ],
  openGraph: {
    title: "سوار | رحلات بحرية فاخرة في ثول والبحر الأحمر",
    description: "عِش معنا متعة بحرية لا تُنسى وخُض تجربة بحرية لا مثيل لها.",
    type: "website",
    locale: "ar_SA",
    images: [heroOg.src],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/icon.webp", type: "image/webp" }],
    apple: [{ url: "/icon.webp" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0A1A2F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-cairo antialiased">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
