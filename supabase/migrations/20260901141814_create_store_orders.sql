create table if not exists public.store_orders (
  id uuid primary key default gen_random_uuid(),
  order_seq bigint generated always as identity unique,
  order_number text generated always as ('TSB-ORD-' || lpad(order_seq::text, 6, '0')) stored unique,
  request_id uuid unique references public.quote_requests(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  product_id uuid references public.store_products(id) on delete set null,
  product_name text not null,
  sku text,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(12,2) check (unit_price is null or unit_price >= 0),
  currency varchar(3) not null default 'EUR',
  status text not null default 'draft' check (status in ('draft','confirmed','processing','ready','completed','cancelled')),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  company text,
  notes text,
  preferred_language text not null default 'fr' check (preferred_language in ('fr','nl','en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.store_orders enable row level security;

create policy "Clients can view own store orders"
on public.store_orders
for select
to authenticated
using (auth.uid() = user_id);

create policy "Admins can view store orders"
on public.store_orders
for select
to authenticated
using ((select private.is_admin()));

create policy "Admins can create store orders"
on public.store_orders
for insert
to authenticated
with check ((select private.is_admin()));

create policy "Admins can update store orders"
on public.store_orders
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins can delete store orders"
on public.store_orders
for delete
to authenticated
using ((select private.is_admin()));

grant select, insert, update, delete on table public.store_orders to authenticated;
grant select, insert, update, delete on table public.store_orders to service_role;

create index if not exists store_orders_user_id_idx on public.store_orders(user_id);
create index if not exists store_orders_status_idx on public.store_orders(status);
create index if not exists store_orders_created_at_idx on public.store_orders(created_at desc);
;
