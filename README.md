# Homer (working name)

White-label, AI-native home platform sold to property developers and builders,
used by homeowners and residents. Every home gets a digital twin (plans,
appliances, warranties, dates, docs) with a conversational AI, a defect system,
and a branded developer portal.

"Homer" is a temporary working name. User-visible strings read from a
`PRODUCT_NAME` constant (env `VITE_PRODUCT_NAME`) so a rename is one change.

The full specification is the source of truth. Start with `docs/README.md`, then
`docs/01-platform-prd.md`. Rules that never bend live in `CLAUDE.md`. Build order
and current tickets: `docs/03-phase0-tickets.md`. Near-term target is Demo 1 (end
of week 3): the homeowner app on the new stack showing 18 Silky Oak's real data
at a preview URL.

## Repository layout

| Path | What it is |
|---|---|
| `app/` | Homeowner PWA (React, Vite, TypeScript). Demo 1 lives here. |
| `portal/` | Developer portal (React, Vite, TypeScript). Placeholder shell; built out in Phase 1. |
| `api/` | Vercel serverless functions (AI gateway). Empty until Week 4 (P0.16). |
| `db/` | Postgres migrations for the single Supabase project. Empty until Week 2 (P0.6). |
| `docs/` | The specification: PRD, defect spec, Phase 0 tickets, cost model, blockers, prototypes. |
| `reference/` | Read-only reference material. `silky-oak-app.jsx` is the source for the P0.11b seed script. Never edited. |

`app/` and `portal/` are npm workspaces. `api/` and `db/` are not JavaScript
packages; they hold serverless functions and SQL respectively.

## Stack

React front-ends, Supabase (Postgres, RLS, Storage, Auth; Sydney region),
Vercel hosting, serverless AI gateway. Tenant isolation is via RLS only, never
separate databases. pgvector in-database for RAG. See `CLAUDE.md` for the locked
stack and the ten non-negotiable rules.

## Running locally

Requires Node 20 or newer.

```bash
npm install            # installs all workspaces from the repo root
npm run dev:app        # homeowner app at http://localhost:5173
npm run dev:portal     # developer portal at http://localhost:5174
```

Copy `app/.env.example` to `app/.env.local` to override defaults. Secrets are
never committed; they are managed per environment (see P0.5).

## Reference

The old Silky Oak app is permanent read-only reference. It is not built on or
edited here. Its house knowledge is migrated into the database by the P0.11b
seed script, which reads `reference/silky-oak-app.jsx`.
