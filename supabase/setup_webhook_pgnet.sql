create extension if not exists pg_net;

create or replace function public.notify_on_like()
returns trigger as $$
begin
  if new.type = 'LIKE' then
    perform net.http_post(
      url := 'https://xpkkathtikucwtyjzfja.supabase.co/functions/v1/push_notifications',
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || current_setting('custom.supabase_anon_key', true)),
      body := jsonb_build_object(
        'type', 'INSERT',
        'table', TG_TABLE_NAME,
        'record', row_to_json(NEW)
      )
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trigger_notify_on_like on public.interactions;
create trigger trigger_notify_on_like
  after insert on public.interactions
  for each row
  execute function public.notify_on_like();
