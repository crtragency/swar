import { NextResponse } from "next/server";
import { getPackagesMerged, savePackagesList } from "@/lib/content-server";
import type { Pkg } from "@/lib/packages";

export const dynamic = "force-dynamic";

const DEV_PASSWORD = process.env.DEV_PASSWORD || "sewardev";
const ok = (req: Request) =>
  (req.headers.get("x-dev-password") || new URL(req.url).searchParams.get("password")) === DEV_PASSWORD;

export async function GET(req: Request) {
  if (!ok(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ packages: await getPackagesMerged() });
}

export async function PUT(req: Request) {
  if (!ok(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let list: Pkg[];
  try {
    list = (await req.json()).packages as Pkg[];
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  if (!Array.isArray(list)) return NextResponse.json({ error: "bad packages" }, { status: 422 });
  await savePackagesList(list);
  return NextResponse.json({ ok: true, count: list.length });
}
