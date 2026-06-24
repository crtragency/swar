import { NextResponse } from "next/server";
import { getSiteSettings, saveSiteSettings } from "@/lib/content-server";
import type { SiteSettings } from "@/lib/settings-core";

export const dynamic = "force-dynamic";

const DEV_PASSWORD = process.env.DEV_PASSWORD || "sewardev";
const ok = (req: Request) =>
  (req.headers.get("x-dev-password") || new URL(req.url).searchParams.get("password")) === DEV_PASSWORD;

export async function GET(req: Request) {
  if (!ok(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ settings: await getSiteSettings() });
}

export async function PUT(req: Request) {
  if (!ok(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let settings: Partial<SiteSettings>;
  try {
    settings = (await req.json()).settings as Partial<SiteSettings>;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  if (!settings || typeof settings !== "object") return NextResponse.json({ error: "missing settings" }, { status: 422 });
  await saveSiteSettings(settings);
  return NextResponse.json({ ok: true });
}
