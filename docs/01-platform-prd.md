# Homer (working name) - Platform PRD
## Product Requirements Document v2.3 - July 2026
### Working title: "Homer" (temporary placeholder, July 2026; naming decision deferred). Built from the Silky Oak app project. Domain/trademark findings: see Blockers Pack v1.1.

---

## 0. Status (12 July 2026)

Interactive prototype v0.1 built: single-file homeowner app (chat with scripted knowledge, home map with hot dots, full triage flow, tour player, auto-rescheduling task) in the liquid glass language with Unit 12 multi-res data. File: home-ai-app-prototype.html. Suitable for pilot-prospect demos on a phone; deployable to a URL.

Companion documents: Defect Module Spec v1.0 · Phase 0 Tickets v1.1 (with Phase 1 outline) · Operating Cost Model v1.0 · Legal & Commercial Blockers Pack v1.0.

Open blockers before pilot: (1) AI disclaimer + deflection duty-of-care wording, (2) Deals vs financial-comparison regulation, (3) compliance module content verified per state, (4) name/trademark + locked pricing. Blockers 1-3 are drafted for solicitor review in the blockers pack; blocker 4 progressed with searches and a proposed pricing lock.

## 0b. Document set (this repo, /docs)

- `01-platform-prd.md` - this document (spine)
- `02-defect-module-spec.md` - defect & warranty module build spec v1.1
- `03-phase0-tickets.md` - Phase 0 tickets v1.1 + Phase 1 outline
- `04-cost-model.md` - operating cost model v1.0
- `05-blockers-pack.md` - legal & commercial blockers pack v1.1
- `prototypes/homeowner-app.html`, `prototypes/developer-portal.html`, `prototypes/multires-screens.html` - interactive reference
- `README.md` - index and canonical decisions

## 1. Product summary

A white-label, AI-native home platform sold to property developers (multi-res first) and builders, used by homeowners and residents. All end-user accounts are provisioned under a developer/builder master account - there is no public self-signup. Each property gets a living digital twin - plans, appliances, finishes, warranties, key dates, and documents - with a conversational AI that knows the property, a structured defect and maintenance system, and a branded portal for the organisation that provisioned it.

Positioning: competitors hand over documents; we hand over answers. HouseLab, Constructive, and ClickHome stop at document logistics. This product is the assistant layer on top - and starts where they stop: at handover.

## 2. Problem statement

Builders and developers spend $500–$2,000 per project on handover and post-occupancy admin, then bleed time on repetitive homeowner calls and unstructured defect claims. Homeowners inherit a folder of PDFs they never read and a house they don't understand. No product in the Australian market gives the property itself a brain that both parties can talk to.

## 3. Goals

1. A builder can provision a fully-loaded home in **under 15 minutes** (template clone + doc sideload); a 20-unit multi-res building in **under 90 minutes**.
2. **≥40% monthly active homeowners** across pilot portfolio at 90 days post-handover.
3. **≥30% of would-be defect/support contacts deflected** by AI triage (see Defect Module Spec v1.0).
4. Platform AI cost **<$1.50/property/month** on the included tier; zero marginal AI cost on BYO-key organisations.
5. Two paying organisations (one builder, one multi-res developer) within 6 months of pilot start.

## 4. Non-goals (v1)

- **No build-phase features** (progress tracking, selections, scheduling) - Constructive/ClickHome territory; we begin at handover.
- **No native iOS/Android apps** - PWA on mobile and desktop. Revisit if enterprise deals demand it.
- **No trade accounts** - magic-link work orders only (per Defect Module Spec).
- **No payments/marketplace** (servicing packages) - data model allows it; not built.
- **No body-corporate/strata management** (levies, meetings, by-law workflows) - MYBOS/BuildingLink territory. We hold building-level *documents and defects*, not strata governance.
- **No short-stay / guest ("Airbnb") mode** - descoped entirely. The tenancy model does not preclude a future guest role; nothing is designed or built for it.

## 5. Personas

