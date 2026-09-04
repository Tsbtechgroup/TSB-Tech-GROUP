create or replace function public.tsb_notify_admin_new_quote()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  insert into public.notifications (
    user_id,
    type,
    title,
    message,
    entity_type,
    entity_id
  )
  select
    ur.user_id,
    case
      when new.service = 'TSB Store' then 'store'
      else 'quote'
    end,
    case
      when new.service = 'TSB Store' then 'Nouvelle demande TSB Store'
      else 'Nouvelle demande de devis'
    end,
    case
      when new.service = 'TSB Store' then
        'Une nouvelle demande TSB Store a été envoyée par ' || new.name || '.'
      else
        'Une nouvelle demande « ' || new.service || ' » a été envoyée par ' || new.name || '.'
    end,
    'quote_request',
    new.id::text
  from public.user_roles ur
  where ur.role = 'admin';

  return new;
end;
$function$;

create or replace function public.tsb_notify_admin_new_client_role()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  client_label text;
begin
  if new.role <> 'client' then
    return new;
  end if;

  select nullif(trim(concat_ws(' ', p.first_name, p.last_name)), '')
  into client_label
  from public.profiles p
  where p.id = new.user_id;

  client_label := coalesce(client_label, 'Un nouveau client');

  insert into public.notifications (
    user_id,
    type,
    title,
    message,
    entity_type,
    entity_id
  )
  select
    ur.user_id,
    'client',
    'Nouveau client TSB',
    client_label || ' vient de rejoindre la plateforme.',
    'profile',
    new.user_id::text
  from public.user_roles ur
  where ur.role = 'admin'
    and ur.user_id is distinct from new.user_id;

  return new;
end;
$function$;

drop trigger if exists tsb_notify_admin_new_client_role_trigger on public.user_roles;
create trigger tsb_notify_admin_new_client_role_trigger
after insert on public.user_roles
for each row
execute function public.tsb_notify_admin_new_client_role();

create or replace function public.tsb_notify_store_order_created()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if new.user_id is null then
    return new;
  end if;

  insert into public.notifications (
    user_id,
    type,
    title,
    message,
    entity_type,
    entity_id
  )
  values (
    new.user_id,
    'order',
    'Nouvelle commande TSB Store',
    'Votre commande ' || new.order_number || ' a été créée dans votre espace client.',
    'store_order',
    new.id::text
  );

  return new;
end;
$function$;

drop trigger if exists tsb_notify_store_order_created_trigger on public.store_orders;
create trigger tsb_notify_store_order_created_trigger
after insert on public.store_orders
for each row
execute function public.tsb_notify_store_order_created();

create or replace function public.tsb_notify_store_order_updated()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  status_label text;
begin
  if new.user_id is null or old.status is not distinct from new.status then
    return new;
  end if;

  status_label :=
    case new.status
      when 'draft' then 'Brouillon'
      when 'confirmed' then 'Confirmée'
      when 'processing' then 'En préparation'
      when 'ready' then 'Prête'
      when 'completed' then 'Terminée'
      when 'cancelled' then 'Annulée'
      else new.status
    end;

  insert into public.notifications (
    user_id,
    type,
    title,
    message,
    entity_type,
    entity_id
  )
  values (
    new.user_id,
    'order',
    'Commande TSB Store mise à jour',
    'Votre commande ' || new.order_number || ' est maintenant : ' || status_label || '.',
    'store_order',
    new.id::text
  );

  return new;
end;
$function$;

drop trigger if exists tsb_notify_store_order_updated_trigger on public.store_orders;
create trigger tsb_notify_store_order_updated_trigger
after update on public.store_orders
for each row
execute function public.tsb_notify_store_order_updated();

create or replace function public.tsb_notify_store_invoice_updated()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  payment_label text;
begin
  if new.user_id is null then
    return new;
  end if;

  if old.status is distinct from new.status then
    if new.status = 'issued' then
      insert into public.notifications (
        user_id, type, title, message, entity_type, entity_id
      ) values (
        new.user_id,
        'invoice',
        'Nouvelle facture TSB Store',
        'Votre facture ' || new.invoice_number || ' est maintenant disponible.',
        'store_invoice',
        new.id::text
      );
    elsif new.status = 'cancelled' then
      insert into public.notifications (
        user_id, type, title, message, entity_type, entity_id
      ) values (
        new.user_id,
        'invoice',
        'Facture TSB Store annulée',
        'Votre facture ' || new.invoice_number || ' a été annulée.',
        'store_invoice',
        new.id::text
      );
    end if;

    return new;
  end if;

  if new.status = 'issued'
     and old.payment_status is distinct from new.payment_status then
    payment_label :=
      case new.payment_status
        when 'unpaid' then 'Non payé'
        when 'partially_paid' then 'Partiellement payé'
        when 'paid' then 'Payé'
        when 'refunded' then 'Remboursé'
        else new.payment_status
      end;

    insert into public.notifications (
      user_id, type, title, message, entity_type, entity_id
    ) values (
      new.user_id,
      'invoice',
      'Paiement de facture mis à jour',
      'Le statut de paiement de la facture ' || new.invoice_number || ' est maintenant : ' || payment_label || '.',
      'store_invoice',
      new.id::text
    );
  end if;

  return new;
end;
$function$;

drop trigger if exists tsb_notify_store_invoice_updated_trigger on public.store_invoices;
create trigger tsb_notify_store_invoice_updated_trigger
after update on public.store_invoices
for each row
execute function public.tsb_notify_store_invoice_updated();;
