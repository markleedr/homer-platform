-- Seed: 18 Silky Oak Terrace (Phase 0 ticket P0.11b, Demo 1 data source)
--
-- Loads the real house knowledge from reference/silky-oak-app.jsx into the
-- database as structured records, owned by Mark. This is the read path for Demo
-- 1 so the app does not wait on the ingestion pipeline (P0.21); the pipeline
-- replaces it later for real onboarding. The Silky Oak repo stays untouched: this
-- was transcribed from the in-repo reference copy only.
--
-- Idempotent and re-runnable: fixed UUIDs for the org and property (upserted),
-- and child rows are deleted then reinserted, all in one transaction. Owner
-- membership resolves Mark by email from auth.users; Beck is added on a re-run
-- once she has signed in (add her email to the owner block below).
--
-- Scope per ticket: appliances, finishes, key dates, service directory, emergency
-- shut-offs, home-map hot dots. Documents wait for storage (P0.9 / P0.23); the AI
-- narrative profile (HOUSE_MEMORY) is the context assembler's job (P0.17).
--
-- No em dashes anywhere, including in the seeded copy that reaches homeowners:
-- the reference uses them heavily and they are replaced here with commas, colons
-- or the word "to".

begin;

-- Tenant root and property ----------------------------------------------------

insert into public.orgs (id, name, kind)
values ('a0000000-0000-4000-8000-000000000001', 'Fiteni Homes', 'builder')
on conflict (id) do update set name = excluded.name, kind = excluded.kind;

