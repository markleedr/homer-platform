# Homer (working name) - Legal & Commercial Blockers Pack v1.1
## July 2026 · Companion to Platform PRD v2.0

Purpose: progress the four pilot blockers. Blockers 1-3 are drafted here for solicitor review: draft wording and framed questions, so the engagement is a review job, not a from-scratch job. Blocker 4 is progressed with live searches and a proposed pricing lock. Nothing in this document is legal advice, and the draft wording must not ship without solicitor sign-off.

---

## Blocker 1: AI disclaimers and deflection duty-of-care

### Draft in-product wording (for review, not final)

**General AI disclaimer (settings + first run, one-time acknowledgement):**
"[Product] gives general information about your home based on the documents loaded for it. It is not a substitute for advice from a licensed builder, electrician, plumber, gas fitter, or other qualified professional. For anything involving gas, electricity, structural elements, or safety, always have the issue checked by a licensed professional."

**Assessment card footer (persistent, every triage assessment):**
"This is an automated assessment to help you decide what to do next. It is not a professional inspection, and it does not decide warranty or liability. You can always report this to [Org] regardless of this assessment."

**Deflection screen (Branch A, persistent):**
"Always your call. Reporting is never blocked." (already in the UI)

**Emergency screen:**
"If anyone is in danger, call 000 now." (first element, already in the UI)

### Product safeguards already designed (context for the solicitor)
1. Deflection is advisory only: a "Report anyway" path is permanently visible on every deflection; the system never blocks a report.
2. Hard-coded escalation rules run before the AI: anything gas, electrical, or structural is never classified below defect candidate and always carries licensed-professional framing.
3. The AI states warranty-period facts only, never liability conclusions.
4. Every assessment is stored verbatim and shown identically to homeowner and org (no information asymmetry).
5. Emergency content is rule-triggered pre-LLM and cached offline.

### Questions for the solicitor
- Q1.1: Does the deflection layer, with the above safeguards, create duty-of-care or negligent-misstatement exposure if the AI downgrades a genuine defect? What contractual and UX language mitigates this?
- Q1.2: Should the acknowledgement be per-user click-through at first run, and does it need to be re-presented on material changes?
- Q1.3: Australian Consumer Law: can liability for the AI assessment be limited by ToS, and what carve-outs (death/personal injury, consumer guarantees) must remain?
- Q1.4: Does the "Draft a claim" helper (writes warranty claim letters) raise any issues about providing legal services?
- Q1.5: Any additional requirements for the org-facing side (builder relies on AI severity scores in their queue)?

---

## Blocker 2: Deals feature vs financial-product regulation

### The feature as currently specced
Watches upcoming renewals (e.g. home/contents insurance), and before the renewal date uses AI with web search to scan the market and indicate whether the current price looks high. Currently parked as a renewal card inside Dates, P1, not in the pilot.

### The concern
Comparing or commenting on insurance products may constitute general financial product advice under the Corporations Act, which requires an AFS licence or authorisation. Comparison websites operate under specific licensing/exemption structures.

### Proposed repositioning (for solicitor validation)
Ship as "Renewal reminders + market information": (a) track the renewal date, (b) remind ahead of time, (c) present factual, sourced market information (e.g. published price ranges, links to comparison services) without recommending any product or stating the user should switch. No product ranking, no "you're overpaying" language, no commissions.

### Questions for the solicitor
- Q2.1: Does the repositioned version avoid the general-advice perimeter? What specific wording is out of bounds?
- Q2.2: If we later want affiliate/referral revenue from comparison partners, what structure is required?
- Q2.3: Are there equivalent concerns for energy plan comparison (AER/state schemes) if Deals extends to utilities?

Decision already taken: Deals does not ship in the pilot; nothing blocks Phase 0/1 on this. Priority: medium.

---

## Blocker 3: Compliance module content, per state

### What ships
A compliance calendar (obligations with dates + nudges), evidence vault, and portfolio dashboard. The platform supplies default obligation templates per state; orgs can add their own.

