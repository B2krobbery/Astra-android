-- 1. PRIVACY SPLIT: Move private birth data out of profiles
create table public.private_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  birth_time text,
  birth_latitude numeric,
  birth_longitude numeric,
  updated_at timestamptz default now()
);
alter table public.private_profiles enable row level security;
create policy "Users can view own private profile" on public.private_profiles for select using (auth.uid() = id);
create policy "Users can update own private profile" on public.private_profiles for update using (auth.uid() = id);
create policy "Users can insert own private profile" on public.private_profiles for insert with check (auth.uid() = id);

-- Remove private fields from public profiles
alter table public.profiles drop column birth_time;
alter table public.profiles drop column birth_latitude;
alter table public.profiles drop column birth_longitude;

-- 2. DISCOVERY VIEW: Secure RPC to fetch candidates
create or replace function get_discovery_candidates()
returns setof public.profiles
language sql security invoker
as $$
  select p.*
  from public.profiles p
  where p.id != auth.uid()
  and p.onboarding_completed = true
  and not exists (
    select 1 from public.interactions i 
    where i.actor_id = auth.uid() and i.target_id = p.id
  )
  and not exists (
    select 1 from public.interactions i
    where i.actor_id = p.id and i.target_id = auth.uid() and i.action_type = 'BLOCK'
  );
$$;

-- 3. STORAGE: Provision avatars bucket securely
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, '{"image/jpeg","image/png","image/webp"}')
on conflict (id) do update set public = true;

create policy "Avatars are publicly accessible" on storage.objects for select using ( bucket_id = 'avatars' );
create policy "Users can upload their own avatars" on storage.objects for insert with check ( 
  bucket_id = 'avatars' and 
  auth.uid()::text = (storage.foldername(name))[1] 
);
create policy "Users can update their own avatars" on storage.objects for update using ( 
  bucket_id = 'avatars' and 
  auth.uid()::text = (storage.foldername(name))[1] 
);
create policy "Users can delete their own avatars" on storage.objects for delete using ( 
  bucket_id = 'avatars' and 
  auth.uid()::text = (storage.foldername(name))[1] 
);

-- 4. MUTUAL MATCH TRIGGER
create or replace function check_mutual_match()
returns trigger
language plpgsql security definer
as $$
declare
  is_mutual boolean;
begin
  if NEW.action_type = 'LIKE' then
    select exists (
      select 1 from public.interactions 
      where actor_id = NEW.target_id and target_id = NEW.actor_id and action_type = 'LIKE'
    ) into is_mutual;
    
    if is_mutual then
      insert into public.matches (user1_id, user2_id)
      values (
        least(NEW.actor_id, NEW.target_id),
        greatest(NEW.actor_id, NEW.target_id)
      ) on conflict do nothing;
      
      -- also initialize a conversation
      insert into public.conversations (match_id)
      select id from public.matches 
      where user1_id = least(NEW.actor_id, NEW.target_id) and user2_id = greatest(NEW.actor_id, NEW.target_id)
      limit 1;
    end if;
  end if;
  return NEW;
end;
$$;

create trigger on_interaction_insert
after insert on public.interactions
for each row execute function check_mutual_match();

