# Home AI - Phase 0 Ticket Breakdown
## Foundations sprint plan, weeks 1-6 - v1.2, July 2026
### Companion to: Platform PRD v2.3, Defect Module Spec v1.1 · Updated for: Demo 1 milestone, script-based seeding (P0.11b), homeowner BYO keys, home map, completeness gate, design language

Goal of Phase 0: a deploy pipeline that isn't copy-paste, a multi-tenant database that passes an isolation audit, working auth for all four account planes, an ingestion pipeline that can load a real home, and 18 Silky Oak migrated as tenant #1. At the end of week 6, the app does everything Silky Oak does today - but from a database, behind real auth, for any number of homes.

Sizing: S <1 day, M 1-3 days, L 3-5 days. Order within each week matters - tickets assume their predecessors.

---

## Demo 1 milestone (end of week 3) - primary near-term target

Demo 1 is the first milestone and the near-term forcing function. It is the Homer homeowner app running on the new stack, showing Mark's real house (18 Silky Oak Terrace), at a Vercel preview URL.

**Demo 1 includes:**
- Homeowner app on the new React stack, deployed to a preview URL.
- Chat answering from database-sourced context for 18 Silky Oak (not hardcoded).
- Dates tab.
- House tab with the home map and hand-pinned hot dots.
- The "Meet your home" tour.
- Owner auth only: Mark and Beck. No other auth planes.
- Real house data seeded by script (P0.11b), read from the Silky Oak app.jsx, not via the ingestion pipeline.

**Demo 1 excludes (moves behind Demo 1):** org, portal, platform-admin and trade auth; the ingestion pipeline and templates; notifications; the defect schema and Issues tab; portal UI; archive lock; the second tenant; billing. The live Silky Oak app keeps running untouched.

**Sequencing rule (v1.2):** execute Phase 0 tickets in Demo-1-first order wherever that conflicts with the original week-by-week plan below. Anything not needed for Demo 1 (org and portal auth, ingestion pipeline, notifications, defect UI) moves behind it. The week sections below remain the master ticket list and exit checks; this rule is the ordering overlay on top of them.

**Silky Oak is permanent read-only reference.** Nothing is built in the silky-oak repo and no file there is edited. Its app.jsx is copied into this repo at `reference/silky-oak-app.jsx` as the read-only data source for the P0.11b seed script. The live Silky Oak app and westllen.au keep running untouched until a deliberate parity cutover much later.

**Minimum ticket path to Demo 1 (in order):**
1. **P0.1** Monorepo scaffold.
2. **P0.2** CI/CD, trimmed to preview deploys per PR plus protected main.
3. **P0.4** Supabase project, then **P0.5** secrets into managed env.
4. **P0.6** core schema, Demo-1 subset: `properties`, `property_members`, `appliances`, `documents`, `key_dates`, `chats`, `chat_messages`, `service_directory`.
5. **P0.7** RLS plus pgTAP for those tables, including chat creator-only visibility.
6. **P0.11** homeowner auth, owner accounts for Mark and Beck, PIN gate retired.
7. **P0.11b** seed script: 18 Silky Oak house knowledge read from app.jsx into the database.
8. **P0.15** entitlement resolver, minimal version.
9. **P0.16 / P0.17 / P0.18** gateway plus context assembler plus guardrails, minimal: platform key only, request logging, emergency pre-LLM rules.
10. **P0.24b** component library subset: liquid glass tokens, icon sprite, the three button variants.
11. **P0.25** Demo-1 subset: Chat, Dates, House with home map, and the "Meet your home" tour player.

Note: the "Meet your home" tour was listed under Phase 1 in the original plan; Demo 1 pulls the tour player into Phase 0 as part of P0.25. Everything else on this path is existing Phase 0 scope, resequenced.

---

## Week 1 - Stop the bleeding: pipeline + environments

- **P0.1 (M)** Repo restructure: monorepo (`/app` homeowner PWA, `/portal`, `/api` gateway functions, `/db` migrations). Move off single-file app.jsx incrementally - new code in modules, old file shrinks as features migrate.
- **P0.2 (M)** CI/CD: GitHub Actions → Vercel preview deploys per PR, staging + production environments, protected main branch. Claude Code set up locally so changes push directly. **The copy-paste deploy loop dies here.**
- **P0.3 (S)** Sentry (front + serverless) + uptime monitoring + Vercel log drains.
- **P0.4 (S)** Supabase project, Sydney region, PITR on, Vault enabled, staging project mirrored.
- **P0.5 (S)** Secrets migration: Anthropic key + all env config out of Vercel dashboard sprawl into managed env per environment.

