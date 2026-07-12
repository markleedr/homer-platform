# CLAUDE.md - Homer (working name)

Homer is a white-label, AI-native home platform sold to property developers and builders, used by homeowners and residents. Built from the Silky Oak home app (westllen.au). Every home gets a digital twin (plans, appliances, warranties, dates, docs) with a conversational AI, a defect system, and a branded developer portal.

## Read first
Full spec lives in `/docs`. Start with `docs/README.md` (index + canonical decisions), then `docs/01-platform-prd.md` (the spine, v2.3). Build order and current tickets: `docs/03-phase0-tickets.md`. Do not re-derive decisions that are already made in the PRD; if a task appears to conflict with the PRD, flag it rather than silently choosing.

## Status
Phase 0, week 1. A pilot developer is committed, so the 6-week Phase 0 clock is live. First task: P0.1 (repo restructure) and P0.2 (CI/CD). The old deploy loop (copy-paste into GitHub web editor) is dead as of this repo.

## Stack (locked)
- React front-ends: homeowner PWA (`/app`) + developer portal (`/portal`)
- Supabase: Postgres + RLS + Storage + Auth, Sydney region. Single database, single project. Tenant isolation via RLS only, never via separate databases.
- Vercel hosting; serverless functions in `/api` (AI gateway)
- Monorepo layout: `/app`, `/portal`, `/api`, `/db` (migrations), `/docs`
- pgvector in-database for RAG. No external vector service.

## Non-negotiable rules (from PRD, do not relax)
1. NO EM DASHES anywhere: code comments, UI copy, docs, commit messages. Use commas, colons, or spaced hyphens.
2. Chat privacy: chat rows are visible ONLY to the user who created them. RLS-enforced. Org admins see aggregate metrics, never transcripts. Two logged carve-outs only: defect-attached assessments, abuse review.
3. AI key resolution per request: user key > org key > platform pool. Key failure pauses AI for that scope, never silently falls back to another party's key.
4. Tiered defect routing (defect spec 8a): trivial deflects, structural/gas/electrical/water-ingress hard-routes to builder with licensed-professional framing, never reassured by the AI. Safety detectors can only escalate a tier, never lower one. Confidence < 0.75 never deflects. "Report anyway" always visible on deflections.
5. Emergency content is rule-triggered BEFORE the LLM and cached offline.
6. Data is never paywalled. Only AI features sit behind payment. No "pay or lose your data" state can exist.
7. Org-layer documents are read-only to homeowners; archive copy locks at handover (immutable, hashed). Owner-layer docs are fully editable by the owner.
8. `defect_events` and audit tables are append-only. No updates, no deletes.
9. Every AI assessment is stored verbatim and shown identically to homeowner and org.
10. Data-isolation audit is a hard gate: re-run whenever a migration touches a tenant-keyed table. Two seeded tenants must never see each other's rows through any table, view, storage path, or AI context.

## Design language (PRD 8e, applies to all UI)
Liquid glass: translucent white frosted panels (backdrop blur + saturation) over ambient colour washes (reef teal, coral, sea green), inner top light edge, soft floating shadows. Semantic colours only as tinted glass, never solid fills. Exactly one saturated element per screen (the primary action). Floating glass tab dock. Line icons only: single SVG sprite, 24px grid, 1.75px stroke, round caps, currentColor, in frosted chips. No emoji in UI. No flat card-on-grey. Reference implementations: `docs/prototypes/*.html`. backdrop-filter needs a higher-opacity white fallback for mid-range Android.

## Component rules (PRD 8b)
One button component, three variants: list (fixed 22px icon slot left, label column wraps without moving the icon), primary (centred, filled, max one per screen), ghost (escape hatches). Pills: inline-flex centred, no mid-pill wrap (shorten labels ~22 chars), min 5px/12px padding. Min 10px horizontal text-to-edge clearance. Plain-language statuses in homeowner UI (In progress, Monitoring, Fixed); state-machine names never surface. Emergency shut-offs always red, always first on the House tab.

## Language and tone
Australian English throughout (colour, organise, licence). Homeowner-facing copy is warm, plain, specific ("your water shut-off is in the laundry cupboard"), never corporate. The AI states facts, never liability conclusions.

## Testing and gates
RLS policies get pgTAP tests, positive and negative, before any feature lands on a table. CI runs on every PR; main is protected; deploys go through preview > staging > production. Sentry on front end and functions.

## Working name
"Homer" is a temporary placeholder. Do not hardcode the name into user-visible strings where avoidable; use a `PRODUCT_NAME` constant/env from day one so renaming is one change.
