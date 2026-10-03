create extension if not exists pg_net;

-- Function to forward new chat messages to push_notifications Edge Function
create or replace function public.handle_message_webhook()
returns trigger as $$
begin
  begin
    perform net.http_post(
      url := 'https://xpkkathtikucwtyjzfja.supabase.co/functions/v1/push_notifications',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer sb_publishable_7C4Qmq1NFC93t-d0UG2xqw_UIQvVYrQ"}'::jsonb,
      body := jsonb_build_object(
        'type', 'INSERT',
        'table', 'messages',
        'record', row_to_json(NEW)
      ),
      timeout_milliseconds := 5000
    );
  exception when others then
    raise warning 'Message push notification webhook call failed: %', SQLERRM;
  end;
  return new;
end;
$$ language plpgsql security definer;

-- Ensure on_message_push_notification trigger is attached
drop trigger if exists on_message_push_notification on public.messages;
create trigger on_message_push_notification
  after insert on public.messages
  for each row
  execute function public.handle_message_webhook();
