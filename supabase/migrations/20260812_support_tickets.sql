-- Partner support tickets

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  subject text not null,
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'waiting_partner', 'resolved', 'closed')),
  last_message_at timestamptz not null default now(),
  last_message_by text
    check (last_message_by is null or last_message_by in ('partner', 'super_admin')),
  resolved_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  author_role text not null
    check (author_role in ('partner', 'super_admin')),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists support_tickets_partner_idx
  on public.support_tickets (partner_id, updated_at desc);

create index if not exists support_tickets_status_idx
  on public.support_tickets (status, last_message_at desc);

create index if not exists support_ticket_messages_ticket_idx
  on public.support_ticket_messages (ticket_id, created_at asc);

alter table public.support_tickets enable row level security;
alter table public.support_ticket_messages enable row level security;

create policy support_tickets_admin_all
  on public.support_tickets
  for all
  using (public.current_role() = 'super_admin')
  with check (public.current_role() = 'super_admin');

create policy support_tickets_partner_select
  on public.support_tickets
  for select
  using (partner_id = public.current_partner_id());

create policy support_tickets_partner_insert
  on public.support_tickets
  for insert
  with check (partner_id = public.current_partner_id());

create policy support_tickets_partner_update
  on public.support_tickets
  for update
  using (partner_id = public.current_partner_id())
  with check (partner_id = public.current_partner_id());

create policy support_ticket_messages_admin_all
  on public.support_ticket_messages
  for all
  using (public.current_role() = 'super_admin')
  with check (public.current_role() = 'super_admin');

create policy support_ticket_messages_partner_select
  on public.support_ticket_messages
  for select
  using (
    exists (
      select 1
      from public.support_tickets t
      where t.id = ticket_id
        and t.partner_id = public.current_partner_id()
    )
  );

create policy support_ticket_messages_partner_insert
  on public.support_ticket_messages
  for insert
  with check (
    author_role = 'partner'
    and exists (
      select 1
      from public.support_tickets t
      where t.id = ticket_id
        and t.partner_id = public.current_partner_id()
        and t.status not in ('closed')
    )
  );
