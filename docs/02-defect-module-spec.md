# Silky Oak - Defect & Warranty Module
## Build Specification v1.1 - July 2026

---

## 1. Problem statement

Post-handover defect management is the most expensive, dispute-prone phase of a residential builder's client relationship. Homeowners phone or email defects with no structure; builders track them in spreadsheets; trades get chased by text; nothing is timestamped; and when a dispute reaches QBCC, neither side has a clean evidence trail. Industry research (HouseLab) puts handover plus post-occupancy admin at $500–$2,000 per project. This module turns Silky Oak's existing Snap & Diagnose capability into a structured defect pipeline: homeowners report defects with AI-assisted intake, trivial issues are deflected before they reach the builder, and everything that does reach the builder arrives classified, photographed, and pre-assessed.

## 2. Goals

1. **Deflect ≥30% of would-be defect reports** at the AI triage layer (measured: triaged sessions that end without a submitted defect).
2. **Cut builder time-per-defect to under 3 minutes** from notification to assessment decision (portal analytics).
3. **100% of defect interactions timestamped and photo-evidenced** - a QBCC-ready ledger exportable per home.
4. **Pilot proof point:** one builder, ≥20 homes, a case-study-grade number on deflected calls and resolution time within 90 days of go-live.

## 3. Non-goals (v1)

- **No trade portal.** Trades receive work orders via email/SMS magic link with a lightweight status-update page. A full trade login is Phase 3.
- **No build-progress / pre-handover features.** Silky Oak starts at handover. Selections, progress photos, and scheduling are Constructive/ClickHome territory.
- **No payments or servicing marketplace.** Design the data model to allow it later (see P2), don't build it.
- **No automated liability determinations.** The AI classifies and suggests; the builder decides. The app never tells a homeowner "the builder is/isn't liable."
- **No native apps.** PWA remains the delivery vehicle.

## 4. Users and stories

**Homeowner (Hannah, new build, 4 months post-handover)**
- As a homeowner, I want to photograph a problem and know within a minute whether it's a defect worth reporting or something I can fix/monitor myself, so I don't feel stupid calling the builder or angry being ignored.
- As a homeowner, I want to see the status of every defect I've reported, so I never have to chase.
- As a homeowner, I want trivial issues turned into guidance (e.g. a monitored crack log) rather than a dead end.

**Builder admin (Bec, client care manager at a 60-home/yr builder)**
- As a builder admin, I want every incoming defect pre-classified with photos, location, severity, and warranty-period status, so assessment takes minutes not site visits.
- As a builder admin, I want to accept/decline with a templated reason, assign a trade, and set a target date in one screen.
- As a builder admin, I want a per-home and per-portfolio defect dashboard, so I can see which trades and which products generate rework.
- As a builder admin, I want an exportable, timestamped defect ledger per home, so disputes and QBCC matters are evidence-backed.

**Trade (Sam, plumber)**
- As a trade, I want a work order with photos, address, access notes, and a one-tap "mark complete + upload photo" page, without creating an account.

**Silky Oak admin (Mark)**
- As the operator, I want per-tenant AI usage and deflection metrics, so I can prove ROI and control cost.

## 5. Sequencing decision

Spec covers both surfaces. **Build order: homeowner intake first (Sprint 1–2), builder portal second (Sprint 2–3), trade link third (Sprint 3).** Rationale: the homeowner intake generates the data; a builder portal with nothing in it demos badly. During Sprint 1–2, the "builder portal" can be a filtered Supabase view + email notifications - enough to keep a pilot builder in the loop before the real portal ships.

---

## 6. Data model (Supabase / Postgres)

All tables carry `tenant_id` (builder org) and RLS policies. Run the data-isolation audit before pilot.

```
builders            id, name, branding(jsonb), abn, contact, settings(jsonb)
homes               id, builder_id, address, lot, handover_date,
                    defect_period_end (date, default handover+12mo),
                    structural_period_end (date, default handover+6.5yr),
                    template_id, status
home_members        id, home_id, user_id, role (owner|member|guest), invited_by
appliances          id, home_id, category, brand, model, serial,
                    warranty_end, docs(jsonb[]), maintenance_ledger(jsonb[])
defects             id, home_id, reporter_id, status, severity,
                    category, location_room, title, description,
                    ai_assessment(jsonb), warranty_flag
                    (in_defect_period|in_structural_period|expired|appliance_warranty),
                    builder_decision (accepted|declined|monitoring),
                    decline_reason, assigned_trade_id, target_date,
                    resolved_at, homeowner_signoff_at, created_at
defect_events       id, defect_id, actor_type (homeowner|builder|trade|system|ai),
                    event_type, payload(jsonb), created_at   -- append-only audit log
defect_media        id, defect_id, storage_path, exif(jsonb), taken_at, uploaded_by
trades              id, builder_id, name, trade_type, email, phone
work_orders         id, defect_id, trade_id, magic_token, sent_at,
                    accepted_at, completed_at, completion_media(jsonb)
triage_sessions     id, home_id, outcome (deflected|escalated_to_defect|
                    converted_to_crack_log|abandoned), ai_cost, created_at
```

