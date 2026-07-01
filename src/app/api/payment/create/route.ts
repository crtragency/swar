import { NextResponse } from "next/server";
import { updateBooking } from "@/lib/store";

export const dynamic = "force-dynamic";

const SECRET_KEY = process.env.MOYASAR_SECRET_KEY || "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://swar-wine.vercel.app";

export async function POST(req: Request) {
  if (!SECRET_KEY) return NextResponse.json({ error: "Payment not configured" }, { status: 500 });

  const body = await req.json();
  const { bookingId, amount, description, name, email } = body;

  if (!bookingId || !amount) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Moyasar expects amount in halalas (SAR × 100)
  const halalas = Math.round(Number(amount) * 100);

  const moyasarRes = await fetch("https://api.moyasar.com/v1/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(SECRET_KEY + ":").toString("base64"),
    },
    body: JSON.stringify({
      amount: halalas,
      currency: "SAR",
      description: description || "حجز سوار البحرية",
      callback_url: `${SITE_URL}/payment?bookingId=${bookingId}`,
      source: { type: "creditcard" },
      metadata: { bookingId, name: name || "" },
    }),
  });

  const data = await moyasarRes.json();

  if (!moyasarRes.ok) {
    return NextResponse.json({ error: data.message || "Moyasar error" }, { status: 500 });
  }

  // Save Moyasar payment ID on the booking
  await updateBooking(bookingId, { notes: `moyasar_id:${data.id}` } as never);

  return NextResponse.json({ paymentUrl: data.source?.transaction_url, paymentId: data.id });
}
