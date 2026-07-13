-- Migration 001: core schema
-- Homer platform, Phase 0 ticket P0.6.
--
-- Lays down the full tenant-keyed relational skeleton the platform hangs off:
-- orgs, org_members, property_groups, properties, property_members, appliances,
-- documents (3-layer), shared_assets, chats, chat_messages, tasks, key_dates,
-- service_directory.
--
-- Scope boundary (do not widen here):
--   * Schema only. RLS POLICIES are P0.7, defect tables P0.8, storage buckets
--     P0.9, audit log P0.10, embeddings/RAG P0.17.
--   * RLS is ENABLED on every table here with zero policies, so every table is
--     deny-all by default. This closes any exposure window between this
--     migration landing and P0.7 writing the policies. The lock is 001's job,
--     the policies are P0.7's.
--
-- Rules honoured (CLAUDE.md):
--   * No em dashes anywhere, including these comments.
--   * Chat rows are creator-only (rule 2): chat_messages.user_id is denormalised
--     from chats.user_id so the P0.7 policy is a single-column check, no join.
--   * Tenant isolation via RLS only, single database (rule, PRD 8a).
--
-- Design decisions baked in (confirmed with Mark, 13 July 2026):
--   * Finishes, emergency shut-offs and home-map hot dots are stored as jsonb on
--     properties (not dedicated tables). Cheapest correct option for Demo 1 and
--     P0.11b, and these blobs fetch whole with the property row which suits the
--     offline emergency cache (rule 5). Hot dots can normalise later when Phase 1
--     defect intake needs to link a pin to an appliance.
--   * documents carries its own org_id (denormalised) so org-layer and
--     shared-layer docs are always tenant-isolable even when property_id is null.
--   * No dedicated warranties table yet: warranty data folds into key_dates
--     (category 'warranty') plus per-appliance warranty_end and support_contact.
--     A real warranties table is a likely near-term add for the claim helper.
--   * No emoji stored: appliance and marker "type" fields are slugs that map to
--     the Tabler icon sprite (no emoji in UI).

-- Extensions ------------------------------------------------------------------

-- pgvector, enabled here per docs/infrastructure.md which pins enablement to
-- P0.6. No vector columns land yet; the embeddings table is P0.17.
create extension if not exists vector with schema extensions;

-- Shared helper: set updated_at on write -------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
-- Pinned empty search_path so the function cannot be hijacked by a mutable
-- role search_path. now() resolves from pg_catalog, which is always in scope.
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Trigger helper: stamps updated_at = now() on every row update.';

-- Enums (closed sets) ---------------------------------------------------------

create type public.org_kind as enum ('builder', 'developer');
create type public.org_member_role as enum ('admin', 'member');
create type public.property_group_kind as enum ('estate', 'building', 'portfolio');
create type public.property_kind as enum ('home', 'unit');
create type public.property_member_role as enum ('owner', 'member', 'resident');
create type public.document_layer as enum ('org', 'owner', 'shared');
create type public.chat_role as enum ('user', 'assistant', 'system');
create type public.key_date_category as enum ('maintenance', 'warranty', 'renewal', 'safety');

-- orgs ------------------------------------------------------------------------

create table public.orgs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  kind        public.org_kind not null default 'builder',
  abn         text,
  branding    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.orgs is
  'Builder or developer organisation. Root of the tenancy tree; every tenant-keyed row descends from an org.';
comment on column public.orgs.branding is
  'Org branding blob: logo, colours, hero image. Populated at org onboarding (Phase 1 portal).';

create trigger orgs_set_updated_at
  before update on public.orgs
  for each row execute function public.set_updated_at();

alter table public.orgs enable row level security;

-- org_members -----------------------------------------------------------------

