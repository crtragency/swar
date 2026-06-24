-- Sewar Marine — bookings table.
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query).
-- The app's API route talks to this table with the SERVICE ROLE key (server
-- only), which bypasses RLS. RLS is enabled with no public policies so the
-- anon/public key cannot read or write bookings.

create table if not exists public.bookings (
  id            text primary key,
  created_at    timestamptz not null default now(),
  package_id    text,
  package_title text,
  option        text,
  persons       int,
  addons        jsonb default '[]'::jsonb,
  date          text,
  depart_time   text,
  name          text,
  phone         text,
  notes         text,
  pay_method    text,
  pay_type      text,
  deposit       int,
  amount_due    int,
  promo         text,
  total         int,
  status        text default 'pending'
);

create index if not exists bookings_created_at_idx on public.bookings (created_at desc);

alter table public.bookings enable row level security;
-- (no policies on purpose → only the service role key can access the data)

-- Developer-managed content (blog posts published from the studio, package edits).
create table if not exists public.site_content (
  key   text primary key,
  value jsonb
);
alter table public.site_content enable row level security;
-- (no policies → only the service role key can read/write)