insert into public.properties (
  id, org_id, kind, name,
  address_line1, suburb, state, postcode, lot_plan, handover_date,
  bin_config, finishes, emergency_shutoffs, home_map
) values (
  'a0000000-0000-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000001',
  'home',
  '18 Silky Oak Terrace',
  '18 Silky Oak Terrace', 'Victoria Point', 'QLD', '4165',
  'Lot 120 SP336107', date '2026-04-22',
  '{"collection_day":"Thursday","general":"weekly","recycling":"fortnightly","garden":"fortnightly","anchor_week":"2026-01-01","anchor_colour":"yellow","note":"Red general bin weekly. Yellow recycling and green garden alternate fortnightly, yellow in the week of 1 Jan 2026, green the next."}'::jsonb,
  '{
    "exterior": {"label":"Exterior","items":[
      {"name":"Roof, gutter, fascia","spec":"Colorbond Shale Grey","colour":"#BCBCB4","note":"Also barge capping, dry verge and whirlybirds"},
      {"name":"Brickwork","spec":"PGH Frost, raked off-white mortar","colour":"#E8E4DC"},
      {"name":"Cladding and render","spec":"Haymes White Wash 1 (Linea 180 + Fascade)","colour":"#F2EFE9"},
      {"name":"Trims, eaves, posts","spec":"Haymes Greyology 2","colour":"#C9C9C5","note":"Window trim, gable trim, eaves, entry and patio posts, door jambs"},
      {"name":"Garage door","spec":"Centurion Georgian: Dover White","colour":"#F4F2EC"},
      {"name":"Windows","spec":"Pearl White gloss frames","colour":"#F5F4F0"},
      {"name":"Entry door","spec":"AWOWS 5G, Cabots Marine Clear stain, Trilock matte black","colour":"#8A6A4C"},
      {"name":"Driveway and paths","spec":"Exposed aggregate: Ocean Floor","colour":"#9A948A"},
      {"name":"Fence and gates","spec":"Colorbond Basalt","colour":"#6D6C6A"},
      {"name":"Letterbox","spec":"Key Largo rendered pillar: Dover White","colour":"#F4F2EC"},
      {"name":"Clothesline","spec":"Fold-down: Monument","colour":"#3E3F42"}
    ]},
    "kitchen": {"label":"Kitchen","items":[
      {"name":"Benchtops","spec":"YDL engineered stone: Crystal, 20mm","colour":"#EDEBE6","note":"Silica-free. No hot pots on stone; pH-neutral cleaner"},
      {"name":"Cabinetry","spec":"Polytec Natural Oak Matt","colour":"#C8A87A","note":"Cupboards, overheads, kickboards, rangehood fascia, pantry"},
      {"name":"Island front and sides","spec":"Polytec Classic White Ashgrain","colour":"#F1EFEA"},
      {"name":"Splashback tile","spec":"Micro Flute Matt 5MIKDMK3602, 300x600, grout 501 White","colour":"#F3F2EE"},
      {"name":"Handles","spec":"Horizontal 5076-192-BN","colour":"#8E8E8E"},
      {"name":"Sink and tap","spec":"AFA Flow double bowl, Mizu Drift gooseneck chrome (2265797)","colour":"#C9CDD1"}
    ]},
    "bathrooms": {"label":"Bathrooms","items":[
      {"name":"Main tile (floors, walls, niche)","spec":"Terrazzo Positano White POSMO2 Matte, 600x600, grout 505 Light Grey","colour":"#E9E7E1","note":"Bathroom, ensuite, WCs, porch and patio"},
      {"name":"Feature tile","spec":"Micro Flute Matt 5MIKDMK3602, 300x600, grout 501 White","colour":"#F3F2EE","note":"Bath splashback and ensuite ledge"},
      {"name":"Vanity tops","spec":"YDL stone: Crystal, 20mm","colour":"#EDEBE6"},
      {"name":"Cabinetry","spec":"Polytec Natural Oak Matt, handles 5075-128-BN","colour":"#C8A87A"},
      {"name":"Tapware","spec":"Mizu Drift: Chrome","colour":"#C9CDD1","note":"Basin 2267195, shower kit 2267361, rail 9512140"},
      {"name":"Bath","spec":"Posh Solus freestanding 1500 (1703113)","colour":"#FAFAF8"},
      {"name":"Basins and toilets","spec":"Roca The Gap 550x410, Posh Domaine back-to-wall","colour":"#FAFAF8"},
      {"name":"Mirrors and screens","spec":"Civic: matt silver micro-frame","colour":"#D6D8DA","note":"No vinegar on the aluminium"}
    ]},
    "living": {"label":"Living and Beds","items":[
      {"name":"Main flooring","spec":"Vinyl plank: Flax Oak","colour":"#C7A578"},
      {"name":"Carpet","spec":"Creative Moods: Raincloud, 7mm underlay","colour":"#AEB2B5"},
      {"name":"Walls, doors, skirting","spec":"Haymes Minimalist 1","colour":"#F0EEE8","note":"Ceilings: Ceiling White"},
      {"name":"Internal doors","spec":"Corinthian Motive MOTP 3D, matte black Lianna","colour":"#EFEDE8"},
      {"name":"Barn door","spec":"AWOBD2, Cabots Marine Clear, Cowdroy black track","colour":"#8A6A4C"},
      {"name":"Robe doors","spec":"Vinyl: Glacier, white frames","colour":"#EDF0F2"},
      {"name":"Blinds","spec":"Roller: Vibe White","colour":"#F6F5F2"},
      {"name":"Laundry","spec":"Crystal bench, Natural Oak Matt, Posh Solus tub","colour":"#EDEBE6"}
    ]}
  }'::jsonb,
  '[
    {"type":"electrical","label":"Electricity: main switch","instructions":"Meter box on the garage-side external wall. 3-phase with per-circuit safety switches, flip the MAIN SWITCH off. If solar is ever installed, also switch the PV isolators off."},
    {"type":"water","label":"Water: mains shut-off","instructions":"Water meter at the front boundary, turn the tap or lever clockwise. Hot-water-only leak: close the cold inlet isolation valve at the Rheem unit."},
    {"type":"gas","label":"Gas","instructions":"No gas connection. The house is all-electric."},
    {"type":"hot_water","label":"Hot water emergency","instructions":"Switch off at the switchboard isolator and the isolator at the unit, then close the cold inlet valve. Careful: TPR discharge water is hot. Rheem 24/7: 13 10 31."},
    {"type":"termite","label":"Termite sighting","instructions":"Do not disturb or spray, it compromises the Pledge claim. Photograph it, keep the area untouched, call Smartbuilt (job 14281259)."},
    {"type":"drain","label":"Blocked drain or sewer","instructions":"Council handles the boundary connection: (07) 3829 8999. House side: any licensed plumber."}
  ]'::jsonb,
  '{
    "viewBox":"0 0 100 168",
    "rooms":[
      {"label":"Patio","kind":"outdoor","x":6,"y":6,"w":34,"h":26},
      {"label":"Entry","x":40,"y":6,"w":16,"h":26},
      {"label":"Bed 1","x":56,"y":6,"w":26,"h":26},
      {"label":"Ensuite","kind":"wet","x":82,"y":6,"w":12,"h":20},
      {"label":"Family","x":6,"y":32,"w":50,"h":24},
      {"label":"Bed 2","x":56,"y":32,"w":38,"h":24},
      {"label":"Kitchen","x":6,"y":56,"w":22,"h":26},
      {"label":"Meals","x":28,"y":56,"w":28,"h":26},
      {"label":"Media","x":56,"y":56,"w":38,"h":22},
      {"label":"Laundry","kind":"wet","x":6,"y":82,"w":18,"h":12},
      {"label":"Bed 3","x":56,"y":78,"w":26,"h":26},
      {"label":"Bath","kind":"wet","x":82,"y":78,"w":12,"h":26},
      {"label":"Garage","kind":"garage","x":6,"y":94,"w":44,"h":60},
      {"label":"Bed 4","x":56,"y":104,"w":38,"h":26}
    ],
    "markers":[
      {"category":"emergency","type":"power","label":"Main power / meter box","x":9,"y":120,"note":"Meter box on the garage-side external wall. 3-phase with per-circuit safety switches, flip the MAIN SWITCH down to kill all power."},
      {"category":"emergency","type":"water","label":"Water mains shut-off","x":30,"y":161,"note":"Water meter at the front boundary, turn the tap or lever clockwise to shut off the whole house."},
      {"category":"emergency","type":"hot_water","label":"Hot water unit (Rheem)","x":9,"y":64,"note":"Rheem AmbiPower heat pump, external. For a hot-water-only leak: switch off its isolator and close the cold inlet valve. TPR discharge water is hot."},
      {"category":"emergency","type":"termite","label":"Termite barrier","x":12,"y":149,"note":"Termimesh perimeter barrier. If you see termites, do not disturb or spray, photograph and call Smartbuilt (job 14281259)."},
      {"category":"appliance","type":"air_con","label":"A/C outdoor unit","x":66,"y":4,"note":"Ducted A/C condenser (provide drain). Annual service is a warranty condition. Chillin 0456 734 451."},
      {"category":"appliance","type":"cooker","label":"Cooker and rangehood","x":21,"y":60,"note":"Westinghouse 90cm electric cooker with slide-out rangehood, ducted externally. Electrolux 13 13 49."},
      {"category":"appliance","type":"dishwasher","label":"Dishwasher","x":23,"y":77,"note":"Westinghouse WSF6606XB. Support: Electrolux 13 13 49."},
      {"category":"appliance","type":"garage_door","label":"Garage door","x":27,"y":150,"note":"Centurion sectional door. Annual service keeps the warranty clean. cgdoors.com.au."},
      {"category":"appliance","type":"network","label":"Wi-Fi mesh","x":24,"y":41,"note":"ASUS ZenWiFi XD5 mesh. Network allens lollies."},
      {"category":"water","type":"sink","label":"Kitchen sink and island","x":10,"y":71,"note":"Kitchen sink plus power and water to the island bench."},
      {"category":"water","type":"bath","label":"Ensuite (Bed 1)","x":88,"y":22,"note":"Bed 1 ensuite, double vanity, WC, shower."},
      {"category":"water","type":"bath","label":"Main bathroom","x":88,"y":99,"note":"Main bathroom, bath, WC, basin, shower."},
      {"category":"water","type":"laundry","label":"Laundry","x":20,"y":90,"note":"Laundry, tub and washing-machine point."}
    ]
  }'::jsonb
)
on conflict (id) do update set
  org_id = excluded.org_id,
  kind = excluded.kind,
  name = excluded.name,
  address_line1 = excluded.address_line1,
  suburb = excluded.suburb,
  state = excluded.state,
  postcode = excluded.postcode,
  lot_plan = excluded.lot_plan,
  handover_date = excluded.handover_date,
  bin_config = excluded.bin_config,
  finishes = excluded.finishes,
  emergency_shutoffs = excluded.emergency_shutoffs,
  home_map = excluded.home_map;

