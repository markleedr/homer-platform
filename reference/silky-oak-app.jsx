const { useState, useRef, useEffect, useCallback, useMemo } = React;

/* ————————————————————————————————————————————————
   SILKY OAK · Home AI for 18 Silky Oak Terrace — v3
   Chat · Dates (maintenance system) · House · Deals
   Mobile-first · liquid glass · bright, light, white
———————————————————————————————————————————————— */

/* Hero image lives at the site root as /backyard.jpg (kept out of this file so
   edits stay lightweight). If it's ever missing the hero simply fades out. */
const HERO = "/backyard.jpg";

const HOUSE_MEMORY = `You are "Silky Oak", the home assistant for 18 Silky Oak Terrace, Victoria Point QLD 4165 (Lot 120 SP336107). Owners: Mark & Rebecca (Beck) Allen. Answer questions using this house memory and any attached files or photos. Be concise, warm and practical. Use Australian English. If something isn't in memory or attachments, say so plainly rather than guessing.

HOUSE MEMORY
• Builder: Fiteni Homes (Sutgold Pty Ltd, QBCC 728754). Practical completion 22 Apr 2026. Maintenance: maintenance@fiteni.co (always email, with photos). Urgent defects (leaks/electrical/security): phone + email immediately.
• Warranties: 12-month minor defects — submit ONE list ~22 Apr 2027. QBCC structural: 6 yrs 6 mths → ~22 Oct 2032.
• Insurance: AAMI Building, policy HPA171742800, period 1 May 2026 – 1 May 2027, auto-renews (direct debit $159.28/mo, $1,911.45/yr). Excess $1,000. Complete Replacement Cover. AAMI 13 22 44.
• Termites: Termimesh barrier installed 27/10/2025. Pledge Guarantee expires 27/10/2035 — must contact installer ≥60 days before expiry. Annual inspection extends it 1 yr each time. Installer: Smartbuilt Brisbane, 22 Pineapple St Zillmere, job ref 14281259. Keep visual inspection zones clear (75mm gardens, 30mm paving, 20mm doorways). NEVER spray or disturb live termites — photograph and call the installer.
• Air con: Chillin ducted system, AirTouch 2+ zone controller. Annual professional service is a warranty condition — Chillin 0456 734 451 / admin@chillin.com.au. Clean return-air filter every 3 months. Cooling 23–24°C, heating 20–21°C recommended.
• Hot water: Rheem Ambi Power 280 heat pump (551E280). 6-monthly DIY check (TPR valve easing lever, clear louvres, condensate hose). 5-year major service required (~Apr 2031) or Rheem may reject warranty claims. Rheem 131 031. Cylinder warranty to year 10.
• Garage door: Centurion sectional (Colorbond). Annual technician service is a warranty condition. Door warranty 24 months, opener 5 yrs. cgdoors.com.au.
• Lighting: 46 integrated LED downlights, 150mm cutout, sealed, IC-rated (R4.8 ceiling insulation) — replace whole fitting, not a bulb; buy 150mm cutout IC-4. 3 LED oyster lights. 9 Hunter Pacific Concept fans with built-in 18W CCT LED (3000/4000/6000K) — LED module replacement is electrician-only; never use solid-state dimmers on fan circuits.
• Appliances: Westinghouse dual cooker WFE9546SD, rangehood WRR904SB, dishwasher WSF6606XB. Manufacturer warranty claims go via maintenance@fiteni.co.
• Smoke alarms: interconnected photoelectric (cert 30/3/2026). QLD: test & vacuum annually.
• Roof: BlueScope Colorbond metal roof, Jarvis Metal Roofing workmanship warranty. Clean gutters annually before storm season.
• Internet: NBN with ASUS ZenWiFi XD5 mesh. Wi-Fi network "allens lollies", password 5ganmi7q4&.
• Benchtops: YDL crystalline-silica-free stone (Crystal, 20mm) — no hot pots directly on stone, pH-neutral cleaner only.
• Security screens: Mason ScreenGuard 316 stainless mesh — 10-yr warranty REQUIRES regular PowaWash cleaning (coastal: every 2 weeks). Shower screens/mirrors: Civic — no vinegar on aluminium frames.
• Loan: Macquarie Offset Home Loan, $750k, variable (no fixed-rate expiry).
• Solar: quoted (Springers S-292307, Sigenergy + 11kW EV charger) but not confirmed installed.
• Bins: collection every THURSDAY. Red (general) every week. Yellow (recycling) and green (garden) alternate fortnightly — yellow in the week of 1 Jan 2026, green the next, and so on.
• Shut-offs: all-electric house, NO gas. Power main switch: meter box on the garage-side external wall (3-phase, per-circuit safety switches). Water: meter tap at the front boundary; hot-water-only leaks — cold inlet isolation valve at the Rheem unit.
• Key finishes: internal walls/doors Haymes Minimalist 1; exterior trims/eaves Greyology 2; cladding & render Haymes White Wash 1; roof/gutter/fascia Colorbond Shale Grey; brick PGH Frost (off-white raked mortar); garage door Dover White Georgian; entry door Cabots Marine Clear stain; driveway exposed aggregate "Ocean Floor"; fencing Colorbond Basalt; floors Flax Oak vinyl plank + Raincloud carpet; tiles Terrazzo Positano White POSMO2 600x600 matte (grout 505 Light Grey) + Micro Flute Matt 5MIKDMK3602 300x600 (grout 501 White); cabinetry Polytec Natural Oak Matt; island front Polytec Classic White Ashgrain; tapware Mizu Drift chrome; blinds Vibe White rollers.`;

const SUGGESTIONS = [
  "When does our insurance renew?",
  "What bulbs do the downlights take?",
  "Who services the air con?",
  "What's the wall paint colour?",
];

const DIAG_PROMPT = "Diagnose this photo from our house. Identify what it shows (error code, leak, crack, damage, pest sign, appliance fault). Tell me: 1) what it likely is, 2) how serious, 3) a DIY fix if safe, 4) which warranty or manual applies, 5) if a tradie is needed, who from our contacts and what to say. If it's a crack, classify the width and whether to log it and notify Fiteni/QBCC. If it could be termites, remind us not to disturb or spray it.";

/* — timeline of recurring & one-off tasks (ids enable tick-off) — */
const TIMELINE = [
  { id: "acfilter",  d: "2026-08-01", t: "Clean AC return-air filter", k: "Maintenance", note: "Every 3 months. Hallway return grille — vacuum or wash & dry.", repeat: "FREQ=MONTHLY;INTERVAL=3" },
  { id: "screens",   d: "2026-07-20", t: "PowaWash security screens", k: "Maintenance", note: "ScreenGuard 10-yr warranty condition — coastal zone: every 2 weeks. Soft brush, PowaWash or neutral detergent, rinse.", repeat: "FREQ=WEEKLY;INTERVAL=2" },
  { id: "slab",      d: "2026-08-15", t: "Walk slab edge & foundations", k: "Maintenance", note: "Keep termite inspection zones clear (75mm gardens / 30mm paving). Check drainage. Log any cracks in the Crack Log below.", repeat: "FREQ=MONTHLY;INTERVAL=3" },
  { id: "termite",   d: "2026-10-01", t: "Annual termite inspection", k: "Maintenance", note: "Extends Termimesh Pledge 1 yr. Smartbuilt Brisbane, job 14281259.", repeat: "FREQ=YEARLY" },
  { id: "hws6",      d: "2026-10-15", t: "Rheem hot water 6-monthly check", k: "Maintenance", note: "Lift TPR valve easing lever a few seconds, clear louvres, check condensate hose.", repeat: "FREQ=MONTHLY;INTERVAL=6" },
  { id: "gutters",   d: "2026-10-15", t: "Clean gutters & roof check", k: "Maintenance", note: "Before storm season. Supports BlueScope/Jarvis warranties.", repeat: "FREQ=YEARLY" },
  { id: "smoke",     d: "2027-04-01", t: "Test & clean smoke alarms", k: "Safety", note: "QLD annual requirement. Interconnected photoelectric.", repeat: "FREQ=YEARLY" },
  { id: "defects",   d: "2027-04-22", t: "Fiteni 12-month defect list DUE", k: "Warranty", note: "Submit ONE list with photos to maintenance@fiteni.co.", repeat: "" },
  { id: "acservice", d: "2027-04-22", t: "Air-con annual service", k: "Warranty", note: "Warranty condition. Chillin 0456 734 451.", repeat: "FREQ=YEARLY" },
  { id: "garage",    d: "2027-04-22", t: "Garage door annual service", k: "Warranty", note: "Centurion warranty condition. cgdoors.com.au.", repeat: "FREQ=YEARLY" },
  { id: "insurance", d: "2027-05-01", t: "AAMI insurance renews", k: "Renewal", note: "Policy HPA171742800 auto-renews. Review sum insured — scan Deals first.", repeat: "FREQ=YEARLY" },
  { id: "wty2",      d: "2028-03-01", t: "2-year warranty check", k: "Warranty", note: "Garage door & Westinghouse appliances — test everything before warranties lapse.", repeat: "" },
  { id: "hws5",      d: "2031-04-22", t: "Rheem 5-year MAJOR service", k: "Warranty", note: "Required or Rheem can reject claims. Rheem 131 031.", repeat: "" },
  { id: "qbcc",      d: "2032-10-22", t: "QBCC structural warranty ENDS", k: "Warranty", note: "Report structural issues to Fiteni before this date.", repeat: "" },
  { id: "pledge",    d: "2035-10-27", t: "Termimesh Pledge expires", k: "Warranty", note: "Contact Smartbuilt ≥60 days prior to extend.", repeat: "" },
];

/* — every cover on the house, for the countdown + claim helper — */
const WARRANTIES = [
  { id: "wdef",  name: "Fiteni 12-month defect period", who: "Fiteni Homes", end: "2027-04-22", doc: "Form 21 / building contract", how: "ONE written list with photos to maintenance@fiteni.co before this date" },
  { id: "wins",  name: "AAMI building insurance", who: "AAMI — HPA171742800", end: "2027-05-01", doc: "Certificate of Insurance", how: "13 22 44 or aami.com.au/login. Excess $1,000", renews: true },
  { id: "wapp",  name: "Westinghouse appliances", who: "Electrolux", end: "2028-04-22", doc: "Westinghouse manuals (24 months)", how: "Via maintenance@fiteni.co, or Electrolux 13 13 49 with proof of purchase" },
  { id: "wgdr",  name: "Garage door (door)", who: "Centurion", end: "2028-04-22", doc: "Centurion warranty booklet", how: "cgdoors.com.au — annual service keeps it valid" },
  { id: "wgop",  name: "Garage door opener", who: "Centurion", end: "2031-04-22", doc: "Centurion warranty booklet (5 yrs)", how: "cgdoors.com.au" },
  { id: "wqbcc", name: "QBCC structural warranty", who: "QBCC / Fiteni", end: "2032-10-22", doc: "QBCC Notice of Cover", how: "Report to Fiteni in writing; QBCC 139 333 if unresolved" },
  { id: "wterm", name: "Termimesh Pledge Guarantee", who: "Smartbuilt Brisbane", end: "2035-10-27", doc: "Pledge certificate, job 14281259", how: "Extendable 1 yr per annual inspection — book ≥60 days before each anniversary", extend: true },
  { id: "wscr",  name: "ScreenGuard security screens", who: "Mason Security Screens", end: "2036-04-22", doc: "ScreenGuard warranty card (10 yrs)", how: "Conditional on PowaWash cleaning — coastal: every 2 weeks" },
  { id: "whws",  name: "Rheem cylinder", who: "Rheem", end: "2036-04-22", doc: "Rheem 551E280 warranty (10 yrs)", how: "13 10 31 — the 5-year major service is a condition" },
];