**Exit check:** a one-line change reaches production via PR → CI → deploy in under 10 minutes, with rollback.

## Week 2 - Schema + RLS (the security model IS the schema)

- **P0.6 (L)** Core schema migration 001: `orgs`, `org_members`, `property_groups`, `properties`, `property_members`, `appliances`, `documents` (3-layer model: org / owner / shared-asset, with `layer` + `locked_at` for archive copies), `shared_assets`, `chats`, `chat_messages`, `tasks`, `key_dates`, `service_directory`.
- **P0.7 (L)** RLS policy set: org isolation, property membership, chat creator-only visibility, org-layer docs read-only to owners, shared-asset inheritance. Written as testable policies with a pgTAP suite - every policy gets a positive and negative test.
- **P0.8 (M)** Defect schema (tables per Defect Module Spec §6) in the same migration series - even though defect UI comes later, the ledger tables and `defect_events` append-only trigger land now.
- **P0.9 (S)** Storage buckets + path convention + signed-URL helper with RLS-checked permission lookup.
- **P0.10 (S)** Audit-log table + trigger pattern for evidentiary actions.

**Exit check:** pgTAP suite green; a seeded second tenant cannot read tenant #1's rows through any table, view, or storage path.

## Week 3 - Auth: four planes

- **P0.11 (M)** Homeowner auth: Supabase Auth, magic link + Google/Apple OAuth, household invites (owner invites member). PIN gate retired.
- **P0.11b (M)** Script-based seed of 18 Silky Oak (Demo 1 data source): a repeatable seed script reads house knowledge from `reference/silky-oak-app.jsx` and writes it into the database as structured records (appliances, finishes, key dates, service directory, emergency shut-offs, home-map hot dots), owned by Mark and Beck's accounts. This exists so Demo 1 does not wait on the ingestion pipeline (P0.21). The script is the read path; the ingestion pipeline replaces it later for real onboarding. Silky Oak repo stays untouched: the script reads the in-repo reference copy only.
- **P0.12 (M)** Org auth: email/password + MFA (TOTP) mandatory, org roles (admin/member), team invites.
- **P0.13 (S)** Platform admin: separate route group, MFA, allow-listed accounts, every action audited.
- **P0.14 (S)** Trade magic-token infrastructure: single-use, state-scoped, expiring tokens table + verification middleware (consumed by defect module in Phase 1).
- **P0.15 (M)** Session/entitlement middleware: one server-side resolver that answers "what properties/layers can this user see" - used by API routes, storage URLs, and AI context assembly alike. Single source of truth.

**Exit check:** all four account types log in on staging; entitlement resolver has test coverage; no client-side permission logic anywhere.

## Week 4 - AI gateway v2

- **P0.16 (L)** Gateway rebuild: per-request key resolution user key > org key > platform pool (all Vault-held), request logging (tenant, user, tokens, cost, latency), weighted-unit metering, per-user daily caps, org pool accounting (user-key traffic excluded from org pools). Cost model tracking fields per "Operating Cost Model v1.0" wired in here. Includes placing the platform Anthropic key into Supabase Vault with a validation ping (deferred here from P0.5, see `docs/infrastructure.md`).
- **P0.17 (M)** Context assembler: builds system context from structured property profile + RAG retrieval (pgvector) scoped by the entitlement resolver. Prompt caching on the stable house profile block.
- **P0.18 (M)** Guardrail layer: emergency keyword/vision pre-filters run before the LLM; no-liability response framing; global caps. Non-overridable regardless of key source.
- **P0.19 (S)** Graceful-degrade states: 80% pool warning email, 100% pause UX, BYO key-failure pause + admin alert.
- **P0.20 (S)** Model tiering config: standard tier default, premium tier flag for Snap & Diagnose route.

**Exit check:** chat works on staging against a seeded property using DB-sourced context; cost per message visible in a per-tenant metering view; pulling the org's fake BYO key pauses AI without erroring.

## Week 5 - Ingestion pipeline v1 + tenant #1 migration

