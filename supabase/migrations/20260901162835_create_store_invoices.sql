create table if not exists public.store_invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_seq bigint generated always as identity unique,
  invoice_number text generated always as ('TSB-INV-' || lpad(invoice_seq::text, 6, '0')) stored unique,
  order_id uuid not null unique references public.store_orders(id) on delete restrict,
  user_id uuid references auth.users(id) on delete set null,
  order_number text not null,
  product_id uuid references public.store_products(id) on delete set null,
  product_name text not null,
  sku text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  subtotal_amount numeric(12,2) not null check (subtotal_amount >= 0),
  discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  fees_amount numeric(12,2) not null default 0 check (fees_amount >= 0),
  tax_rate numeric(6,3) not null default 0 check (tax_rate >= 0),
  tax_amount numeric(12,2) not null default 0 check (tax_amount >= 0),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  currency varchar(3) not null default 'EUR',
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  company text,
  preferred_language text not null default 'fr' check (preferred_language in ('fr','nl','en')),
  status text not null default 'draft' check (status in ('draft','issued','cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','partially_paid','paid','refunded')),
  issue_date date,
  due_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.store_invoices enable row level security;

create policy "Clients can view own store invoices"
on public.store_invoices
for select
to authenticated
using (auth.uid() = user_id);

create policy "Admins can view store invoices"
on public.store_invoices
for select
to authenticated
using ((select private.is_admin()));

create policy "Admins can create store invoices"
on public.store_invoices
for insert
to authenticated
with check ((select private.is_admin()));

create policy "Admins can update store invoices"
on public.store_invoices
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins can delete draft store invoices"
on public.store_invoices
for delete
to authenticated
using ((select private.is_admin()) and status = 'draft');

grant select, insert, update, delete on table public.store_invoices to authenticated;
grant select, insert, update, delete on table public.store_invoices to service_role;

grant usage, select on all sequences in schema public to authenticated;
grant usage, select on all sequences in schema public to service_role;

create index if not exists store_invoices_user_id_idx on public.store_invoices(user_id);
create index if not exists store_invoices_status_idx on public.store_invoices(status);
create index if not exists store_invoices_payment_status_idx on public.store_invoices(payment_status);
create index if not exists store_invoices_created_at_idx on public.store_invoices(created_at desc);;
