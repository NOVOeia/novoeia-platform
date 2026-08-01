alter table public.partner_offers
  add column if not exists stripe_checkout_session_id text;

create index if not exists partner_offers_checkout_session_idx
  on public.partner_offers (stripe_checkout_session_id);
