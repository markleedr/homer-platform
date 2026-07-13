# Infrastructure (living record)

What is provisioned for Homer, and the decisions behind it. Secrets never live
in this repo: connection strings, API keys and database passwords go into
managed environment variables per environment (P0.5). This file records only
non-secret identifiers and decisions.

## Hosting: Vercel

- Project: `homer-platform-app` (team `markleedrs-projects`).
- Root directory `app/`, framework Vite, env var `VITE_PRODUCT_NAME`.
- Production deploys from `main`; every PR gets a preview; rollback via the
  dashboard Instant Rollback. See `docs/ci-cd.md`.
- The developer portal becomes a second Vercel project in Phase 1.

## Database: Supabase

Single Postgres database per environment. Tenant isolation is via RLS only,
never separate databases per tenant (CLAUDE.md, PRD 8a). Region
`ap-southeast-2` (Sydney) for Australian data residency.

| Environment | Project name | Ref | Region | Postgres |
|---|---|---|---|---|
| Production | homer-production | `sgfuhfyrnxqgycpglwju` | ap-southeast-2 | 17 |
| Staging | homer-staging | `eziaxmrgmtbctztvkunt` | ap-southeast-2 | 17 |

The project ref is not a secret (it is part of the public API URL). The
`anon` (publishable) key is client-safe. The `service_role` key and database
password are server-only secrets and are never committed.

- Plan: Pro organisation.
- **Vault** enabled (`supabase_vault`) for encrypted secret storage, used for
  AI keys (CLAUDE.md rule 3).
- **pgvector** (`vector`) available for in-database RAG (enabled with the schema
  in P0.6, not before).
- **pgTAP** available for the RLS test suite (P0.7).

### Backups and recovery

- Free **daily backups (7-day retention)** are active on both projects from
  creation.
- **Point-in-time recovery (PITR)** is deferred. Decision (13 July 2026): PITR
  costs USD $100/month per project for 7-day retention and adds little over the
  free daily backups while the only tenant is 18 Silky Oak. It will be enabled
  on `homer-production` before any external pilot home's data lands (week 5-6).
  This is a conscious, cost-based deviation from PRD 8a's "PITR from day one",
  logged here and gated in `docs/03-phase0-tickets.md`.

## Secrets handling

No secret is stored in this repo. In P0.5, keys and connection strings move into
managed environment variables per environment (Vercel env + Supabase Vault).
The `anon` key may sit in client env; the `service_role` key and database
password live server-side only.