-- Owners ----------------------------------------------------------------------
-- Resolve by email from auth.users. Add Beck's email to the VALUES list once she
-- has signed in, then re-run.

insert into public.property_members (property_id, user_id, role)
select 'a0000000-0000-4000-8000-000000000002', u.id, 'owner'
from auth.users u
where u.email in ('markrobertallen@gmail.com')
on conflict (property_id, user_id) do update set role = excluded.role;

-- Child records: delete then reinsert for a clean re-seed ----------------------

delete from public.appliances where property_id = 'a0000000-0000-4000-8000-000000000002';
insert into public.appliances (property_id, name, brand_model, category, warranty_end, support_contact, notes) values
  ('a0000000-0000-4000-8000-000000000002','Cooker','Westinghouse WFE9546SD','cooker',date '2028-04-22','Electrolux 13 13 49','90cm dual-fuel style electric, slide-out rangehood over'),
  ('a0000000-0000-4000-8000-000000000002','Rangehood','Westinghouse WRR904SB','rangehood',date '2028-04-22','Electrolux 13 13 49','Ducted externally, wash mesh filters monthly'),
  ('a0000000-0000-4000-8000-000000000002','Dishwasher','Westinghouse WSF6606XB','dishwasher',date '2028-04-22','Electrolux 13 13 49',null),
  ('a0000000-0000-4000-8000-000000000002','Hot water','Rheem AmbiPower 280 (551E280)','hot_water',date '2036-04-22','Rheem 13 10 31 (24/7)','Heat pump. 6-monthly TPR check; 5-year major service around Apr 2031 is a warranty condition'),
  ('a0000000-0000-4000-8000-000000000002','Air conditioning','Chillin ducted, AirTouch 2+','air_con',date '2031-04-22','Chillin 0456 734 451','Annual service is a warranty condition. Filter every 3 months. Cool 23 to 24C, heat 20 to 21C'),
  ('a0000000-0000-4000-8000-000000000002','Garage door','Centurion sectional','garage_door',date '2028-04-22','cgdoors.com.au','Door 24 months, opener 5 years. Annual service is a condition'),
  ('a0000000-0000-4000-8000-000000000002','Wi-Fi mesh','ASUS ZenWiFi XD5','network',date '2029-04-22','asus.com/au/support','Network allens lollies'),
  ('a0000000-0000-4000-8000-000000000002','Security screens','Mason ScreenGuard 316 mesh','security',date '2036-04-22','screenguard.com.au','PowaWash every 2 weeks (coastal) or the 10-year warranty is void'),
  ('a0000000-0000-4000-8000-000000000002','Lighting','46 LED downlights plus 9 Hunter Pacific fans','lighting',null,'Any electrician','Downlights: replace the whole fitting, 150mm cutout, IC-4 sealed. Fan LED modules: electrician only. No solid-state dimmers on fan circuits'),
  ('a0000000-0000-4000-8000-000000000002','Smoke alarms','Interconnected photoelectric','smoke_alarm',null,'Fiteni Electrical via builder','Test and vacuum annually (QLD)');

