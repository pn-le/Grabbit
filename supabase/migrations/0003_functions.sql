-- Business logic RPCs. SECURITY DEFINER so RLS write policies stay closed;
-- every function validates auth.uid() itself.

-- Auto-create profile on signup (username from magic-link metadata)
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into users (id, username, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', 'shopper_' || left(new.id::text, 8)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

create or replace function level_for_points(p integer)
returns integer language sql immutable as $$
  select case when p >= 2000 then 4 when p >= 500 then 3 when p >= 100 then 2 else 1 end
$$;

create or replace function award_points(p_user uuid, p_delta integer, p_reason text, p_deal uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into points_ledger (user_id, delta, reason, deal_id)
  values (p_user, p_delta, p_reason, p_deal);
  update users
  set points = points + p_delta, level = level_for_points(points + p_delta)
  where id = p_user;
end $$;

-- Feed read: one endpoint shape for all sources (PRD API contract).
create or replace function get_deals(
  p_store_ids text[] default null,
  p_categories text[] default null,
  p_source text default null,
  p_sort text default 'newest',
  p_lat double precision default 42.3555,
  p_lng double precision default -71.0603,
  p_limit integer default 21,
  p_offset integer default 0
)
returns setof deals_view language sql stable as $$
  select dv.*
  from deals_view dv
  join stores s on s.id = dv.store_id
  where dv.status = 'active'
    and dv.expires_at > now()
    -- FR-2: net-gone >= 3 drops from default feed
    and not (dv.source = 'community' and dv.gone_count - dv.confirmed_count >= 3)
    and (p_store_ids is null or dv.store_id = any (p_store_ids))
    and (p_categories is null or dv.category::text = any (p_categories))
    and (p_source is null or dv.source::text = p_source)
  order by
    case when p_sort = 'newest' then extract(epoch from dv.posted_at) end desc,
    case when p_sort = 'discount' then dv.discount_pct end desc,
    case when p_sort = 'nearest' then
      2 * 6371 * asin(sqrt(
        sin(radians(s.lat - p_lat) / 2) ^ 2 +
        cos(radians(p_lat)) * cos(radians(s.lat)) * sin(radians(s.lng - p_lng) / 2) ^ 2
      ))
    end asc
  limit p_limit offset p_offset
$$;

create or replace function vote_on_deal(p_deal_id uuid, p_kind vote_kind)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_deal deals%rowtype;
  v_confirms integer;
begin
  if auth.uid() is null then raise exception 'Sign in to vote'; end if;
  select * into v_deal from deals where id = p_deal_id;
  if not found then raise exception 'Deal not found'; end if;
  if v_deal.source <> 'community' then
    raise exception 'Store-data deals are verified, not voted';
  end if;
  if v_deal.posted_by = auth.uid() then
    raise exception 'You cannot vote on your own post';
  end if;

  insert into votes (deal_id, user_id, kind) values (p_deal_id, auth.uid(), p_kind);
  -- unique(deal_id, user_id) enforces FR-8's one-vote rule

  perform award_points(auth.uid(), 1, 'vote', p_deal_id);

  -- Confirmed-by-others bonus to the poster on their first confirmation
  if p_kind = 'confirmed' then
    select count(*) into v_confirms from votes
    where deal_id = p_deal_id and kind = 'confirmed';
    if v_confirms = 1 and v_deal.posted_by is not null then
      perform award_points(v_deal.posted_by, 5, 'confirmed_bonus', p_deal_id);
    end if;
  end if;
end $$;

create or replace function report_deal(p_deal_id uuid, p_reason report_reason)
returns void language plpgsql security definer set search_path = public as $$
declare v_count integer;
begin
  if auth.uid() is null then raise exception 'Sign in to report'; end if;
  insert into reports (deal_id, user_id, reason) values (p_deal_id, auth.uid(), p_reason)
  on conflict (deal_id, user_id) do nothing;
  select count(*) into v_count from reports where deal_id = p_deal_id;
  if v_count >= 3 then -- FR-9: auto-hide pending review
    update deals set status = 'hidden' where id = p_deal_id and status = 'active';
  end if;
end $$;

create or replace function post_deal(
  p_store_id text,
  p_title text,
  p_category deal_category,
  p_price_cents integer,
  p_original_price_cents integer,
  p_photo_url text,
  p_note text default null,
  p_aisle text default null,
  p_lat double precision default null,
  p_lng double precision default null
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_user users%rowtype;
  v_today integer;
  v_total integer;
  v_deal_id uuid;
  v_at_store boolean := false;
  v_points integer := 10;
  v_new_badges text[] := '{}';
  v_store stores%rowtype;
  v_store_posts integer;
begin
  if auth.uid() is null then raise exception 'Sign in to post'; end if;
  select * into v_user from users where id = auth.uid();

  -- FR-8: 20 posts/day; FR-10: new accounts (<24h) capped at 3 posts
  select count(*) into v_today from deals
  where posted_by = auth.uid() and posted_at > now() - interval '24 hours';
  if v_today >= 20 then raise exception 'Daily post limit reached (20/day)'; end if;
  select count(*) into v_total from deals where posted_by = auth.uid();
  if v_user.created_at > now() - interval '24 hours' and v_total >= 3 then
    raise exception 'New accounts are limited to 3 posts in the first 24h';
  end if;

  select * into v_store from stores where id = p_store_id;
  if not found then raise exception 'Unknown store'; end if;

  -- FR-6: at-store bonus only within 1km
  if p_lat is not null and p_lng is not null then
    v_at_store := 2 * 6371 * asin(sqrt(
      sin(radians(v_store.lat - p_lat) / 2) ^ 2 +
      cos(radians(p_lat)) * cos(radians(v_store.lat)) *
      sin(radians(v_store.lng - p_lng) / 2) ^ 2
    )) <= 1.0;
  end if;
  if v_at_store then v_points := v_points + 2; end if;

  insert into deals (store_id, source, title, category, price_cents, original_price_cents,
                     photo_url, note, aisle, posted_by, posted_from_lat, posted_from_lng)
  values (p_store_id, 'community', p_title, p_category, p_price_cents, p_original_price_cents,
          p_photo_url, p_note, p_aisle, auth.uid(), p_lat, p_lng)
  returning id into v_deal_id;

  -- FR-12 badges
  if not v_user.badges @> array['first_post'] then
    v_new_badges := v_new_badges || 'first_post';
  end if;
  if extract(hour from now() at time zone 'America/New_York') < 8
     and not v_user.badges @> array['early_bird'] then
    v_new_badges := v_new_badges || 'early_bird';
  end if;
  select count(*) into v_store_posts from deals
  where posted_by = auth.uid() and store_id = p_store_id;
  if v_store_posts >= 10 and not v_user.badges @> array['store_regular'] then
    v_new_badges := v_new_badges || 'store_regular';
  end if;
  if array_length(v_new_badges, 1) > 0 then
    update users set badges = badges || v_new_badges where id = auth.uid();
  end if;

  perform award_points(auth.uid(), v_points, 'post', v_deal_id);

  return jsonb_build_object(
    'deal_id', v_deal_id,
    'points_earned', v_points,
    'new_badges', to_jsonb(v_new_badges)
  );
end $$;

-- FR-11: weekly board resets Monday 00:00 ET (computed from the ledger)
create or replace function get_leaderboard(p_store_id text default null, p_period text default 'weekly')
returns table (user_id uuid, username text, level integer, points bigint)
language sql stable as $$
  select u.id, u.username, u.level, sum(pl.delta)::bigint as points
  from points_ledger pl
  join users u on u.id = pl.user_id
  left join deals d on d.id = pl.deal_id
  where (p_store_id is null or d.store_id = p_store_id)
    and (
      p_period <> 'weekly'
      or pl.created_at >= date_trunc('week', now() at time zone 'America/New_York')
         at time zone 'America/New_York'
    )
  group by u.id, u.username, u.level
  having sum(pl.delta) > 0
  order by points desc
  limit 10
$$;

-- FR-2 sweep: called by the expire-deals edge function (or pg_cron)
create or replace function expire_deals()
returns integer language plpgsql security definer set search_path = public as $$
declare v_count integer;
begin
  update deals set status = 'expired'
  where status = 'active' and source = 'community' and expires_at < now();
  get diagnostics v_count = row_count;
  return v_count;
end $$;
