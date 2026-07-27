create extension if not exists pgcrypto;

create type public.app_role as enum ('super_admin','partner','client');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'client',
  partner_id uuid,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id),
  name text not null,
  slug text not null unique,
  status text not null default 'pending',
  plan_name text,
  ghl_location_id text,
  branding jsonb not null default '{}'::jsonb,
  social_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_partner_id_fkey foreign key (partner_id) references public.partners(id) on delete set null;

create table if not exists public.platform_integrations (
  id uuid primary key default gen_random_uuid(),
  provider text not null unique,
  status text not null default 'disconnected',
  public_config jsonb not null default '{}'::jsonb,
  encrypted_secret text,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.ghl_connections (
  id uuid primary key default gen_random_uuid(),
  company_id text,
  location_id text,
  connection_type text not null check (connection_type in ('agency','location')),
  encrypted_access_token text not null,
  encrypted_refresh_token text,
  expires_at timestamptz,
  scopes text[],
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(connection_type, company_id, location_id)
);

create table if not exists public.catalog_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  wholesale_price numeric(12,2) not null default 0,
  suggested_price numeric(12,2),
  currency text not null default 'USD',
  billing_type text not null default 'recurring',
  interval text,
  ghl_product_id text,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.partner_offers (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  product_id uuid not null references public.catalog_products(id) on delete cascade,
  retail_price numeric(12,2) not null,
  currency text not null default 'USD',
  ghl_price_id text,
  stripe_price_id text,
  checkout_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(partner_id, product_id)
);

create table if not exists public.partner_clients (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  status text not null default 'lead',
  ghl_contact_id text,
  ghl_location_id text,
  offer_id uuid references public.partner_offers(id),
  created_at timestamptz not null default now()
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_event_id text not null,
  event_type text,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(provider, external_event_id)
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id),
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.current_role()
returns public.app_role language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.current_partner_id()
returns uuid language sql stable security definer set search_path = public
as $$ select partner_id from public.profiles where id = auth.uid() $$;

alter table public.profiles enable row level security;
alter table public.partners enable row level security;
alter table public.platform_integrations enable row level security;
alter table public.ghl_connections enable row level security;
alter table public.catalog_products enable row level security;
alter table public.partner_offers enable row level security;
alter table public.partner_clients enable row level security;
alter table public.webhook_events enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_self_or_admin on public.profiles for select using (id = auth.uid() or public.current_role() = 'super_admin');
create policy partners_admin_all on public.partners for all using (public.current_role() = 'super_admin') with check (public.current_role() = 'super_admin');
create policy partners_partner_read on public.partners for select using (id = public.current_partner_id());
create policy catalog_authenticated_read on public.catalog_products for select to authenticated using (active = true or public.current_role() = 'super_admin');
create policy catalog_admin_write on public.catalog_products for all using (public.current_role() = 'super_admin') with check (public.current_role() = 'super_admin');
create policy offers_partner_scope on public.partner_offers for all using (partner_id = public.current_partner_id() or public.current_role() = 'super_admin') with check (partner_id = public.current_partner_id() or public.current_role() = 'super_admin');
create policy clients_partner_scope on public.partner_clients for all using (partner_id = public.current_partner_id() or public.current_role() = 'super_admin') with check (partner_id = public.current_partner_id() or public.current_role() = 'super_admin');
create policy integrations_admin_only on public.platform_integrations for all using (public.current_role() = 'super_admin') with check (public.current_role() = 'super_admin');
create policy connections_admin_only on public.ghl_connections for all using (public.current_role() = 'super_admin') with check (public.current_role() = 'super_admin');
create policy audit_admin_read on public.audit_logs for select using (public.current_role() = 'super_admin');

create or replace view public.platform_settings_public as
select provider, status, public_config, updated_at from public.platform_integrations;

grant select on public.platform_settings_public to authenticated;
