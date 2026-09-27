create or replace trigger notify_on_like
  after insert on public.interactions
  for each row
  execute function supabase_functions.http_request(
    'https://xpkkathtikucwtyjzfja.supabase.co/functions/v1/push_notifications',
    'POST',
    '{"Content-Type": "application/json"}',
    '{}',
    '1000'
  );
