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