/* — materials & finishes mood board (from the Fiteni colour & tile selections) — */
const FINISHES = {
  exterior: { label: "Exterior", items: [
    { n: "Roof · Gutter · Fascia", s: "Colorbond Shale Grey", c: "#BCBCB4", x: "Also barge capping, dry verge and whirlybirds" },
    { n: "Brickwork", s: "PGH Frost, raked off-white mortar", c: "#E8E4DC" },
    { n: "Cladding & Render", s: "Haymes White Wash 1 (Linea 180 + Fascade)", c: "#F2EFE9" },
    { n: "Trims · Eaves · Posts", s: "Haymes Greyology 2", c: "#C9C9C5", x: "Window trim, gable trim, eaves, entry & patio posts, door jambs" },
    { n: "Garage Door", s: "Centurion Georgian — Dover White", c: "#F4F2EC" },
    { n: "Windows", s: "Pearl White gloss frames", c: "#F5F4F0" },
    { n: "Entry Door", s: "AWOWS 5G, Cabots Marine Clear stain, Trilock matte black", c: "#8A6A4C" },
    { n: "Driveway & Paths", s: "Exposed aggregate — Ocean Floor", c: "#9A948A" },
    { n: "Fence & Gates", s: "Colorbond Basalt", c: "#6D6C6A" },
    { n: "Letterbox", s: "Key Largo rendered pillar — Dover White", c: "#F4F2EC" },
    { n: "Clothesline", s: "Fold-down — Monument", c: "#3E3F42" },
  ]},
  kitchen: { label: "Kitchen", items: [
    { n: "Benchtops", s: "YDL engineered stone — Crystal, 20mm", c: "#EDEBE6", x: "Silica-free. No hot pots on stone; pH-neutral cleaner" },
    { n: "Cabinetry", s: "Polytec Natural Oak Matt", c: "#C8A87A", x: "Cupboards, overheads, kickboards, rangehood fascia, pantry" },
    { n: "Island front & sides", s: "Polytec Classic White Ashgrain", c: "#F1EFEA" },
    { n: "Splashback tile", s: "Micro Flute Matt 5MIKDMK3602, 300×600, grout 501 White", c: "#F3F2EE" },
    { n: "Handles", s: "Horizontal 5076-192-BN", c: "#8E8E8E" },
    { n: "Sink & tap", s: "AFA Flow double bowl · Mizu Drift gooseneck chrome (2265797)", c: "#C9CDD1" },
  ]},
  bathrooms: { label: "Bathrooms", items: [
    { n: "Main tile (floors, walls, niche)", s: "Terrazzo Positano White POSMO2 Matte, 600×600, grout 505 Light Grey", c: "#E9E7E1", x: "Bathroom, ensuite, WCs, porch & patio" },
    { n: "Feature tile", s: "Micro Flute Matt 5MIKDMK3602, 300×600, grout 501 White", c: "#F3F2EE", x: "Bath splashback + ensuite ledge" },
    { n: "Vanity tops", s: "YDL stone — Crystal, 20mm", c: "#EDEBE6" },
    { n: "Cabinetry", s: "Polytec Natural Oak Matt, handles 5075-128-BN", c: "#C8A87A" },
    { n: "Tapware", s: "Mizu Drift — Chrome", c: "#C9CDD1", x: "Basin 2267195 · shower kit 2267361 · rail 9512140" },
    { n: "Bath", s: "Posh Solus freestanding 1500 (1703113)", c: "#FAFAF8" },
    { n: "Basins & toilets", s: "Roca The Gap 550×410 · Posh Domaine back-to-wall", c: "#FAFAF8" },
    { n: "Mirrors & screens", s: "Civic — matt silver micro-frame", c: "#D6D8DA", x: "No vinegar on the aluminium" },
  ]},
  living: { label: "Living & Beds", items: [
    { n: "Main flooring", s: "Vinyl plank — Flax Oak", c: "#C7A578" },
    { n: "Carpet", s: "Creative Moods — Raincloud, 7mm underlay", c: "#AEB2B5" },
    { n: "Walls · Doors · Skirting", s: "Haymes Minimalist 1", c: "#F0EEE8", x: "Ceilings: Ceiling White" },
    { n: "Internal doors", s: "Corinthian Motive MOTP 3D, matte black Lianna", c: "#EFEDE8" },
    { n: "Barn door", s: "AWOBD2, Cabots Marine Clear, Cowdroy black track", c: "#8A6A4C" },
    { n: "Robe doors", s: "Vinyl — Glacier, white frames", c: "#EDF0F2" },
    { n: "Blinds", s: "Roller — Vibe White", c: "#F6F5F2" },
    { n: "Laundry", s: "Crystal bench · Natural Oak Matt · Posh Solus tub", c: "#EDEBE6" },
  ]},
};

/* — appliance registry — */
const APPLIANCES = [
  { e: "🍳", n: "Cooker", b: "Westinghouse WFE9546SD", w: "2028-04-22", s: "Electrolux 13 13 49", x: "90cm dual-fuel style electric, slide-out rangehood over" },
  { e: "💨", n: "Rangehood", b: "Westinghouse WRR904SB", w: "2028-04-22", s: "Electrolux 13 13 49", x: "Ducted externally — wash mesh filters monthly" },
  { e: "🍽️", n: "Dishwasher", b: "Westinghouse WSF6606XB", w: "2028-04-22", s: "Electrolux 13 13 49" },
  { e: "🚿", n: "Hot water", b: "Rheem AmbiPower 280 (551E280)", w: "2036-04-22", s: "Rheem 13 10 31 (24/7)", x: "Heat pump. 6-monthly TPR check; 5-yr major service ~Apr 2031 is a warranty condition" },
  { e: "❄️", n: "Air conditioning", b: "Chillin ducted · AirTouch 2+", w: "2031-04-22", s: "Chillin 0456 734 451", x: "Annual service = warranty condition. Filter every 3 months. Cool 23–24°, heat 20–21°" },
  { e: "🚗", n: "Garage door", b: "Centurion sectional", w: "2028-04-22", s: "cgdoors.com.au", x: "Door 24 mo, opener 5 yrs. Annual service is a condition" },
  { e: "📶", n: "Wi-Fi mesh", b: "ASUS ZenWiFi XD5", w: "2029-04-22", s: "asus.com/au/support", x: 'Network "allens lollies"' },
  { e: "🛡️", n: "Security screens", b: "Mason ScreenGuard 316 mesh", w: "2036-04-22", s: "screenguard.com.au", x: "PowaWash every 2 weeks (coastal) or the 10-yr warranty is void" },
  { e: "💡", n: "Lighting", b: "46 LED downlights + 9 Hunter Pacific fans", w: "", s: "Any electrician", x: "Downlights: replace whole fitting — 150mm cutout, IC-4 sealed. Fan LED modules: electrician-only. No solid-state dimmers on fan circuits" },
  { e: "🚨", n: "Smoke alarms", b: "Interconnected photoelectric", w: "", s: "Fiteni Electrical via builder", x: "Test & vacuum annually (QLD)" },
];

/* — one-tap service directory — */
const SERVICES = [
  { n: "Fiteni Homes — maintenance", r: "Defects & builder warranty", p: "0732454055", pl: "(07) 3245 4055", em: "maintenance@fiteni.co", tip: "Always email with photos. Urgent (leak/electrical/security): phone AND email." },
  { n: "Chillin Air Conditioning", r: "A/C service & faults", p: "0456734451", pl: "0456 734 451 (book service)", em: "admin@chillin.com.au", tip: "Tech support 0424 136 807. Before calling: reset breaker + isolator 15 min; photo the outdoor-unit sticker." },
  { n: "Rheem Service", r: "Hot water — 24/7", p: "131031", pl: "13 10 31", tip: "Book the 5-year major service (~Apr 2031) — skipping it can void claims." },
  { n: "Electrolux / Westinghouse", r: "Cooker, rangehood, dishwasher", p: "131349", pl: "13 13 49", tip: "Have the model + serial (door sticker). Claims can also go via Fiteni." },
  { n: "Smartbuilt (Termimesh)", r: "Termite inspections & Pledge", pl: "termimesh.com.au — job ref 14281259", tip: "22 Pineapple St Zillmere. Book ≥60 days before each late-Oct anniversary." },
  { n: "Centurion Garage Doors", r: "Garage door service", pl: "cgdoors.com.au", tip: "Annual service keeps the warranty clean." },
  { n: "AAMI", r: "Building insurance claims", p: "132244", pl: "13 22 44", tip: "Photos first; make-safe repairs are OK; keep receipts. Excess $1,000." },
  { n: "Energex", r: "Power outages / faults", p: "136262", pl: "13 62 62 (outage) · 13 19 62 (emergency)" },
  { n: "Redland City Council", r: "Water faults, bins, rates", p: "0738298999", pl: "(07) 3829 8999" },
  { n: "SES", r: "Storm & flood damage", p: "132500", pl: "132 500" },
];

/* — emergency shut-offs — */
const EMERGENCY = [
  { e: "⚡", n: "Electricity — main switch", w: "Meter box on the garage-side external wall. 3-phase with per-circuit safety switches — flip MAIN SWITCH off. (If solar is ever installed: also switch PV isolators off.)" },
  { e: "💧", n: "Water — mains shut-off", w: "Water meter at the front boundary — turn the tap/lever clockwise. Hot-water-only leak: close the cold inlet isolation valve at the Rheem unit." },
  { e: "🔥", n: "Gas", w: "No gas connection — the house is all-electric." },
  { e: "🚿", n: "Hot water emergency", w: "Switch off at the switchboard isolator AND the isolator at the unit, then close the cold inlet valve. Careful: TPR discharge water is HOT. Rheem 24/7: 13 10 31." },
  { e: "🐜", n: "Termite sighting", w: "DO NOT disturb or spray — it compromises the Pledge claim. Photograph it, keep the area untouched, call Smartbuilt (job 14281259)." },
  { e: "🌊", n: "Blocked drain / sewer", w: "Council handles the boundary connection — (07) 3829 8999. House side: any licensed plumber." },
];
const EMERGENCY_NUMBERS = [
  { n: "Emergency", p: "000" }, { n: "SES storm/flood", p: "132500" },
  { n: "Energex", p: "131962" }, { n: "Council water", p: "0738298999" },
  { n: "Rheem 24/7", p: "131031" }, { n: "AAMI claims", p: "132244" },
];

/* — guest mode — */
const GUEST_INFO = {
  wifi: { ssid: "allens lollies", pass: "5ganmi7q4&" },
  basics: [
    "A/C: AirTouch panel in the hallway — zones per room. Cool 23–24°, heat 20–21°.",
    "Hot water is a heat pump — it hums outside; that's normal.",
    "Oven is the 90cm Westinghouse — controls guide is in the top drawer.",
    "Please keep gardens/items clear of the house slab edge (termite barrier).",
    "No gas — everything is electric.",
  ],
  contact: "Mark & Beck",
};

/* — house plans (PDFs in /plans/ at the repo root or /public) — */
const PLANS = [
  { t: "Full approved plans", f: "/plans/full-plans.pdf", d: "Floor plan, elevations, site plan, downpipes (FIT3444B)" },
  { t: "Electrical plan", f: "/plans/electrical-plan.pdf", d: "105 fixtures — power, lighting, data, smoke alarms, meter box" },
  { t: "Landscaping plan", f: "/plans/landscaping-plan.pdf", d: "Planting, turf, paths, fencing lines" },
  { t: "Engineering / slab", f: "/plans/engineering.pdf", d: "Structerre slab & footings, pier locations, sewer & stormwater" },
  { t: "Termite protection plan", f: "/plans/termite-plan.pdf", d: "Termimesh barrier layout — check before digging or rendering", missing: true },
];

/* — simplified house map: room blocks + key-item markers —
   Distilled from the approved FIT3444 floor & electrical plans. viewBox 0 0 100 168.
   Positions are approximate (schematic, not surveyed). */
