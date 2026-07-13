-- Migration 002: RLS policies and entitlement predicates
-- Homer platform, Phase 0 ticket P0.7.
--
-- The security model IS the schema. This migration turns the deny-all lock from
-- 001 into a precise, least-privilege access model, encoded once as reusable
-- predicates so every future table and the P0.15 entitlement resolver share the
-- same logic. It covers the six policy families the ticket names:
--   1. org isolation            (no org sees another org's rows)
--   2. property membership       (property members and their org staff read a property)
--   3. chat creator-only         (rule 2: chat rows visible ONLY to their creator)
--   4. org-layer docs read-only  (rule 7: owners read org docs, never write them;
--                                 locked archive copies are immutable)
--   5. shared-asset inheritance  (org library visible to org members)
--   6. owner-authored writes      (owners add their own reminders and contacts)
--
-- Access planes and how RLS applies:
--   * The homeowner PWA talks to Supabase directly with the user's JWT (the
--     authenticated role). RLS is what protects that path. These policies target
--     the authenticated role.
--   * The /api gateway uses the service_role key, which bypasses RLS, and does
--     its own entitlement checks (P0.15). So RLS here guards the direct-client
--     path; the server path is guarded by the resolver.
--   * anon has no policies here, so anon reads nothing.
--
-- Predicates live in a private schema (not exposed via the API) and are
-- SECURITY DEFINER with a locked empty search_path, so a membership check does
-- not itself trigger RLS and cannot recurse.
--
-- No em dashes anywhere, including these comments.

