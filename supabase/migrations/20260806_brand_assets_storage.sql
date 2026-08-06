-- Bucket público para logos, portadas y assets de marca white-label
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brand-assets',
  'brand-assets',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Lectura pública (landing, checkout, funnel)
drop policy if exists brand_assets_public_read on storage.objects;
create policy brand_assets_public_read
on storage.objects
for select
to public
using (bucket_id = 'brand-assets');

-- Super Admin: gestión completa del bucket
drop policy if exists brand_assets_admin_all on storage.objects;
create policy brand_assets_admin_all
on storage.objects
for all
to authenticated
using (
  bucket_id = 'brand-assets'
  and public.current_role() = 'super_admin'
)
with check (
  bucket_id = 'brand-assets'
  and public.current_role() = 'super_admin'
);

-- Partner: subir/actualizar/eliminar solo en su carpeta partners/{partner_id}/...
drop policy if exists brand_assets_partner_insert on storage.objects;
create policy brand_assets_partner_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'brand-assets'
  and public.current_role() = 'partner'
  and public.current_partner_id() is not null
  and (storage.foldername(name))[1] = 'partners'
  and (storage.foldername(name))[2] = public.current_partner_id()::text
);

drop policy if exists brand_assets_partner_update on storage.objects;
create policy brand_assets_partner_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'brand-assets'
  and public.current_role() = 'partner'
  and public.current_partner_id() is not null
  and (storage.foldername(name))[1] = 'partners'
  and (storage.foldername(name))[2] = public.current_partner_id()::text
)
with check (
  bucket_id = 'brand-assets'
  and public.current_role() = 'partner'
  and public.current_partner_id() is not null
  and (storage.foldername(name))[1] = 'partners'
  and (storage.foldername(name))[2] = public.current_partner_id()::text
);

drop policy if exists brand_assets_partner_delete on storage.objects;
create policy brand_assets_partner_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'brand-assets'
  and public.current_role() = 'partner'
  and public.current_partner_id() is not null
  and (storage.foldername(name))[1] = 'partners'
  and (storage.foldername(name))[2] = public.current_partner_id()::text
);

-- Compatibilidad con subidas legacy: logos/{auth.uid()}/...
drop policy if exists brand_assets_user_logos_insert on storage.objects;
create policy brand_assets_user_logos_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'brand-assets'
  and (storage.foldername(name))[1] = 'logos'
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists brand_assets_user_logos_update on storage.objects;
create policy brand_assets_user_logos_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'brand-assets'
  and (storage.foldername(name))[1] = 'logos'
  and (storage.foldername(name))[2] = auth.uid()::text
)
with check (
  bucket_id = 'brand-assets'
  and (storage.foldername(name))[1] = 'logos'
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists brand_assets_user_logos_delete on storage.objects;
create policy brand_assets_user_logos_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'brand-assets'
  and (storage.foldername(name))[1] = 'logos'
  and (storage.foldername(name))[2] = auth.uid()::text
);