create table public.org_members (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.orgs (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        public.org_member_role not null default 'member',
  created_at  timestamptz not null default now(),
  unique (org_id, user_id)
);

comment on table public.org_members is
  'User to org membership with role. admin can provision and edit; member can work defects, not billing or provisioning (PRD 8a).';

create index org_members_org_id_idx on public.org_members (org_id);
create index org_members_user_id_idx on public.org_members (user_id);

alter table public.org_members enable row level security;

-- property_groups -------------------------------------------------------------

create table public.property_groups (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.orgs (id) on delete cascade,
  name        text not null,
  kind        public.property_group_kind not null default 'estate',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.property_groups is
  'Optional grouping of properties: estate, building or portfolio. A building group carries the multi-res building doc and plant layer (Phase 2).';

create index property_groups_org_id_idx on public.property_groups (org_id);

create trigger property_groups_set_updated_at
  before update on public.property_groups
  for each row execute function public.set_updated_at();

alter table public.property_groups enable row level security;

-- properties ------------------------------------------------------------------

create table public.properties (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.orgs (id) on delete cascade,
  group_id      uuid references public.property_groups (id) on delete set null,
  kind          public.property_kind not null default 'home',
  name          text not null,
  address_line1 text,
  suburb        text,
  state         text,
  postcode      text,
  lot_plan      text,
  handover_date date,
  bin_config    jsonb not null default '{}'::jsonb,
  finishes      jsonb not null default '{}'::jsonb,
  emergency_shutoffs jsonb not null default '[]'::jsonb,
  home_map      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.properties is
  'A home or unit. The tenant-keyed spine: appliances, documents, chats, tasks, key_dates and the service directory all reference a property.';
comment on column public.properties.lot_plan is
  'Lot and plan identifier, for example "Lot 120 SP336107".';
comment on column public.properties.handover_date is
  'Handover date. Defect and structural warranty periods auto-calculate from this.';
comment on column public.properties.bin_config is
  'Bin schedule blob: collection day, rotation anchor and pattern. From postcode lookup, org confirmed.';
comment on column public.properties.finishes is
  'Materials and finishes board, grouped (exterior, kitchen, bathrooms, living). Org-layer reference content shown on the House tab.';
comment on column public.properties.emergency_shutoffs is
  'Ordered list of emergency shut-offs, each keyed by type (water, gas, electrical, hot_water, other) so the pre-LLM emergency rules (rule 5) and the offline cache can read them by type.';
comment on column public.properties.home_map is
  'Home map phase 1: floor-plan rooms, hot-dot markers and viewBox. Hand-pinned for Demo 1; AI-generated stylised plan is Phase 2.';

create index properties_org_id_idx on public.properties (org_id);
create index properties_group_id_idx on public.properties (group_id);

create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

alter table public.properties enable row level security;

-- property_members ------------------------------------------------------------

create table public.property_members (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        public.property_member_role not null default 'owner',
  created_at  timestamptz not null default now(),
  unique (property_id, user_id)
);

comment on table public.property_members is
  'User to property membership. owner and member have full property context; resident is unit-scoped with building-level docs flagged resident-visible (PRD 6).';

create index property_members_property_id_idx on public.property_members (property_id);
create index property_members_user_id_idx on public.property_members (user_id);

alter table public.property_members enable row level security;

-- shared_assets ---------------------------------------------------------------
-- Defined before documents and appliances because both reference it.

create table public.shared_assets (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.orgs (id) on delete cascade,
  name        text not null,
  brand_model text,
  category    text,
  spec        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.shared_assets is
  'Org-level asset library: an appliance, product or document defined once and inherited by every property that references it (PRD 7.5). Template cloning pulls from here.';
comment on column public.shared_assets.spec is
  'Reusable asset detail: manual reference, warranty terms, quick-start notes.';

create index shared_assets_org_id_idx on public.shared_assets (org_id);

create trigger shared_assets_set_updated_at
  before update on public.shared_assets
  for each row execute function public.set_updated_at();

alter table public.shared_assets enable row level security;

-- appliances ------------------------------------------------------------------

create table public.appliances (
  id              uuid primary key default gen_random_uuid(),
  property_id     uuid not null references public.properties (id) on delete cascade,
  shared_asset_id uuid references public.shared_assets (id) on delete set null,
  name            text not null,
  brand_model     text,
  category        text,
  warranty_end    date,
  support_contact text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.appliances is
  'Appliance registry per property. May inherit from a shared_asset. warranty_end drives the per-appliance countdown; the maintenance ledger and linked doc bundles attach here.';
comment on column public.appliances.category is
  'Icon and grouping slug (for example cooker, rangehood, hot_water, air_con) mapped to the Tabler sprite. No emoji stored.';
comment on column public.appliances.support_contact is
  'Plain-text service contact, for example "Electrolux 13 13 49".';

create index appliances_property_id_idx on public.appliances (property_id);
create index appliances_shared_asset_id_idx on public.appliances (shared_asset_id);

create trigger appliances_set_updated_at
  before update on public.appliances
  for each row execute function public.set_updated_at();

alter table public.appliances enable row level security;

-- documents -------------------------------------------------------------------

create table public.documents (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references public.orgs (id) on delete cascade,
  property_id       uuid references public.properties (id) on delete cascade,
  shared_asset_id   uuid references public.shared_assets (id) on delete set null,
  layer             public.document_layer not null,
  uploaded_by       uuid references auth.users (id) on delete set null,
  title             text,
  canonical_name    text,
  original_filename text,
  storage_path      text,
  content_type      text,
  size_bytes        bigint,
  tags              text[] not null default '{}',
  content_hash      text,
  locked_at         timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- Org and owner layer docs belong to a property; shared-layer docs belong to
  -- a shared_asset library entry. org_id is always present so every document is
  -- tenant-isolable even when property_id is null.
  constraint documents_layer_target_ck check (
    (layer in ('org', 'owner') and property_id is not null)
    or (layer = 'shared' and shared_asset_id is not null)
  )
);

comment on table public.documents is
  'Three-layer document model (PRD 6): org layer (sideloaded, read-only to owner, locked as an immutable archive copy at handover), owner layer (owner uploads, fully editable), shared-asset layer (org library). The AI reads only the layers a user is entitled to.';
comment on column public.documents.org_id is
  'Denormalised tenant key. Always set so org-layer and shared-layer docs are isolable even when property_id is null.';
comment on column public.documents.canonical_name is
  'AI-normalised canonical name. original_filename keeps the source name as metadata (no enforced naming convention, PRD 8b).';
comment on column public.documents.locked_at is
  'Set when this row becomes part of the immutable archive copy at handover. content_hash is stamped at the same time (rule 7).';
comment on column public.documents.content_hash is
  'Hash of the stored file, stamped when the archive copy locks, for dispute-evidence integrity.';

create index documents_org_id_idx on public.documents (org_id);
create index documents_property_id_idx on public.documents (property_id);
create index documents_shared_asset_id_idx on public.documents (shared_asset_id);

create trigger documents_set_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

alter table public.documents enable row level security;

-- chats -----------------------------------------------------------------------

create table public.chats (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.chats is
  'A chat thread scoped to a property. user_id is the creator; chat rows are visible ONLY to their creator (rule 2), enforced by RLS in P0.7.';

create index chats_property_id_idx on public.chats (property_id);
create index chats_user_id_idx on public.chats (user_id);

create trigger chats_set_updated_at
  before update on public.chats
  for each row execute function public.set_updated_at();

alter table public.chats enable row level security;

-- chat_messages ---------------------------------------------------------------

create table public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  chat_id     uuid not null references public.chats (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        public.chat_role not null,
  content     text not null,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

comment on table public.chat_messages is
  'Messages within a chat. user_id is denormalised from chats.user_id so the creator-only RLS policy (rule 2) is a single-column check with no join. Cost and token metering fields are wired in P0.16 via metadata.';
comment on column public.chat_messages.metadata is
  'Per-message metadata: model, token counts, cost, latency. Populated by the gateway in P0.16.';

create index chat_messages_chat_id_idx on public.chat_messages (chat_id);
create index chat_messages_user_id_idx on public.chat_messages (user_id);

alter table public.chat_messages enable row level security;

-- tasks -----------------------------------------------------------------------

create table public.tasks (
  id               uuid primary key default gen_random_uuid(),
  property_id      uuid not null references public.properties (id) on delete cascade,
  title            text not null,
  notes            text,
  category         public.key_date_category not null default 'maintenance',
  due_date         date,
  repeat_rule      text,
  last_completed_at date,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.tasks is
  'Recurring, tick-off-able maintenance and safety actions (for example clean AC filter every 3 months). repeat_rule holds the recurrence; key_dates holds fixed milestone countdowns.';
comment on column public.tasks.repeat_rule is
  'Recurrence string, for example "FREQ=MONTHLY;INTERVAL=3". Empty or null means a one-off task.';
comment on column public.tasks.last_completed_at is
  'Date the task was last ticked off. The next due date derives from this plus repeat_rule.';

create index tasks_property_id_idx on public.tasks (property_id);

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

alter table public.tasks enable row level security;

-- key_dates -------------------------------------------------------------------

create table public.key_dates (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  title       text not null,
  category    public.key_date_category not null default 'warranty',
  due_date    date not null,
  note        text,
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.key_dates is
  'Fixed milestone dates and countdowns: warranty ends, structural warranty expiry, insurance renewal, defect-list due. Drives the Dates tab countdowns and the warranty claim helper.';
comment on column public.key_dates.created_by is
  'Null for system or org sourced dates; set to the user for owner-added dates.';

create index key_dates_property_id_idx on public.key_dates (property_id);

create trigger key_dates_set_updated_at
  before update on public.key_dates
  for each row execute function public.set_updated_at();

alter table public.key_dates enable row level security;

-- service_directory -----------------------------------------------------------

create table public.service_directory (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  name        text not null,
  role        text,
  phone       text,
  phone_label text,
  email       text,
  tip         text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.service_directory is
  'One-tap service directory per property: org-preloaded trades plus the owner''s own contacts.';
comment on column public.service_directory.phone is
  'Dialable digits, for example "0732454055".';
comment on column public.service_directory.phone_label is
  'Human-readable phone, for example "(07) 3245 4055".';

create index service_directory_property_id_idx on public.service_directory (property_id);

create trigger service_directory_set_updated_at
  before update on public.service_directory
  for each row execute function public.set_updated_at();

alter table public.service_directory enable row level security;
