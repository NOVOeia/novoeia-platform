alter table public.catalog_products
  add column if not exists stripe_product_id text,
  add column if not exists stripe_price_id text;

create index if not exists catalog_products_stripe_product_idx
  on public.catalog_products (stripe_product_id);

alter table public.partner_offers
  add column if not exists stripe_checkout_session_id text;

create index if not exists partner_offers_checkout_session_idx
  on public.partner_offers (stripe_checkout_session_id);

-- NOVO Avanzado (Stripe product prod_Ux15FXk6GFygd3)
insert into public.catalog_products (
  name,
  description,
  wholesale_price,
  suggested_price,
  currency,
  billing_type,
  interval,
  stripe_product_id,
  metadata,
  active
)
select
  'NOVO Avanzado — Mensual',
  'Plan avanzado NOVO con facturación mensual.',
  87.00,
  97.00,
  'USD',
  'recurring',
  'month',
  'prod_Ux15FXk6GFygd3',
  '{"family":"novo-avanzado","stripe_product_id":"prod_Ux15FXk6GFygd3"}'::jsonb,
  true
where not exists (
  select 1 from public.catalog_products where name = 'NOVO Avanzado — Mensual'
);

insert into public.catalog_products (
  name,
  description,
  wholesale_price,
  suggested_price,
  currency,
  billing_type,
  interval,
  stripe_product_id,
  metadata,
  active
)
select
  'NOVO Avanzado — Anual',
  'Plan avanzado NOVO con facturación anual.',
  870.00,
  970.00,
  'USD',
  'recurring',
  'year',
  'prod_Ux15FXk6GFygd3',
  '{"family":"novo-avanzado","stripe_product_id":"prod_Ux15FXk6GFygd3"}'::jsonb,
  true
where not exists (
  select 1 from public.catalog_products where name = 'NOVO Avanzado — Anual'
);