-- Authorship completion -------------------------------------------------------
-- key_dates already carries created_by. tasks and service_directory need it so
-- an owner-authored row (a personal reminder, the owner's own tradie) is
-- distinguishable from an org-provisioned one. Null means org or system
-- provisioned; set means owner authored. Adding it now avoids a later reshape of
-- these tenant-keyed tables (which would re-trigger the isolation audit).

alter table public.tasks
  add column created_by uuid references auth.users (id) on delete set null;
comment on column public.tasks.created_by is
  'Null for org or system provisioned tasks; set to the user for owner-authored reminders.';

alter table public.service_directory
  add column created_by uuid references auth.users (id) on delete set null;
comment on column public.service_directory.created_by is
  'Null for org-preloaded trades; set to the user for the owner''s own contacts.';

-- Entitlement predicates ------------------------------------------------------

create schema if not exists private;
comment on schema private is
  'Server-side helpers not exposed via the API. RLS entitlement predicates live here.';

-- Is the current user a member of this org (any role)?
create or replace function private.is_org_member(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.org_members m
    where m.org_id = p_org and m.user_id = (select auth.uid())
  );
$$;

-- Is the current user an admin of this org?
create or replace function private.is_org_admin(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.org_members m
    where m.org_id = p_org
      and m.user_id = (select auth.uid())
      and m.role = 'admin'
  );
$$;

-- Is the current user a member of this property (owner, member or resident)?
create or replace function private.is_property_member(p_property uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.property_members pm
    where pm.property_id = p_property and pm.user_id = (select auth.uid())
  );
$$;

-- Is the current user the owner of this property?
create or replace function private.is_property_owner(p_property uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.property_members pm
    where pm.property_id = p_property
      and pm.user_id = (select auth.uid())
      and pm.role = 'owner'
  );
$$;

-- The owning org of a property (definer lookup so callers need no orgs access).
create or replace function private.property_org(p_property uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select org_id from public.properties where id = p_property;
$$;

-- Can the current user read this property's content? Property members and the
-- owning org's staff (admin or member) can; nobody else.
create or replace function private.can_access_property(p_property uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_property_member(p_property)
      or private.is_org_member(private.property_org(p_property));
$$;

grant usage on schema private to authenticated;
grant execute on all functions in schema private to authenticated;

-- Policies --------------------------------------------------------------------
-- Every policy is scoped to the authenticated role. Tables with no write policy
-- for a command deny that command to clients (writes flow through service_role).

-- orgs: members read, admins update. Create and delete are platform-level.
create policy orgs_select on public.orgs
  for select to authenticated
  using (private.is_org_member(id));

create policy orgs_update on public.orgs
  for update to authenticated
  using (private.is_org_admin(id))
  with check (private.is_org_admin(id));

-- org_members: you see your own memberships; admins see the whole roster and
-- manage seats.
create policy org_members_select on public.org_members
  for select to authenticated
  using (user_id = (select auth.uid()) or private.is_org_admin(org_id));

create policy org_members_insert on public.org_members
  for insert to authenticated
  with check (private.is_org_admin(org_id));

create policy org_members_update on public.org_members
  for update to authenticated
  using (private.is_org_admin(org_id))
  with check (private.is_org_admin(org_id));

create policy org_members_delete on public.org_members
  for delete to authenticated
  using (private.is_org_admin(org_id));

-- property_groups: org members read, org admins write.
create policy property_groups_select on public.property_groups
  for select to authenticated
  using (private.is_org_member(org_id));

create policy property_groups_write on public.property_groups
  for all to authenticated
  using (private.is_org_admin(org_id))
  with check (private.is_org_admin(org_id));

-- properties: property members and org staff read; org admins provision.
create policy properties_select on public.properties
  for select to authenticated
  using (private.can_access_property(id));

create policy properties_insert on public.properties
  for insert to authenticated
  with check (private.is_org_admin(org_id));

create policy properties_update on public.properties
  for update to authenticated
  using (private.is_org_admin(org_id))
  with check (private.is_org_admin(org_id));

create policy properties_delete on public.properties
  for delete to authenticated
  using (private.is_org_admin(org_id));

-- property_members: you see your own row; household and org staff see co-members.
-- The owner invites household; org admins manage membership.
create policy property_members_select on public.property_members
  for select to authenticated
  using (user_id = (select auth.uid()) or private.can_access_property(property_id));

create policy property_members_insert on public.property_members
  for insert to authenticated
  with check (
    private.is_property_owner(property_id)
    or private.is_org_admin(private.property_org(property_id))
  );

create policy property_members_update on public.property_members
  for update to authenticated
  using (
    private.is_property_owner(property_id)
    or private.is_org_admin(private.property_org(property_id))
  )
  with check (
    private.is_property_owner(property_id)
    or private.is_org_admin(private.property_org(property_id))
  );

create policy property_members_delete on public.property_members
  for delete to authenticated
  using (
    private.is_property_owner(property_id)
    or private.is_org_admin(private.property_org(property_id))
  );

-- shared_assets: org library. Org members read, org admins write.
create policy shared_assets_select on public.shared_assets
  for select to authenticated
  using (private.is_org_member(org_id));

create policy shared_assets_write on public.shared_assets
  for all to authenticated
  using (private.is_org_admin(org_id))
  with check (private.is_org_admin(org_id));

-- appliances: property members and org staff read; org admins write (appliances
-- are org or ingestion provisioned in v1).
create policy appliances_select on public.appliances
  for select to authenticated
  using (private.can_access_property(property_id));

create policy appliances_write on public.appliances
  for all to authenticated
  using (private.is_org_admin(private.property_org(property_id)))
  with check (private.is_org_admin(private.property_org(property_id)));

-- documents: the three-layer model.
--   org layer:   property members and org staff read; org admins write; owners
--                never write (rule 7).
--   owner layer: property members read and write their own uploads; org staff do
--                not see an owner's private uploads.
--   shared layer: org members read; org admins write.
-- A locked row (locked_at set) is the immutable archive copy: no client update
-- or delete of it, by anyone.
create policy documents_select on public.documents
  for select to authenticated
  using (
    (layer = 'org' and private.can_access_property(property_id))
    or (layer = 'owner' and private.is_property_member(property_id))
    or (layer = 'shared' and private.is_org_member(org_id))
  );

create policy documents_insert on public.documents
  for insert to authenticated
  with check (
    (layer = 'org' and private.is_org_admin(org_id))
    or (layer = 'owner'
        and private.is_property_member(property_id)
        and uploaded_by = (select auth.uid()))
    or (layer = 'shared' and private.is_org_admin(org_id))
  );

create policy documents_update on public.documents
  for update to authenticated
  using (
    locked_at is null
    and (
      (layer in ('org', 'shared') and private.is_org_admin(org_id))
      or (layer = 'owner'
          and private.is_property_member(property_id)
          and uploaded_by = (select auth.uid()))
    )
  )
  with check (
    locked_at is null
    and (
      (layer in ('org', 'shared') and private.is_org_admin(org_id))
      or (layer = 'owner'
          and private.is_property_member(property_id)
          and uploaded_by = (select auth.uid()))
    )
  );

create policy documents_delete on public.documents
  for delete to authenticated
  using (
    locked_at is null
    and (
      (layer in ('org', 'shared') and private.is_org_admin(org_id))
      or (layer = 'owner'
          and private.is_property_member(property_id)
          and uploaded_by = (select auth.uid()))
    )
  );

-- chats: creator-only (rule 2). Not org staff, not household co-members. You can
-- only open a chat on a property you can access.
create policy chats_select on public.chats
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy chats_insert on public.chats
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and private.can_access_property(property_id)
  );

create policy chats_update on public.chats
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy chats_delete on public.chats
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- chat_messages: creator-only, and a message must belong to one of your chats.
create policy chat_messages_select on public.chat_messages
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy chat_messages_insert on public.chat_messages
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.chats c
      where c.id = chat_id and c.user_id = (select auth.uid())
    )
  );

