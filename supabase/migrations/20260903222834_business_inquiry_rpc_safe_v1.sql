create or replace function public.submit_business_inquiry(
  p_inquiry_type text,
  p_name text,
  p_email text,
  p_phone text,
  p_company text,
  p_country text,
  p_message text,
  p_preferred_language text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
  v_user_id uuid := auth.uid();
  v_type text := lower(trim(coalesce(p_inquiry_type, '')));
  v_name text := trim(coalesce(p_name, ''));
  v_email text := lower(trim(coalesce(p_email, '')));
  v_phone text := trim(coalesce(p_phone, ''));
  v_company text := nullif(trim(coalesce(p_company, '')), '');
  v_country text := nullif(trim(coalesce(p_country, '')), '');
  v_message text := trim(coalesce(p_message, ''));
  v_language text := lower(trim(coalesce(p_preferred_language, 'fr')));
  v_service text;
  v_final_message text;
begin
  if v_type not in (
    'solutions',
    'investment',
    'strategic',
    'joint_venture',
    'distribution',
    'institutions',
    'international',
    'other'
  ) then
    raise exception 'invalid_inquiry_type';
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 120 then
    raise exception 'invalid_name';
  end if;

  if char_length(v_email) < 5 or char_length(v_email) > 254
     or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' then
    raise exception 'invalid_email';
  end if;

  if char_length(v_phone) < 4 or char_length(v_phone) > 40 then
    raise exception 'invalid_phone';
  end if;

  if v_company is not null and char_length(v_company) > 160 then
    raise exception 'invalid_company';
  end if;

  if v_country is not null and char_length(v_country) > 120 then
    raise exception 'invalid_country';
  end if;

  if char_length(v_message) < 10 or char_length(v_message) > 4000 then
    raise exception 'invalid_message';
  end if;

  if v_language not in ('fr','nl','en','de','es','it','pt','ar','tr','zh') then
    v_language := 'fr';
  end if;

  if exists (
    select 1
    from public.quote_requests q
    where lower(q.email) = v_email
      and q.service like 'TSB Business%'
      and q.created_at > now() - interval '45 seconds'
  ) then
    raise exception 'rate_limited';
  end if;

  v_service := case v_type
    when 'solutions' then 'TSB Business — Solutions entreprises'
    when 'investment' then 'TSB Business — Investissement'
    when 'strategic' then 'TSB Business — Partenariat stratégique'
    when 'joint_venture' then 'TSB Business — Joint-venture'
    when 'distribution' then 'TSB Business — Distribution / représentation'
    when 'institutions' then 'TSB Business — Institutions / grands projets'
    when 'international' then 'TSB Business — Développement international'
    else 'TSB Business — Autre proposition'
  end;

  v_final_message := case
    when v_country is null then v_message
    else 'Pays / zone : ' || v_country || E'\n\n' || v_message
  end;

  insert into public.quote_requests (
    user_id,
    service,
    name,
    email,
    phone,
    company,
    message,
    status,
    preferred_language
  )
  values (
    v_user_id,
    v_service,
    v_name,
    v_email,
    v_phone,
    v_company,
    v_final_message,
    'received',
    v_language
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_business_inquiry(text,text,text,text,text,text,text,text) from public;
grant execute on function public.submit_business_inquiry(text,text,text,text,text,text,text,text) to anon, authenticated;;
