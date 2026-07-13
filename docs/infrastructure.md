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
- **pgTAP** available for the RLS test suite (P0.7). Installed on `homer-staging`
  for ad-hoc runs; deliberately not installed on `homer-production` (a test-only
  tool). The suite lives in `db/tests` and runs automatically in CI via the
  `DB RLS tests` workflow, which boots a real Supabase Postgres stack with the
  migrations applied and runs pgTAP against it. This is the automated form of the
  rule 10 isolation audit. Canonical migrations and tests stay in `/db`; the CI
  job generates a throwaway Supabase CLI scaffold and copies `/db` into it, so the
  locked monorepo layout is unchanged. Promote the workflow to a required status
  check in branch protection once it has gone green on a PR.

### Backups and recovery

- Free **daily backups (7-day retention)** are active on both projects from
  creation.
- **Point-in-time recovery (PITR)** is deferred. Decision (13 July 2026): PITR
  costs USD $100/month per project for 7-day retention and adds little over the
  free daily backups while the only tenant is 18 Silky Oak. It will be enabled
  on `homer-production` before any external pilot home's data lands (week 5-6).
  This is a conscious, cost-based deviation from PRD 8a's "PITR from day one",
  logged here and gated in `docs/03-phase0-tickets.md`.

## Environment variables and secrets (P0.5)

The rule that protects tenant isolation: **anything prefixed `VITE_` is compiled
into the browser bundle and is public.** Only client-safe values ever get that
prefix. Real secrets never get a `VITE_` prefix, never appear in `app/src`, and
are never committed. A leaked `service_role` key bypasses row-level security and
would expose every tenant, so this rule is not optional.

Real values live only in managed environment settings (Vercel) and Supabase
Vault, never in this repo. Committed `.env.example` files carry placeholders
only.

### Client-safe (Vercel, `VITE_` prefix, per environment target)

| Variable | Production target | Preview target |
|---|---|---|
| `VITE_PRODUCT_NAME` | Homer | Homer |
| `VITE_SUPABASE_URL` | homer-production URL | homer-staging URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | homer-production publishable key | homer-staging publishable key |

Production deploys (from `main`) hit the production database; PR previews hit
staging. Values are taken from each Supabase project's API settings; the
publishable key (`sb_publishable_...`) is preferred over the legacy anon JWT.

### Server-only (never `VITE_`, never committed; read only by `/api`)

| Variable | Where | When |
|---|---|---|
| `SUPABASE_URL` | Vercel server env, per target | with the gateway (P0.16) |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel server env, per target (secret) | with the gateway (P0.16) |
| Platform Anthropic key | Supabase Vault (encrypted), not Vercel | with the gateway (P0.16) |
| Per-org and per-user BYO AI keys | Supabase Vault, per tenant | BYO features |

The platform Anthropic key placement is deliberately deferred from P0.5 to P0.16
so it is set alongside the gateway that validates it (validation ping on save),
rather than sitting unused for weeks. Logged as a conscious deviation from the
P0.5 "move the Anthropic key now" wording; gated against P0.16 in
`docs/03-phase0-tickets.md`.
