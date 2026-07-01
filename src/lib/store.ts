// Booking storage with pluggable backends, chosen at runtime by env vars:
//   1. Supabase (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)  ← production
//   2. Vercel KV / Upstash (KV_REST_API_URL + KV_REST_API_TOKEN)
//   3. in-memory list (dev / preview, no setup)

export type Booking = {
  id: string;
  createdAt: string;
  packageId: string;
  packageTitle: string;
  option: string;
  persons: number;
  addons: string[];
  date: string;
  departTime: string;
  name: string;
  phone: string;
  notes: string;
  payMethod: "bank" | "online" | "pos";
  payType: "full" | "deposit";
  deposit: number;
  amountDue: number;
  paid: number;
  promo: string;
  total: number;
  status: "pending" | "confirmed" | "cancelled";
};

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const KEY = "sewar:bookings";

export const STORAGE_MODE = SB_URL && SB_KEY ? "supabase" : KV_URL && KV_TOKEN ? "kv" : "memory";

// in-memory fallback
const g = globalThis as unknown as { __sewarBookings?: Booking[] };
if (!g.__sewarBookings) g.__sewarBookings = [];

/* ───────────────────────── Supabase (PostgREST) ───────────────────────── */
function toRow(b: Booking) {
  return {
    id: b.id,
    created_at: b.createdAt,
    package_id: b.packageId,
    package_title: b.packageTitle,
    option: b.option,
    persons: b.persons,
    addons: b.addons,
    date: b.date,
    depart_time: b.departTime,
    name: b.name,
    phone: b.phone,
    notes: b.notes,
    pay_method: b.payMethod,
    pay_type: b.payType,
    deposit: b.deposit,
    amount_due: b.amountDue,
    paid: b.paid,
    promo: b.promo,
    total: b.total,
    status: b.status,
  };
}
function fromRow(r: Record<string, unknown>): Booking {
  return {
    id: String(r.id),
    createdAt: String(r.created_at),
    packageId: String(r.package_id ?? ""),
    packageTitle: String(r.package_title ?? ""),
    option: String(r.option ?? ""),
    persons: Number(r.persons ?? 0),
    addons: Array.isArray(r.addons) ? (r.addons as string[]) : [],
    date: String(r.date ?? ""),
    departTime: String(r.depart_time ?? ""),
    name: String(r.name ?? ""),
    phone: String(r.phone ?? ""),
    notes: String(r.notes ?? ""),
    payMethod: (["bank","online","pos"].includes(r.pay_method as string) ? r.pay_method : "bank") as Booking["payMethod"],
    payType: (r.pay_type as Booking["payType"]) ?? "full",
    deposit: Number(r.deposit ?? 0),
    amountDue: Number(r.amount_due ?? 0),
    paid: Number(r.paid ?? 0),
    promo: String(r.promo ?? ""),
    total: Number(r.total ?? 0),
    status: (r.status as Booking["status"]) ?? "pending",
  };
}
function sbHeaders() {
  return {
    apikey: SB_KEY!,
    Authorization: `Bearer ${SB_KEY}`,
    "Content-Type": "application/json",
  };
}

/* ───────────────────────────── Vercel KV ──────────────────────────────── */
async function kv(command: unknown[]) {
  const res = await fetch(KV_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV error ${res.status}`);
  return res.json();
}

/* ───────────────────────────── public API ─────────────────────────────── */
export async function addBooking(b: Booking): Promise<void> {
  if (SB_URL && SB_KEY) {
    const res = await fetch(`${SB_URL}/rest/v1/bookings`, {
      method: "POST",
      headers: { ...sbHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify(toRow(b)),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Supabase insert ${res.status}: ${await res.text()}`);
    return;
  }
  if (KV_URL && KV_TOKEN) {
    await kv(["LPUSH", KEY, JSON.stringify(b)]);
    return;
  }
  g.__sewarBookings!.unshift(b);
}