delete from public.service_directory where property_id = 'a0000000-0000-4000-8000-000000000002';
insert into public.service_directory (property_id, name, role, phone, phone_label, email, tip, sort_order) values
  ('a0000000-0000-4000-8000-000000000002','Fiteni Homes: maintenance','Defects and builder warranty','0732454055','(07) 3245 4055','maintenance@fiteni.co','Always email with photos. Urgent (leak, electrical, security): phone and email.',0),
  ('a0000000-0000-4000-8000-000000000002','Chillin Air Conditioning','A/C service and faults','0456734451','0456 734 451 (book service)','admin@chillin.com.au','Tech support 0424 136 807. Before calling: reset breaker and isolator 15 min, photo the outdoor-unit sticker.',1),
  ('a0000000-0000-4000-8000-000000000002','Rheem Service','Hot water, 24/7','131031','13 10 31',null,'Book the 5-year major service (around Apr 2031), skipping it can void claims.',2),
  ('a0000000-0000-4000-8000-000000000002','Electrolux / Westinghouse','Cooker, rangehood, dishwasher','131349','13 13 49',null,'Have the model and serial (door sticker). Claims can also go via Fiteni.',3),
  ('a0000000-0000-4000-8000-000000000002','Smartbuilt (Termimesh)','Termite inspections and Pledge',null,'termimesh.com.au, job ref 14281259',null,'22 Pineapple St Zillmere. Book at least 60 days before each late-Oct anniversary.',4),
  ('a0000000-0000-4000-8000-000000000002','Centurion Garage Doors','Garage door service',null,'cgdoors.com.au',null,'Annual service keeps the warranty clean.',5),
  ('a0000000-0000-4000-8000-000000000002','AAMI','Building insurance claims','132244','13 22 44',null,'Photos first, make-safe repairs are OK, keep receipts. Excess $1,000.',6),
  ('a0000000-0000-4000-8000-000000000002','Energex','Power outages and faults','136262','13 62 62 (outage), 13 19 62 (emergency)',null,null,7),
  ('a0000000-0000-4000-8000-000000000002','Redland City Council','Water faults, bins, rates','0738298999','(07) 3829 8999',null,null,8),
  ('a0000000-0000-4000-8000-000000000002','SES','Storm and flood damage','132500','132 500',null,null,9);

