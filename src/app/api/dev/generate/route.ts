import { NextResponse } from "next/server";
import { generateBlogDraft, aiProvider } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DEV_PASSWORD = process.env.DEV_PASSWORD || "sewardev";

export async function POST(req: Request) {
  if (req.headers.get("x-dev-password") !== DEV_PASSWORD) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!aiProvider()) {
    return NextResponse.json(
      { error: "لم يتم ضبط مفتاح الذكاء الاصطناعي. أضف ANTHROPIC_API_KEY أو GEMINI_API_KEY في الإعدادات." },
      { status: 503 }
    );
  }
  let body: { title?: string; keyphrase?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const title = (body.title || "").trim();
  if (!title) return NextResponse.json({ error: "أدخل عنوان المقال" }, { status: 422 });
  try {
    const draft = await generateBlogDraft(title, (body.keyphrase || "").trim());
    return NextResponse.json({ draft });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "تعذّر التوليد" }, { status: 500 });
  }
}
