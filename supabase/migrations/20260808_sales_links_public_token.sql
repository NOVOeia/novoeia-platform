alter table public.sales_links
  add column if not exists public_token text;

create unique index if not exists sales_links_public_token_idx
  on public.sales_links (public_token)
  where public_token is not null;
