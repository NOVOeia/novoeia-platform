-- Partner payment profiles (payout activation wizard)

create table if not exists public.partner_payment_profiles (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  status text not null default 'draft'
    check (status in ('draft', 'pending_review', 'approved', 'rejected', 'needs_changes')),
  legal_profile jsonb not null default '{}'::jsonb,
  backup_bank jsonb not null default '{}'::jsonb,
  has_us_bank boolean not null default false,
  us_bank jsonb not null default '{}'::jsonb,
  payment_route text
    check (
      payment_route is null
      or payment_route in (
        'AIRWALLEX_ACCOUNT',
        'WISE_ACCOUNT',
        'WISE_BANK',
        'USA_BANK'
      )
    ),
  provider_details jsonb not null default '{}'::jsonb,
  wizard_state jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (partner_id)
);

create index if not exists partner_payment_profiles_partner_idx
  on public.partner_payment_profiles (partner_id);

create index if not exists partner_payment_profiles_status_idx
  on public.partner_payment_profiles (status);

alter table public.partner_payment_profiles enable row level security;

create policy partner_payment_profiles_admin_all
  on public.partner_payment_profiles
  for all
  using (public.current_role() = 'super_admin')
  with check (public.current_role() = 'super_admin');

create policy partner_payment_profiles_partner_select
  on public.partner_payment_profiles
  for select
  using (partner_id = public.current_partner_id());

create policy partner_payment_profiles_partner_insert
  on public.partner_payment_profiles
  for insert
  with check (partner_id = public.current_partner_id());

create policy partner_payment_profiles_partner_update
  on public.partner_payment_profiles
  for update
  using (
    partner_id = public.current_partner_id()
    and status in ('draft', 'rejected', 'needs_changes', 'pending_review')
  )
  with check (
    partner_id = public.current_partner_id()
    and status in ('draft', 'rejected', 'needs_changes', 'pending_review')
  );
