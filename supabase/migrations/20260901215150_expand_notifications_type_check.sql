alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type = any (array['quote'::text,'service'::text,'document'::text,'support'::text,'system'::text,'appointment'::text,'store'::text,'client'::text,'order'::text,'invoice'::text]));;