### Draft obligation matrix (QLD first, for verification, not publication)
| Obligation | Applies to | Indicative frequency | Notes to verify |
|---|---|---|---|
| Smoke alarm testing | All dwellings | Periodic testing; interconnected photoelectric requirements | Verify current QLD Fire Safety legislation scope + landlord vs owner-occupier duties |
| Smoke alarm compliance upgrade | Dwellings sold/leased; broader deadlines | One-off + ongoing | Verify current deadline status for owner-occupied homes |
| Pool safety certificate | Properties with regulated pools | Renewal cycle differs shared vs non-shared pools | Verify current QBCC/QDC requirements |
| Termite management inspection | Homes with termite management systems | Commonly annual per system warranty | Contractual (warranty-driven) more than statutory; label accordingly |
| Air-conditioning service | Per manufacturer warranty | Commonly annual/biannual | Contractual; warranty-preservation framing |
| Solar PV inspection | Homes with PV | Periodic | Verify current recommendation vs requirement |
| Multi-res: fire safety systems certification | Class 2 buildings | Annual (occupier's statement / QFES requirements) | Verify current QLD instrument + who is the duty-holder (body corporate vs owner) |
| Multi-res: lift registration + maintenance | Buildings with lifts | Registration + periodic | Verify WHS QLD registrable plant requirements |

### Design rule for the module (already in PRD 7.6)
Each obligation template carries: jurisdiction, duty-holder, source instrument, "verified by [solicitor/date]" metadata. Unverified templates cannot be published to orgs. Statutory vs contractual obligations are visually distinguished.

### Questions for the solicitor
- Q3.1: Verify/correct the QLD matrix above; identify anything missing for detached and Class 2 residential.
- Q3.2: Duty-holder mapping: which obligations sit with the owner vs body corporate vs org, so nudges target the right party.
- Q3.3: Liability position if a platform-supplied date is wrong or a nudge is missed; required disclaimer wording for compliance content.
- Q3.4: Scope order for other states (NSW next given DBP Act building manual requirements?).

Priority: needed before the compliance module ships (post-pilot), not before the pilot. Engage now, deadline soft.

---

## Blocker 4: Name, trademark, pricing

### Findings (12 July 2026, live checks)
Domain availability for "Home AI":
- homeai.com.au: available only as a PREMIUM listing (expect a significant price)
- homeai.au, home-ai.com.au, homeai.app, gethomeai.com, homeai.io: all TAKEN
- Also taken: myhomeai.com.au, homeai.homes

By contrast: silkyoak.com.au and silkyoak.au are both AVAILABLE at standard pricing.

Trademark: an exact-match and similar-mark search on IP Australia's Trade Mark Search (search.ipaustralia.gov.au) in classes 9 (software), 42 (SaaS), and 36/37 (property services) is the required next step; IP Australia's free TM Checker gives a quick registrability signal. Independent of search results, "Home AI" is a descriptive mark: two generic words that describe the product category. Descriptive marks are hard to register, hard to defend, and impossible to rank for in search. Expect examiner objection on distinctiveness even if no conflict exists.

### Recommendation
Adopt a distinctive brand and, if desired, keep "home AI" as the category descriptor beneath it (e.g. "Silky Oak: the home AI platform"). Silky Oak is distinctive, Australian, already carries the project's history, and both key domains are open today. Descriptors can't be owned; brands can.

Decision needed from Mark: (a) brand name, (b) register domains immediately upon decision (they are cheap; squatting risk is real once outreach starts), (c) file TM Headstart application in classes 9 and 42 after the solicitor/attorney search.

### Name status (updated)
Decision deferred; "Homer" adopted as temporary working name (do not register, do not use in outreach materials without checking; a permanent decision is required before pilot contracts and public materials). Domain findings above stand for whenever the decision is made.

### Proposed pricing (opening hypothesis for pilot conversations, NOT final list pricing)
| Item | Price (AUD, ex GST) | Notes |
|---|---|---|
| Provisioning fee, detached | $250/home | Covers concierge ingestion; firm below 50 homes |
| Provisioning fee, multi-res | $180/unit (20+ units) | Building shell loaded once; template efficiency passed through |
| Platform subscription | $8/property/month, billed annually to org | 2-year minimum funded term in pilot contracts |
| Compliance module | +$2.50/property/month | Post-pilot, once content verified |
| Volume discounts | Per cost model: to 15% at 50+, 30% at 200+, 40% at 500+ | Grounded in Operating Cost Model v1.0 |
| Org BYO AI key | Enterprise tier feature, no discount | Positioned as control, not savings |
| Pilot offer | Provisioning at cost + first 6 months subscription free for cohort #1 (20-50 homes) | In exchange for case-study rights + weekly feedback |
| Homeowner continuation (post org-funded term) | Free core forever; BYO key free; paid AI tier priced ~2yrs out (indicative $4-6/mo) | Data never paywalled; AI is the paywall |

At $8/property/month against a marginal cost of ~$0.30-0.75, gross margin exceeds 90% at scale before labour; the pilot discount is bounded and time-limited by design.

---

## Engagement plan
One solicitor brief covering Q1.x + Q2.x + Q3.x (this document is the brief). Suggested sequencing: Q1.x answers required before any external homeowner uses triage (hard gate, weeks away); Q2.x whenever (feature parked); Q3.x before compliance module launch (months away). Trademark search via a trade marks attorney in parallel with the name decision.

*Internal. Not for distribution. Draft wording requires solicitor sign-off before shipping.*
