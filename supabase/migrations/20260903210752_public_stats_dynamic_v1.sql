create schema if not exists private;

create table if not exists private.public_stats_config (
  singleton boolean primary key default true check (singleton = true),
  launch_at timestamptz not null default now()
);

insert into private.public_stats_config (singleton, launch_at)
values (true, now())
on conflict (singleton) do nothing;

revoke all on table private.public_stats_config from public, anon, authenticated;

create or replace function public.get_public_stats()
returns table (
  clients bigint,
  completed_services bigint,
  orders bigint,
  quote_requests bigint,
  published_products bigint,
  launch_at timestamptz
)
language sql
stable
security definer
set search_path = pg_catalog, public, private
as $$
  with cfg as (
    select launch_at
    from private.public_stats_config
    where singleton = true
    limit 1
  )
  select
    (
      select count(*)
      from public.profiles p
      cross join cfg
      where p.created_at >= cfg.launch_at
        and exists (
          select 1
          from public.user_roles ur
          where ur.user_id = p.id
            and ur.role = 'client'
        )
    )::bigint as clients,
    (
      select count(*)
      from public.client_services cs
      cross join cfg
      where cs.status = 'completed'
        and coalesce(cs.completed_at, cs.updated_at, cs.created_at) >= cfg.launch_at
    )::bigint as completed_services,
    (
      select count(*)
      from public.store_orders so
      cross join cfg
      where so.created_at >= cfg.launch_at
        and so.status in ('confirmed', 'processing', 'ready', 'completed')
    )::bigint as orders,
    (
      select count(*)
      from public.quote_requests qr
      cross join cfg
      where qr.created_at >= cfg.launch_at
        and coalesce(qr.status, 'received') <> 'cancelled'
    )::bigint as quote_requests,
    (
      select count(*)
      from public.store_products sp
      where sp.is_published = true
    )::bigint as published_products,
    (select launch_at from cfg) as launch_at;
$$;

revoke all on function public.get_public_stats() from public;
grant execute on function public.get_public_stats() to anon, authenticated;

comment on function public.get_public_stats() is
'Public aggregate counters for TSB Tech Group. Returns counts only; no personal data. Activity counters start at the launch_at snapshot stored in private.public_stats_config.';;
