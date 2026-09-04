create or replace function public.tsb_guard_client_notification_update()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  -- Keep notification ownership/content immutable for normal authenticated clients.
  if old.user_id is distinct from new.user_id
     or old.type is distinct from new.type
     or old.title is distinct from new.title
     or old.message is distinct from new.message
     or old.entity_type is distinct from new.entity_type
     or old.entity_id is distinct from new.entity_id
     or old.created_at is distinct from new.created_at
  then
    raise exception 'notification_update_not_allowed';
  end if;

  -- Only read-state fields may change.
  if new.is_read then
    if old.is_read is distinct from new.is_read and new.read_at is null then
      new.read_at := now();
    end if;
  else
    new.read_at := null;
  end if;

  return new;
end;
$$;

revoke all on function public.tsb_guard_client_notification_update() from public, anon, authenticated;

drop trigger if exists tsb_guard_client_notification_update_trigger on public.notifications;
create trigger tsb_guard_client_notification_update_trigger
before update on public.notifications
for each row
execute function public.tsb_guard_client_notification_update();;