- **P0.21 (L)** Doc sideload flow: drag-and-drop with folder-structure → tag preservation, upload to org layer, AI extraction pass (model numbers, serials, warranty periods, dates → draft `appliances`/`key_dates` records), human review screen, commit.
- **P0.22 (M)** Property templates: define template (appliance set, standard docs from shared assets, finishes schedule), clone-to-property with delta editing.
- **P0.23 (M)** **Migrate 18 Silky Oak as tenant #1:** house knowledge out of app.jsx into the database - appliances, finishes, dates, service directory, docs from the Claude Project/Dropbox into the org layer. Mark + Beck as owner/member accounts. The house must work *better* than before, from data.
- **P0.24 (S)** Archive-copy snapshot action (lock org layer at "handover" with hash + timestamp).

**Exit check:** Silky Oak runs entirely from the database - grep the codebase for any hard-coded house knowledge and find none. A second fake home provisioned from a template in <15 min.

## Week 6 - Homeowner app on the new spine + notifications skeleton

- **P0.24b (M)** Component library: liquid glass tokens (PRD 8e), icon sprite (Tabler, 1.75px stroke, currentColor), the three button variants, pill rules, backdrop-filter fallback. Built first so the tab migration lands on-brand once, not twice.
- **P0.25 (L)** Tab migration: Chat / Dates / House rewired to DB + gateway (Issues tab is Phase 1 with the defect sprints). Nudges strip driven by `key_dates`/`tasks` queries. Owner doc upload/edit in House with lock badges on org docs.
- **P0.26 (M)** Notifications skeleton: event bus table + workers for push (PWA), email (Resend or similar), templated payloads per event type carrying a source tag (org / building manager / system), homeowner preference centre, quiet hours. SMS stubbed (provider decision deferred - Twilio shortlisted).
- **P0.27 (S)** PWA housekeeping: manifest/service-worker updates for the new shell, install prompts, offline shell for reference content (shut-offs must work offline).
- **P0.28 (M)** **Data-isolation audit** (full pass per the audit skill) + fix window. Hard gate.
- **P0.28b (S)** Enable PITR on `homer-production` before any external pilot home's data lands. Deferred from P0.4 as a cost decision (13 July 2026); free daily backups cover Phase 0 while 18 Silky Oak is the only tenant. See `docs/infrastructure.md`.
- **P0.29 (S)** Phase 0 review: cost metering readout, performance pass, backlog groom into Phase 1 (defect Sprints 1–3, portal build).

**Exit check / Phase 0 done means:** two tenants, four auth planes, isolation audit green, Silky Oak fully migrated and daily-usable by you and Beck, one fake builder org with a template-provisioned home, chat costing what the metering says it costs, and deploys taking minutes.

---


---

## Phase 1 outline: pilot build (weeks 7-16, sequenced after Phase 0 exit)

- **Sprints 1-3: defect module** per Defect Module Spec v1.0 (triage intake + AI branches, builder loop, trade magic links). The triage UI consumes the Phase 0 component library and home map pins (tap-the-plan location entry).
- **Portal P0:** org onboarding + branding, templates + bulk provisioning (incl. multi-res building shell + unit generation + staged handover), defect screens, dashboard. Liquid glass treatment per PRD 8e.
- **Homeowner P0 completion:** Issues tab, "Meet your home" tour generation + player (TTS provider selection decided here), owner doc upload/edit, share-spec cards.
- **Shared assets P0:** library CRUD, template inheritance, extraction dedup (the cost lever).
- **Pilot gates before first external home:** isolation audit green, legal sign-off on AI disclaimers + deflection wording, name/trademark cleared, pricing locked, Stripe live for contracts.
- **Not in Phase 1:** compliance module (needs state-verified content), home map phase 2 (stylised SVG generation), Deals, BYO key settings UI (gateway supports it; ship when first org asks), announcements/NPS (fast-follow during pilot).

## Explicitly NOT in Phase 0
Portal UI beyond what ingestion review requires (Phase 1), defect UI (Phase 1, Sprints 1–3 per module spec), announcements, NPS, multi-res generation, Deals, billing/Stripe (needed before pilot *contracts*, not before pilot *build*), BYO key UI (gateway supports it; settings screen ships when the first org asks).

## Risks to watch
1. **app.jsx strangler migration stalls** - timebox: anything not migrated by end of week 6 gets an explicit Phase 1 ticket, don't let it silently persist.
2. **Ingestion extraction quality** - if AI extraction accuracy on real builder docs is poor, fall back to review-heavy flow for pilot (concierge model absorbs it) and improve prompts with real samples.
3. **Solo-builder bus factor** - Claude Code + this ticket list is the mitigation; every ticket should be executable from the written spec without tribal knowledge.

*Internal. Not for distribution.*
