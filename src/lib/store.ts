// Booking storage. Uses Vercel KV / Upstash Redis REST when the env vars are
// present (production persistence), otherwise falls back to an in-memory list
// so the app works locally and in preview without any setup.

export type Booking = {
  id: string;
  createdAt: string;
  packageId: string;
  packageTitle: string;
  option: string; // selected duration / tier label
  persons: number;
  addons: string[];
  date: string;
  departTime: string;
  name: string;
  phone: string;
  notes: string;
  payMethod: "bank" | "arrival";
  total: number;
  status: "pending" | "confirmed" | "cancelled";
};

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const KEY = "sewar:bookings";

// in-memory fallback (survives within a single running server instance)
const g = globalThis as unknown as { __sewarBookings?: Booking[] };
if (!g.__sewarBookings) g.__sewarBookings = [];

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

export async function addBooking(b: Booking): Promise<void> {
  if (KV_URL && KV_TOKEN) {
    await kv(["LPUSH", KEY, JSON.stringify(b)]);
    return;
  }
  g.__sewarBookings!.unshift(b);
}

export async function getBookings(): Promise<Booking[]> {
  if (KV_URL && KV_TOKEN) {
    const { result } = await kv(["LRANGE", KEY, 0, 500]);
    return (result as string[]).map((s) => JSON.parse(s) as Booking);
  }
  return g.__sewarBookings!;
}

export const STORAGE_MODE = KV_URL && KV_TOKEN ? "kv" : "memory";
