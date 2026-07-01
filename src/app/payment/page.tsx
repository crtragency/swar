"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PaymentResult() {
  const params = useSearchParams();
  const bookingId = params.get("bookingId");
  const paymentId = params.get("id");
  const statusParam = params.get("status");

  const [state, setState] = useState<"loading" | "paid" | "failed">("loading");

  useEffect(() => {
    if (!bookingId || !paymentId) { setState("failed"); return; }
    if (statusParam === "failed" || statusParam === "canceled") { setState("failed"); return; }

    fetch(`/api/payment/verify?id=${paymentId}&bookingId=${bookingId}`)
      .then((r) => r.json())
      .then((d) => setState(d.status === "paid" ? "paid" : "failed"))
      .catch(() => setState("failed"));
  }, [bookingId, paymentId, statusParam]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4" dir="rtl">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-8 text-center">
        {state === "loading" && (
          <>
            <div className="text-5xl mb-4 animate-spin">⏳</div>
            <p className="font-bold text-slate-600 text-lg">جاري التحقق من الدفع...</p>
          </>
        )}
        {state === "paid" && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-extrabold text-emerald-600 mb-2">تم الدفع بنجاح!</h1>
            <p className="text-slate-500 mb-1">رقم الحجز: <span className="font-mono font-bold text-slate-800">{bookingId}</span></p>
            <p className="text-sm text-slate-400 mt-3">سيتواصل معك فريق سوار البحرية قريباً لتأكيد الرحلة 🌊</p>
            <a href="/" className="mt-6 inline-block rounded-xl bg-teal-600 px-6 py-2.5 font-bold text-white hover:opacity-80 transition-opacity">العودة للرئيسية</a>
          </>
        )}
        {state === "failed" && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-extrabold text-red-600 mb-2">فشلت عملية الدفع</h1>
            <p className="text-slate-500 mb-1">رقم الحجز: <span className="font-mono font-bold text-slate-800">{bookingId}</span></p>
            <p className="text-sm text-slate-400 mt-3">يمكنك المحاولة مرة أخرى أو التواصل معنا عبر واتساب</p>
            <div className="flex gap-3 mt-6 justify-center">
              <button onClick={() => window.history.back()} className="rounded-xl border border-slate-300 px-5 py-2.5 font-bold text-slate-700 hover:bg-slate-50 transition-colors">رجوع</button>
              <a href="https://wa.me/966500045946" className="rounded-xl bg-green-500 px-5 py-2.5 font-bold text-white hover:opacity-80 transition-opacity">واتساب</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-5xl animate-spin">⏳</div>
      </div>
    }>
      <PaymentResult />
    </Suspense>
  );
}
