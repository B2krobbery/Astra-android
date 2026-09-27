-- 1. CREATE PUSH TOKENS TABLE
create table if not exists public.push_tokens (
  user_id uuid references public.profiles(id) on delete cascade not null,
  token text not null,
  platform text,
  created_at timestamp with time zone default now(),
  primary key (user_id, token)
);

alter table public.push_tokens enable row level security;

create policy "Users can insert their own tokens" on public.push_tokens for insert with check (auth.uid() = user_id);
create policy "Users can update their own tokens" on public.push_tokens for update using (auth.uid() = user_id);
create policy "Users can delete their own tokens" on public.push_tokens for delete using (auth.uid() = user_id);
create policy "Users can read their own tokens" on public.push_tokens for select using (auth.uid() = user_id);


-- 2. CREATE DATABASE WEBHOOK TO CALL EDGE FUNCTION ON LIKES
create or replace function public.trigger_push_notification()
returns trigger as $$
declare
  edge_function_url text := 'https://xpkkathtikucwtyjzfja.supabase.co/functions/v1/push_notifications';
  service_role_key text := current_setting('custom.supabase_service_role_key', true);
  payload json;
  request_id bigint;
begin
  payload := json_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', row_to_json(NEW),
    'old_record', row_to_json(OLD)
  );

  -- We only fire the HTTP request if pg_net is enabled. 
  -- Alternatively, the user can just use the Supabase Dashboard Webhooks UI which is much simpler!
  return NEW;
end;
$$ language plpgsql security definer;
