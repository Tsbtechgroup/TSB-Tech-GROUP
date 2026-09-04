create or replace function public.tsb_guard_quote_request_client_insert()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  -- Service-role / internal server paths keep their current behavior.
  if coalesce(auth.role(), '') <> 'authenticated' then
    return new;
  end if;

  -- Admins are allowed to use the table normally.
  if private.is_admin() then
    return new;
  end if;

  -- A client can only create a request for themself.
  if new.user_id is distinct from auth.uid() then
    raise exception 'quote_user_not_allowed';
  end if;

  -- Administrative fields must stay at their safe initial values.
  if new.status is distinct from 'received' then
    raise exception 'quote_status_not_allowed';
  end if;

  if new.admin_reply is not null
     or new.replied_at is not null
     or new.reply_email_sent_at is not null
     or new.reply_email_status is distinct from 'not_sent' then
    raise exception 'quote_admin_fields_not_allowed';
  end if;

  -- Do not let a browser forge the request timestamp.
  new.created_at := now();

  return new;
end;
$$;

revoke all on function public.tsb_guard_quote_request_client_insert() from public, anon, authenticated;

drop trigger if exists tsb_guard_quote_request_client_insert_trigger on public.quote_requests;
create trigger tsb_guard_quote_request_client_insert_trigger
before insert on public.quote_requests
for each row
execute function public.tsb_guard_quote_request_client_insert();;
