# HANDOVER.md - Homer build handover
## 12 July 2026 · From planning (claude.ai session with Mark) to build (Claude Code)

This document hands the project from the planning phase to the build phase. Read alongside `CLAUDE.md` (rules) and `docs/README.md` (spec index). A pilot developer is committed: the Phase 0 six-week clock starts now.

---

## 1. State of play

**Done (planning phase):**
- Platform PRD v2.3 (`docs/01`): complete product spec including architecture, UI, design language, document pack standard, onboarding flows, compliance module, continuation model, and a future-investigation register.
- Defect module build spec v1.1 (`docs/02`) with data model, state machine, tiered liability routing, and 3-sprint ticket breakdown.
- Phase 0 tickets v1.1 (`docs/03`): 30+ tickets across 6 weeks with per-week exit checks, plus Phase 1 outline.
- Operating cost model v1.0 (`docs/04`): unit economics at 1 to 1,000 residences, discount policy, metering requirements.
- Legal blockers pack v1.1 (`docs/05`): draft disclaimer wording and solicitor questions, ready to send.
- Two working prototypes (`docs/prototypes`): homeowner app and developer portal, both interactive, both in the locked design language. These are the visual and interaction reference for the real build.

**Not done (and deliberately so):**
- No production code exists yet. The current Silky Oak app (single-file app.jsx, house knowledge hardcoded, PIN gate, copy-paste deploys) is the starting material to be strangler-migrated, not preserved.
- Solicitor engagement not yet sent (Mark's action).
- Permanent name not chosen ("Homer" is a placeholder; use PRODUCT_NAME constant).
- Pilot pricing is an opening hypothesis, not signed.

## 2. Immediate build order (first two weeks)

1. **P0.1** Monorepo restructure: `/app`, `/portal`, `/api`, `/db`, `/docs` (docs already here). Begin strangler migration of app.jsx: new code in modules, old file shrinks.
2. **P0.2** CI/CD: GitHub Actions > Vercel preview per PR, staging + production, protected main. Exit check: a one-line change reaches production via PR in under 10 minutes with rollback.
3. **P0.3** Sentry + uptime monitoring.
4. **P0.4** Supabase project, Sydney region, PITR on, Vault enabled, staging mirror.
5. **P0.5** Secrets out of dashboard sprawl into managed env per environment.
6. **P0.6-P0.10** Week 2: core schema + RLS with pgTAP positive/negative tests per policy, defect tables (append-only trigger on defect_events), storage buckets + signed-URL helper, audit log pattern.

Full detail and the remaining 4 weeks: `docs/03-phase0-tickets.md`. The emotional milestone is week 5: 18 Silky Oak Terrace becomes tenant #1 and the codebase greps clean of hardcoded house facts.

## 3. Decisions ledger (do not relitigate)

Product: developer-first B2B2C, multi-res emphasised; no public self-signup, all accounts descend from an org master account; short-stay/Airbnb mode descoped entirely; Deals parked pending legal; compliance module post-pilot behind state-verified content; four tabs (Chat, Dates, House, Issues), no fifth tab for multi-res.

Architecture: single Supabase DB + RLS (never per-development databases); AI key resolution user > org > platform; pooled org AI limits + per-user daily caps; graceful degrade, never hard AI errors; notifications push-first, SMS rare and org-paid, announcements rate-limited ~4/month/property; four auth planes with MFA for org and platform admins.

Commercial: org-funded 2-year minimum term (lock-in on org, never homeowner); at term end homes drop to a free-forever core tier (data never paywalled, AI is the paywall); continuation ladder free core > personal BYO key > paid subscription (priced ~2 years out); pilot pricing hypothesis $250/$180 provisioning + $8/property/month with volume discount ladder grounded in the cost model.

Risk: tiered defect routing by stakes (defect spec 8a) with safety detectors that only escalate; liability routing investigation registered in PRD 10a for pre-scale legal work; blocker 1 (disclaimer wording) is the only legal gate before external homeowners touch triage.

## 4. Session feedback (corrections and preferences from the planning sessions)

### Preferences & Style
- Australian English, direct and confident tone, no hedging.
- Concise pragmatic docs; decisions recorded as they are made ("document as we go").
- Mark is non-technical on infra: explain architecture in plain terms with diagrams where possible.

### Corrections
- Generic "classic React style" UI was rejected: the liquid glass language (now PRD 8e) is mandatory. Reference the prototypes, not generic component defaults.
- Emoji icons were rejected: line icons only, per the icon system in CLAUDE.md.
- Button/pill layout bugs were corrected twice: icon in a fixed slot, label in its own column, centred pills that never wrap mid-pill. These rules are now in PRD 8b; treat them as tested requirements.

### Standing Rules
- Never use em dashes in ANY output including code and commit messages.
- Never fabricate: data accuracy before publication is a hard value for Mark (verify figures against sources; no invented testimonials, benchmarks, or metrics).

### Do Differently
- When a design or copy pattern is corrected once, apply it everywhere retroactively without being asked (the em dash and button fixes required sweeps).
- Prefer building the cheap 90% version first (home map phase 1 vs phase 2 pattern): Mark consistently chose pragmatic phasing when offered.

## 5. Open blockers and owners

| Blocker | Owner | Deadline |
|---|---|---|
| Solicitor review of disclaimer + deflection wording (docs/05, Q1.x) | Mark | Before any external homeowner uses triage (~week 6-8) |
| Permanent name + domain registration + TM search | Mark | Before pilot contract and outreach materials |
| Pilot pricing sign-off (hypothesis in docs/05) | Mark | Before pilot contract |
| Pilot developer contract + cohort scope (20-50 homes) | Mark | Weeks 2-4, so ingestion targets real homes by week 5-6 |
| Everything in docs/03 | Claude Code + developer | Weeks 1-6 |

## 6. What the pilot needs from the build, in one line
By the end of week 6: two tenants isolated and audited, four auth planes live, chat running from database-sourced context at a measured cost, one real home (18 Silky Oak) fully migrated, one fake developer org provisioned from a template in under 15 minutes, and deploys measured in minutes. Everything after that is Phase 1 and it is already ticketed.

*Internal. Not for distribution.*
