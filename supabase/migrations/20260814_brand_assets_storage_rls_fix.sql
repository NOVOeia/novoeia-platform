-- Alinea policies de brand-assets con el path real de subida:
-- partners/{partner_id}/{user_id}/{folder}/{file}
-- o {folder}/{user_id}/{file}
-- y elimina policies antiguas demasiado restrictivas / inconsistentes.

drop policy if exists brand_assets_authenticated_insert on storage.objects;
drop policy if exists brand_assets_authenticated_update on storage.objects;
drop policy if exists brand_assets_authenticated_delete on storage.objects;
drop policy if exists brand_assets_authenticated_select on storage.objects;

drop policy if exists brand_assets_public_read on storage.objects;
create policy brand_assets_public_read
on storage.objects
for select
to public
using (bucket_id = 'brand-assets');

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
  and (storage.foldername(name))[3] = auth.uid()::text
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
  and (storage.foldername(name))[3] = auth.uid()::text
)
with check (
  bucket_id = 'brand-assets'
  and public.current_role() = 'partner'
  and public.current_partner_id() is not null
  and (storage.foldername(name))[1] = 'partners'
  and (storage.foldername(name))[2] = public.current_partner_id()::text
  and (storage.foldername(name))[3] = auth.uid()::text
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
  and (storage.foldername(name))[3] = auth.uid()::text
);

-- Compatibilidad: logos|covers|funnel/{auth.uid()}/...
drop policy if exists brand_assets_user_folder_insert on storage.objects;
create policy brand_assets_user_folder_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'brand-assets'
  and (storage.foldername(name))[1] in ('logos', 'covers', 'funnel', 'videos')
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists brand_assets_user_folder_update on storage.objects;
create policy brand_assets_user_folder_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'brand-assets'
  and (storage.foldername(name))[1] in ('logos', 'covers', 'funnel', 'videos')
  and (storage.foldername(name))[2] = auth.uid()::text
)
with check (
  bucket_id = 'brand-assets'
  and (storage.foldername(name))[1] in ('logos', 'covers', 'funnel', 'videos')
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists brand_assets_user_folder_delete on storage.objects;
create policy brand_assets_user_folder_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'brand-assets'
  and (storage.foldername(name))[1] in ('logos', 'covers', 'funnel', 'videos')
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- Mantener legacy logos/{uid} policies si existían con otros nombres
drop policy if exists brand_assets_user_logos_insert on storage.objects;
drop policy if exists brand_assets_user_logos_update on storage.objects;
drop policy if exists brand_assets_user_logos_delete on storage.objects;
