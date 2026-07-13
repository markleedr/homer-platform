# /db - database migrations

Postgres migrations for the single Supabase project (Sydney region). Tenant
isolation is via RLS only, never separate databases (CLAUDE.md, PRD 8a).

Migrations begin in Week 2 of Phase 0:

- **P0.6 (done)** core schema `001_core_schema.sql`: `orgs`, `org_members`, `property_groups`, `properties`, `property_members`, `appliances`, `documents` (3-layer model), `shared_assets`, `chats`, `chat_messages`, `tasks`, `key_dates`, `service_directory`. RLS is enabled on every table with no policies yet, so all thirteen are deny-all by default until P0.7 adds policies. Finishes, emergency shut-offs and home-map hot dots are stored as jsonb on `properties`.
- **P0.7 (done)** RLS policy set `002_rls_policies.sql`: 44 policies across the thirteen tables, built on six `SECURITY DEFINER` entitlement predicates in the `private` schema (shared with the P0.15 resolver and every future table). Covers org isolation, property membership, chat creator-only visibility (rule 2), org-layer docs read-only to owners plus archive-copy immutability (rule 7), shared-asset inheritance, and owner-authored writes (a `created_by` marker was added to `tasks` and `service_directory` to complete the authorship model). Verified against staging: two isolated tenants cannot read or write across the boundary, and a household co-member cannot see another user's chat. The pgTAP suite lives in `tests/`.
- **P0.7 (done)** grants `003_grants.sql`: explicit `GRANT` of DML on the public
  tables to the `authenticated` role. Postgres needs both a table privilege and
  an RLS policy before a role can touch a table; hosted Supabase grants the
  privilege implicitly but a fresh local stack (the CI test database) does not,
  so the grants are made explicit here for portability. RLS is still the real
  gate. **Convention for future migrations: any new table in `public` must grant
  DML to `authenticated` the same way**; only `authenticated` is granted (anon
  gets nothing, service_role already has full access).
- **P0.8** defect schema, including the `defect_events` append-only trigger.
- **P0.10** audit-log table and trigger pattern.

All three migrations are applied to staging and production; the two are kept in step so production never carries tenant tables without policies. Production does not have the pgTAP extension (a test-only tool).

Rules that constrain everything here: chat rows are creator-only (rule 2), `defect_events` and audit tables are append-only (rule 8), and the data-isolation audit is a hard gate re-run on every migration touching a tenant-keyed table (rule 10).

## Layout
- `migrations/` numbered, forward-only SQL migrations (start at `001_`).
- `tests/` pgTAP suites for the RLS policies, one positive and one negative case per policy family. Run by the Supabase test runner or pg_prove against a database with the migrations applied.
