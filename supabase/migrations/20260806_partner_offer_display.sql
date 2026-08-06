alter table public.partner_offers
  add column if not exists display_name text,
  add column if not exists display_description text;
