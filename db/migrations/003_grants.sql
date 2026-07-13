-- Migration 003: explicit role grants
-- Homer platform, Phase 0 ticket P0.7 (follow-up).
--
-- Postgres requires two things before the authenticated role can touch a table:
-- a table-level privilege (GRANT) AND a row-level policy (RLS). Migration 002
-- added the policies; this migration adds the table privileges explicitly.
--
-- Why explicit: hosted Supabase grants these privileges to anon/authenticated
-- implicitly via default privileges, but a fresh local stack (the CI test
-- database) does not, so the policies were leaning on an implicit grant that is
-- not portable. Granting here makes the access model explicit and identical in
-- every environment. RLS is still the real gate: a blanket table privilege lets
-- the role issue the statement, and the policy decides which rows (if any) it
-- affects. Tables and commands with no permissive policy stay fully denied.
--
-- Least privilege: only the authenticated role is granted, and only DML. anon
-- gets nothing (the product requires login), and service_role already has full
-- access and bypasses RLS. Future migrations that add tables must grant on those
-- new tables the same way (see db/README.md).
--
-- No em dashes anywhere, including these comments.

grant usage on schema public to authenticated;

grant select, insert, update, delete on all tables in schema public to authenticated;
