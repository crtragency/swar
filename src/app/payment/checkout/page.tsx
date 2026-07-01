"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

declare global {
  interface Window {
    Moyasar?: {
      init: (opts: Record<string, unknown>) => void;
    };
  }
}

function CheckoutForm() {
  const params = useSearchParams();
  const bookingId = params.get("bookingId") || "";
  const amount    = Number(params.get("amount") || 0);
  const title     = params.get("title") || "حجز سوار البحرية";
  const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL || "";

  useEffect(() => {
    if (!bookingId || !amount) return;

    // load CSS
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://cdn.moyasar.com/mpf/1.14/moyasar.css";
    document.head.appendChild(link);

    // load JS then init
    const script = document.createElement("script");
    script.src = "https://cdn.moyasar.com/mpf/1.14/moyasar.js";
    script.onload = () => {
      window.Moyasar?.init({
        element: ".mysr-form",
        amount: Math.round(amount * 100), // halalas
        currency: "SAR",
        description: title,
        publishable_api_key: process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY,
        callback_url: `${SITE_URL}/payment?bookingId=${bookingId}`,
        methods: ["creditcard", "stcpay", "applepay"],
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      document.head.removeChild(link);
    };
  }, [bookingId, amount, title, SITE_URL]);

  if (!bookingId || !amount) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <p className="text-red-600 font-bold">رابط الدفع غير صالح</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-10" dir="rtl">
      <div className="w-full max-w-md">
        {/* header */}
        <div className="mb-6 text-center">
          <div className="text-3xl mb-2">🌊</div>
          <h1 className="text-xl font-extrabold text-slate-800">سوار البحرية</h1>
          <p className="text-sm text-slate-500 mt-1">{title}</p>
        </div>

        {/* amount box */}
        <div className="mb-6 rounded-2xl bg-white shadow-sm px-5 py-4 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-500">المبلغ المطلوب</span>
          <span className="text-2xl font-extrabold text-teal-600">
            {amount.toLocaleString()} <span className="text-sm font-normal text-slate-400">ريال</span>
          </span>
        </div>

        {/* moyasar form mounts here */}
        <div className="mysr-form rounded-2xl overflow-hidden shadow-sm" />

        <p className="mt-4 text-center text-xs text-slate-400">
          رقم الحجز: <span className="font-mono font-bold">{bookingId}</span>
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">
          ⚠️ المبلغ غير مسترد في حال الإلغاء
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-pulse">💳</div>
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}
