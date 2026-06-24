import { NextResponse } from "next/server";
import { generateBlogDraft, localGenerateDraft, aiProvider } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DEV_PASSWORD = process.env.DEV_PASSWORD || "sewardev";

export async function POST(req: Request) {
  if (req.headers.get("x-dev-password") !== DEV_PASSWORD) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { title?: string; keyphrase?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const title = (body.title || "").trim();
  const keyphrase = (body.keyphrase || "").trim();
  if (!title) return NextResponse.json({ error: "أدخل عنوان المقال" }, { status: 422 });

  // Use an AI provider if a key is configured; otherwise fall back to the
  // built-in local generator so the studio works with NO external key.
  try {
    const draft = aiProvider()
      ? await generateBlogDraft(title, keyphrase)
      : localGenerateDraft(title, keyphrase);
    return NextResponse.json({ draft, source: aiProvider() ? "ai" : "builtin" });
  } catch {
    // AI failed at runtime — degrade gracefully to the local generator.
    const draft = localGenerateDraft(title, keyphrase);
    return NextResponse.json({ draft, source: "builtin" });
  }
}
