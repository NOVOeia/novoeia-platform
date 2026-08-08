alter table public.catalog_products
  add column if not exists ghl_price_id text;

comment on column public.catalog_products.ghl_price_id is
  'GHL SaaS priceId (tarifa del plan) usado en enable-saas al provisionar clientes';
