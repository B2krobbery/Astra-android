-- 20260914172355_secure_multi_profile_photos.sql
-- Multi-photo profile galleries (max 5 per user) with a private avatars bucket,
-- ordered slots, a single enforced primary photo, and transactional RPCs.

alter table public.profile_photos
  add column if not exists position smallint;

with ranked as (
  select id, row_number() over (
    partition by user_id
    order by is_primary desc nulls last, created_at, id
  ) - 1 as new_position
  from public.profile_photos
)
update public.profile_photos p
set position = ranked.new_position
from ranked
where p.id = ranked.id
  and p.position is null;

with ranked as (
  select id, row_number() over (
    partition by user_id
    order by is_primary desc nulls last, position, created_at, id
  ) as row_number
  from public.profile_photos
)
update public.profile_photos p
set is_primary = (ranked.row_number = 1)
from ranked
where p.id = ranked.id;

alter table public.profile_photos
  alter column position set default 0,
  alter column position set not null,
  alter column is_primary set default false,
  alter column is_primary set not null;

alter table public.profile_photos
  drop constraint if exists profile_photos_position_check;
alter table public.profile_photos
  add constraint profile_photos_position_check check (position between 0 and 4);

create unique index if not exists profile_photos_user_position_key
  on public.profile_photos (user_id, position);
create unique index if not exists profile_photos_one_primary_key
  on public.profile_photos (user_id)
  where is_primary;
create index if not exists profile_photos_user_order_idx
  on public.profile_photos (user_id, is_primary desc, position);

update storage.buckets
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[]
where id = 'avatars';

create schema if not exists private;

create or replace function private.can_view_profile_photos(target_folder text)
returns boolean
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  viewer_id uuid := auth.uid();
  target_user_id uuid;
begin
  if viewer_id is null or target_folder is null or target_folder !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    return false;
  end if;

  target_user_id := target_folder::uuid;
  return viewer_id = target_user_id
    or exists (
      select 1
      from public.profiles p
      where p.id = target_user_id
        and coalesce(p.photo_privacy, 'public') = 'public'
    )
    or exists (
      select 1
      from public.matches m
      where (m.user1_id = viewer_id and m.user2_id = target_user_id)
         or (m.user2_id = viewer_id and m.user1_id = target_user_id)
    )
    or exists (
      select 1
      from public.photo_requests pr
      where pr.requester_id = viewer_id
        and pr.target_id = target_user_id
        and pr.status = 'ACCEPTED'
    );
end;
$$;

revoke all on function private.can_view_profile_photos(text) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.can_view_profile_photos(text) to authenticated;

drop policy if exists "Auth Update" on storage.objects;
drop policy if exists "Auth Upload" on storage.objects;
drop policy if exists "Avatars viewable by authenticated users" on storage.objects;
drop policy if exists "Avatars are publicly accessible" on storage.objects;
drop policy if exists "Avatars viewable by owner or match" on storage.objects;
drop policy if exists "Avatars viewable by owner, approved request, or match" on storage.objects;
drop policy if exists "Users can upload their own avatars" on storage.objects;
drop policy if exists "Users can update their own avatars" on storage.objects;
drop policy if exists "Users can delete their own avatars" on storage.objects;

create policy "Authenticated users can view authorized avatars"
on storage.objects for select
to authenticated
using (
  bucket_id = 'avatars'
  and private.can_view_profile_photos((storage.foldername(name))[1])
);

create policy "Users can upload own avatars"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

create policy "Users can update own avatars"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (select auth.uid())::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'avatars'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

create policy "Users can delete own avatars"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can insert own photos" on public.profile_photos;
drop policy if exists "Users can update own photos" on public.profile_photos;
drop policy if exists "Users can delete own photos" on public.profile_photos;

