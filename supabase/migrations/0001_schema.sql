-- Grabbit schema (PRD §7 data model)

create type chain_data_source as enum ('feed', 'community');
create type deal_source as enum ('store_data', 'community', 'coupon');
create type deal_category as enum
  ('meat', 'produce', 'dairy', 'bakery', 'frozen', 'pantry', 'household', 'other');
create type deal_status as enum ('active', 'expired', 'hidden');
create type vote_kind as enum ('confirmed', 'gone');
create type report_reason as enum ('wrong_price', 'not_a_deal', 'inappropriate_photo', 'spam');

create table chains (
  id text primary key,
  name text not null,
  slug text not null unique,
  logo_url text,
  data_source chain_data_source not null
);

create table stores (
  id text primary key,
  chain_id text not null references chains(id),
  name text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  city text not null,
  state text not null default 'MA'
);

-- Profile row per auth user (auth.users is the source of truth for identity).
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  email text not null,
  points integer not null default 0,
  level integer not null default 1,
  badges text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table deals (
  id uuid primary key default gen_random_uuid(),
  store_id text not null references stores(id),
  source deal_source not null,
  title text not null check (char_length(title) between 1 and 80),
  category deal_category not null,
  price_cents integer not null check (price_cents > 0),
  original_price_cents integer not null check (original_price_cents > price_cents),
  discount_pct integer generated always as
    (round((1 - price_cents::numeric / original_price_cents) * 100)) stored,
  photo_url text,
  note text check (char_length(note) <= 100),
  aisle text check (char_length(aisle) <= 40),
  posted_by uuid references users(id),
  posted_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '48 hours',
  status deal_status not null default 'active',
  posted_from_lat double precision,
  posted_from_lng double precision,
  constraint community_needs_poster check (source <> 'community' or posted_by is not null),
  constraint community_needs_photo check (source <> 'community' or photo_url is not null)
);

create index deals_feed_idx on deals (status, posted_at desc);
create index deals_store_idx on deals (store_id, category, posted_at desc);
create index deals_poster_idx on deals (posted_by, posted_at desc);

create table votes (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  kind vote_kind not null,
  created_at timestamptz not null default now(),
  unique (deal_id, user_id) -- FR-8: one vote per user per deal
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  reason report_reason not null,
  created_at timestamptz not null default now(),
  unique (deal_id, user_id)
);

-- FR-11: append-only points ledger
create table points_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  delta integer not null,
  reason text not null,
  deal_id uuid references deals(id) on delete set null,
  created_at timestamptz not null default now()
);

create index ledger_user_idx on points_ledger (user_id, created_at desc);

create table coupons (
  id uuid primary key default gen_random_uuid(),
  chain_id text not null references chains(id),
  title text not null,
  description text not null default '',
  value_text text not null,
  url text not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null
);

-- One read shape for all deal sources (PRD API contract).
create view deals_view with (security_invoker = on) as
select
  d.id, d.store_id, d.source, d.title, d.category,
  d.price_cents, d.original_price_cents, d.discount_pct,
  d.photo_url, d.note, d.aisle, d.posted_by,
  u.username as posted_by_name,
  coalesce(u.level, 0) as posted_by_level,
  d.posted_at, d.expires_at, d.status,
  coalesce(v.confirmed_count, 0)::int as confirmed_count,
  coalesce(v.gone_count, 0)::int as gone_count,
  mv.kind as my_vote
from deals d
left join users u on u.id = d.posted_by
left join lateral (
  select
    count(*) filter (where kind = 'confirmed') as confirmed_count,
    count(*) filter (where kind = 'gone') as gone_count
  from votes where deal_id = d.id
) v on true
left join votes mv on mv.deal_id = d.id and mv.user_id = auth.uid();
