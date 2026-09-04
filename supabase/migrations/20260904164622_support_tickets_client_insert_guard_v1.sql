create or replace function public.tsb_guard_support_ticket_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.is_admin() then
    return new;
  end if;

  if auth.uid() is not null then
    if new.user_id is distinct from auth.uid() then
      raise exception 'support_ticket_invalid_user';
    end if;

    if new.status is distinct from 'open'::text then
      raise exception 'support_ticket_invalid_status';
    end if;

    if new.admin_reply is not null then
      raise exception 'support_ticket_admin_reply_forbidden';
    end if;

    if new.replied_at is not null then
      raise exception 'support_ticket_replied_at_forbidden';
    end if;

    new.created_at := now();
  end if;

  return new;
end;
$$;

revoke all on function public.tsb_guard_support_ticket_insert() from public, anon, authenticated;

drop trigger if exists tsb_guard_support_ticket_insert_trigger on public.support_tickets;
create trigger tsb_guard_support_ticket_insert_trigger
before insert on public.support_tickets
for each row
execute function public.tsb_guard_support_ticket_insert();;