| Persona | Context | Primary jobs |
|---|---|---|
| **Org admin - builder** ("Bec") | Client care at 60-home/yr builder | Provision homes, sideload docs, manage defects, watch portfolio dashboard |
| **Org admin - developer (multi-res)** ("David") | Delivery manager, 40-unit project | Bulk-provision units, manage building-level assets + defects, hand to building manager |
| **Homeowner** ("Hannah") | New build, 4 months in | Ask the house questions, report issues, track maintenance/warranties, add her own docs |
| **Resident (multi-res)** | Apartment owner/occupier | Same as homeowner + building-level info (bins, amenities, building manager contact) |
| **Platform admin** (Mark) | Operator | Tenant management, AI usage/cost, deflection metrics, billing |

## 6. Tenancy & permissions model

```
Organisation (builder | developer)
 └─ Property group (optional: estate / building / portfolio)
     └─ Property (home | unit)
         └─ Users: owner, member, resident (+ time-limited guest codes for access sharing, carried over from Silky Oak)
```

**Permissions matrix (summary)**

| Capability | Org admin | Owner | Member | Resident |
|---|---|---|---|---|
| Provision/edit property structure | ✔ | – | – | – |
| Sideload org docs (read-only to owner) | ✔ | view | view | view* |
| Upload/edit own docs | – | ✔ | ✔ | ✔ (unit) |
| AI chat (full property context) | ✔ (per property) | ✔ | ✔ | ✔ |
| Report defects | – | ✔ | ✔ | ✔ |
| Assess/assign defects | ✔ | – | – | – |
| Building-level docs/defects (multi-res) | ✔ | – | – | view / common-area reports |
| Share guest access codes | – | ✔ | – | – |

\* Residents see building-level docs flagged "resident-visible."

**Document layers (core design rule):**
1. **Org layer** - sideloaded at setup, read-only to the homeowner, snapshotted as an immutable **archive copy** at handover (dispute evidence - the HouseLab pattern).
2. **Owner layer** - homeowner's own uploads/edits (receipts, renovation docs, photos). Fully editable by them, portable if they leave the platform.
3. **Shared asset layer** - org-level library inherited by properties (see §8).

The AI reads all layers the current user is entitled to, and only those.

## 7. Feature areas

### 7.1 Developer portal (web, desktop-first)

**P0**
- Org onboarding: branding (logo, colours, hero image), ABN, team seats with roles.
- Property templates: define a design/spec once (appliance set, finishes schedule, standard docs); clone per property; edit deltas only.
- Bulk provisioning: CSV or table entry of addresses/lots → template assignment → batch create. Multi-res: building shell + unit generation (unit numbering patterns).
- Doc sideloading: drag-and-drop folders with **tag-preserving ingestion** (folder path → tags) + AI extraction (model numbers, warranty periods, serials → structured `appliances` records). Review screen before commit.
- Handover action: assign owner email → invitation → archive copy locked.
- Defect management screens per Defect Module Spec v1.0 (queue, detail, assign, portfolio dashboard).
- Portfolio dashboard: activation, MAU, defects by status/trade/product, deflection rate.

**P1**
- Announcements/content push to owners (org-branded, AI-drafted option).
- NPS pulse configuration (3/9-month post-handover + defect closure).
- Ledger PDF exports (per property, per building).

**P2**
- Insight reports across portfolio (product failure rates, trade performance benchmarks).
- API/webhooks for builders' own systems.

### 7.2 Homeowner app (PWA, mobile-first; same app responsive on desktop)

