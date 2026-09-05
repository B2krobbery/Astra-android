-- Ensure profile exists when a user signs up via Google or any auth provider
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_name text;
begin
  user_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1),
    'Astra Member'
  );

  insert into public.profiles (id, display_name, intent, onboarding_completed)
  values (
    new.id,
    user_name,
    coalesce(new.raw_user_meta_data->>'intent', 'Marriage'),
    false
  )
  on conflict (id) do update
  set display_name = coalesce(public.profiles.display_name, excluded.display_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
