drop policy if exists "Clients can view own store invoices" on public.store_invoices;

create policy "Clients can view own issued store invoices"
on public.store_invoices
for select
to authenticated
using (
  auth.uid() = user_id
  and status in ('issued', 'cancelled')
);;