**P0**
- Auth: email magic link + OAuth (Google/Apple). Household members invited by owner. (PIN gate retired.)
- Four-tab structure carried over: **Chat, Dates, House, Issues** (Deals becomes P1, see below).
- Chat: conversational AI with per-property RAG context (see §7.4), nudges strip, Snap & Diagnose, voice input, file/camera upload.
- **"Meet your home" - voice introduction (the safety-briefing feature):** on first login after handover, the app offers a spoken, guided introduction to the house - the flight-attendant safety talk for a new home. AI-generated script from the property's structured profile, delivered as TTS narration with synchronised visual cards. Fixed chapter order, safety first: (1) welcome (builder-branded - "Welcome to your new home from [Org]"), (2) emergency shut-offs - water, gas, electrical, with location imagery, (3) key appliances and their quirks, (4) bins and key dates, (5) warranties at a glance, (6) how to use the app ("just ask me anything"). Chaptered, skippable, pausable, replayable any time from the House tab (including per-chapter - "replay the shut-offs"), with captions and a text transcript for accessibility. Script is regenerated when the property profile materially changes, and each chapter ends with a suggested question to seed the chat habit. This is the activation moment for the ≥70% 14-day activation target - it's also the sales demo's opening scene.
- Dates: bins (council-schedule aware), auto-rescheduling tasks, warranty countdowns + claim-draft helper, crack log, per-event calendar download.
- House: emergency shut-offs, plans, finishes board, appliance registry (linked doc bundles + maintenance ledger per appliance), service directory (org-preloaded trades + owner's own), guest codes/share cards.
- Issues: defect intake per Defect Module Spec (triage → deflect/escalate/emergency), status tracking, sign-off.
- Owner doc upload/edit: add documents, attach to rooms/appliances, edit their own layer; org layer read-only with "request correction" flow.
- Share-spec cards: native share of a paint colour, tile spec, or plan extract to a tradie (Chimni-validated need).
- Home map, phase 1 of 2 (P0): the uploaded floor plan rendered as an interactive image with hot dots pinned on key locations: water shut-off, gas shut-off, switchboard, hot water system, NBN point, fire exits (multi-res), and registered appliances. Tap a dot for a detail card (photo, instructions, linked docs). The map is embedded in the House tab, the emergency screen (the relevant shut-off dot highlighted), the "Meet your home" tour, and defect intake (tap the location on the plan instead of typing the room).

**P1**
- Deals: renewal watching + AI market scan (needs legal review re: financial-product comparison framing before commercial release - reposition as "renewal reminders + market information").
- Maintenance ledger surfaced against warranty terms ("proof of servicing" pack).
- Home map, phase 2 of 2 (P1): AI-generated stylised floor plan. The ingestion pipeline reads the uploaded plans and renders a clean, liquid-glass-styled SVG plan of the home (simplified walls, rooms labelled, on-brand), replacing the raw plan image as the hot-dot canvas. Hotspot positions are AI-proposed during provisioning and human-confirmed in the portal review step (drag pins to adjust), following the same confidence-routing pattern as data extraction. Plan regenerates on material plan updates; the original document remains available and unmodified in the doc layer.
- NPS pulses.

**P2**
- Resale transfer: hand the property record to the next owner (agent channel play).
- ~~Freemium self-serve homeowner tier~~ - retired (July 2026): all homeowner accounts descend from an org's provisioning; no self-signup. Post-funding retention path is the personal BYO key, not a free tier.

### 7.3 Multi-res mode

A building is a property group with its own document set, appliance/plant registry (lifts, pumps, fire systems - visible to org/building manager only), and defect queue for common areas. Units are properties inheriting building-level docs flagged resident-visible (waste schedules, amenity guides, building manager contact).

**P0:** building shell + unit generation; building-level doc layer; resident role; common-area defect reporting routed to building manager (an org seat).
**P1:** building announcements; building-level ledger export (Shergold Weir digital building manual alignment - sales angle: the platform *is* the comprehensive building manual with an AI on top).
**P2:** strata handoff package (export for owners corp at settlement of final unit).

### 7.4 AI layer

**Included AI (default):** platform-provided Claude access, per-property rate limits (config per plan tier), standard model for chat/triage, premium model reserved for Snap & Diagnose and (P1) Deals scans. Hard monthly token budget per org with soft-warning at 80%; over-budget degrades gracefully to "AI paused - resumes on the 1st or upgrade" rather than erroring.

**BYO AI (org-level and homeowner-level):** two tiers of the same mechanism.
- *Org key:* org supplies their own Anthropic API key (stored encrypted, server-side only, per-org isolation; never exposed to clients). All AI calls for that org's properties route via their key → their cost, our margin protected, no rate caps beyond abuse limits.
- *Homeowner key:* an individual user may add their own Anthropic key in personal settings. Their own chats and Snap & Diagnose calls then route via their key - uncapped beyond abuse limits, not counted against the org pool, and never billed to the org. Scope is strictly the keyholder's own sessions; it does not extend to other household members.
- *Key resolution order per request:* user key → org key → platform pool.
- Validation ping on save for both tiers; automatic fallback to *paused for that scope* (never silently onto another party's key) if a key fails, with an alert to the keyholder.
- v1 supports Anthropic keys only (both tiers). Provider abstraction in the gateway so OpenAI-compatible endpoints can be added later (P2) - do not promise multi-provider at launch.

**Context architecture:** per-property structured profile (from ingestion) injected as system context + RAG over the property's document layers scoped to the requesting user's entitlements. All prompts/responses logged per tenant for cost, quality, and dispute audit.

**Chat privacy (decided):** chat transcripts are visible only to the user who created the chat - not to org admins, not to other household members, not to platform staff in normal operation. Org admins and the platform see aggregate, de-identified metrics only (volume, topic categories, deflection outcomes, token cost). Two carve-outs, both logged and disclosed in the ToS: (1) when a homeowner submits a defect, the AI triage assessment attached to that defect (not the surrounding chat) is shared with the builder as part of the report; (2) system-level abuse/safety review. RLS enforces per-user chat isolation at the database layer; BYO-key orgs get usage metering, never message content.

**Guardrails (global, non-overridable by BYO orgs):** emergency hard-rules pre-LLM; no liability determinations; licensed-professional framing for gas/electrical/structural; per-session and per-day message caps against abuse.

### 7.5 Shared assets

Org-level asset library: an appliance/product/document defined once (e.g. "Bosch SMS6HCI01A - manual, warranty terms, quick-start") and inherited by every property that references it. Template cloning pulls from the library. Update propagation: library edits flow to linked properties with change-log entry; org can pin a property to a version.

**P0:** library CRUD, inheritance, template integration.
**P1:** usage counts ("this dishwasher is in 43 of your homes"), defect-rate-by-product feed into portfolio dashboard.
**P2:** cross-org anonymised product benchmarks (opt-in) - a future data product.

## 8. Platform & technical requirements

- **Stack:** React front-ends (homeowner PWA + portal), Supabase (Postgres, RLS, Storage, Auth), Vercel hosting, serverless AI gateway; TTS via API for the "Meet your home" narration (provider TBD - audio generated once per script version and cached per property, not per play, so cost is one-off cents per home). Aligns with existing PP stack and skills.
- **Multi-tenancy:** RLS on every table keyed by org/property; **data-isolation audit is a launch gate** for each pilot cohort.
- **Ingestion pipeline:** upload → tag-preserving structure capture → AI extraction pass → human review screen → commit to structured records + vector index. Target: 50 docs processed in <10 minutes wall-clock.
- **Environments & deploy:** GitHub + CI/CD, staging + production, Sentry, uptime monitoring. The copy-paste deploy loop is retired before any external user touches the product.
- **Compliance:** Australian Privacy Act privacy policy; AU region hosting where available; data export + deletion per owner; ToS + AI disclaimers (solicitor-reviewed).
- 
**Homeowner continuation model (decided July 2026):** the org funds a minimum 2-year term (lock-in sits on the org contract, never on the homeowner). At term end, the home automatically moves to a free core tier: documents, warranties, key dates, home map, reminders, and notifications remain free forever; only AI chat and Snap & Diagnose pause. Continuation ladder: (1) free core, default and automatic, ~AUD $0.05/home/month to serve; (2) personal BYO key restores full AI at the homeowner's own Anthropic cost; (3) paid homeowner subscription restores full AI on the platform key, priced later (first cohort reaches term end ~2 years post-pilot; price with behavioural data, indicative $4-6/month). Design rule: no "pay or lose your data" moment ever exists. Churn is managed by the product's natural re-engagement clock (warranty expiries, compliance renewals, insurance dates, resale), each of which is also a future revenue surface. Pilot metric: month-13+ monthly active rate as the leading indicator of long-term audience value.

**Pricing lock schedule (decided July 2026):** pilot pricing locked before first pilot contract (opening hypothesis per Blockers Pack); list pricing locked post-pilot on metered actuals; homeowner continuation pricing deferred ~2 years to first term-end cohort.

**Billing:** Stripe; per-property annual SaaS + one-off provisioning fee; plan tiers gate AI limits and seats; compliance module as add-on tier. Unit economics: see companion doc "Home AI - Operating Cost Model v1.0". Volume discount policy grounded in the model: 30-40% discount available above 200 properties while holding >85% gross margin.

## 8a. Architecture decisions (locked July 2026)

**Database:** single Supabase project (Sydney region), one Postgres database, all tables keyed by `org_id`/`property_id`, tenant isolation via RLS - no per-development databases. pgvector in-database for RAG, storage bucketed by `org/property/` with signed URLs only, PITR enabled from day one. Dedicated-instance held back as an enterprise upsell, not architected now.

**AI rate limits:** org-level pooled allowance (properties × ~150 msgs/month) + per-user daily cap (~30–40) as the abuse guard. Weighted actions (Snap & Diagnose = 3–5 units), model tiering (standard for chat/triage, premium for diagnosis), prompt caching on the house profile. "Meet your home" narration is generated once and cached per script version - excluded from usage pools. 80% = admin email; 100% = graceful degrade ("AI resumes on the 1st" + upgrade path), never hard errors. Per-tenant cost instrumentation from day one; target <$1.50/property/month blended.

**Tabs (homeowner):** Chat (nudges + conversation + Snap & Diagnose + triage intake) / Dates (bins, tasks, warranties + claim helper, crack log) / House (shut-offs, plans, finishes, appliance registry, service directory, guest codes, share-spec, owner doc upload - org docs lock-badged) / Issues (defect list, timelines, sign-off; replaces Deals in nav - Deals lives as a renewal card in Dates pending legal review). Portal sections: Dashboard / Properties / Defects / Library / Settings.

**Notifications:** push (default), email (record-keeping + fallback + digests), SMS (handover invite + urgent defect comms only; org-paid, capped, never marketing). Builder announcements are templated, previewed, and rate-limited (~4/month/property). Homeowner preference centre per category; defect-process notifications non-optional. Quiet hours 9pm–7am local.

**Security:** four account planes - platform admin (separate surface, MFA, fully audited), org admin/member (MFA mandatory; member role can work defects, not billing/provisioning), homeowner/member/resident (magic link + OAuth), trade (no account - expiring magic tokens). RLS on every table; chats visible only to their creator (§7.4); AI context assembled server-side from entitlements so cross-tenant leakage is structurally impossible; append-only audit logs on evidentiary actions; secrets in Vault; isolation audit re-run on every migration touching a tenant-keyed table - hard launch gate.

**BYO AI:** two tiers - org-level and homeowner-level Anthropic keys, validated on save, encrypted in Vault, server-side only. Key resolution per request: user key → org key → platform pool. A homeowner key covers only that user's own sessions, is uncapped beyond abuse limits, and is excluded from org pool accounting. Global guardrails (emergency pre-filters, no-liability framing, chat privacy) are non-overridable on any key. Key failure = AI paused for that scope + alert to the keyholder, never silent fallback onto another party's key or bill. Keyholders see token/cost metering, never anyone's message content. Org BYO positioned as an enterprise-tier feature; homeowner BYO as a personal power-user setting. Anthropic-only at launch.

## 8b. UI decisions (locked July 2026)

**Homeowner app**

- "Meet your home" player: chapter-based (welcome, shut-offs, appliances, dates, warranties, "just ask"), captions always on with a full transcript, honest chapter lengths totalling ~3.5 minutes, per-chapter replay from the House tab. Scripts are AI-generated from the property profile so every caption names specifics ("your water shut-off is under the laundry sink"), audio cached once per script version. Final chapter hands off into Chat with suggested prompts. "Finish later" saves position; one gentle nudge after 3 days, never more. Instrument completion per chapter.
- Triage intake: camera-first capture with a describe-only path always available; at most one or two conversational follow-ups (never ask what the profile can infer); assessment card states facts only (what it sees + warranty period status, never liability). Assessment must appear in under 10 seconds.
- Triage loading state: the AI "looks out loud", showing each real check as it runs (photo, home profile, finishes, warranty periods, crack log) with spinner-to-tick progression and a scan line over the photo. Lines are generated from the actual context-assembly steps: never show a check the system didn't perform. Total sequence caps at 8 seconds, paces to the real API call, skippable, reduced-motion respected.
- Branch A (deflect): reassurance first, then three conversion actions (DIY steps, start a photo log, set a reminder). "Report anyway" appears at the bottom of every deflection, visually quieter but never hidden, captioned "always your call".
- Branch B (escalate): a review screen, not a form. All fields pre-filled from photos and conversation, everything editable, warranty status shown as fact. "Send report" is the only filled/primary button in the flow.
- Branch C (emergency): breaks the chat visual language entirely. Red banner, imperative copy, four tap targets ordered by urgency (000, shut-off with actual location from the profile, relevant trade, notify org). Triggered by hard-coded rules before the model runs; shut-off content cached offline.

**Developer portal**

- Defect queue: sorted needs-attention first (SLA breaches with amber wash and left bar, then new, then oldest). Columns: defect, property, AI severity (1-5), age, status.
- Defect detail: one screen, no navigation. Photos, the AI assessment labelled "as shown to the owner" (verbatim, the chat-privacy carve-out made visible), owner's notes, warranty pill in the header. Three decisions ranked by frequency: Accept and assign (primary), Monitor, Decline with templated reason (quietest). Trade + target date inline under accept. Accepting fires the work order and owner notification in one action. Timeline panel is the append-only ledger, exportable.
- Provisioning: template-first (template carries appliance set + doc packs from the shared library; new home = address, handover date, owner email). Defect/structural period dates auto-calculate from handover date.
- Doc sideload: drag folders in; per-file feedback announces what extraction found ("Model + 2yr warranty found"); failures flagged amber for manual tagging, never silently swallowed.
- Extraction review: confidence-based attention routing. Confident fields pre-approved as clean rows; low-confidence fields amber-flagged with inline editing; every value links its source document. System-inferable values (bin day from postcode) are looked up and confirmed, not typed.
- "Approve and hand over" does three things in one click, stated beside the button: locks the archive copy, sends the owner invite, generates the welcome tour.

**File handling and completeness (decided)**

- No enforced file naming convention. Accept any filename; the AI identifies documents by content, then normalises internally to a canonical name with the original kept as metadata. Folder paths still become tags; a one-page recommended folder structure ships as an optional starter pack.
- Enforce completeness instead: a home-level handover pack checklist. Required (blocks handover): shut-off locations, floor + electrical plans, builder warranty terms, handover date, confirmed bin day, owner contact. Warned (soft): manual attached for every appliance in the template. Review screen shows a completeness bar; "Approve and hand over" is disabled with a plain reason until required items are met. Checklist verified by the system from extracted data, and designed to be configurable per compliance regime (Shergold Weir digital building manual alignment).

**Component and layout rules (global)**

- No em dashes anywhere: UI copy, documents, code, chat.
- One button component, three variants: list button (fixed 22px icon slot on the left, label in its own column that wraps without moving the icon, one or two-line labels with bold primary + lighter secondary line, left-aligned), primary button (centred, filled, single line, max one per screen), ghost button (centred, muted, escape hatches).
- Pills/badges: inline-flex, centred both axes, no mid-pill wrapping (shorten the label instead, ~22 char max), minimum 5px vertical / 12px horizontal padding, line-height 1.4.
- No text element sits closer than 10px to its container edge horizontally. Minimum button padding 9-10px vertical, 14px horizontal, 12px icon-to-label gap.
- Plain-language status names in homeowner-facing UI (In progress, Monitoring, Fixed), internal state machine names never surface.
- Emergency shut-offs always red, always first, always in the same position on the House tab.

## 8e. Design language: liquid glass (locked July 2026)

Carried over from the Silky Oak app and formalised. Generic flat card-on-grey UI is explicitly rejected.

**Atmosphere:** the page sits on ambient colour washes (reef teal, coral, sea green, faint violet) radiating through a near-white base, background-attachment fixed so the light feels environmental. Each screen carries its own corner wash so no two screens feel identical.

**Surfaces:** every panel is translucent white glass: rgba white at 0.55-0.78 opacity, backdrop blur 12-28px with saturation boost (1.4-1.6), a 1px light border (rgba(255,255,255,0.85)), an inner top light edge (inset 1px white highlight), and soft deep shadows so panels float. Radii: 30px phone frames, 16px cards, 12px chapter rows, 999px pills/docks. No flat opaque cards anywhere.

**Colour rules:** semantic colours (coral danger, amber warning, teal action/info, green success) appear only as tinted glass (13-16% opacity fills with light borders), never solid blocks. Exactly one saturated element per screen: the primary action button (teal gradient with a coloured glow shadow). Danger surfaces are warm coral-through-glass gradients.

**Tab bar:** a floating glass dock (pill, blurred, hovering above content), not an edge-pinned bar.

**Icon system:** single inline SVG sprite, 24px grid, 1.75px stroke, round caps/joins, fill none, currentColor throughout so icons inherit context tint (coral in danger surfaces, teal on actions, muted ink elsewhere). Icons sit in small frosted chips (30px, 10px radius) in list rows. No emoji, no icon fonts, no mixed stroke weights. Tabler Icons adopted as the source library under these rules.

**Type:** Avenir Next / SF Pro / system stack; weights 500-600 for headings and labels, tight letter-spacing on display sizes; 12-13px body in mockups scaling to 15-17px in product.

**Motion:** subtle lift on hover/press (2-3px translate + shadow deepen), 180-220ms ease; all motion behind prefers-reduced-motion.

**Engineering note:** backdrop-filter density must be device-tested on mid-range Android; fallback is higher-opacity white so degradation reads as "soft", not broken. Fallback ships with the component library, not as an afterthought.

## 8c. Document pack standard (locked July 2026, modelled on Silky Oak)

Three tiers. Tiers map to capability, not bureaucracy: each item names what it unlocks.

**Required (blocks handover, verified by the system from extracted data):**
1. Emergency shut-off locations with photos: water, gas, electrical (unlocks the emergency screen; non-negotiable)
2. Floor plan
3. Electrical plan
4. Builder warranty terms / statutory warranty summary
5. Handover date (defect + structural periods auto-calculate)
6. "Big six" appliances with manuals: oven/cooktop, dishwasher, hot water system, air conditioning, rangehood, smoke alarms
7. Bin day and rotation (postcode lookup, org confirms)
8. Owner contact (invite email)

**Recommended (unlocks optimal experience, warned not blocked):** finishes schedule with paint/tile/flooring codes; landscaping plan; full appliance warranties and receipts; certificates (waterproofing, glazing, termite treatment, engineering/slab); trades directory (who built what); utility meter + NBN locations; pool safety certificate and solar documentation where applicable.

**Nice-to-have:** selections/colour board, contract documents, progress photos, keys and codes register.

**Multi-res building layer additions (required at building level):** fire safety system documentation, lift registration and maintenance records, common-area plans, building manager contact, waste room schedule, embedded network/utility info.

**Surfacing:** portal shows the itemised completeness bar (8b). Homeowner app frames gaps as capability: "Add your paint schedule and I can answer colour-match questions." Every missing item names the feature it unlocks.

## 8d. Onboarding flows (locked July 2026)

**Single residence (target 15 minutes):** select template (carries appliance set + doc packs from shared library) > enter address, handover date, owner email > sideload docs with per-file extraction feedback > review flagged fields (including confirming AI-proposed hot-dot positions on the home map) > completeness gate > approve and hand over (locks archive, sends invite, generates tour and home map).

**Multi-res (target 90 minutes for 20 units):**
1. Create building shell: address, floors, building manager seat
2. Load the building doc layer once (fire, lifts, common areas, waste, network); flag items resident-visible
3. Define unit templates (typically 2-4 layouts per building)
4. Bulk-generate units: numbering pattern or CSV (unit number, layout, owner email, settlement date)
5. Per-unit deltas only (colour selections, appliance variations)
6. Staged handover: each unit's archive-lock, invite, and tour generation fires on its own settlement date, not big-bang
Common-area defects route to the building manager seat; unit defects route to the org queue as normal.

## 7.6 Compliance module (added July 2026)

Statutory obligations tracked per property exactly like warranties: a date, an evidence document, and nudges.

- **Compliance calendar:** per-property obligations with renewal nudges to owner and org. Residential examples: smoke alarm testing/interconnection requirements, pool safety certificate renewal, termite inspection, air-con servicing, solar system checks. Multi-res: annual fire safety certification, lift registration, essential safety measures.
- **Evidence vault:** certificates stored against each obligation with expiry dates and renewal proof.
- **Portfolio compliance dashboard (portal):** every expiring certificate across the portfolio on one screen. The build-to-rent / developer hook.
- **Positioning:** the platform is the digital building manual (Shergold Weir recommendation 20 alignment); the compliance module is what makes it obligation infrastructure rather than a nice-to-have.
- **Commercial:** paid add-on tier, indicatively +$2-3/property/month.
- **Blocking gate:** obligation content (what applies, in which state, at what frequency) must be solicitor-verified per state before launch. Wrong compliance dates are worse than none. Content is configurable per state/regime.

## 9. Success metrics

**Leading (first 90 days):** provisioning time per property; % properties activated (owner accepted invite) within 14 days of handover (target ≥70%); "Meet your home" completion rate per chapter; homeowner WAU/MAU; triage deflection rate ≥30%; triage assessment latency p90 <10s; deflection-overridden rate (deflections where the owner reported anyway); AI cost/property/month <$1.50.

**Lagging (6–12 months):** builder-reported support-contact reduction; defect median resolution <21 days; NPS (homeowner ≥40, org admin ≥50); pilot→paid conversion; logo count (2 orgs by month 6); churn = 0 in year 1 cohort.

## 10. Phasing

- **Phase 0 (wks 1–6):** CI/CD, multi-tenant schema, auth, ingestion v1, migrate 18 Silky Oak as tenant #1. Defect Sprint 1 (per module spec).
- **Phase 1 - Builder pilot (wks 6–16):** portal P0, homeowner app P0, defect Sprints 2–3, shared assets P0. One builder, 20–50 homes, concierge ingestion. Isolation audit gate.
- **Phase 2 - Second vertical (months 4–6):** multi-res P0 with a developer pilot; BYO AI shipped for the first org that asks (it's small - gateway keying - build on demand); notification layer hardening (email/push per event type).
- **Phase 3 (months 6+):** P1 backlog, portfolio insights, agent/resale channel, freemium homeowner tier.

## 10a. Future investigation: liability routing and risk transfer

Raised July 2026, for investigation before scale (not a pilot blocker). The tiered triage design already splits risk by stakes: trivial/cosmetic issues are deflected by the AI (low stakes, where being wrong costs little), structural/gas/electrical/water-ingress issues are hard-routed to the builder or a licensed professional without a reassuring AI judgement (high stakes pushed off the platform), and genuine mid-tier defects are pre-filled and sent to the builder. The "report anyway" path is always present as both a homeowner safety valve and a platform liability shield.

Open items to investigate with legal and commercial input:
- How far can defect liability be contractually pushed to the builder/developer via org terms, and where does the platform's own negligent-misstatement exposure on AI assessments remain irreducible (the platform's statement to the homeowner is not transferable even when the repair obligation is the builder's)?
- Should the deflection/escalation category boundaries be a configurable, contractually-agreed matrix per org (each builder signs off on what the AI is permitted to deflect), turning a platform risk into a shared, documented decision?
- Does routing high-stakes categories straight to the builder create acceptance-time burden that undermines the deflection value proposition, and what is the optimal boundary that maximises deflection while minimising both platform liability and builder load?
- Insurance: is product/professional-indemnity cover for the AI assessment layer available and priced sensibly, as a backstop to the contractual and design mitigations?

This sharpens, but does not replace, Blocker 1: the residual question stays "is our exposure on the trivial-deflection category acceptable given the safeguards", which is narrow and answerable.

## 11. Open questions

- **Blocking / legal:** AI disclaimer + deflection duty-of-care wording (shared with Defect Module Spec); Deals feature vs financial-comparison regulation; compliance module obligation content verified per state.
- **Blocking / commercial:** product name + trademark; pricing tiers finalised before pilot contracts (working model: $150–300 provisioning + $5–10/property/month org-billed).
- **Non-blocking / engineering:** vector store choice (pgvector in Supabase vs external); EXIF/GPS stripping policy on media; TTS provider selection for "Meet your home" (quality vs cost - needs a warm, natural voice; robotic TTS undermines the moment).

## 12. Assumptions made in this PRD (flag if wrong)

1. **BYO AI operates at two levels** - org keys and personal homeowner keys, resolved user → org → platform (decided July 2026; supersedes the earlier org-only assumption).
2. **"Desktop version" = the same responsive PWA on desktop**, plus the portal which is desktop-first - no separate desktop client.
3. **Org docs are read-only to homeowners** (with a request-correction flow); homeowner-editable docs live in their own layer. Keeps the archive copy defensible.
4. **Multi-res excludes strata governance** - documents, assets, and defects only.

---

*Companion document: Silky Oak - Defect & Warranty Module Build Specification v1.0.*
*Internal. Not for distribution.*
