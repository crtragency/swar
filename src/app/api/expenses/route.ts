import { NextResponse } from "next/server";
import { getExpenses, addExpense, deleteExpense, type Expense } from "@/lib/store";

export const dynamic = "force-dynamic";

const OWNER_PASSWORD = process.env.OWNER_PASSWORD || "owner2026";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "sewar2026";

function isAuthed(req: Request) {
  const params = new URL(req.url).searchParams;
  const user = req.headers.get("x-admin-user") || params.get("user");
  const pass = req.headers.get("x-admin-password") || params.get("password");
  return (user === "owner" && pass === OWNER_PASSWORD) || (user === "admin" && pass === ADMIN_PASSWORD);
}

function newId() {
  return "EX-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 5).toUpperCase();
}

export async function GET(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const expenses = await getExpenses();
    return NextResponse.json({ expenses });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad request" }, { status: 400 }); }

  const amount = Number(body.amount);
  if (!amount || amount <= 0) return NextResponse.json({ error: "المبلغ مطلوب" }, { status: 422 });
  const date = String(body.date || "").trim();
  if (!date) return NextResponse.json({ error: "التاريخ مطلوب" }, { status: 422 });

  const expense: Expense = {
    id: newId(),
    createdAt: new Date().toISOString(),
    date,
    category: String(body.category || "أخرى").trim(),
    description: String(body.description || "").trim(),
    amount,
  };
  try {
    await addExpense(expense);
    return NextResponse.json({ ok: true, id: expense.id });
  } catch {
    return NextResponse.json({ error: "تعذّر الحفظ" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 422 });
  try {
    await deleteExpense(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
