-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  date_of_birth date,
  gender text,
  location text,
  bio text,
  education text,
  profession text,
  birth_time text,
  birth_location text,
  birth_latitude numeric,
  birth_longitude numeric,
  onboarding_completed boolean default false,
  regional_preference text default 'ALL',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PROFILE PHOTOS
create table public.profile_photos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  storage_path text not null,
  is_primary boolean default false,
  created_at timestamptz default now()
);

-- PREFERENCES
create table public.preferences (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  min_age integer,
  max_age integer,
  gender_preference text,
  max_distance_km integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- LIKES & BLOCKS
create table public.interactions (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references public.profiles(id) on delete cascade not null,
  target_id uuid references public.profiles(id) on delete cascade not null,
  action_type text check (action_type in ('LIKE', 'PASS', 'BLOCK', 'REPORT')) not null,
  created_at timestamptz default now(),
  unique(actor_id, target_id)
);

-- MATCHES
create table public.matches (
  id uuid primary key default uuid_generate_v4(),
  user1_id uuid references public.profiles(id) on delete cascade not null,
  user2_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user1_id, user2_id)
);

-- CONVERSATIONS
create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references public.matches(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.conversation_participants (
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  last_read_at timestamptz default now(),
  primary key(conversation_id, user_id)
);

-- MESSAGES
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- NOTIFICATIONS
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  content jsonb not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- AUDIT LOGS
create table public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_resource text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- RLS POLICIES --

alter table public.profiles enable row level security;
alter table public.profile_photos enable row level security;
alter table public.preferences enable row level security;
alter table public.interactions enable row level security;
alter table public.matches enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles: Users can read all, update own
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Profile Photos: Read all, modify own
create policy "Photos are viewable by everyone" on public.profile_photos for select using (true);
create policy "Users can insert own photos" on public.profile_photos for insert with check (auth.uid() = user_id);
create policy "Users can update own photos" on public.profile_photos for update using (auth.uid() = user_id);
create policy "Users can delete own photos" on public.profile_photos for delete using (auth.uid() = user_id);

-- Preferences: Only user can read/write own
create policy "Users can view own preferences" on public.preferences for select using (auth.uid() = user_id);
create policy "Users can update own preferences" on public.preferences for update using (auth.uid() = user_id);
create policy "Users can insert own preferences" on public.preferences for insert with check (auth.uid() = user_id);

-- Interactions: Users can see own interactions, insert own
create policy "Users can view own interactions" on public.interactions for select using (auth.uid() = actor_id);
create policy "Users can insert own interactions" on public.interactions for insert with check (auth.uid() = actor_id);

-- Matches: Users can see matches they are part of
create policy "Users can view own matches" on public.matches for select using (auth.uid() = user1_id or auth.uid() = user2_id);

-- Conversations & Messages
create policy "Users can view conversations they are part of" on public.conversations for select using (
  exists (select 1 from public.conversation_participants where conversation_id = id and user_id = auth.uid())
);
create policy "Users can view participants in their conversations" on public.conversation_participants for select using (
  exists (select 1 from public.conversation_participants cp where cp.conversation_id = conversation_id and cp.user_id = auth.uid())
);
create policy "Users can view messages in their conversations" on public.messages for select using (
  exists (select 1 from public.conversation_participants where conversation_id = public.messages.conversation_id and user_id = auth.uid())
);
create policy "Users can send messages to their conversations" on public.messages for insert with check (
  auth.uid() = sender_id and
  exists (select 1 from public.conversation_participants where conversation_id = public.messages.conversation_id and user_id = auth.uid())
);

-- Notifications: Own only
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);

-- Audit logs: Read only by admins, insert via functions only (for simplicity in Phase 1, deny all client modifications)
create policy "Audit logs are protected" on public.audit_logs for all using (false) with check (false);

