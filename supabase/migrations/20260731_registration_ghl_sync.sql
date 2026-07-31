alter table public.profiles
  add column if not exists phone text,
  add column if not exists ghl_sync_status text not null default 'pending';

alter table public.partners
  add column if not exists ghl_sync_status text not null default 'pending',
  add column if not exists contact_email text,
  add column if not exists contact_phone text;

alter table public.partner_clients
  add column if not exists ghl_sync_status text not null default 'pending';

create index if not exists partners_slug_idx on public.partners (slug);
create index if not exists profiles_email_idx on public.profiles (email);
