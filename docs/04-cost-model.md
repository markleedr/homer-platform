# Home AI - Operating Cost Model v1.0
## July 2026 · Companion to Platform PRD v1.8

All figures AUD/month unless noted. USD costs converted at 1.55. These are planning estimates: replace with metered actuals from the Phase 0 per-tenant instrumentation as soon as the pilot runs.

## Assumptions

**Usage:** 2.2 users per residence average. 40% of residences active in a given month. An active residence generates ~25 chat messages and ~1.5 Snap & Diagnose calls per month. Tour audio is generated once per script version and cached (not a recurring cost).

**AI unit costs (base scenario):**
- Chat message: ~3k input tokens with ~90% prompt-cache hit on the house profile + ~300 output tokens on the standard model tier ≈ US$0.008/message
- Snap & Diagnose: image + context on the premium tier ≈ US$0.06/call
- Background jobs (nudge generation, extraction touch-ups): ≈ US$0.03/residence/month
- Blended AI cost: ≈ US$0.15/residence/month base, US$0.40 ceiling scenario (heavier usage, worse cache hit)

**Fixed platform base:** Supabase Pro US$25, Vercel Pro US$20, Sentry US$26, transactional email US$20, domains/misc US$15 ≈ US$106/month. Steps up: email tier at ~100 residences (+US$25), Supabase compute upgrade at ~200 (+US$75), further compute/support tiers at 500 and 1,000.

**Variable per residence:** AI US$0.15 + storage (≈500MB @ US$0.021/GB) US$0.011 + notification/email share US$0.02 + misc US$0.02 ≈ **US$0.20/residence/month** (ceiling ≈ US$0.50).

**One-off per residence (covered by setup fee):** ingestion AI pass over ~50 documents US$0.50-1.50, TTS tour generation US$0.50-1.20, embeddings US$0.20 ≈ **US$1.50-3.00 (AUD $2-4.50)**.

## Cost at scale (base scenario, AUD/month)

| Residences | Fixed | Variable | Total/mo | Per residence | Per user (2.2/res) |
|---|---|---|---|---|---|
| 1 | $164 | $0.31 | $165 | $165 | $75 |
| 3 | $164 | $0.93 | $165 | $55 | $25 |
| 6 | $164 | $1.86 | $166 | $28 | $12.60 |
| 15 | $164 | $4.65 | $169 | $11.30 | $5.15 |
| 50 | $164 | $15.50 | $180 | $3.60 | $1.63 |
| 100 | $202 | $31 | $233 | $2.33 | $1.06 |
| 200 | $358 | $62 | $420 | $2.10 | $0.95 |
| 500 | $515 | $155 | $670 | $1.34 | $0.61 |
| 1,000 | $745 | $310 | $1,055 | $1.06 | $0.48 |

Ceiling scenario (heavy AI usage): add ~AUD $0.45/residence/month to the variable line; per-residence cost at 200 residences rises to ~$2.55. Still comfortably inside pricing.

## What the shape means

1. **Fixed costs dominate below ~50 residences.** The 1-residence cost of $165/month is really "the cost of having a platform at all". This is why the first pilot cohort should be 20+ homes, and why single-home retail pricing makes no sense as a business.
2. **Marginal cost per residence is ~AUD $0.30-0.75/month.** Against $5-10/residence/month pricing, gross margin at scale is 85-93%.
3. **Below ~30 residences, the true cost is labour, not compute:** concierge ingestion at ~1 hour/home. The setup fee ($150-300) exists to cover exactly this. Track hours per home during the pilot; it is the number that determines when self-serve ingestion must ship.
4. **Per-user cost falls under $1/month past 200 residences.** Homeowner BYO keys push it lower still (their usage leaves the platform's bill entirely).

## Efficiency levers (build for these)

- **Prompt caching on house profiles**: the single largest AI saving; already an architecture decision (8a). Monitor cache hit rate per tenant.
- **Shared-asset dedup**: extract and embed a manual once for the 41 homes that share it, not 41 times. Cuts one-off ingestion cost per templated home by ~60-80% and shrinks the vector index. This is the structural reason volume discounts are safe: volume customers are literally cheaper per home.
- **TTS caching per script version**: tours cost once, not per play. Regenerate only on material profile change.
- **Model tiering**: standard tier for chat/triage, premium reserved for vision. Keep the routing rule under review as model prices move.
- **Pooled org rate limits**: quiet homes subsidise chatty ones; no per-home headroom cost.
- **BYO keys (org and homeowner)**: shifts AI cost off the platform entirely for those scopes.

## Discount policy this supports

| Portfolio size | Discount headroom | Rationale |
|---|---|---|
| < 50 | 0% (setup fee firm) | Fixed costs + concierge labour unamortised |
| 50-199 | up to 15% | Fixed base amortised; margin > 80% held |
| 200-499 | up to 30% | Compute step absorbed; shared-asset dedup kicks in |
| 500+ | up to 40% | Marginal cost ~$1/res; margin > 85% held |

Never discount the setup fee below one hour of loaded labour cost until self-serve ingestion ships.

## Tracking (wire into Phase 0 metering, ticket P0.16)

Per tenant, per month: total tokens by tier, cache hit rate, cost per residence, cost per active residence, messages per active user, Snap & Diagnose count, storage GB, one-off ingestion cost per provisioned home, concierge hours per home (manual log during pilot). Review monthly against this model; update the model quarterly.

*Internal. Not for distribution.*
