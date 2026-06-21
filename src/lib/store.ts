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
  payMethod: "bank" | "arrival";
  payType: "full" | "deposit";
  deposit: number;
  amountDue: number;
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
    payMethod: (r.pay_method as Booking["payMethod"]) ?? "bank",
    payType: (r.pay_type as Booking["payType"]) ?? "full",
    deposit: Number(r.deposit ?? 0),
    amountDue: Number(r.amount_due ?? 0),
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

export async function updateStatus(id: string, status: Booking["status"]): Promise<void> {
  if (SB_URL && SB_KEY) {
    const res = await fetch(`${SB_URL}/rest/v1/bookings?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...sbHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify({ status }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Supabase update ${res.status}`);
    return;
  }
  if (KV_URL && KV_TOKEN) {
    const list = await getBookings();
    const idx = list.findIndex((b) => b.id === id);
    if (idx >= 0) {
      list[idx].status = status;
      await kv(["LSET", KEY, idx, JSON.stringify(list[idx])]);
    }
    return;
  }
  const b = g.__sewarBookings!.find((x) => x.id === id);
  if (b) b.status = status;
}
