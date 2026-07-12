# Homer (working name) - project documentation

Product built from the Silky Oak home app. This `/docs` folder is the source of truth for what Homer is and how it is built. Read in order; the PRD is the spine and everything else hangs off it.

## Read this first
Working name is "Homer" (temporary placeholder, naming decision deferred). Do not use in outreach or public materials until a permanent name is chosen. See 05 for domain/trademark findings.

## Documents

| File | What it is | Read when |
|---|---|---|
| `01-platform-prd.md` | Platform PRD v2.2. The spine: product summary, personas, tenancy, feature areas, architecture decisions (8a), UI decisions (8b), design language (8c-8e), document pack standard, onboarding flows, compliance module, metrics, phasing, open questions. | Always. Start here. |
| `02-defect-module-spec.md` | Defect & Warranty Module build spec v1.1. Data model, state machine, AI triage with the tiered routing rule (8a), builder portal screens, ticket breakdown. | Building the defect feature (Phase 1, sprints 1-3). |
| `03-phase0-tickets.md` | Phase 0 ticket breakdown v1.1 (weeks 1-6) + Phase 1 outline. The foundation sprint: pipeline, schema, RLS, auth, AI gateway, ingestion, tenant #1 migration. | Starting the build. This is week 1. |
| `04-cost-model.md` | Operating Cost Model v1.0. Per-residence and per-user cost at scale, efficiency levers, discount policy, tracking fields to wire into metering. | Pricing decisions and gateway metering (P0.16). |
| `05-blockers-pack.md` | Legal & Commercial Blockers Pack v1.1. Draft disclaimer wording, Deals framing, compliance content matrix, name/domain findings, proposed pricing. For solicitor review. | Before first external homeowner (blocker 1) and before pilot contracts (pricing). |

## Prototypes (`/docs/prototypes`)
Single-file HTML, no dependencies, open in any browser. Reference for look, feel, and interaction, not production code.

| File | What it shows |
|---|---|
| `homeowner-app.html` | Working homeowner app: chat, home map with hot dots, full triage flow, tour player. Liquid glass, multi-res data (Unit 12, Reef House). |
| `developer-portal.html` | Working developer portal: dashboard, defect queue + detail decision loop, 15-minute provisioning + sideload flow, library, settings. |
| `multires-screens.html` | Static six-screen overview of the homeowner app in multi-res context. |

## Canonical decisions to respect while building
- No em dashes anywhere (docs, UI copy, code, comments). Use commas, colons, or spaced hyphens.
- Liquid glass design language (PRD 8e): translucent frosted surfaces over ambient washes, line icons (1.75px stroke, currentColor), one saturated element per screen, floating glass tab dock. No flat card-on-grey.
- Chat transcripts are visible only to the user who created them (PRD 7.4). Enforced with RLS.
- AI key resolution order: user key > org key > platform pool (PRD 7.4, 8a).
- Tiered defect routing by stakes (defect spec 8a): deflect trivial, hard-route structural/gas/electrical to the builder, never reassure on high-stakes categories.
- Data is never paywalled; only AI is (PRD continuation model). No "pay or lose your data" moment.
- Single database, RLS-isolated per org/property. Data-isolation audit is a hard launch gate.
- Stack: React (homeowner PWA + portal), Supabase (Postgres/RLS/Storage/Auth, Sydney region), Vercel, serverless AI gateway.

## Status
Phase 0 not yet started. First code task is `03-phase0-tickets.md` P0.1 (repo restructure + CI/CD to kill the copy-paste deploy loop). Two non-code blockers run in parallel: solicitor engagement (05) and naming the first pilot developer.
