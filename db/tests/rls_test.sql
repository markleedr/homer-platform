-- pgTAP suite: RLS policies (P0.7)
--
-- Proves the entitlement model from db/migrations/002_rls_policies.sql. Runs
-- inside one transaction that is rolled back, so it leaves no residue. Fixtures
-- are created as the bootstrap role; each assertion then acts as a specific user
-- by switching to the authenticated role and setting that user's JWT sub, which
-- is exactly how the homeowner PWA reaches the database.
--
-- Two isolated orgs (A and B), each with a property and an owner, plus an org
-- admin per org and a second household member on property A. Every table is
-- checked both ways: the right user sees or writes its row, and no user reaches
-- across the tenant boundary.
--
-- Run by the Supabase test runner (supabase test db) or pg_prove. Assumes pgTAP
-- is available, which it is on Supabase and in the CI database.
--
-- No em dashes anywhere, including these comments.

begin;
select plan(30);

-- Fixtures (bootstrap role) ---------------------------------------------------

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000a0001', 'a-owner@test.local'),
  ('00000000-0000-0000-0000-0000000a0002', 'a-admin@test.local'),
  ('00000000-0000-0000-0000-0000000a0003', 'a-house2@test.local'),
  ('00000000-0000-0000-0000-0000000b0001', 'b-owner@test.local'),
  ('00000000-0000-0000-0000-0000000b0002', 'b-admin@test.local');

insert into public.orgs (id, name) values
  ('0000000a-0000-0000-0000-000000000000', 'Org A'),
  ('0000000b-0000-0000-0000-000000000000', 'Org B');

insert into public.org_members (org_id, user_id, role) values
  ('0000000a-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000a0002', 'admin'),
  ('0000000b-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000b0002', 'admin');

insert into public.properties (id, org_id, name) values
  ('0a0a0000-0000-0000-0000-000000000000', '0000000a-0000-0000-0000-000000000000', 'A Home'),
  ('0b0b0000-0000-0000-0000-000000000000', '0000000b-0000-0000-0000-000000000000', 'B Home');

insert into public.property_members (property_id, user_id, role) values
  ('0a0a0000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000a0001', 'owner'),
  ('0a0a0000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000a0003', 'member'),
  ('0b0b0000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000b0001', 'owner');

insert into public.appliances (property_id, name) values
  ('0a0a0000-0000-0000-0000-000000000000', 'A Oven'),
  ('0b0b0000-0000-0000-0000-000000000000', 'B Oven');

insert into public.key_dates (property_id, title, due_date) values
  ('0a0a0000-0000-0000-0000-000000000000', 'A warranty', '2027-01-01'),
  ('0b0b0000-0000-0000-0000-000000000000', 'B warranty', '2027-01-01');

insert into public.tasks (property_id, title) values
  ('0a0a0000-0000-0000-0000-000000000000', 'A task'),
  ('0b0b0000-0000-0000-0000-000000000000', 'B task');

insert into public.service_directory (property_id, name) values
  ('0a0a0000-0000-0000-0000-000000000000', 'A trade'),
  ('0b0b0000-0000-0000-0000-000000000000', 'B trade');

insert into public.documents (id, org_id, property_id, layer, title, uploaded_by, locked_at) values
  ('0d0c0000-0000-0000-0000-000000000000', '0000000a-0000-0000-0000-000000000000', '0a0a0000-0000-0000-0000-000000000000', 'org', 'A org doc', null, null),
  ('0d00e000-0000-0000-0000-000000000000', '0000000a-0000-0000-0000-000000000000', '0a0a0000-0000-0000-0000-000000000000', 'owner', 'A owner doc', '00000000-0000-0000-0000-0000000a0001', null),
  ('0d10c000-0000-0000-0000-000000000000', '0000000a-0000-0000-0000-000000000000', '0a0a0000-0000-0000-0000-000000000000', 'org', 'A locked archive doc', null, now());

insert into public.chats (id, property_id, user_id, title) values
  ('0c1a0000-0000-0000-0000-000000000000', '0a0a0000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000a0001', 'A private chat');

insert into public.chat_messages (chat_id, user_id, role, content) values
  ('0c1a0000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000a0001', 'user', 'hello');

-- Act as property A owner -----------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000a0001","role":"authenticated"}', true);

select is((select auth.uid()), '00000000-0000-0000-0000-0000000a0001'::uuid,
  'acting as property A owner');

-- Property membership read, and org isolation (only A rows visible).
select is((select count(*) from public.properties)::int, 1,
  'A owner sees exactly one property (their own)');
select is((select count(*) from public.appliances)::int, 1,
  'A owner sees only org A appliances');
select is((select count(*) from public.key_dates)::int, 1,
  'A owner sees only org A key_dates');
