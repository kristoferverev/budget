-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- CATEGORIES
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  type text not null check (type in ('income', 'expense', 'saving')),
  icon text,
  created_at timestamp with time zone default now()
);
alter table public.categories enable row level security;
create policy "Users can manage own categories" on public.categories for all using (auth.uid() = user_id);

-- TRANSACTIONS
create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  date date not null,
  amount decimal(12,2) not null,
  type text not null check (type in ('income', 'expense', 'saving')),
  category_id uuid references public.categories on delete set null,
  description text,
  payment_method text,
  related_to uuid,
  is_imported boolean default false,
  created_at timestamp with time zone default now()
);
alter table public.transactions enable row level security;
create policy "Users can manage own transactions" on public.transactions for all using (auth.uid() = user_id);

-- SAVINGS SETTINGS
create table public.savings_settings (
  user_id uuid primary key references auth.users not null,
  enabled boolean default true,
  multiplier integer default 3,
  round_to_whole boolean default true,
  updated_at timestamp with time zone default now()
);
alter table public.savings_settings enable row level security;
create policy "Users can manage own settings" on public.savings_settings for all using (auth.uid() = user_id);

-- MONTHLY BALANCES
create table public.monthly_balances (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  month text not null, -- YYYY-MM
  checking decimal(12,2) default 0,
  savings decimal(12,2) default 0,
  unique(user_id, month)
);
alter table public.monthly_balances enable row level security;
create policy "Users can manage own balances" on public.monthly_balances for all using (auth.uid() = user_id);

-- RECEIPTS
create table public.receipts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  file_path text,
  store_name text,
  date date,
  total_amount decimal(12,2),
  status text default 'pending',
  raw_text text,
  created_at timestamp with time zone default now()
);
alter table public.receipts enable row level security;
create policy "Users can manage own receipts" on public.receipts for all using (auth.uid() = user_id);

-- RECEIPT LINES
create table public.receipt_lines (
  id uuid primary key default uuid_generate_v4(),
  receipt_id uuid references public.receipts on delete cascade,
  name text,
  quantity decimal(12,3),
  unit_price decimal(12,2),
  total_price decimal(12,2),
  normalized_product_id uuid
);
-- No direct RLS on lines, access inherited via receipt_id join if needed or simple RLS:
alter table public.receipt_lines enable row level security;
create policy "Users can view lines of own receipts" on public.receipt_lines for all using (
  exists (select 1 from public.receipts where id = receipt_id and user_id = auth.uid())
);

-- Default categories trigger or manual insertion
-- (We'll handle default categories insertion in the frontend for now)