create policy chat_messages_update on public.chat_messages
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy chat_messages_delete on public.chat_messages
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- tasks: property members and org staff read. Org admins manage org tasks
-- (created_by null); owners manage their own reminders (created_by = them).
create policy tasks_select on public.tasks
  for select to authenticated
  using (private.can_access_property(property_id));

create policy tasks_insert on public.tasks
  for insert to authenticated
  with check (
    (created_by is null and private.is_org_admin(private.property_org(property_id)))
    or (created_by = (select auth.uid()) and private.is_property_member(property_id))
  );

create policy tasks_update on public.tasks
  for update to authenticated
  using (
    (created_by is null and private.is_org_admin(private.property_org(property_id)))
    or (created_by = (select auth.uid()) and private.is_property_member(property_id))
  )
  with check (
    (created_by is null and private.is_org_admin(private.property_org(property_id)))
    or (created_by = (select auth.uid()) and private.is_property_member(property_id))
  );

create policy tasks_delete on public.tasks
  for delete to authenticated
  using (
    (created_by is null and private.is_org_admin(private.property_org(property_id)))
    or (created_by = (select auth.uid()) and private.is_property_member(property_id))
  );

-- key_dates: same shape as tasks.
create policy key_dates_select on public.key_dates
  for select to authenticated
  using (private.can_access_property(property_id));

create policy key_dates_insert on public.key_dates
  for insert to authenticated
  with check (
    (created_by is null and private.is_org_admin(private.property_org(property_id)))
    or (created_by = (select auth.uid()) and private.is_property_member(property_id))
  );

create policy key_dates_update on public.key_dates
  for update to authenticated
  using (
    (created_by is null and private.is_org_admin(private.property_org(property_id)))
    or (created_by = (select auth.uid()) and private.is_property_member(property_id))
  )
  with check (
    (created_by is null and private.is_org_admin(private.property_org(property_id)))
    or (created_by = (select auth.uid()) and private.is_property_member(property_id))
  );

create policy key_dates_delete on public.key_dates
  for delete to authenticated
  using (
    (created_by is null and private.is_org_admin(private.property_org(property_id)))
    or (created_by = (select auth.uid()) and private.is_property_member(property_id))
  );

-- service_directory: same shape as tasks.
create policy service_directory_select on public.service_directory
  for select to authenticated
  using (private.can_access_property(property_id));

create policy service_directory_insert on public.service_directory
  for insert to authenticated
  with check (
    (created_by is null and private.is_org_admin(private.property_org(property_id)))
    or (created_by = (select auth.uid()) and private.is_property_member(property_id))
  );

create policy service_directory_update on public.service_directory
  for update to authenticated
  using (
    (created_by is null and private.is_org_admin(private.property_org(property_id)))
    or (created_by = (select auth.uid()) and private.is_property_member(property_id))
  )
  with check (
    (created_by is null and private.is_org_admin(private.property_org(property_id)))
    or (created_by = (select auth.uid()) and private.is_property_member(property_id))
  );

create policy service_directory_delete on public.service_directory
  for delete to authenticated
  using (
    (created_by is null and private.is_org_admin(private.property_org(property_id)))
    or (created_by = (select auth.uid()) and private.is_property_member(property_id))
  );
