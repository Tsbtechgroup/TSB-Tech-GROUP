create table if not exists public.store_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null check (category in ('automobile','security','energy','electronics','other')),
  name_fr text not null,
  name_nl text,
  name_en text,
  description_fr text,
  description_nl text,
  description_en text,
  sku text unique,
  price numeric(12,2) check (price is null or price >= 0),
  currency varchar(3) not null default 'EUR',
  availability text not null default 'on_request' check (availability in ('in_stock','on_request','out_of_stock','coming_soon')),
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  image_url text,
  image_path text,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.store_products enable row level security;

drop policy if exists "Public can view published store products" on public.store_products;
create policy "Public can view published store products"
on public.store_products
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Admins can view all store products" on public.store_products;
create policy "Admins can view all store products"
on public.store_products
for select
to authenticated
using ((select private.is_admin()));

drop policy if exists "Admins can create store products" on public.store_products;
create policy "Admins can create store products"
on public.store_products
for insert
to authenticated
with check ((select private.is_admin()));

drop policy if exists "Admins can update store products" on public.store_products;
create policy "Admins can update store products"
on public.store_products
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "Admins can delete store products" on public.store_products;
create policy "Admins can delete store products"
on public.store_products
for delete
to authenticated
using ((select private.is_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'store-products',
  'store-products',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can upload store product images" on storage.objects;
create policy "Admins can upload store product images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'store-products'
  and (select private.is_admin())
);

drop policy if exists "Admins can update store product images" on storage.objects;
create policy "Admins can update store product images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'store-products'
  and (select private.is_admin())
)
with check (
  bucket_id = 'store-products'
  and (select private.is_admin())
);

drop policy if exists "Admins can delete store product images" on storage.objects;
create policy "Admins can delete store product images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'store-products'
  and (select private.is_admin())
);

create index if not exists store_products_category_idx
  on public.store_products (category);
create index if not exists store_products_published_idx
  on public.store_products (is_published, sort_order, created_at desc);;
