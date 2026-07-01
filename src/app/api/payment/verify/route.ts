import { NextResponse } from "next/server";
import { updateBooking } from "@/lib/store";

export const dynamic = "force-dynamic";

const SECRET_KEY = process.env.MOYASAR_SECRET_KEY || "";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("id");
  const bookingId = searchParams.get("bookingId");

  if (!paymentId || !bookingId) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const moyasarRes = await fetch(`https://api.moyasar.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: "Basic " + Buffer.from(SECRET_KEY + ":").toString("base64"),
    },
  });

  const payment = await moyasarRes.json();

  if (payment.status === "paid") {
    await updateBooking(bookingId, { status: "confirmed", paid: Math.round(payment.amount / 100) } as never);
    return NextResponse.json({ status: "paid" });
  }

  return NextResponse.json({ status: payment.status });
}
