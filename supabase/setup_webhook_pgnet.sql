create extension if not exists pg_net;

create or replace function public.handle_interaction_webhook()
returns trigger as $$
begin
  if new.action_type = 'LIKE' then
    begin
      perform net.http_post(
        url := 'https://xpkkathtikucwtyjzfja.supabase.co/functions/v1/push_notifications',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer sb_publishable_7C4Qmq1NFC93t-d0UG2xqw_UIQvVYrQ"}'::jsonb,
        body := jsonb_build_object(
          'type', 'INSERT',
          'table', 'interactions',
          'record', row_to_json(NEW)
        ),
        timeout_milliseconds := 5000
      );
    exception when others then
      raise warning 'Push notification webhook call failed: %', SQLERRM;
    end;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Ensure on_like_push_notification trigger is attached
drop trigger if exists on_like_push_notification on public.interactions;
create trigger on_like_push_notification
  after insert on public.interactions
  for each row
  execute function public.handle_interaction_webhook();
