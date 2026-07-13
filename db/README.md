# /db - database migrations

Postgres migrations for the single Supabase project (Sydney region). Tenant
isolation is via RLS only, never separate databases (CLAUDE.md, PRD 8a).

Migrations begin in Week 2 of Phase 0:

- **P0.6 (done)** core schema `001_core_schema.sql`: `orgs`, `org_members`, `property_groups`, `properties`, `property_members`, `appliances`, `documents` (3-layer model), `shared_assets`, `chats`, `chat_messages`, `tasks`, `key_dates`, `service_directory`. RLS is enabled on every table with no policies yet, so all thirteen are deny-all by default until P0.7 adds policies. Finishes, emergency shut-offs and home-map hot dots are stored as jsonb on `properties`. Applied to staging; production is mirrored once P0.7 policies exist, so production never has tables without policies.
- **P0.7** RLS policy set with a pgTAP suite: every policy gets a positive and a negative test before any feature lands on the table.
- **P0.8** defect schema, including the `defect_events` append-only trigger.
- **P0.10** audit-log table and trigger pattern.

Rules that constrain everything here: chat rows are creator-only (rule 2), `defect_events` and audit tables are append-only (rule 8), and the data-isolation audit is a hard gate re-run on every migration touching a tenant-keyed table (rule 10).

## Layout
- `migrations/` numbered, forward-only SQL migrations (start at `001_`).
