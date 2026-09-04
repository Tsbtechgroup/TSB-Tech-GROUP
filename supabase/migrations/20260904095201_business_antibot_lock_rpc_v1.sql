revoke all on function public.submit_business_inquiry(text,text,text,text,text,text,text,text) from public;
revoke execute on function public.submit_business_inquiry(text,text,text,text,text,text,text,text) from anon;
grant execute on function public.submit_business_inquiry(text,text,text,text,text,text,text,text) to authenticated;
grant execute on function public.submit_business_inquiry(text,text,text,text,text,text,text,text) to service_role;;
