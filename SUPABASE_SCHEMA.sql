create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique,
  user_id uuid references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  totals jsonb not null default '{}'::jsonb,
  coupon_code text,
  address jsonb not null default '{}'::jsonb,
  payment_method text,
  payment_id text,
  payment_status text not null default 'pending',
  created_at timestamptz default now()
);

alter table public.orders add column if not exists order_number text;
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists payment_method text;

alter table public.profiles enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can read own orders" on public.orders;
create policy "Users can read own orders"
on public.orders for select
using (auth.uid() = user_id);

drop policy if exists "Users can create own orders" on public.orders;
create policy "Users can create own orders"
on public.orders for insert
with check (auth.uid() = user_id);