const MAP_ROOMS = [
  { l: "Patio", s: "outdoor", x: 6, y: 6, w: 34, h: 26, c: "out" },
  { l: "Entry", x: 40, y: 6, w: 16, h: 26 },
  { l: "Bed 1", x: 56, y: 6, w: 26, h: 26 },
  { l: "Ensuite", x: 82, y: 6, w: 12, h: 20, c: "wet" },
  { l: "Family", x: 6, y: 32, w: 50, h: 24 },
  { l: "Bed 2", x: 56, y: 32, w: 38, h: 24 },
  { l: "Kitchen", x: 6, y: 56, w: 22, h: 26 },
  { l: "Meals", x: 28, y: 56, w: 28, h: 26 },
  { l: "Media", x: 56, y: 56, w: 38, h: 22 },
  { l: "Laundry", x: 6, y: 82, w: 18, h: 12, c: "wet" },
  { l: "Bed 3", x: 56, y: 78, w: 26, h: 26 },
  { l: "Bath", x: 82, y: 78, w: 12, h: 26, c: "wet" },
  { l: "Garage", x: 6, y: 94, w: 44, h: 60, c: "gar" },
  { l: "Bed 4", x: 56, y: 104, w: 38, h: 26 },
];
const MAP_CATS = { emergency: "#d0685c", appliance: "#3f8f70", water: "#5b8fd6" };
const MAP_MARKERS = [
  { cat: "emergency", e: "⚡", l: "Main power / meter box", x: 9, y: 120, note: "Meter box on the garage-side external wall. 3-phase with per-circuit safety switches — flip the MAIN SWITCH down to kill all power." },
  { cat: "emergency", e: "💧", l: "Water mains shut-off", x: 30, y: 161, note: "Water meter at the front boundary — turn the tap/lever clockwise to shut off the whole house." },
  { cat: "emergency", e: "🚿", l: "Hot water unit (Rheem)", x: 9, y: 64, note: "Rheem AmbiPower heat pump, external. For a hot-water-only leak: switch off its isolator and close the cold inlet valve. TPR discharge water is HOT." },
  { cat: "emergency", e: "🐜", l: "Termite barrier", x: 12, y: 149, note: "Termimesh perimeter barrier. If you see termites, don't disturb or spray — photograph and call Smartbuilt (job 14281259)." },
  { cat: "appliance", e: "❄️", l: "A/C outdoor unit", x: 66, y: 4, note: "Ducted A/C condenser (provide drain). Annual service is a warranty condition. Chillin 0456 734 451." },
  { cat: "appliance", e: "🍳", l: "Cooker + rangehood", x: 21, y: 60, note: "Westinghouse 90cm electric cooker with slide-out rangehood, ducted externally. Electrolux 13 13 49." },
  { cat: "appliance", e: "🍽️", l: "Dishwasher", x: 23, y: 77, note: "Westinghouse WSF6606XB. Support: Electrolux 13 13 49." },
  { cat: "appliance", e: "🚗", l: "Garage door", x: 27, y: 150, note: "Centurion sectional door. Annual service keeps the warranty clean. cgdoors.com.au." },
  { cat: "appliance", e: "📶", l: "Wi-Fi mesh", x: 24, y: 41, note: "ASUS ZenWiFi XD5 mesh. Network \"allens lollies\"." },
  { cat: "water", e: "🚰", l: "Kitchen sink & island", x: 10, y: 71, note: "Kitchen sink plus power & water to the island bench." },
  { cat: "water", e: "🛁", l: "Ensuite (Bed 1)", x: 88, y: 22, note: "Bed 1 ensuite — double vanity, WC, shower." },
  { cat: "water", e: "🛁", l: "Main bathroom", x: 88, y: 99, note: "Main bathroom — bath, WC, basin, shower." },
  { cat: "water", e: "🧺", l: "Laundry", x: 20, y: 90, note: "Laundry — tub and washing-machine point." },
];

/* — compare the market: upcoming renewals — */
const INITIAL_RENEWALS = [
  { id: "ins", cat: "Home insurance", provider: "AAMI Building", costYr: 1911.45, date: "2027-05-01",
    q: "Best home building insurance deals Queensland 2026 compare AAMI complete replacement cover new build Victoria Point" },
  { id: "power", cat: "Electricity", provider: "Not on file", costYr: null, date: "",
    q: "Cheapest electricity plans South East Queensland Energex 2026 compare best deals three phase home" },
  { id: "net", cat: "Internet", provider: "NBN (plan not on file)", costYr: null, date: "",
    q: "Best NBN plans 2026 Australia compare deals fast speed value" },
  { id: "mob", cat: "Mobile", provider: "Not on file", costYr: null, date: "",
    q: "Best value mobile phone plans Australia 2026 compare deals" },
];

const money = (n) => n == null ? null : "$" + n.toLocaleString("en-AU", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

/* — helpers — */
const uid = () => Math.random().toString(36).slice(2, 10);
const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso) => {
  if (!iso) return "Add date";
  const dt = new Date(iso + "T00:00:00");
  return dt.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
};
const daysUntil = (iso) => {
  if (!iso) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.round((new Date(iso + "T00:00:00") - now) / 86400000);
};
const store = {
  get(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

/* next due date for a task, given the tick-off history */
function nextDue(ev, doneMap) {
  const last = doneMap[ev.id];
  if (!ev.repeat) return { d: ev.d, done: !!last };
  const m = /FREQ=(WEEKLY|MONTHLY|YEARLY)(?:;INTERVAL=(\d+))?/.exec(ev.repeat);
  const base = last ? new Date(last + "T00:00:00") : null;
  if (!base) return { d: ev.d, done: false };
  const n = m && m[2] ? parseInt(m[2], 10) : 1;
  const dt = new Date(base);
  if (m[1] === "WEEKLY") dt.setDate(dt.getDate() + 7 * n);
  else if (m[1] === "MONTHLY") dt.setMonth(dt.getMonth() + n);
  else dt.setFullYear(dt.getFullYear() + n);
  return { d: dt.toISOString().slice(0, 10), done: false };
}

/* — bins: every Thursday; yellow/green alternate, anchored yellow on Thu 1 Jan 2026 — */
const BIN_ANCHOR = new Date(2026, 0, 1);
function binFor(thu) {
  const weeks = Math.round((thu - BIN_ANCHOR) / (7 * 86400000));
  return weeks % 2 === 0
    ? { c: "#e2b93c", name: "Yellow — recycling", e: "♻️" }
    : { c: "#3f8f70", name: "Green — garden", e: "🌿" };
}
function nextThursdays(count) {
  const out = []; const d = new Date(); d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + ((4 - d.getDay() + 7) % 7));
  for (let i = 0; i < count; i++) { out.push(new Date(d)); d.setDate(d.getDate() + 7); }
  return out;
}
function downloadBinsICS() {
  const ics = [
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Silky Oak//Bins//EN","X-WR-CALNAME:Silky Oak Bins",
    "BEGIN:VEVENT","UID:bins-red@silkyoak","DTSTAMP:20260101T000000Z",
    "SUMMARY:🗑️ Bins out tonight (red + this week's bin)",
    "DESCRIPTION:General waste every week. Yellow recycling & green garden alternate.",
    "DTSTART;VALUE=DATE:20260101","RRULE:FREQ=WEEKLY",
    "BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:Bins out","TRIGGER:-PT5H","END:VALARM","END:VEVENT",
    "BEGIN:VEVENT","UID:bins-yellow@silkyoak","DTSTAMP:20260101T000000Z",
    "SUMMARY:♻️ Yellow recycling bin week","DTSTART;VALUE=DATE:20260101","RRULE:FREQ=WEEKLY;INTERVAL=2","TRANSP:TRANSPARENT","END:VEVENT",
    "BEGIN:VEVENT","UID:bins-green@silkyoak","DTSTAMP:20260101T000000Z",
    "SUMMARY:🌿 Green garden bin week","DTSTART;VALUE=DATE:20260108","RRULE:FREQ=WEEKLY;INTERVAL=2","TRANSP:TRANSPARENT","END:VEVENT",
    "END:VCALENDAR"].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "silky-oak-bins.ics";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Couldn't read file"));
    r.readAsDataURL(file);
  });
}
function fileToText(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(new Error("Couldn't read file"));
    r.readAsText(file);
  });
}
function resizeImage(file, maxDim = 1568, quality = 0.85) {
  return new Promise((res) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      const dataUrl = c.toDataURL("image/jpeg", quality);
      res({ data: dataUrl.split(",")[1], mediaType: "image/jpeg", preview: dataUrl });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      fileToBase64(file).then((b64) => res({ data: b64, mediaType: file.type || "image/jpeg", preview: null }));
    };
    img.src = url;
  });
}

/* single-event .ics download */
function downloadICS(ev, dateOverride) {
  const dISO = dateOverride || ev.d;
  const dt = dISO.replace(/-/g, "");
  const end = new Date(new Date(dISO + "T00:00:00").getTime() + 86400000)
    .toISOString().slice(0, 10).replace(/-/g, "");
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Silky Oak//Home//EN",
    "BEGIN:VEVENT",
    `UID:${uid()}@silkyoak`,
    `DTSTART;VALUE=DATE:${dt}`,
    `DTEND;VALUE=DATE:${end}`,
    ev.repeat ? `RRULE:${ev.repeat}` : null,
    `SUMMARY:${ev.t}`,
    `DESCRIPTION:${(ev.note || "").replace(/,/g, "\\,")}`,
    "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${ev.t}`, "TRIGGER:-P14D", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = ev.t.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".ics";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/* — icons — */
const I = {
  mic: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.7"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>),
  camera: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1l1.2-1.8c.28-.42.75-.7 1.26-.7h4.08c.5 0 .98.28 1.26.7L16.5 6h1A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12.2" r="3.2" stroke="currentColor" strokeWidth="1.7"/></svg>),
  plus: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>),
  send: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5.5 12h12M12 6l6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  doc: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M7 3.5h6.5L18 8v11a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7.5 3.5H7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M13.5 3.5V8H18" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>),
  x: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>),
  leaf: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 21c-4.5-2.6-7-6.1-7-10.2C5 6.7 8 4 12 3c4 1 7 3.7 7 7.8 0 4.1-2.5 7.6-7 10.2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M12 7v11M12 11l3-2.4M12 14l-3-2.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>),
  chat: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 7.5A3.5 3.5 0 0 1 7.5 4h9A3.5 3.5 0 0 1 20 7.5v6a3.5 3.5 0 0 1-3.5 3.5H10l-4.4 3.2c-.66.48-1.6.01-1.6-.81V7.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>),
  cal: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><rect x="4" y="5.5" width="16" height="14.5" rx="3" stroke="currentColor" strokeWidth="1.7"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>),
  tag: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M3.5 11.2V5.5a2 2 0 0 1 2-2h5.7a2 2 0 0 1 1.4.6l7.3 7.3a2 2 0 0 1 0 2.8l-5.7 5.7a2 2 0 0 1-2.8 0l-7.3-7.3a2 2 0 0 1-.6-1.4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><circle cx="8.2" cy="8.2" r="1.4" fill="currentColor"/></svg>),
  home: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 11.2 12 4l8 7.2M6 10v9a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 19v-9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  dl: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 4v11m0 0 4.5-4.5M12 15l-4.5-4.5M5 19.5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  spark: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.3l-1.8-5.7L4.5 10.8 10.2 9 12 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>),
  check: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 12.5 10 17.5 19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>),
};

const KCOLOR = { Maintenance: "#3f8f70", Warranty: "#e2a13c", Renewal: "#5b8fd6", Safety: "#d0685c" };
const WX = [[0,"☀️"],[1,"🌤️"],[2,"⛅"],[3,"☁️"],[45,"🌫️"],[51,"🌦️"],[61,"🌧️"],[80,"🌧️"],[95,"⛈️"]];
const wxIcon = (code) => { let e = "☁️"; for (const [c, em] of WX) if (code >= c) e = em; return e; };

