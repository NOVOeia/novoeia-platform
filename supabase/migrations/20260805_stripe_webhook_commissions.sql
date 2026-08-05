create table if not exists public.partner_commissions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  sales_link_id uuid references public.sales_links(id) on delete set null,
  client_id uuid references public.partner_clients(id) on delete set null,
  stripe_checkout_session_id text unique,
  stripe_subscription_id text,
  stripe_invoice_id text,
  gross_amount numeric(12,2) not null,
  wholesale_amount numeric(12,2) not null,
  commission_amount numeric(12,2) not null,
  currency text not null default 'USD',
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'cancelled')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists partner_commissions_partner_idx
  on public.partner_commissions (partner_id, status);

create index if not exists partner_commissions_sales_link_idx
  on public.partner_commissions (sales_link_id);

alter table public.partner_commissions enable row level security;

create policy partner_commissions_admin_all on public.partner_commissions
  for all using (public.current_role() = 'super_admin')
  with check (public.current_role() = 'super_admin');

create policy partner_commissions_partner_read on public.partner_commissions
  for select using (partner_id = public.current_partner_id());