delete from public.tasks where property_id = 'a0000000-0000-4000-8000-000000000002';
insert into public.tasks (property_id, title, category, due_date, repeat_rule, notes) values
  ('a0000000-0000-4000-8000-000000000002','Clean AC return-air filter','maintenance',date '2026-08-01','FREQ=MONTHLY;INTERVAL=3','Every 3 months. Hallway return grille, vacuum or wash and dry.'),
  ('a0000000-0000-4000-8000-000000000002','PowaWash security screens','maintenance',date '2026-07-20','FREQ=WEEKLY;INTERVAL=2','ScreenGuard 10-year warranty condition, coastal zone: every 2 weeks. Soft brush, PowaWash or neutral detergent, rinse.'),
  ('a0000000-0000-4000-8000-000000000002','Walk slab edge and foundations','maintenance',date '2026-08-15','FREQ=MONTHLY;INTERVAL=3','Keep termite inspection zones clear (75mm gardens, 30mm paving). Check drainage. Log any cracks.'),
  ('a0000000-0000-4000-8000-000000000002','Annual termite inspection','maintenance',date '2026-10-01','FREQ=YEARLY','Extends the Termimesh Pledge 1 year. Smartbuilt Brisbane, job 14281259.'),
  ('a0000000-0000-4000-8000-000000000002','Rheem hot water 6-monthly check','maintenance',date '2026-10-15','FREQ=MONTHLY;INTERVAL=6','Lift the TPR valve easing lever a few seconds, clear louvres, check the condensate hose.'),
  ('a0000000-0000-4000-8000-000000000002','Clean gutters and roof check','maintenance',date '2026-10-15','FREQ=YEARLY','Before storm season. Supports the BlueScope and Jarvis warranties.'),
  ('a0000000-0000-4000-8000-000000000002','Test and clean smoke alarms','safety',date '2027-04-01','FREQ=YEARLY','QLD annual requirement. Interconnected photoelectric.'),
  ('a0000000-0000-4000-8000-000000000002','Air-con annual service','warranty',date '2027-04-22','FREQ=YEARLY','Warranty condition. Chillin 0456 734 451.'),
  ('a0000000-0000-4000-8000-000000000002','Garage door annual service','warranty',date '2027-04-22','FREQ=YEARLY','Centurion warranty condition. cgdoors.com.au.'),
  ('a0000000-0000-4000-8000-000000000002','AAMI insurance renews','renewal',date '2027-05-01','FREQ=YEARLY','Policy HPA171742800 auto-renews. Review the sum insured.');

delete from public.key_dates where property_id = 'a0000000-0000-4000-8000-000000000002';
insert into public.key_dates (property_id, title, category, due_date, note) values
  ('a0000000-0000-4000-8000-000000000002','Fiteni 12-month defect period ends','warranty',date '2027-04-22','Fiteni Homes, Form 21 and building contract. Submit ONE written list with photos to maintenance@fiteni.co before this date.'),
  ('a0000000-0000-4000-8000-000000000002','AAMI building insurance renews','renewal',date '2027-05-01','AAMI, policy HPA171742800. 13 22 44 or aami.com.au/login. Excess $1,000. Auto-renews.'),
  ('a0000000-0000-4000-8000-000000000002','Westinghouse appliance warranties end','warranty',date '2028-04-22','Electrolux. Westinghouse manuals (24 months). Via maintenance@fiteni.co, or Electrolux 13 13 49 with proof of purchase.'),
  ('a0000000-0000-4000-8000-000000000002','Garage door (door) warranty ends','warranty',date '2028-04-22','Centurion warranty booklet. cgdoors.com.au, annual service keeps it valid.'),
  ('a0000000-0000-4000-8000-000000000002','2-year warranty check','warranty',date '2028-03-01','Garage door and Westinghouse appliances, test everything before warranties lapse.'),
  ('a0000000-0000-4000-8000-000000000002','Garage door opener warranty ends','warranty',date '2031-04-22','Centurion (5 years). cgdoors.com.au.'),
  ('a0000000-0000-4000-8000-000000000002','Rheem 5-year major service due','warranty',date '2031-04-22','Required or Rheem can reject claims. Rheem 131 031.'),
  ('a0000000-0000-4000-8000-000000000002','QBCC structural warranty ends','warranty',date '2032-10-22','QBCC and Fiteni. Report to Fiteni in writing, QBCC 139 333 if unresolved.'),
  ('a0000000-0000-4000-8000-000000000002','Termimesh Pledge Guarantee expires','warranty',date '2035-10-27','Smartbuilt Brisbane, job 14281259. Extendable 1 year per annual inspection, book at least 60 days before each anniversary.'),
  ('a0000000-0000-4000-8000-000000000002','ScreenGuard security screens warranty ends','warranty',date '2036-04-22','Mason Security Screens. Conditional on PowaWash cleaning, coastal every 2 weeks.'),
  ('a0000000-0000-4000-8000-000000000002','Rheem cylinder warranty ends','warranty',date '2036-04-22','Rheem 551E280 (10 years). 13 10 31, the 5-year major service is a condition.');

commit;