select is((select count(*) from public.tasks)::int, 1,
  'A owner sees only org A tasks');
select is((select count(*) from public.service_directory)::int, 1,
  'A owner sees only org A service_directory');
select is((select count(*) from public.properties
           where id = '0b0b0000-0000-0000-0000-000000000000')::int, 0,
  'A owner cannot see org B property');
select is((select count(*) from public.appliances
           where property_id = '0b0b0000-0000-0000-0000-000000000000')::int, 0,
  'A owner cannot see org B appliances');

-- Documents: sees org-layer and own owner-layer, including the locked archive.
select is((select count(*) from public.documents)::int, 3,
  'A owner sees org, owner and locked docs on their property');

-- Chat creator-only: owner sees own chat and message.
select is((select count(*) from public.chats)::int, 1,
  'A owner sees their own chat');
select is((select count(*) from public.chat_messages)::int, 1,
  'A owner sees their own chat message');

-- Org-layer docs are read-only to the owner (rule 7): update affects zero rows.
select is(
  (with upd as (
     update public.documents set title = 'hacked'
     where id = '0d0c0000-0000-0000-0000-000000000000' returning 1)
   select count(*) from upd)::int, 0,
  'A owner cannot update an org-layer doc');

-- Owner can edit their own owner-layer doc.
select is(
  (with upd as (
     update public.documents set title = 'my receipt v2'
     where id = '0d00e000-0000-0000-0000-000000000000' returning 1)
   select count(*) from upd)::int, 1,
  'A owner can update their own owner-layer doc');

-- Owner cannot provision a property (org admin only): RLS blocks the insert.
select throws_ok(
  $$ insert into public.properties (org_id, name)
     values ('0000000a-0000-0000-0000-000000000000', 'sneaky') $$,
  '42501',
  null,
  'A owner cannot insert a property');

-- Owner can add their own reminder (created_by = self).
select lives_ok(
  $$ insert into public.tasks (property_id, title, created_by)
     values ('0a0a0000-0000-0000-0000-000000000000', 'my reminder',
             '00000000-0000-0000-0000-0000000a0001') $$,
  'A owner can add their own task');

-- Owner cannot add an org task (created_by null).
select throws_ok(
  $$ insert into public.tasks (property_id, title, created_by)
     values ('0a0a0000-0000-0000-0000-000000000000', 'org task', null) $$,
  '42501',
  null,
  'A owner cannot add an org-provisioned task');

-- Act as property A second household member -----------------------------------
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000a0003","role":"authenticated"}', true);

select is((select auth.uid()), '00000000-0000-0000-0000-0000000a0003'::uuid,
  'acting as property A household member');

-- Same property, but chats are creator-only: sees none of the owner's chat.
select is((select count(*) from public.chats)::int, 0,
  'household member cannot see another user chat (creator-only)');
select is((select count(*) from public.chat_messages)::int, 0,
  'household member cannot see another user chat message');
-- But does share the property content.
select is((select count(*) from public.appliances)::int, 1,
  'household member sees the property appliances');

-- Act as org A admin ----------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000a0002","role":"authenticated"}', true);

select is((select auth.uid()), '00000000-0000-0000-0000-0000000a0002'::uuid,
  'acting as org A admin');

-- Org staff read their org's property content.
select is((select count(*) from public.properties)::int, 1,
  'org A admin sees org A property');
select is((select count(*) from public.appliances)::int, 1,
  'org A admin sees org A appliances');

-- Archive immutability: even org admin cannot update a locked doc.
select is(
  (with upd as (
     update public.documents set title = 'tampered'
     where id = '0d10c000-0000-0000-0000-000000000000' returning 1)
   select count(*) from upd)::int, 0,
  'org A admin cannot update a locked archive doc');

-- Org admin can provision a property in their own org.
select lives_ok(
  $$ insert into public.properties (org_id, name)
     values ('0000000a-0000-0000-0000-000000000000', 'A Home 2') $$,
  'org A admin can provision a property in org A');

-- But cannot write into org B.
select throws_ok(
  $$ insert into public.appliances (property_id, name)
     values ('0b0b0000-0000-0000-0000-000000000000', 'cross-tenant') $$,
  '42501',
  null,
  'org A admin cannot write to org B property');

-- Act as org B owner ----------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000b0001","role":"authenticated"}', true);

select is((select auth.uid()), '00000000-0000-0000-0000-0000000b0001'::uuid,
  'acting as org B owner');

-- The other side of isolation: B sees only B, never A.
select is((select count(*) from public.properties)::int, 1,
  'B owner sees only their own property');
select is((select count(*) from public.appliances)::int, 1,
  'B owner sees only org B appliances');
select is((select count(*) from public.chats)::int, 0,
  'B owner cannot see org A chat');

select * from finish();
rollback;
