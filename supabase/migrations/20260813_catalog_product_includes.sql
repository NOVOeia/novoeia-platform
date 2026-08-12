alter table public.catalog_products
  add column if not exists includes text;

comment on column public.catalog_products.includes is
  'Qué incluye el producto (texto multilínea, un ítem por línea). Visible para partners.';

comment on column public.catalog_products.description is
  'Descripción del producto del catálogo. Visible para partners.';
