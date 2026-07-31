alter table public.profiles
  add column if not exists email text,
  add column if not exists ghl_user_id text unique,
  add column if not exists ghl_company_id text,
  add column if not exists ghl_location_id text;

create table if not exists public.oauth_states (
  state uuid primary key,
  purpose text not null check (purpose in ('login', 'connect')),
  user_type text not null default 'Company' check (user_type in ('Company', 'Location')),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.oauth_states enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, email, ghl_user_id)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'client'),
    new.raw_user_meta_data->>'full_name',
    new.email,
    nullif(new.raw_user_meta_data->>'ghl_user_id', '')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    ghl_user_id = coalesce(excluded.ghl_user_id, public.profiles.ghl_user_id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create policy profiles_self_update on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());