function SilkyOakHome() {
  const [tab, setTab] = useState("chat");
  const [houseSec, setHouseSec] = useState("emergency");
  const [finZone, setFinZone] = useState("exterior");
  const [planStatus, setPlanStatus] = useState({}); // file → "checking" | "ok" | "missing"
  const [mapShow, setMapShow] = useState(false);
  const [mapCat, setMapCat] = useState("all");
  const [mapSel, setMapSel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [apiHistory, setApiHistory] = useState([]);
  const [input, setInput] = useState("");
  const [atts, setAtts] = useState([]);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechOK, setSpeechOK] = useState(true);
  const [error, setError] = useState(null);
  const [renewals, setRenewals] = useState(INITIAL_RENEWALS);
  const [deals, setDeals] = useState({});
  const [scanning, setScanning] = useState({});
  const [weather, setWeather] = useState(null);
  const [doneMap, setDoneMap] = useState(() => store.get("silky_done", {}));
  const [cracks, setCracks] = useState(() => store.get("silky_cracks", []));
  const [crackDraft, setCrackDraft] = useState(null);
  const [nudgeHide, setNudgeHide] = useState(() => store.get("silky_nudge", {}));
  const [gCodes, setGCodes] = useState(() => store.get("silky_gcodes", []));
  const [gLabel, setGLabel] = useState("");
  const [gHours, setGHours] = useState(72);
  const [gBusy, setGBusy] = useState(false);
  const [role, setRole] = useState(() => store.get("silky_role", ""));

  const [code, setCodeState] = useState(() => { try { return localStorage.getItem("silkyoak_code") || ""; } catch { return ""; } });
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState(false);
  const [pinChecking, setPinChecking] = useState(false);
  const [gateMode, setGateMode] = useState("family"); // family | guest
  const saveCode = (c) => { try { localStorage.setItem("silkyoak_code", c); } catch {} setCodeState(c); };
  const saveRole = (r) => { store.set("silky_role", r); setRole(r); };

  useEffect(() => { store.set("silky_done", doneMap); }, [doneMap]);
  useEffect(() => { store.set("silky_cracks", cracks); }, [cracks]);
  useEffect(() => { store.set("silky_nudge", nudgeHide); }, [nudgeHide]);
  useEffect(() => { store.set("silky_gcodes", gCodes); }, [gCodes]);

  /* weather — Open-Meteo, no key */
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("https://api.open-meteo.com/v1/forecast?latitude=-27.582&longitude=153.308&current=temperature_2m,weather_code&daily=temperature_2m_max,precipitation_probability_max&timezone=Australia%2FBrisbane&forecast_days=1")
        .then((r) => r.json())
        .then((d) => { if (alive) setWeather({ t: Math.round(d.current.temperature_2m), c: d.current.weather_code, max: Math.round(d.daily.temperature_2m_max[0]), rain: d.daily.precipitation_probability_max[0] }); })
        .catch(() => {});
    load();
    const iv = setInterval(load, 30 * 60 * 1000);
    return () => { alive = false; clearInterval(iv); };
  }, []);

  /* probe plan PDFs when the section opens — so a missing file shows an
     in-app message instead of dumping the user on a raw 404 page */
  useEffect(() => {
    if (houseSec !== "plans") return;
    let alive = true;
    PLANS.forEach((p) => {
      if (p.missing || !p.f) return;
      setPlanStatus((s) => (s[p.f] ? s : { ...s, [p.f]: "checking" }));
      fetch(p.f, { method: "HEAD" })
        .then((r) => {
          if (!alive) return;
          const ct = (r.headers.get("content-type") || "").toLowerCase();
          const ok = r.ok && !ct.includes("text/html");
          setPlanStatus((s) => ({ ...s, [p.f]: ok ? "ok" : "missing" }));
        })
        .catch(() => { if (alive) setPlanStatus((s) => ({ ...s, [p.f]: "missing" })); });
    });
    return () => { alive = false; };
  }, [houseSec]);

  const tryPin = useCallback(async (p) => {
    setPinChecking(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-silky-code": p },
        body: JSON.stringify({ ping: true }),
      });
      if (r.status === 401) throw new Error("wrong pin");
      saveCode(p); saveRole("family");
    } catch {
      setPinErr(true);
      setTimeout(() => { setPinErr(false); setPin(""); }, 650);
    } finally { setPinChecking(false); }
  }, []);

  const tryGuest = useCallback(async (p) => {
    setPinChecking(true);
    try {
      const r = await fetch("/api/guest-code", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: p, labels: gCodes.map((c) => c.label) }),
      });
      const d = await r.json();
      if (!d.valid) throw new Error("bad code");
      saveRole("guest");
    } catch {
      setPinErr(true);
      setTimeout(() => { setPinErr(false); setPin(""); }, 650);
    } finally { setPinChecking(false); }
  }, [gCodes]);

  useEffect(() => {
    if (pinChecking) return;
    if (gateMode === "family" && pin.length === 4) tryPin(pin);
    if (gateMode === "guest" && pin.length === 6) tryGuest(pin);
  }, [pin]);

  const apiFetch = async (body) => {
    const resp = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-silky-code": code },
      body: JSON.stringify(body),
    });
    if (resp.status === 401) {
      try { localStorage.removeItem("silkyoak_code"); } catch {}
      setCodeState(""); saveRole("");
      throw new Error("Access code rejected — please sign in again.");
    }
    return resp.json();
  };

  const scrollRef = useRef(null);
  const taRef = useRef(null);
  const recRef = useRef(null);
  const baseTextRef = useRef("");
  const fileRef = useRef(null);
  const camRef = useRef(null);
  const diagRef = useRef(null);
  const crackRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSpeechOK(false); return; }
    const rec = new SR();
    rec.lang = "en-AU"; rec.interimResults = true; rec.continuous = false;
    rec.onresult = (e) => {
      let t = ""; for (const r of e.results) t += r[0].transcript;
      setInput((baseTextRef.current + " " + t).trim());
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    const ta = taRef.current; if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [input, tab]);

  const toggleMic = () => {
    if (!recRef.current) return;
    if (listening) { recRef.current.stop(); setListening(false); }
    else { baseTextRef.current = input; try { recRef.current.start(); setListening(true); } catch {} }
  };

  const addFiles = useCallback(async (list) => {
    setError(null);
    for (const f of Array.from(list)) {
      try {
        if (f.type.startsWith("image/")) {
          const { data, mediaType, preview } = await resizeImage(f);
          setAtts((a) => [...a, { id: uid(), kind: "image", name: f.name, data, mediaType, preview }]);
        } else if (f.type === "application/pdf") {
          if (f.size > 8 * 1024 * 1024) throw new Error(`${f.name} is too large — keep PDFs under 8MB`);
          const data = await fileToBase64(f);
          setAtts((a) => [...a, { id: uid(), kind: "pdf", name: f.name, data }]);
        } else if (/text|json|csv|markdown/.test(f.type) || /\.(txt|md|csv|json)$/i.test(f.name)) {
          const text = await fileToText(f);
          setAtts((a) => [...a, { id: uid(), kind: "text", name: f.name, text: text.slice(0, 60000) }]);
        } else throw new Error(`Can't read ${f.name} — photos, PDFs and text files only`);
      } catch (err) { setError(err.message); }
    }
  }, []);

  /* send — attList lets Diagnose bypass the tray */
  const send = async (forcedText, attList) => {
    const usingTray = !attList;
    const list = attList || atts;
    const text = (forcedText ?? input).trim();
    if ((!text && list.length === 0) || busy) return;
    if (listening) { recRef.current?.stop(); setListening(false); }
    setError(null); setTab("chat");

    const shownAtts = list.map(({ kind, name, preview }) => ({ kind, name, preview }));
    setMessages((m) => [...m, { id: uid(), role: "user", text: usingTray ? text : "📷 Diagnose this photo", atts: shownAtts }]);
    if (usingTray) { setInput(""); setAtts([]); }
    setBusy(true);

    const blocks = [];
    for (const a of list) {
      if (a.kind === "image") blocks.push({ type: "image", source: { type: "base64", media_type: a.mediaType, data: a.data } });
      else if (a.kind === "pdf") blocks.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: a.data } });
      else if (a.kind === "text") blocks.push({ type: "text", text: `Attached file "${a.name}":\n\n${a.text}` });
    }
    blocks.push({ type: "text", text: text || "Please look at what I've attached." });
    const newHistory = [...apiHistory, { role: "user", content: blocks }];

    try {
      const data = await apiFetch({ model: "claude-sonnet-4-6", max_tokens: 1000, system: HOUSE_MEMORY, messages: newHistory });
      if (data.error) throw new Error(data.error.message || "Something went wrong");
      const reply = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
      setApiHistory([...newHistory, { role: "assistant", content: reply }]);
      setMessages((m) => [...m, { id: uid(), role: "assistant", text: reply || "…", atts: [] }]);
    } catch (err) {
      setError(err.message);
      setMessages((m) => m.slice(0, -1));
      if (usingTray) setInput(text);
    } finally { setBusy(false); }
  };

  const onDiagnose = async (e) => {
    const f = e.target.files?.[0]; e.target.value = "";
    if (!f) return;
    const { data, mediaType, preview } = await resizeImage(f);
    send(DIAG_PROMPT, [{ id: uid(), kind: "image", name: "photo.jpg", data, mediaType, preview }]);
  };

  const askChat = (prefill) => { setTab("chat"); setInput(prefill); setTimeout(() => taRef.current?.focus(), 60); };

  /* crack log */
  const onCrackPhoto = (e) => {
    const f = e.target.files?.[0]; e.target.value = "";
    if (!f) return;
    resizeImage(f, 640, 0.55).then(({ preview }) =>
      setCrackDraft({ photo: preview, loc: "", width: "<1mm", note: "", date: todayISO() }));
  };
  const saveCrack = () => {
    if (!crackDraft) return;
    try {
      const next = [{ ...crackDraft, id: uid() }, ...cracks];
      if (JSON.stringify(next).length > 4_000_000) { setError("Crack log is full on this device — email older photos to yourself and clear some."); return; }
      setCracks(next); setCrackDraft(null);
    } catch { setError("Couldn't save that photo."); }
  };

  /* guest codes */
  const makeGuestCode = async () => {
    setGBusy(true); setError(null);
    try {
      const r = await fetch("/api/guest-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: gLabel || "Guest", hours: gHours }),
      });
      const d = await r.json();
      if (!d.code) throw new Error(d.error || "Couldn't create a code — is GUEST_CODE_SECRET set in Vercel?");
      setGCodes([{ code: d.code, label: d.label, expires: d.expires }, ...gCodes]);
      setGLabel("");
    } catch (err) { setError(err.message); }
    finally { setGBusy(false); }
  };

  /* market scan via Claude + web search (unchanged) */
  const scanDeal = async (r) => {
    setScanning((s) => ({ ...s, [r.id]: true }));
    setDeals((d) => ({ ...d, [r.id]: null }));
    try {
      const costLine = r.costYr != null ? `They currently pay about $${r.costYr} per year.` : "Their current cost is unknown.";
      const data = await apiFetch({
          model: "claude-sonnet-4-6",
          max_tokens: 1200,
          system: 'You help a household in Victoria Point QLD 4165 find better deals. Search the web for current offers, then respond ONLY with valid JSON, no markdown fences, no other text, in this exact shape: {"summary": "1-2 sentence plain verdict on whether switching looks worthwhile", "offers": [{"provider": "name", "price_per_year": 1234, "note": "why it is good, one short sentence"}], "best_price_per_year": 1234, "estimated_annual_saving": 123}. Include 2-3 offers. price_per_year and best_price_per_year are numbers (AUD, annualised; multiply monthly prices by 12). estimated_annual_saving = their current annual cost minus best_price_per_year when their cost is known, otherwise null. Use null for anything you cannot determine. Be factual and conservative.',
          messages: [{ role: "user", content: `${r.q}. Current provider: ${r.provider}. ${costLine}` }],
          tools: [{ type: "web_search_20250305", name: "web_search" }],
        });
      if (data.error) throw new Error(data.error.message);
      const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
      let parsed = null;
      try {
        const clean = text.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(clean.slice(clean.indexOf("{"), clean.lastIndexOf("}") + 1));
      } catch { parsed = { summary: text, offers: [], best_price_per_year: null, estimated_annual_saving: null }; }
      if (r.costYr != null && parsed.best_price_per_year != null) {
        parsed.estimated_annual_saving = Math.round(r.costYr - parsed.best_price_per_year);
      }
      setDeals((d) => ({ ...d, [r.id]: parsed }));
    } catch (err) {
      setDeals((d) => ({ ...d, [r.id]: { summary: "Couldn't scan the market: " + err.message, offers: [], best_price_per_year: null, estimated_annual_saving: null } }));
    } finally { setScanning((s) => ({ ...s, [r.id]: false })); }
  };

  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };
  const empty = messages.length === 0;

  /* tasks with computed next-due, sorted soonest first */
  const tasks = useMemo(() => TIMELINE.map((ev) => {
    const nd = nextDue(ev, doneMap);
    return { ...ev, due: nd.d, doneOnce: nd.done, days: daysUntil(nd.d) };
  }).sort((a, b) => (a.doneOnce ? 1 : 0) - (b.doneOnce ? 1 : 0) || a.due.localeCompare(b.due)), [doneMap]);

  /* nudges: bins Wed→Thu, tasks due ≤7d, warranties ≤60d */
  const nudges = useMemo(() => {
    const out = [];
    const now = new Date();
    const thu = nextThursdays(1)[0];
    const hrs = (new Date(thu).setHours(6, 0, 0, 0) - now) / 3600000;
    if (hrs <= 16 && hrs > -14) {
      const b = binFor(thu);
      out.push({ id: "bins", e: "🗑️", txt: `Bins out tonight — red + ${b.e} ${b.name.toLowerCase()}`, days: 0 });
    }
    for (const t of tasks) {
      if (!t.doneOnce && t.days <= 7) out.push({ id: t.id, e: "🔧", txt: t.days < 0 ? `${t.t} — overdue ${-t.days}d` : t.days === 0 ? `${t.t} — today` : `${t.t} — in ${t.days}d`, days: t.days });
    }
    for (const w of WARRANTIES) {
      const d = daysUntil(w.end);
      if (d > 0 && d <= 60) out.push({ id: w.id, e: "📄", txt: `${w.name} ${w.renews ? "renews" : "ends"} ${fmtDate(w.end)}`, days: d });
    }
    return out.filter((n) => !nudgeHide[n.id] || new Date(nudgeHide[n.id]) < now).sort((a, b) => a.days - b.days).slice(0, 3);
  }, [tasks, nudgeHide]);

  const snooze = (id) => {
    const until = new Date(); until.setDate(until.getDate() + 3);
    setNudgeHide({ ...nudgeHide, [id]: until.toISOString() });
  };

  const sortedRenewals = [...renewals].sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999")).slice(0, 4);
  const crackGroups = useMemo(() => cracks.reduce((g, e) => {
    const k = (e.loc || "unlabelled").trim().toLowerCase();
    (g[k] = g[k] || []).push(e); return g;
  }, {}), [cracks]);
  const thursdays = nextThursdays(4);

  const weatherPill = weather && (
    <div className="wPill" title={`Max ${weather.max}° · ${weather.rain}% rain`}>
      <span className="wIco">{wxIcon(weather.c)}</span>
      <span className="wTemp">{weather.t}°</span>
      {weather.rain >= 50 && <span className="wRain">☔{weather.rain}%</span>}
    </div>
  );

  /* ————— GATE ————— */
  if (!code && role !== "guest") {
    const boxes = gateMode === "family" ? 4 : 6;
    return (
      <div className="app gate">
        <div className="gateInner">
          <div className="gateLogo"><I.leaf style={{ width: 34, height: 34 }} /></div>
          <div className="gateTitle">Silky Oak</div>
          <div className="gateSub">{gateMode === "family" ? "Enter the family PIN" : "Enter your 6-digit guest code"}</div>
          <div className={"pinRow" + (pinErr ? " shake" : "") + (boxes === 6 ? " six" : "")}>
            {Array.from({ length: boxes }).map((_, i) => (
              <div key={i} className={"pinBox" + (pin.length > i ? " filled" : "")}>{pin.length > i ? "•" : ""}</div>
            ))}
          </div>
          <input className="pinInput" type="tel" inputMode="numeric" autoFocus
            maxLength={boxes} value={pin} disabled={pinChecking}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, boxes))} />
          {pinChecking && <div className="gateChecking">Checking…</div>}
          <button className="gateSwap" onClick={() => { setGateMode(gateMode === "family" ? "guest" : "family"); setPin(""); }}>
            {gateMode === "family" ? "Have a guest code?" : "← Family PIN"}
          </button>
        </div>
      </div>
    );
  }

  /* ————— GUEST VIEW ————— */
  if (role === "guest" && !code) {
    const thu = thursdays[0]; const b = binFor(thu);
    return (
      <div className="app">
        <div className="bgWash" />
        {weatherPill}
        <main className="feed" style={{ paddingTop: 60 }}>
          <div className="pageHead"><div className="pageTitle">Welcome 👋</div>
            <div className="pageSub">18 Silky Oak Terrace — guest guide</div></div>
          <div className="tlCard guestCard">
            <div className="secH">📶 Wi-Fi</div>
            <div className="guestWifi">{GUEST_INFO.wifi.ssid}<br /><b>{GUEST_INFO.wifi.pass}</b></div>
            <div className="secH" style={{ marginTop: 14 }}>🗑️ Bins — Thursday</div>
            <div className="tlNote">Red bin every week. This week also: {b.e} {b.name}. Out Wednesday night, thanks!</div>
            <div className="secH" style={{ marginTop: 14 }}>🏡 House basics</div>
            {GUEST_INFO.basics.map((t, i) => <div key={i} className="tlNote">• {t}</div>)}
          </div>
          <div className="secTitle">🆘 If something goes wrong</div>
          {EMERGENCY.map((x, i) => (
            <div key={i} className="tlCard"><div className="tlTitle">{x.e} {x.n}</div><div className="tlNote">{x.w}</div></div>
          ))}
          <div className="numGrid">
            {EMERGENCY_NUMBERS.map((x) => (
              <a key={x.p} className="numBtn" href={"tel:" + x.p}><span>{x.n}</span><b>{x.p}</b></a>
            ))}
          </div>
          <button className="gateSwap" style={{ margin: "18px auto" }} onClick={() => { saveRole(""); setPin(""); }}>Exit guest mode</button>
        </main>
      </div>
    );
  }

  /* ————— MAIN ————— */
  return (
    <div className="app">
      <div className="bgWash" />
      {weatherPill}

      {/* ——— CHAT ——— */}
      {tab === "chat" && (
        <main className="feed" ref={scrollRef}>
          {empty ? (
            <div className="hello">
              <div className="heroWrap">
                <img className="heroImg" src={HERO} alt="" onError={(e) => { e.target.style.display = "none"; }} />
                <div className="heroFade" />
                <div className="heroText">
                  <div className="heroKicker">18 Silky Oak Terrace</div>
                  <div className="heroTitle">Hey, I'm Silky&nbsp;Oak</div>
                  <div className="heroSub">Your house, on call.</div>
                </div>
              </div>
              {nudges.length > 0 && (
                <div className="nudges">
                  {nudges.map((n) => (
                    <div key={n.id} className="nudge">
                      <span className="nEmoji">{n.e}</span>
                      <span className="nTxt">{n.txt}</span>
                      <button className="nX" onClick={() => snooze(n.id)} title="Snooze 3 days"><I.x style={{ width: 13, height: 13 }} /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="chips">
                <button className="chip chipDiag" onClick={() => diagRef.current?.click()}>📷 Diagnose a photo</button>
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="chip" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            </div>
          ) : (
            <div className="msgs">
              <div className="feedTop">
                <div className="feedTopIcon"><I.leaf style={{ width: 15, height: 15 }} /></div>
                Silky Oak
              </div>
              {nudges.length > 0 && (
                <div className="nudges slim">
                  {nudges.map((n) => (
                    <div key={n.id} className="nudge">
                      <span className="nEmoji">{n.e}</span>
                      <span className="nTxt">{n.txt}</span>
                      <button className="nX" onClick={() => snooze(n.id)}><I.x style={{ width: 13, height: 13 }} /></button>
                    </div>
                  ))}
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={"row " + m.role}>
                  <div className={"bubble " + m.role}>
                    {m.atts?.length > 0 && (
                      <div className="bAtts">
                        {m.atts.map((a, i) => a.kind === "image" && a.preview
                          ? <img key={i} className="bImg" src={a.preview} alt="" />
                          : <span key={i} className="bFile"><I.doc style={{ width: 13, height: 13 }} />{a.name}</span>
                        )}
                      </div>
                    )}
                    {m.text}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="row assistant"><div className="bubble assistant typing">
                  <span className="dot" /><span className="dot" /><span className="dot" />
                </div></div>
              )}
            </div>
          )}
          {error && <div className="errBar" onClick={() => setError(null)}>{error} — tap to dismiss</div>}
        </main>
      )}

      {/* ——— DATES · maintenance system ——— */}
      {tab === "dates" && (
        <main className="feed" ref={scrollRef}>
          <div className="pageHead">
            <div className="pageTitle">Dates</div>
            <div className="pageSub">Bins, maintenance, warranties & the crack log</div>
          </div>

          {/* bins */}
          <div className="tlCard">
            <div className="secH">🗑️ Bins — every Thursday</div>
            <div className="binRow big">
              <span className="binDot" style={{ background: binFor(thursdays[0]).c }} />
              <div><b>{binFor(thursdays[0]).e} {binFor(thursdays[0]).name}</b>
                <div className="tlNote">+ red general waste · {fmtDate(thursdays[0].toISOString().slice(0, 10))}</div></div>
            </div>
            {thursdays.slice(1).map((d, i) => {
              const b = binFor(d);
              return (
                <div key={i} className="binRow">
                  <span className="binDot" style={{ background: b.c }} />
                  <span className="binName">{b.e} {b.name}</span>
                  <span className="binDate">{fmtDate(d.toISOString().slice(0, 10))}</span>
                </div>
              );
            })}
            <button className="miniBtn" style={{ marginTop: 10 }} onClick={downloadBinsICS}>
              <I.dl style={{ width: 13, height: 13 }} /> Add bin nights to calendar
            </button>
          </div>

          {/* task runner */}
          <div className="secTitle">🔧 Maintenance — tick to log & reschedule</div>
          <div className="tl">
            {tasks.map((ev) => (
              <div key={ev.id} className={"tlItem" + (ev.doneOnce ? " doneMuted" : "")}>
                <div className="tlRail">
                  <span className="tlDot" style={{ background: KCOLOR[ev.k] || "#999" }} />
                  <span className="tlLine" />
                </div>
                <div className="tlCard">
                  <div className="tlWhen">
                    {ev.doneOnce ? "Done ✓" : fmtDate(ev.due)}
                    {!ev.doneOnce && ev.days != null && (
                      <span className={"tlDays" + (ev.days < 0 ? " over" : ev.days <= 30 ? " soon" : "")}>
                        {ev.days < 0 ? `${-ev.days}d overdue` : ev.days === 0 ? "today" : `in ${ev.days}d`}
                      </span>
                    )}
                    <span className="tlKind" style={{ color: KCOLOR[ev.k] }}>{ev.k}</span>
                  </div>
                  <div className="tlTitle">{ev.t}</div>
                  <div className="tlNote">{ev.note}</div>
                  {doneMap[ev.id] && <div className="tlNote" style={{ opacity: 0.55 }}>Last done {fmtDate(doneMap[ev.id])}</div>}
                  <div className="tlFoot">
                    <button className="miniBtn" onClick={() => downloadICS(ev, ev.due)}>
                      <I.dl style={{ width: 13, height: 13 }} /> Calendar
                    </button>
                    {!ev.doneOnce && (
                      <button className="miniBtn tick" onClick={() => setDoneMap({ ...doneMap, [ev.id]: todayISO() })}>
                        <I.check style={{ width: 13, height: 13 }} /> Done
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* warranties */}
          <div className="secTitle">📄 Warranties — the claim helper</div>
          {WARRANTIES.map((w) => {
            const d = daysUntil(w.end);
            const col = d < 0 ? "#d0685c" : d <= 90 ? "#e2a13c" : "#3f8f70";
            return (
              <div key={w.id} className="tlCard" style={{ borderLeft: `3px solid ${col}` }}>
                <div className="tlWhen">{w.who}
                  <span className="tlDays" style={{ color: col }}>
                    {d < 0 ? "expired" : d > 730 ? `${Math.round(d / 365)} yrs left` : `${d}d left`}
                  </span>
                </div>
                <div className="tlTitle">{w.name}</div>
                <div className="tlNote">{w.renews ? "Renews" : "Ends"} {fmtDate(w.end)} · {w.how}</div>
                <div className="tlFoot">
                  <button className="miniBtn" onClick={() => askChat(`Draft a claim for our ${w.name} (${w.who}). Reference: ${w.doc}. Property: 18 Silky Oak Terrace, Victoria Point. The issue is: `)}>
                    ✍️ Draft a claim
                  </button>
                </div>
              </div>
            );
          })}

          {/* crack log */}
          <div className="secTitle">📷 Crack & condition log</div>
          <div className="tlCard">
            <div className="tlNote">New slabs move most in years 1–2. Photograph any crack with a coin for scale, re-shoot quarterly — this builds your evidence trail for the Fiteni defect list and QBCC.</div>
            {!crackDraft && (
              <button className="miniBtn" style={{ marginTop: 10 }} onClick={() => crackRef.current?.click()}>
                <I.camera style={{ width: 14, height: 14 }} /> Log a crack photo
              </button>
            )}
            {crackDraft && (
              <div className="crackForm">
                <img className="crackBig" src={crackDraft.photo} alt="" />
                <input className="fld" placeholder="Where? (e.g. garage slab east edge)" value={crackDraft.loc}
                  onChange={(e) => setCrackDraft({ ...crackDraft, loc: e.target.value })} />
                <div className="chips" style={{ margin: "8px 0" }}>
                  {["<1mm", "1–5mm", "5–15mm", ">15mm"].map((w) => (
                    <button key={w} className={"chip" + (crackDraft.width === w ? " on" : "")}
                      onClick={() => setCrackDraft({ ...crackDraft, width: w })}>{w}</button>
                  ))}
                </div>
                <div className="tlNote">{crackDraft.width === "<1mm" ? "Hairline — cosmetic, monitor." : crackDraft.width === "1–5mm" ? "Slight — monitor quarterly; note if growing." : crackDraft.width === "5–15mm" ? "Moderate — photograph and email Fiteni." : "Severe — report to Fiteni & QBCC promptly."}</div>
                <input className="fld" placeholder="Note (optional)" value={crackDraft.note}
                  onChange={(e) => setCrackDraft({ ...crackDraft, note: e.target.value })} />
                <div className="tlFoot">
                  <button className="miniBtn tick" onClick={saveCrack}><I.check style={{ width: 13, height: 13 }} /> Save</button>
                  <button className="miniBtn" onClick={() => setCrackDraft(null)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
          {Object.entries(crackGroups).map(([loc, list]) => (
            <div key={loc} className="tlCard">
              <div className="tlTitle" style={{ textTransform: "capitalize" }}>{loc}</div>
              <div className="crackRow">
                {list.map((e) => (
                  <div key={e.id} className="crackCell">
                    <img src={e.photo} alt="" />
                    <div className="crackMeta">{fmtDate(e.date)} · {e.width}</div>
                    {e.note && <div className="crackMeta dim">{e.note}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {error && <div className="errBar" onClick={() => setError(null)}>{error} — tap to dismiss</div>}
        </main>
      )}

      {/* ——— HOUSE ——— */}
      {tab === "house" && (
        <main className="feed" ref={scrollRef}>
          <div className="pageHead">
            <div className="pageTitle">House</div>
            <div className="pageSub">Everything about 18 Silky Oak Terrace</div>
          </div>
          <div className="seg">
            {[["emergency","🆘"],["plans","📐"],["map","📍"],["finishes","🎨"],["appliances","🔌"],["services","📞"],["guest","🔑"]].map(([k, e]) => (
              <button key={k} className={"segBtn" + (houseSec === k ? " on" : "")} onClick={() => setHouseSec(k)}>
                {e} {k[0].toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>

          {houseSec === "emergency" && (<>
            {EMERGENCY.map((x, i) => (
              <div key={i} className="tlCard"><div className="tlTitle">{x.e} {x.n}</div><div className="tlNote">{x.w}</div></div>
            ))}
            <div className="numGrid">
              {EMERGENCY_NUMBERS.map((x) => (
                <a key={x.p} className="numBtn" href={"tel:" + x.p}><span>{x.n}</span><b>{x.p}</b></a>
              ))}
            </div>
          </>)}

          {houseSec === "plans" && PLANS.map((p, i) => {
            const st = p.missing ? "missing" : (planStatus[p.f] || "checking");
            const fname = p.f ? p.f.split("/").pop() : "";
            return (
              <div key={i} className="tlCard">
                <div className="tlTitle">{p.t}</div>
                <div className="tlNote">{p.d}</div>
                <div className="tlFoot">
                  {st === "ok"
                    ? <a className="miniBtn" href={p.f} target="_blank" rel="noreferrer"><I.doc style={{ width: 13, height: 13 }} /> Open</a>
                    : st === "checking"
                      ? <span className="tlNote" style={{ opacity: 0.6 }}>Checking…</span>
                      : <span className="tlNote" style={{ opacity: 0.6 }}>Not uploaded yet — add {fname} to /plans</span>}
                  <button className="miniBtn" onClick={() => askChat(`Looking at the ${p.t.toLowerCase()} for our house — `)}>💬 Ask about this plan</button>
                </div>
              </div>
            );
          })}

          {houseSec === "map" && (<>
            <div className="tlCard" style={{ padding: 13 }}>
              <div className="tlNote" style={{ marginBottom: 11 }}>
                A simplified layout of 18 Silky Oak Terrace. Tap <b>Show key items</b> to place the shut-offs, appliances and fixtures on the plan, then tap any marker for details.
              </div>
              <button className={"miniBtn" + (mapShow ? " tick" : "")} onClick={() => { setMapShow(!mapShow); setMapSel(null); }}>
                {mapShow ? "✓ Items shown — tap to hide" : "📍 Show key items"}
              </button>
              {mapShow && (
                <div className="seg sub" style={{ paddingTop: 12, paddingBottom: 4 }}>
                  {[["all","All"],["emergency","🆘 Emergency"],["appliance","🔌 Appliances"],["water","💧 Water"]].map(([k, lab]) => (
                    <button key={k} className={"segBtn" + (mapCat === k ? " on" : "")} onClick={() => { setMapCat(k); setMapSel(null); }}>{lab}</button>
                  ))}
                </div>
              )}
              <div className="mapWrap">
                <svg viewBox="0 0 100 168" className="mapSvg">
                  {MAP_ROOMS.map((r, i) => {
                    const ly = r.s ? r.y + r.h / 2 - 1 : r.y + r.h / 2 + 1;
                    return (
                      <g key={i}>
                        <rect className={"mapRoom" + (r.c ? " " + r.c : "")} x={r.x} y={r.y} width={r.w} height={r.h} rx="1" />
                        <text className="mapLab" x={r.x + r.w / 2} y={ly}>{r.l}</text>
                        {r.s && <text className="mapSub" x={r.x + r.w / 2} y={ly + 3}>{r.s}</text>}
                      </g>
                    );
                  })}
                  {mapShow && MAP_MARKERS.map((m, idx) => {
                    if (mapCat !== "all" && m.cat !== mapCat) return null;
                    const on = mapSel === idx;
                    return (
                      <g key={idx} className="mapMk" onClick={() => setMapSel(on ? null : idx)}>
                        <circle cx={m.x} cy={m.y} r={on ? 5 : 3.9} fill="none" stroke={MAP_CATS[m.cat]} strokeWidth={on ? 1 : 0.6} opacity={on ? 0.95 : 0.55} />
                        <circle cx={m.x} cy={m.y} r="2.7" fill={MAP_CATS[m.cat]} stroke="#fff" strokeWidth="0.5" />
                        <text x={m.x} y={m.y} className="mapIco">{m.e}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              {mapShow && mapSel != null && (
                <div className="mapCallout" style={{ borderLeftColor: MAP_CATS[MAP_MARKERS[mapSel].cat] }}>
                  <div className="tlTitle" style={{ margin: 0 }}>{MAP_MARKERS[mapSel].e} {MAP_MARKERS[mapSel].l}</div>
                  <div className="tlNote" style={{ marginTop: 4 }}>{MAP_MARKERS[mapSel].note}</div>
                  <div className="tlFoot">
                    <button className="miniBtn" onClick={() => askChat(`About the ${MAP_MARKERS[mapSel].l.toLowerCase()} at our house — `)}>💬 Ask about this</button>
                  </div>
                </div>
              )}
              {mapShow && mapSel == null && (
                <div className="tlNote" style={{ marginTop: 11, opacity: 0.7, textAlign: "center" }}>Tap a marker to see what it is and what to do.</div>
              )}
            </div>
            <div className="tlNote" style={{ opacity: 0.6, fontSize: 11.5, textAlign: "center", marginTop: 2 }}>
              Schematic only — positions are approximate. See the Plans tab for the surveyed drawings.
            </div>
          </>)}

          {houseSec === "finishes" && (<>
            <div className="seg sub">
              {Object.entries(FINISHES).map(([k, z]) => (
                <button key={k} className={"segBtn" + (finZone === k ? " on" : "")} onClick={() => setFinZone(k)}>
                  {z.label}
                </button>
              ))}
            </div>
            <div className="swGrid">
              {FINISHES[finZone].items.map((it, i) => (
                <div key={i} className="swTile">
                  <span className="swBox" style={{ background: it.c }} />
                  <span className="swName">{it.n}</span>
                  <span className="swSpec">{it.s}</span>
                  {it.x && <span className="swX">{it.x}</span>}
                  <span className="swBtns">
                    <button className="swMini" onClick={() => navigator.clipboard?.writeText(it.n + ": " + it.s)}>copy</button>
                    <button className="swMini" onClick={() => askChat("About our " + it.n.toLowerCase() + " (" + it.s + ") — ")}>ask</button>
                  </span>
                </div>
              ))}
            </div>
          </>)}

          {houseSec === "appliances" && APPLIANCES.map((a, i) => {
            const d = a.w ? daysUntil(a.w) : null;
            return (
              <div key={i} className="tlCard">
                <div className="tlWhen">{a.b}
                  {d != null && (
                    <span className="tlDays" style={{ color: d < 0 ? "#d0685c" : d <= 180 ? "#e2a13c" : "#3f8f70" }}>
                      {d < 0 ? "warranty ended" : d > 730 ? `wty ${Math.round(d / 365)} yrs` : `wty ${d}d`}
                    </span>
                  )}
                </div>
                <div className="tlTitle">{a.e} {a.n}</div>
                {a.x && <div className="tlNote">{a.x}</div>}
                <div className="tlNote" style={{ opacity: 0.65 }}>Support: {a.s}{a.w ? ` · warranty to ${fmtDate(a.w)}` : ""}</div>
                <div className="tlFoot">
                  <button className="miniBtn" onClick={() => askChat(`How do I `)}>💬 How do I…</button>
                  <button className="miniBtn" onClick={() => askChat(`Something's wrong with our ${a.n.toLowerCase()} (${a.b}): `)}>⚠️ Report a fault</button>
                </div>
              </div>
            );
          })}

          {houseSec === "services" && SERVICES.map((s, i) => (
            <div key={i} className="tlCard svcCard">
              <div className="svcRow">
                <div style={{ flex: 1 }}>
                  <div className="tlTitle">{s.n}</div>
                  <div className="tlNote">{s.r}</div>
                  <div className="tlNote" style={{ opacity: 0.65 }}>{s.pl}{s.em ? ` · ${s.em}` : ""}</div>
                </div>
                {s.p && <a className="callBtn" href={"tel:" + s.p}>📞</a>}
              </div>
              {s.tip && <div className="tlNote tip">💡 {s.tip}</div>}
            </div>
          ))}

          {houseSec === "guest" && (<>
            <div className="tlCard guestCard">
              <div className="secH">Guest quick-reference</div>
              <div className="tlNote">📶 <b>{GUEST_INFO.wifi.ssid}</b> / <b>{GUEST_INFO.wifi.pass}</b></div>
              <div className="tlNote">🗑️ Bins Thursday — red weekly; this week also {binFor(thursdays[0]).e} {binFor(thursdays[0]).name.toLowerCase()}.</div>
              {GUEST_INFO.basics.map((t, i) => <div key={i} className="tlNote">• {t}</div>)}
              <button className="miniBtn" style={{ marginTop: 10 }} onClick={() => {
                const b = binFor(thursdays[0]);
                const card = `🏡 18 Silky Oak Terrace\n\n📶 Wi-Fi: ${GUEST_INFO.wifi.ssid} / ${GUEST_INFO.wifi.pass}\n🗑️ Bins out Wed night — red every week; this week also ${b.name}.\n\n${GUEST_INFO.basics.map((x) => "• " + x).join("\n")}\n\n🆘 Power main switch: meter box, garage-side wall. Water: meter at front boundary. No gas.\n000 · SES 132 500 · Energex 13 19 62\n${GUEST_INFO.contact}`;
                if (navigator.share) navigator.share({ title: "Silky Oak — Guest Guide", text: card });
                else { navigator.clipboard?.writeText(card); setError("Guest card copied to clipboard"); }
              }}>📤 Share guest card</button>
            </div>
            <div className="tlCard">
              <div className="secH">Temporary app codes</div>
              <div className="tlNote">Guests enter these at the PIN screen ("Have a guest code?"). They see the guest guide + emergency info only, and the code expires by itself.</div>
              <input className="fld" placeholder="Label (e.g. Beck's mum, Dec house-sitter)" value={gLabel} onChange={(e) => setGLabel(e.target.value)} />
              <div className="chips" style={{ margin: "8px 0" }}>
                {[[24, "1 day"], [72, "3 days"], [168, "1 week"], [720, "30 days"]].map(([h, l]) => (
                  <button key={h} className={"chip" + (gHours === h ? " on" : "")} onClick={() => setGHours(h)}>{l}</button>
                ))}
              </div>
              <button className="miniBtn tick" disabled={gBusy} onClick={makeGuestCode}>
                {gBusy ? "Creating…" : "Generate code"}
              </button>
              {gCodes.filter((c) => new Date(c.expires) > new Date()).map((c) => (
                <div key={c.code} className="codeRow">
                  <div><b className="codeNum">{c.code}</b>
                    <div className="tlNote">{c.label} · expires {fmtDate(c.expires.slice(0, 10))}</div></div>
                  <button className="miniBtn" onClick={() => navigator.clipboard?.writeText(c.code)}>Copy</button>
                </div>
              ))}
            </div>
          </>)}
          {error && <div className="errBar" onClick={() => setError(null)}>{error} — tap to dismiss</div>}
        </main>
      )}

      {/* ——— DEALS ——— */}
      {tab === "deals" && (
        <main className="feed" ref={scrollRef}>
          <div className="pageHead">
            <div className="pageTitle">Deals</div>
            <div className="pageSub">Upcoming renewals — scan the market before they roll over</div>
          </div>
          <div className="tl">
            {sortedRenewals.map((r) => {
              const days = daysUntil(r.date);
              const deal = deals[r.id];
              const isScanning = scanning[r.id];
              return (
                <div key={r.id} className="tlItem">
                  <div className="tlRail">
                    <span className="tlDot" style={{ background: KCOLOR.Renewal }} />
                    <span className="tlLine" />
                  </div>
                  <div className="tlCard">
                    <div className="tlWhen">
                      {fmtDate(r.date)}
                      {days != null && (
                        <span className={"tlDays" + (days < 0 ? " over" : days <= 45 ? " soon" : "")}>
                          {days < 0 ? "rolled over" : days === 0 ? "today" : `in ${days}d`}
                        </span>
                      )}
                      <span className="tlKind" style={{ color: KCOLOR.Renewal }}>{r.cat}</span>
                    </div>
                    <div className="tlTitle">{r.provider}</div>
                    <div className="tlNote">{r.costYr != null ? `Currently ~${money(r.costYr)}/yr` : "Current cost unknown — add it for savings estimates"}</div>
                    <div className="tlFoot">
                      <button className="miniBtn scan" disabled={isScanning} onClick={() => scanDeal(r)}>
                        <I.spark style={{ width: 13, height: 13 }} />
                        {isScanning ? "Scanning the market…" : deal ? "Scan again" : "Scan the market"}
                      </button>
                    </div>
                    {isScanning && (
                      <div className="dealBox scanningBox">
                        <span className="dot" /><span className="dot" /><span className="dot" />
                        <span className="scanTxt">Searching current offers…</span>
                      </div>
                    )}
                    {deal && !isScanning && (
                      <div className="dealBox">
                        {deal.estimated_annual_saving != null && deal.estimated_annual_saving > 0 && (
                          <div className="saveBig">Save ~{money(deal.estimated_annual_saving)}/yr</div>
                        )}
                        <div className="dealSummary">{deal.summary}</div>
                        {(deal.offers || []).map((o, i) => (
                          <div key={i} className="offerRow">
                            <span className="offerName">{o.provider}</span>
                            <span className="offerNote">{o.note}</span>
                            {o.price_per_year != null && <span className="offerPrice">{money(o.price_per_year)}/yr</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="dealsHint">Prices come from a live web scan and can be out of date — always confirm on the provider's site.</div>
          {error && <div className="errBar" onClick={() => setError(null)}>{error} — tap to dismiss</div>}
        </main>
      )}

      {/* ——— DOCK ——— */}
      <footer className="dock">
        {tab === "chat" && (
          <>
            {atts.length > 0 && (
              <div className="tray">
                {atts.map((a) => (
                  <div key={a.id} className="trayItem">
                    {a.kind === "image" && a.preview
                      ? <img src={a.preview} alt="" />
                      : <span className="trayFile"><I.doc style={{ width: 14, height: 14 }} />{a.name}</span>}
                    <button className="trayX" onClick={() => setAtts((x) => x.filter((y) => y.id !== a.id))}>
                      <I.x style={{ width: 11, height: 11 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="bar">
              <button className="iconBtn" title="Add a file" onClick={() => fileRef.current?.click()}>
                <I.plus style={{ width: 21, height: 21 }} />
              </button>
              <button className="iconBtn" title="Camera" onClick={() => camRef.current?.click()}>
                <I.camera style={{ width: 21, height: 21 }} />
              </button>
              <textarea ref={taRef} className="input" rows={1}
                placeholder={listening ? "Listening…" : "Ask about the house…"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey} />
              {speechOK && (
                <button className={"iconBtn" + (listening ? " live" : "")} title="Speak" onClick={toggleMic}>
                  <I.mic style={{ width: 20, height: 20 }} />
                </button>
              )}
              <button className="sendBtn" disabled={busy || (!input.trim() && atts.length === 0)} onClick={() => send()}>
                <I.send style={{ width: 19, height: 19 }} />
              </button>
            </div>
          </>
        )}
        <nav className="tabs">
          <button className={"tab" + (tab === "chat" ? " on" : "")} onClick={() => setTab("chat")}>
            <I.chat style={{ width: 21, height: 21 }} /><span>Chat</span>
          </button>
          <button className={"tab" + (tab === "dates" ? " on" : "")} onClick={() => setTab("dates")}>
            <I.cal style={{ width: 21, height: 21 }} /><span>Dates</span>
          </button>
          <button className={"tab" + (tab === "house" ? " on" : "")} onClick={() => setTab("house")}>
            <I.home style={{ width: 21, height: 21 }} /><span>House</span>
          </button>
          <button className={"tab" + (tab === "deals" ? " on" : "")} onClick={() => setTab("deals")}>
            <I.tag style={{ width: 21, height: 21 }} /><span>Deals</span>
          </button>
        </nav>
      </footer>

      <input ref={fileRef} type="file" multiple accept="image/*,application/pdf,.txt,.md,.csv,.json" style={{ display: "none" }}
        onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
      <input ref={camRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
        onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
      <input ref={diagRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={onDiagnose} />
      <input ref={crackRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={onCrackPhoto} />
    </div>
  );
}

/* ————————————————————— STYLES ————————————————————— */
const CSS = `
:root{
  --bg:#f4f6f8; --ink:#1c2530; --sub:#6b7684; --line:rgba(20,30,45,.08);
  --glass:rgba(255,255,255,.62); --glassBorder:rgba(255,255,255,.75);
  --green:#3f8f70; --accent:#5b8fd6; --shadow:0 8px 30px rgba(25,40,60,.10);
  --radius:20px;
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body,#root{height:100%;margin:0}
body{
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,system-ui,sans-serif;
  color:var(--ink);background:var(--bg);
  overscroll-behavior-y:none;-webkit-font-smoothing:antialiased;
}
.app{position:relative;height:100dvh;display:flex;flex-direction:column;overflow:hidden}
.bgWash{position:fixed;inset:0;z-index:0;pointer-events:none;
  background:
    radial-gradient(60% 45% at 78% 8%,rgba(120,180,255,.20),transparent 60%),
    radial-gradient(55% 40% at 12% 6%,rgba(120,220,180,.20),transparent 60%),
    radial-gradient(70% 55% at 50% 108%,rgba(150,200,255,.16),transparent 55%);
}

/* weather pill */
.wPill{position:fixed;top:max(12px,env(safe-area-inset-top));right:14px;z-index:30;
  display:flex;align-items:center;gap:5px;padding:6px 11px;border-radius:999px;
  background:var(--glass);border:1px solid var(--glassBorder);
  backdrop-filter:blur(20px) saturate(1.4);-webkit-backdrop-filter:blur(20px) saturate(1.4);
  box-shadow:var(--shadow);font-size:13px;font-weight:600}
.wIco{font-size:15px;line-height:1}.wTemp{font-weight:700}
.wRain{color:var(--accent);font-size:11px;font-weight:700}

/* feed */
.feed{position:relative;z-index:1;flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;
  padding:0 15px 6px;scroll-behavior:smooth}
.pageHead{padding:calc(env(safe-area-inset-top) + 20px) 4px 8px}
.pageTitle{font-size:26px;font-weight:800;letter-spacing:-.02em}
.pageSub{color:var(--sub);font-size:13.5px;margin-top:2px}

/* hero */
.hello{padding-top:0}
.heroWrap{position:relative;margin:calc(env(safe-area-inset-top) + 8px) -15px 0;height:300px;overflow:hidden}
.heroImg{width:100%;height:100%;object-fit:cover;display:block}
.heroFade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(244,246,248,0) 40%,rgba(244,246,248,.85) 82%,var(--bg) 100%)}
.heroText{position:absolute;left:20px;bottom:20px;right:20px}
.heroKicker{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--green)}
.heroTitle{font-size:30px;font-weight:800;letter-spacing:-.02em;margin-top:3px}
.heroSub{color:var(--sub);font-size:15px;margin-top:2px}

/* nudges */
.nudges{display:flex;flex-direction:column;gap:8px;margin:16px 0 4px}
.nudges.slim{margin:8px 0}
.nudge{display:flex;align-items:center;gap:10px;padding:11px 13px;border-radius:15px;
  background:var(--glass);border:1px solid var(--glassBorder);
  backdrop-filter:blur(16px) saturate(1.3);-webkit-backdrop-filter:blur(16px) saturate(1.3);
  box-shadow:var(--shadow)}
.nEmoji{font-size:17px}.nTxt{flex:1;font-size:13.5px;font-weight:600;line-height:1.3}
.nX{border:0;background:rgba(20,30,45,.06);color:var(--sub);width:24px;height:24px;
  border-radius:50%;display:grid;place-items:center;cursor:pointer;flex-shrink:0}

/* chips */
.chips{display:flex;flex-wrap:wrap;gap:8px;padding:16px 2px 4px}
.chip{border:1px solid var(--glassBorder);background:var(--glass);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  color:var(--ink);font-size:13.5px;font-weight:600;padding:9px 14px;border-radius:999px;
  cursor:pointer;transition:transform .12s,background .2s}
.chip:active{transform:scale(.96)}
.chip.on{background:var(--green);color:#fff;border-color:var(--green)}
.chipDiag{background:rgba(91,143,214,.14);border-color:rgba(91,143,214,.3);color:#2c5a94}

/* chat msgs */
.msgs{padding-top:calc(env(safe-area-inset-top) + 8px);display:flex;flex-direction:column;gap:12px;padding-bottom:6px}
.feedTop{display:flex;align-items:center;gap:8px;font-weight:700;font-size:14px;color:var(--sub);padding:4px 2px 2px}
.feedTopIcon{width:26px;height:26px;border-radius:50%;background:var(--green);color:#fff;display:grid;place-items:center}
.row{display:flex}.row.user{justify-content:flex-end}.row.assistant{justify-content:flex-start}
.bubble{max-width:84%;padding:11px 15px;border-radius:19px;font-size:15px;line-height:1.5;
  white-space:pre-wrap;word-wrap:break-word;box-shadow:var(--shadow)}
.bubble.user{background:var(--green);color:#fff;border-bottom-right-radius:6px}
.bubble.assistant{background:var(--glass);border:1px solid var(--glassBorder);
  backdrop-filter:blur(16px) saturate(1.3);-webkit-backdrop-filter:blur(16px) saturate(1.3);
  border-bottom-left-radius:6px}
.bAtts{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
.bImg{width:120px;height:120px;object-fit:cover;border-radius:12px}
.bFile{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;
  background:rgba(255,255,255,.5);padding:5px 9px;border-radius:9px}
.typing{display:flex;gap:5px;align-items:center;padding:15px 17px}
.dot{width:7px;height:7px;border-radius:50%;background:var(--sub);opacity:.4;animation:blink 1.3s infinite}
.dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
@keyframes blink{0%,60%,100%{opacity:.3}30%{opacity:.9}}

/* section headers */
.secTitle{font-size:15px;font-weight:800;margin:22px 4px 10px;letter-spacing:-.01em}
.secH{font-size:14px;font-weight:800;margin-bottom:6px}

/* generic card */
.tlCard{background:var(--glass);border:1px solid var(--glassBorder);border-radius:16px;
  padding:14px 15px;box-shadow:var(--shadow);
  backdrop-filter:blur(16px) saturate(1.3);-webkit-backdrop-filter:blur(16px) saturate(1.3);
  margin-bottom:10px}
.tlWhen{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:12.5px;color:var(--sub);font-weight:700}
.tlDays{padding:2px 8px;border-radius:999px;background:rgba(20,30,45,.06);font-size:11.5px}
.tlDays.soon{background:rgba(226,161,60,.16);color:#9a6a12}
.tlDays.over{background:rgba(208,104,92,.16);color:#a33}
.tlKind{margin-left:auto;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em}
.tlTitle{font-size:15.5px;font-weight:700;margin:5px 0 3px;letter-spacing:-.01em}
.tlNote{font-size:13px;color:var(--sub);line-height:1.45}
.tlFoot{display:flex;flex-wrap:wrap;gap:8px;margin-top:11px}

/* mini buttons */
.miniBtn{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--line);
  background:rgba(255,255,255,.6);color:var(--ink);font-size:12.5px;font-weight:700;
  padding:7px 12px;border-radius:10px;cursor:pointer;text-decoration:none;transition:transform .12s}
.miniBtn:active{transform:scale(.96)}
.miniBtn.tick{background:var(--green);color:#fff;border-color:var(--green)}
.miniBtn.scan{background:rgba(91,143,214,.14);border-color:rgba(91,143,214,.3);color:#2c5a94}
.miniBtn:disabled{opacity:.55}

/* bins */
.binRow{display:flex;align-items:center;gap:10px;padding:7px 0;border-top:1px solid var(--line)}
.binRow.big{border:0;padding-bottom:4px}
.binDot{width:13px;height:13px;border-radius:50%;flex-shrink:0;box-shadow:0 0 0 3px rgba(255,255,255,.5)}
.binName{font-size:13.5px;font-weight:600}
.binDate{margin-left:auto;font-size:12.5px;color:var(--sub);font-weight:600}

/* timeline rail */
.tl{position:relative}
.tlItem{display:flex;gap:12px}
.tlRail{display:flex;flex-direction:column;align-items:center;padding-top:15px}
.tlDot{width:12px;height:12px;border-radius:50%;flex-shrink:0;box-shadow:0 0 0 4px rgba(255,255,255,.55)}
.tlLine{flex:1;width:2px;background:var(--line);margin:4px 0 -4px}
.tlItem:last-child .tlLine{display:none}
.tlItem .tlCard{flex:1}
.doneMuted{opacity:.5}

/* fields */
.fld{width:100%;border:1px solid var(--line);background:rgba(255,255,255,.7);
  border-radius:11px;padding:10px 12px;font-size:14px;margin-top:8px;font-family:inherit;color:var(--ink)}
.fld:focus{outline:none;border-color:var(--green)}

/* crack log */
.crackForm{margin-top:12px}
.crackBig{width:100%;max-height:230px;object-fit:cover;border-radius:13px}
.crackRow{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
.crackCell{width:96px}
.crackCell img{width:96px;height:96px;object-fit:cover;border-radius:10px}
.crackMeta{font-size:10.5px;color:var(--sub);margin-top:3px;font-weight:600;line-height:1.3}
.crackMeta.dim{opacity:.7;font-weight:500}

/* segmented control */
.seg{display:flex;gap:6px;overflow-x:auto;padding:4px 2px 12px;-webkit-overflow-scrolling:touch}
.seg::-webkit-scrollbar{display:none}
.seg.sub{padding-top:0}
.segBtn{white-space:nowrap;border:1px solid var(--glassBorder);background:var(--glass);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  color:var(--ink);font-size:13px;font-weight:700;padding:8px 14px;border-radius:999px;cursor:pointer;flex-shrink:0}
.segBtn.on{background:var(--ink);color:#fff;border-color:var(--ink)}

/* swatches */
.swGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.swTile{display:flex;flex-direction:column;text-align:left;gap:2px;padding:12px;border-radius:15px;
  background:var(--glass);border:1px solid var(--glassBorder);box-shadow:var(--shadow);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.swBox{width:100%;height:52px;border-radius:10px;border:1px solid rgba(20,30,45,.1);margin-bottom:6px}
.swName{font-size:13px;font-weight:800;letter-spacing:-.01em}
.swSpec{font-size:11.5px;color:var(--sub);line-height:1.35}
.swX{font-size:11px;color:var(--accent);margin-top:3px;line-height:1.35}
.swBtns{display:flex;gap:6px;margin-top:8px}
.swMini{flex:1;border:1px solid var(--line);background:rgba(255,255,255,.6);
  font-size:11.5px;font-weight:700;padding:5px;border-radius:8px;cursor:pointer;color:var(--ink)}

/* house map */
.mapWrap{background:rgba(255,255,255,.4);border:1px solid var(--line);border-radius:14px;
  padding:8px;margin-top:12px}
.mapSvg{width:100%;height:auto;display:block;touch-action:manipulation}
.mapRoom{fill:rgba(255,255,255,.55);stroke:rgba(20,30,45,.28);stroke-width:.5}
.mapRoom.wet{fill:rgba(91,143,214,.10)}
.mapRoom.out{fill:rgba(63,143,112,.07);stroke-dasharray:2 1.5}
.mapRoom.gar{fill:rgba(20,30,45,.045)}
.mapLab{font-size:3px;font-weight:800;fill:#48525e;text-anchor:middle}
.mapSub{font-size:2.2px;font-weight:600;fill:#9aa2ac;text-anchor:middle;text-transform:uppercase;letter-spacing:.08em}
.mapIco{font-size:3.5px;text-anchor:middle;dominant-baseline:central;pointer-events:none}
.mapMk{cursor:pointer}
.mapMk:active{opacity:.8}
.mapCallout{margin-top:12px;border:1px solid var(--line);border-left-width:4px;
  border-radius:12px;padding:11px 13px;background:rgba(255,255,255,.6)}

/* services */
.svcCard .svcRow{display:flex;align-items:flex-start;gap:12px}
.callBtn{width:44px;height:44px;border-radius:50%;background:var(--green);color:#fff;
  display:grid;place-items:center;font-size:19px;text-decoration:none;flex-shrink:0;box-shadow:var(--shadow)}
.tip{margin-top:9px;padding-top:9px;border-top:1px solid var(--line)}

/* number grid */
.numGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:4px 0 10px}
.numBtn{display:flex;flex-direction:column;gap:1px;padding:11px 13px;border-radius:13px;
  background:var(--glass);border:1px solid var(--glassBorder);box-shadow:var(--shadow);text-decoration:none;color:var(--ink)}
.numBtn span{font-size:11.5px;color:var(--sub);font-weight:700}
.numBtn b{font-size:16px;letter-spacing:.01em}

/* guest */
.guestCard .guestWifi{font-size:15px;line-height:1.5;padding:10px 12px;border-radius:11px;
  background:rgba(63,143,112,.1);margin-top:4px}
.codeRow{display:flex;align-items:center;gap:10px;margin-top:10px;padding-top:10px;border-top:1px solid var(--line)}
.codeNum{font-size:22px;font-weight:800;letter-spacing:.18em;font-variant-numeric:tabular-nums}

/* deals */
.dealBox{margin-top:12px;padding:13px;border-radius:14px;background:rgba(91,143,214,.08);border:1px solid rgba(91,143,214,.16)}
.scanningBox{display:flex;align-items:center;gap:6px}
.scanTxt{font-size:12.5px;color:var(--sub);font-weight:600;margin-left:4px}
.saveBig{font-size:18px;font-weight:800;color:var(--green);margin-bottom:5px}
.dealSummary{font-size:13.5px;line-height:1.5;margin-bottom:10px}
.offerRow{display:flex;align-items:baseline;gap:8px;padding:8px 0;border-top:1px solid rgba(91,143,214,.14)}
.offerName{font-size:13px;font-weight:800}
.offerNote{font-size:12px;color:var(--sub);flex:1;line-height:1.35}
.offerPrice{font-size:13px;font-weight:800;white-space:nowrap}
.dealsHint{font-size:11.5px;color:var(--sub);text-align:center;padding:6px 20px 12px;line-height:1.4}

/* error */
.errBar{margin:12px 2px;padding:11px 14px;border-radius:12px;font-size:13px;font-weight:600;
  background:rgba(208,104,92,.12);color:#a33;border:1px solid rgba(208,104,92,.24);cursor:pointer}

/* dock */
.dock{position:relative;z-index:2;flex-shrink:0;
  background:linear-gradient(180deg,rgba(244,246,248,0),var(--bg) 24%);
  padding-bottom:env(safe-area-inset-bottom)}
.tray{display:flex;gap:8px;overflow-x:auto;padding:8px 15px 2px}
.trayItem{position:relative;flex-shrink:0}
.trayItem img{width:56px;height:56px;object-fit:cover;border-radius:11px}
.trayFile{display:flex;align-items:center;gap:5px;height:56px;padding:0 12px;font-size:12px;font-weight:600;
  background:var(--glass);border:1px solid var(--glassBorder);border-radius:11px;max-width:150px;overflow:hidden;white-space:nowrap}
.trayX{position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;
  background:var(--ink);color:#fff;border:0;display:grid;place-items:center;cursor:pointer}
.bar{display:flex;align-items:flex-end;gap:7px;padding:8px 12px 10px}
.iconBtn{width:40px;height:40px;flex-shrink:0;border-radius:50%;border:1px solid var(--glassBorder);
  background:var(--glass);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  color:var(--sub);display:grid;place-items:center;cursor:pointer}
.iconBtn.live{background:var(--green);color:#fff;border-color:var(--green);animation:pulse 1.4s infinite}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(63,143,112,.5)}50%{box-shadow:0 0 0 8px rgba(63,143,112,0)}}
.input{flex:1;resize:none;border:1px solid var(--glassBorder);background:var(--glass);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  border-radius:21px;padding:10px 15px;font-size:15px;font-family:inherit;color:var(--ink);
  max-height:120px;line-height:1.4}
.input:focus{outline:none;border-color:var(--green)}
.sendBtn{width:40px;height:40px;flex-shrink:0;border-radius:50%;border:0;background:var(--green);
  color:#fff;display:grid;place-items:center;cursor:pointer;transition:transform .12s}
.sendBtn:active{transform:scale(.92)}.sendBtn:disabled{opacity:.4}

/* tabs */
.tabs{display:flex;border-top:1px solid var(--line);padding:6px 6px 4px}
.tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;border:0;background:none;
  color:var(--sub);font-size:10.5px;font-weight:700;padding:6px 0;cursor:pointer}
.tab.on{color:var(--green)}
.tab span{letter-spacing:.01em}

/* gate */
.gate{align-items:center;justify-content:center}
.gateInner{position:relative;z-index:1;text-align:center;padding:30px;max-width:340px;width:100%}
.gateLogo{width:66px;height:66px;border-radius:22px;background:var(--green);color:#fff;
  display:grid;place-items:center;margin:0 auto 18px;box-shadow:var(--shadow)}
.gateTitle{font-size:27px;font-weight:800;letter-spacing:-.02em}
.gateSub{color:var(--sub);font-size:14.5px;margin-top:5px}
.pinRow{display:flex;gap:11px;justify-content:center;margin:26px 0 4px}
.pinRow.six{gap:8px}
.pinBox{width:52px;height:60px;border-radius:15px;border:1.5px solid var(--glassBorder);
  background:var(--glass);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  display:grid;place-items:center;font-size:26px;box-shadow:var(--shadow)}
.pinRow.six .pinBox{width:42px;height:52px;font-size:22px}
.pinBox.filled{border-color:var(--green)}
.pinInput{position:absolute;opacity:0;pointer-events:none;left:-9999px}
.gateChecking{color:var(--sub);font-size:13px;margin-top:14px}
.gateSwap{display:block;margin:18px auto 0;border:0;background:none;color:var(--accent);
  font-size:14px;font-weight:700;cursor:pointer;padding:8px}
.shake{animation:shake .5s}
@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-9px)}40%,80%{transform:translateX(9px)}}
`;

const styleEl = document.createElement("style");
styleEl.textContent = CSS;
document.head.appendChild(styleEl);

ReactDOM.createRoot(document.getElementById("root")).render(<SilkyOakHome />);