create policy "Users can insert own photos"
on public.profile_photos for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own photos"
on public.profile_photos for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own photos"
on public.profile_photos for delete
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.register_profile_photo(
  p_storage_path text,
  p_make_primary boolean default false
)
returns public.profile_photos
language plpgsql
security invoker
set search_path = ''
as $$
declare
  viewer_id uuid := auth.uid();
  photo_count integer;
  next_position smallint;
  inserted_photo public.profile_photos;
begin
  if viewer_id is null then
    raise exception 'Authentication required';
  end if;
  if p_storage_path is null or p_storage_path not like viewer_id::text || '/%' then
    raise exception 'Invalid photo path';
  end if;

  perform 1 from public.profiles where id = viewer_id for update;
  if not found then
    raise exception 'Profile not found';
  end if;

  select count(*) into photo_count
  from public.profile_photos
  where user_id = viewer_id;
  if photo_count >= 5 then
    raise exception 'A maximum of 5 profile photos is allowed';
  end if;

  select slot::smallint into next_position
  from generate_series(0, 4) as slot
  where not exists (
    select 1 from public.profile_photos p
    where p.user_id = viewer_id and p.position = slot
  )
  order by slot
  limit 1;

  if p_make_primary or photo_count = 0 then
    update public.profile_photos
    set is_primary = false
    where user_id = viewer_id and is_primary;
  end if;

  insert into public.profile_photos (user_id, storage_path, is_primary, position)
  values (viewer_id, p_storage_path, p_make_primary or photo_count = 0, next_position)
  returning * into inserted_photo;

  if inserted_photo.is_primary then
    update public.profiles
    set avatar_storage_path = inserted_photo.storage_path,
        updated_at = now()
    where id = viewer_id;
  end if;

  return inserted_photo;
end;
$$;

create or replace function public.set_primary_profile_photo(p_photo_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  viewer_id uuid := auth.uid();
  selected_path text;
begin
  if viewer_id is null then
    raise exception 'Authentication required';
  end if;

  perform 1 from public.profiles where id = viewer_id for update;
  select storage_path into selected_path
  from public.profile_photos
  where id = p_photo_id and user_id = viewer_id;
  if selected_path is null then
    raise exception 'Photo not found';
  end if;

  update public.profile_photos
  set is_primary = (id = p_photo_id)
  where user_id = viewer_id
    and is_primary is distinct from (id = p_photo_id);

  update public.profiles
  set avatar_storage_path = selected_path,
      updated_at = now()
  where id = viewer_id;
end;
$$;

create or replace function public.delete_profile_photo(p_photo_id uuid)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  viewer_id uuid := auth.uid();
  deleted_path text;
  deleted_was_primary boolean;
  replacement_id uuid;
  replacement_path text;
begin
  if viewer_id is null then
    raise exception 'Authentication required';
  end if;

  perform 1 from public.profiles where id = viewer_id for update;
  select storage_path, is_primary
  into deleted_path, deleted_was_primary
  from public.profile_photos
  where id = p_photo_id and user_id = viewer_id
  for update;
  if deleted_path is null then
    raise exception 'Photo not found';
  end if;

  delete from public.profile_photos
  where id = p_photo_id and user_id = viewer_id;

  if deleted_was_primary then
    select id, storage_path
    into replacement_id, replacement_path
    from public.profile_photos
    where user_id = viewer_id
    order by position, created_at, id
    limit 1;

    if replacement_id is not null then
      update public.profile_photos set is_primary = true where id = replacement_id;
    end if;

    update public.profiles
    set avatar_storage_path = replacement_path,
        updated_at = now()
    where id = viewer_id;
  end if;

  return deleted_path;
end;
$$;

revoke all on function public.register_profile_photo(text, boolean) from public, anon;
revoke all on function public.set_primary_profile_photo(uuid) from public, anon;
revoke all on function public.delete_profile_photo(uuid) from public, anon;
grant execute on function public.register_profile_photo(text, boolean) to authenticated;
grant execute on function public.set_primary_profile_photo(uuid) to authenticated;
grant execute on function public.delete_profile_photo(uuid) to authenticated;
