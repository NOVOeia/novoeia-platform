create table if not exists public.platform_notifications (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners(id) on delete cascade,
  recipient_role public.app_role not null default 'partner',
  type text not null,
  title text not null,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists platform_notifications_partner_created_idx
  on public.platform_notifications (partner_id, created_at desc);

create index if not exists platform_notifications_partner_unread_idx
  on public.platform_notifications (partner_id)
  where read_at is null;

alter table public.platform_notifications enable row level security;

create policy platform_notifications_partner_read on public.platform_notifications
  for select using (partner_id = public.current_partner_id());

create policy platform_notifications_partner_update on public.platform_notifications
  for update using (partner_id = public.current_partner_id())
  with check (partner_id = public.current_partner_id());

create policy platform_notifications_admin_all on public.platform_notifications
  for all using (public.current_role() = 'super_admin')
  with check (public.current_role() = 'super_admin');

do $$
begin
  alter publication supabase_realtime add table public.platform_notifications;
exception
  when duplicate_object then null;
end $$;
