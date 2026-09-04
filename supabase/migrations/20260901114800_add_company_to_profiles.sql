alter table public.profiles
add column if not exists company text;

comment on column public.profiles.company is 'Optional company or organisation name for professional clients.';;