export async function getBookings(): Promise<Booking[]> {
  if (SB_URL && SB_KEY) {
    const res = await fetch(`${SB_URL}/rest/v1/bookings?select=*&order=created_at.desc&limit=500`, {
      headers: sbHeaders(),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Supabase select ${res.status}`);
    const rows = (await res.json()) as Record<string, unknown>[];
    return rows.map(fromRow);
  }
  if (KV_URL && KV_TOKEN) {
    const { result } = await kv(["LRANGE", KEY, 0, 500]);
    return (result as string[]).map((s) => JSON.parse(s) as Booking);
  }
  return g.__sewarBookings!;
}

export async function updateBooking(id: string, patch: Partial<Booking>): Promise<void> {
  if (SB_URL && SB_KEY) {
    const res = await fetch(`${SB_URL}/rest/v1/bookings?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...sbHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify(toRowPatch(patch)),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Supabase update ${res.status}`);
    return;
  }
  if (KV_URL && KV_TOKEN) {
    const list = await getBookings();
    const idx = list.findIndex((b) => b.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...patch };
      await kv(["LSET", KEY, idx, JSON.stringify(list[idx])]);
    }
    return;
  }
  const b = g.__sewarBookings!.find((x) => x.id === id);
  if (b) Object.assign(b, patch);
}

export async function updateStatus(id: string, status: Booking["status"]): Promise<void> {
  return updateBooking(id, { status });
}

export async function deleteBooking(id: string): Promise<void> {
  if (SB_URL && SB_KEY) {
    const res = await fetch(`${SB_URL}/rest/v1/bookings?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { ...sbHeaders(), Prefer: "return=minimal" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Supabase delete ${res.status}`);
    return;
  }
  if (KV_URL && KV_TOKEN) {
    const list = await getBookings();
    const filtered = list.filter((b) => b.id !== id);
    await kv(["DEL", KEY]);
    for (const b of [...filtered].reverse()) await kv(["RPUSH", KEY, JSON.stringify(b)]);
    return;
  }
  g.__sewarBookings = g.__sewarBookings!.filter((b) => b.id !== id);
}

function toRowPatch(p: Partial<Booking>): Record<string, unknown> {
  const m: Record<string, unknown> = {};
  if (p.packageTitle !== undefined) m.package_title = p.packageTitle;
  if (p.option !== undefined) m.option = p.option;
  if (p.persons !== undefined) m.persons = p.persons;
  if (p.addons !== undefined) m.addons = p.addons;
  if (p.date !== undefined) m.date = p.date;
  if (p.departTime !== undefined) m.depart_time = p.departTime;
  if (p.name !== undefined) m.name = p.name;
  if (p.phone !== undefined) m.phone = p.phone;
  if (p.notes !== undefined) m.notes = p.notes;
  if (p.payMethod !== undefined) m.pay_method = p.payMethod;
  if (p.payType !== undefined) m.pay_type = p.payType;
  if (p.deposit !== undefined) m.deposit = p.deposit;
  if (p.amountDue !== undefined) m.amount_due = p.amountDue;
  if (p.paid !== undefined) m.paid = p.paid;
  if (p.promo !== undefined) m.promo = p.promo;
  if (p.total !== undefined) m.total = p.total;
  if (p.status !== undefined) m.status = p.status;
  return m;
}

/* ───────────────────── generic JSON content store ─────────────────────── */
// Used for developer-managed content (blog posts, package overrides).
const gc = globalThis as unknown as { __sewarContent?: Record<string, unknown> };
if (!gc.__sewarContent) gc.__sewarContent = {};

export async function getContent<T>(key: string, fallback: T): Promise<T> {
  if (SB_URL && SB_KEY) {
    const res = await fetch(`${SB_URL}/rest/v1/site_content?key=eq.${encodeURIComponent(key)}&select=value`, {
      headers: sbHeaders(),
      cache: "no-store",
    });
    if (res.ok) {
      const rows = (await res.json()) as { value: T }[];
      if (rows.length) return rows[0].value;
    }
    return fallback;
  }
  if (KV_URL && KV_TOKEN) {
    const { result } = await kv(["GET", `content:${key}`]);
    return result ? (JSON.parse(result as string) as T) : fallback;
  }
  return (gc.__sewarContent![key] as T) ?? fallback;
}

export async function setContent(key: string, value: unknown): Promise<void> {
  if (SB_URL && SB_KEY) {
    const res = await fetch(`${SB_URL}/rest/v1/site_content?on_conflict=key`, {
      method: "POST",
      headers: { ...sbHeaders(), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ key, value }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Supabase content upsert ${res.status}`);
    return;
  }
  if (KV_URL && KV_TOKEN) {
    await kv(["SET", `content:${key}`, JSON.stringify(value)]);
    return;
  }
  gc.__sewarContent![key] = value;
}

/* ─────────────────────────── Expenses ─────────────────────────────────── */
export type Expense = {
  id: string;
  createdAt: string;
  date: string;
  category: string;
  description: string;
  amount: number;
};

const EXPENSE_KEY = "sewar:expenses";
const ge = globalThis as unknown as { __sewarExpenses?: Expense[] };
if (!ge.__sewarExpenses) ge.__sewarExpenses = [];

export async function getExpenses(): Promise<Expense[]> {
  if (SB_URL && SB_KEY) {
    const res = await fetch(`${SB_URL}/rest/v1/expenses?select=*&order=date.desc&limit=500`, {
      headers: sbHeaders(), cache: "no-store",
    });
    if (!res.ok) throw new Error(`Supabase expenses select ${res.status}`);
    const rows = (await res.json()) as Record<string, unknown>[];
    return rows.map((r) => ({
      id: String(r.id), createdAt: String(r.created_at), date: String(r.date),
      category: String(r.category ?? ""), description: String(r.description ?? ""),
      amount: Number(r.amount ?? 0),
    }));
  }
  if (KV_URL && KV_TOKEN) {
    const { result } = await kv(["GET", EXPENSE_KEY]);
    return result ? (JSON.parse(result as string) as Expense[]) : [];
  }
  return ge.__sewarExpenses!;
}

export async function addExpense(e: Expense): Promise<void> {
  if (SB_URL && SB_KEY) {
    const res = await fetch(`${SB_URL}/rest/v1/expenses`, {
      method: "POST",
      headers: { ...sbHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify({ id: e.id, created_at: e.createdAt, date: e.date, category: e.category, description: e.description, amount: e.amount }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Supabase expense insert ${res.status}: ${await res.text()}`);
    return;
  }
  if (KV_URL && KV_TOKEN) {
    const list = await getExpenses();
    list.unshift(e);
    await kv(["SET", EXPENSE_KEY, JSON.stringify(list)]);
    return;
  }
  ge.__sewarExpenses!.unshift(e);
}

export async function deleteExpense(id: string): Promise<void> {
  if (SB_URL && SB_KEY) {
    const res = await fetch(`${SB_URL}/rest/v1/expenses?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE", headers: { ...sbHeaders(), Prefer: "return=minimal" }, cache: "no-store",
    });
    if (!res.ok) throw new Error(`Supabase expense delete ${res.status}`);
    return;
  }
  if (KV_URL && KV_TOKEN) {
    const list = (await getExpenses()).filter((x) => x.id !== id);
    await kv(["SET", EXPENSE_KEY, JSON.stringify(list)]);
    return;
  }
  ge.__sewarExpenses = ge.__sewarExpenses!.filter((x) => x.id !== id);
}
