import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const DEV_PASSWORD = process.env.DEV_PASSWORD || "sewardev";
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB cap to keep stored settings light

export async function POST(req: Request) {
  if (req.headers.get("x-dev-password") !== DEV_PASSWORD) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "لم يتم إرسال ملف" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "الملف ليس صورة" }, { status: 415 });
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "حجم الصورة كبير (الحد 2 ميجابايت). اضغط الصورة أو استخدم رابطًا مباشرًا." },
      { status: 413 }
    );
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const url = `data:${file.type};base64,${buf.toString("base64")}`;
  return NextResponse.json({ url });
}
