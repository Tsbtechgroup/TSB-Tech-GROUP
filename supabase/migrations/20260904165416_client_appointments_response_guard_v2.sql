drop policy if exists "Clients can create own appointments" on public.client_appointments;

create or replace function public.tsb_guard_client_appointment_response()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if private.is_admin() then
    return new;
  end if;

  if
    old.id is distinct from new.id
    or old.user_id is distinct from new.user_id
    or old.client_service_id is distinct from new.client_service_id
    or old.title is distinct from new.title
    or old.description is distinct from new.description
    or old.scheduled_at is distinct from new.scheduled_at
    or old.status is distinct from new.status
    or old.location is distinct from new.location
    or old.created_at is distinct from new.created_at
  then
    raise exception 'Modification du rendez-vous non autorisée';
  end if;

  if new.client_response is null then
    raise exception 'Réponse client invalide';
  end if;

  if old.client_response is distinct from new.client_response
     or old.client_response_message is distinct from new.client_response_message
  then
    new.client_responded_at := now();
  else
    new.client_responded_at := old.client_responded_at;
  end if;

  new.updated_at := old.updated_at;

  return new;
end;
$function$;

revoke all on function public.tsb_guard_client_appointment_response() from public, anon, authenticated;
grant execute on function public.tsb_guard_client_appointment_response() to postgres;
;
