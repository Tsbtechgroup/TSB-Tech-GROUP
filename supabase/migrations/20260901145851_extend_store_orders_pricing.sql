alter table public.store_orders
  add column if not exists discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  add column if not exists fees_amount numeric(12,2) not null default 0 check (fees_amount >= 0),
  add column if not exists total_amount numeric(12,2) generated always as (
    case
      when unit_price is null then null
      else greatest((unit_price * quantity) - discount_amount + fees_amount, 0)
    end
  ) stored;

comment on column public.store_orders.discount_amount is 'Absolute discount applied to the Store order.';
comment on column public.store_orders.fees_amount is 'Additional fees applied to the Store order.';
comment on column public.store_orders.total_amount is 'Calculated order total: unit_price * quantity - discount_amount + fees_amount.';;