**Design notes**
- `defect_events` is the QBCC evidence trail - append-only, never updated or deleted. Every state change, message, and media upload writes an event.
- `warranty_flag` is computed at creation from `homes` dates and, where the defect is appliance-linked, `appliances.warranty_end`.
- Crack log entries become `defects` with `builder_decision = monitoring` and a linked media series - unifies the existing feature into this model.
- `triage_sessions` exists purely to measure deflection - the headline ROI metric.

## 7. State machine

```
draft → submitted → under_assessment → accepted → assigned → in_progress
                                     ↘ declined (with reason, homeowner notified)
                                     ↘ monitoring (crack-log pattern)
in_progress → rectified → homeowner_signoff → closed
rectified → disputed → under_assessment   (homeowner rejects the fix, one loop max
                                           before flagging for manual escalation)
```

Rules:
- Only the builder moves `submitted → accepted/declined/monitoring`.
- `declined` requires a reason (templated list + free text). Homeowner sees it verbatim.
- `closed` requires homeowner sign-off OR auto-closes 14 days after `rectified` with notice ("closed - no response"), logged as such.
- Both parties see the full event log for their defects at all times (HouseLab's transparency pattern - it defuses disputes).

## 8. AI triage layer (full depth at launch)

**Intake flow (homeowner):**
1. Homeowner taps "Report an issue" (or arrives via Snap & Diagnose - same pipeline).
2. Photo(s) + optional voice/text description.
3. Claude assesses with house context (age of home, known finishes, appliance registry, prior defects, crack log history) and returns:
   - `classification`: cosmetic | maintenance | wear_and_tear | defect_candidate | structural_candidate | appliance_fault | emergency
   - `severity`: 1–5
   - `confidence`: 0–1
   - plain-language assessment + recommended next step
4. **Branching:**
   - **Deflect** (cosmetic/maintenance/wear, confidence ≥ 0.75): guidance + offer to add a maintenance task or start a crack log. Always show "Report to builder anyway" - the homeowner keeps final say. Deflection is a suggestion, never a wall.
   - **Escalate** (defect/structural/appliance candidates, or confidence < 0.75): pre-filled defect report (title, category, location, severity, description drafted from the photo analysis). Homeowner reviews, edits, submits.
   - **Emergency** (gas smell, major water ingress, exposed live wiring, structural collapse risk): skip triage entirely → emergency shut-off screen + builder's emergency contact + "call 000 if immediate danger." Hard-coded keyword/vision rules run BEFORE the LLM; the model is a second net, not the first.

### 8a. Tiered routing rule (explicit, liability-driven)

The routing split is deliberate: the platform keeps only the issues where being wrong is cheap, and pushes the issues where being wrong is expensive onto the builder or a licensed professional. Risk is routed by stakes, not just by category.

| Tier | Categories | Route | Who bears the call | Rationale |
|---|---|---|---|---|
| 1 · Deflect | cosmetic, maintenance, wear_and_tear (confidence ≥ 0.75) | AI handles: guidance, maintenance task, or crack log. "Report anyway" always present. | Platform (low residual) | This is where the deflection value lives. Being wrong costs a tube of filler, not a repair bill. Safeguards blanket it. |
| 2 · Escalate, pre-filled | defect_candidate, appliance_fault (non-safety) | AI pre-fills the report; homeowner submits to builder. | Builder (defect + warranty decision) | AI adds value (clean, classified report) without rendering the risky reassurance. |
| 3 · Hard-route, no reassurance | anything structural, gas, electrical, water ingress; OR confidence < 0.75 | Straight to builder / licensed professional. AI does NOT deflect and does NOT reassure; it frames "have this checked by a licensed professional." | Builder / licensed trade | High stakes deliberately pushed off the platform. The AI never tells someone a dangerous thing is fine. |
| 4 · Emergency | gas smell, major water ingress, exposed live wiring, structural collapse risk | Skip triage entirely → emergency screen, shut-off location, 000 framing. | Homeowner safety first, then builder | Rule-triggered pre-LLM; the model is a second net, not the first. |

Rules binding the table:
- The tier is set by the MORE severe of (a) the AI classification and (b) the hard-coded category detector. A structural keyword or vision signal forces tier 3+ even if the model's confidence in "cosmetic" is high. Safety detectors can only ever escalate a tier, never lower one.
- Confidence below 0.75 always routes to at least tier 2 (never deflected), because low confidence is itself a reason not to reassure.
- "Report anyway" is present on tier 1 outcomes without exception: it is both the homeowner's safety valve and the platform's liability shield (the platform informs, never blocks).
- Every routing decision (tier, the signals that set it, the assessment shown) is written to `defect_events` verbatim, so the boundary the AI applied is auditable per issue.
- Future (per PRD 10a): the tier boundaries may become a per-org configurable matrix that each builder signs off on, converting a platform risk call into a documented, shared decision. Not in v1; v1 ships the fixed table above.

**Hard guardrails (non-negotiable):**
- Anything gas, electrical, or structural is never classified below `defect_candidate` and always carries "have this checked by a licensed professional" framing regardless of model output.
- The AI never states warranty/liability conclusions to the homeowner; it states the *period status* as fact ("your home is within its 12-month defect period") and lets the builder decide the claim.
- Every AI assessment is stored verbatim in `ai_assessment` and the event log - the builder sees exactly what the homeowner was told.
- Per-tenant token budget with alerting; triage uses the standard model tier, no web search.

## 9. Builder portal (v1 screens)

1. **Defect queue** - filterable list (status, severity, home, age of ticket), SLA colour coding (e.g. amber >5 business days in `submitted`).
2. **Defect detail** - photos, AI assessment, event timeline, warranty flag; actions: accept / decline (templated reasons) / mark monitoring; assign trade + target date.
3. **Home view** - one home's full defect ledger + "Export ledger (PDF)".
4. **Portfolio dashboard** - defects by status, by trade, by product/appliance, median resolution time, deflection rate. (This screen is the sales demo.)
5. **Settings** - trades directory, decline-reason templates, notification prefs, branding.

Notifications: email on new defect (daily digest option), SMS optional. In-app only for everything else.

## 10. Trade work-order flow (no login)

- Assigning a trade generates a magic-link page: defect summary, photos, address, access notes, target date.
- Trade taps "Accept", then later "Complete" + mandatory completion photo.
- Links expire on completion or 30 days; token single-use per state change.
- All trade actions write `defect_events`.

## 11. Requirements summary

**P0 (pilot cannot ship without):** triage intake with deflect/escalate/emergency branches; defect CRUD + state machine; event log; builder queue + detail + accept/decline/assign; email notifications; trade magic-link flow; ledger PDF export; RLS + isolation audit passed; per-tenant AI budget caps.

**P1 (fast follow during pilot):** portfolio dashboard; crack-log unification; appliance-linked defects pulling warranty dates; homeowner sign-off + auto-close; SLA colouring; NPS pulse at defect closure.

**P2 (design for, don't build):** trade accounts; servicing packages/marketplace; product-level insight reports across builders; QBCC form pre-fill; resale transfer of the home record.

## 12. Success metrics

| Metric | Target (90-day pilot) | Source |
|---|---|---|
| Deflection rate | ≥30% of triage sessions | `triage_sessions` |
| Median builder assessment time | <3 min from open to decision | portal analytics |
| Median submitted→rectified | <21 days | `defect_events` |
| Homeowner monthly active | ≥40% of pilot homes | app analytics |
| AI cost per home per month | <$1.50 | token logging |
| Builder-reported call/email reduction | directional, via pilot interviews | qualitative |

## 13. Open questions

- **Legal (blocking):** disclaimer wording for AI assessments and emergency guidance - needs solicitor review before pilot homeowners touch it.
- **Legal (blocking):** does the deflection layer create any duty-of-care exposure if the AI wrongly downgrades a real defect? Mitigation is the always-available "report anyway" path + guardrails, but get it confirmed.
- **Product (non-blocking):** should declined defects be appealable in-app, or handled offline? v1 assumption: offline, with the decline reason logged.
- **Engineering (non-blocking):** image storage - Supabase Storage vs S3 direct; EXIF retention policy (timestamps matter for evidence; GPS should probably be stripped for privacy).

## 14. Ticket breakdown

**Sprint 1 - Foundations + homeowner intake (est. 2 wks)**
- T1.1 Supabase schema + RLS for all tables above (M)
- T1.2 Migrate house knowledge from code into `homes`/`appliances` for 18 Silky Oak as tenant #1 (M)
- T1.3 Triage intake UI: photo/voice/text → assessment card → branch (L)
- T1.4 AI triage service: prompt, guardrail pre-filters, response schema, logging (L)
- T1.5 Emergency hard-rules + emergency screen wiring (S)
- T1.6 Defect submission (pre-filled form) + homeowner defect list/status view (M)
- T1.7 `triage_sessions` + event logging plumbing (S)

**Sprint 2 - Builder loop (est. 2 wks)**
- T2.1 Builder auth + org model (M)
- T2.2 Defect queue + detail + accept/decline/monitoring actions (L)
- T2.3 Email notifications (new defect, decision made, digest) (M)
- T2.4 Trades directory CRUD (S)
- T2.5 Ledger PDF export per home (M)
- T2.6 Data-isolation audit + fix pass (M)

**Sprint 3 - Trades + polish (est. 2 wks)**
- T3.1 Work-order magic-link pages + token lifecycle (M)
- T3.2 Rectified → sign-off → close flow incl. auto-close job (M)
- T3.3 Portfolio dashboard v1 (M)
- T3.4 Crack log unification into defect model (M)
- T3.5 Per-tenant AI budget caps + admin metrics view (S)
- T3.6 NPS pulse on closure (S)

Sizing: S <1 day, M 1–3 days, L 3–5 days.

---

*Silky Oak - internal build document. Not for distribution.*
