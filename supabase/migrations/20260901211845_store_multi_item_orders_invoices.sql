-- TSB Store: support multi-product orders and invoices without breaking legacy flows.

create table if not exists public.store_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.store_orders(id) on delete cascade,
  product_id uuid null references public.store_products(id) on delete set null,
  product_name text not null,
  sku text null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric null check (unit_price is null or unit_price >= 0),
  currency varchar not null default 'EUR',
  line_total numeric generated always as (
    case
      when unit_price is null then null
      else unit_price * quantity
    end
  ) stored,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists store_order_items_order_id_idx
  on public.store_order_items(order_id);
create index if not exists store_order_items_product_id_idx
  on public.store_order_items(product_id);

alter table public.store_order_items enable row level security;

drop policy if exists "Clients can view own store order items" on public.store_order_items;
create policy "Clients can view own store order items"
on public.store_order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.store_orders o
    where o.id = store_order_items.order_id
      and o.user_id = auth.uid()
  )
);

drop policy if exists "Admins can manage store order items" on public.store_order_items;
create policy "Admins can manage store order items"
on public.store_order_items
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

-- Backfill one legacy item for every existing order that has none yet.
insert into public.store_order_items (
  order_id,
  product_id,
  product_name,
  sku,
  quantity,
  unit_price,
  currency,
  sort_order
)
select
  o.id,
  o.product_id,
  o.product_name,
  o.sku,
  o.quantity,
  o.unit_price,
  o.currency,
  0
from public.store_orders o
where not exists (
  select 1
  from public.store_order_items i
  where i.order_id = o.id
);

create table if not exists public.store_invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.store_invoices(id) on delete cascade,
  product_id uuid null references public.store_products(id) on delete set null,
  product_name text not null,
  sku text null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric not null check (unit_price >= 0),
  currency varchar not null default 'EUR',
  subtotal_amount numeric generated always as (unit_price * quantity) stored,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists store_invoice_items_invoice_id_idx
  on public.store_invoice_items(invoice_id);
create index if not exists store_invoice_items_product_id_idx
  on public.store_invoice_items(product_id);

alter table public.store_invoice_items enable row level security;

drop policy if exists "Clients can view own issued store invoice items" on public.store_invoice_items;
create policy "Clients can view own issued store invoice items"
on public.store_invoice_items
for select
to authenticated
using (
  exists (
    select 1
    from public.store_invoices inv
    where inv.id = store_invoice_items.invoice_id
      and inv.user_id = auth.uid()
      and inv.status in ('issued', 'cancelled')
  )
);

drop policy if exists "Admins can manage store invoice items" on public.store_invoice_items;
create policy "Admins can manage store invoice items"
on public.store_invoice_items
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

-- Backfill one legacy invoice item for every existing invoice that has none yet.
insert into public.store_invoice_items (
  invoice_id,
  product_id,
  product_name,
  sku,
  quantity,
  unit_price,
  currency,
  sort_order
)
select
  inv.id,
  inv.product_id,
  inv.product_name,
  inv.sku,
  inv.quantity,
  inv.unit_price,
  inv.currency,
  0
from public.store_invoices inv
where not exists (
  select 1
  from public.store_invoice_items ii
  where ii.invoice_id = inv.id
);
;
