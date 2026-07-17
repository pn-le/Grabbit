-- Grabbit demo seed (PRD §7 required deliverable).
-- Chains, ~65 real Boston-area stores, 10 demo users, ~150 demo deals
-- (staggered over the past 48h), ~30 coupons. Demo photos are null →
-- the client renders a labeled placeholder.
-- Regenerate store block with: node scripts/generate-seed-sql.mjs

insert into chains (id, name, slug, data_source) values
  ('walmart', 'Walmart', 'walmart', 'feed'),
  ('target', 'Target', 'target', 'feed'),
  ('stopshop', 'Stop & Shop', 'stop-and-shop', 'community'),
  ('starmarket', 'Star Market', 'star-market', 'community'),
  ('marketbasket', 'Market Basket', 'market-basket', 'community')
on conflict (id) do nothing;

-- {{STORES}}

-- Demo users: rows in auth.users (password login disabled — no password set)
-- plus profiles. Fixed UUIDs so re-running is idempotent.
do $seed_users$
declare
  names text[] := array['yellowtag_yara','markdown_mike','clearance_queen','basket_case_ben',
    'thrifty_theresa','dealhopper_dan','savvy_sofia','coupon_carl','boston_bargains','newbie_nina'];
  pts integer[] := array[2340, 1180, 890, 610, 445, 260, 175, 120, 65, 20];
  bdg text[][] := array[
    array['first_post','ten_confirmed','store_regular','early_bird'],
    array['first_post','ten_confirmed','store_regular', null],
    array['first_post','ten_confirmed','early_bird', null],
    array['first_post','store_regular', null, null],
    array['first_post','ten_confirmed', null, null],
    array['first_post','early_bird', null, null],
    array['first_post', null, null, null],
    array['first_post', null, null, null],
    array['first_post', null, null, null],
    array['first_post', null, null, null]];
  uid uuid;
  i integer;
begin
  for i in 1..10 loop
    uid := ('00000000-0000-4000-a000-00000000000' || (i - 1))::uuid;
    insert into auth.users (instance_id, id, aud, role, email, email_confirmed_at,
                            raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
            names[i] || '@demo.grabbit.app', now(),
            '{"provider":"email","providers":["email"]}',
            jsonb_build_object('username', names[i]),
            now() - (30 + i * 9) * interval '1 day', now())
    on conflict (id) do nothing;

    insert into users (id, username, email, points, level, badges, created_at)
    values (uid, names[i], names[i] || '@demo.grabbit.app', pts[i],
            level_for_points(pts[i]),
            (select array_agg(b) from unnest(bdg[i:i][1:4]) b where b is not null),
            now() - (30 + i * 9) * interval '1 day')
    on conflict (id) do update set points = excluded.points, level = excluded.level;

    -- backfill the ledger so leaderboards have history (half in the last week)
    insert into points_ledger (user_id, delta, reason, created_at)
    values (uid, pts[i] / 2, 'seed_backfill', now() - interval '30 days'),
           (uid, pts[i] - pts[i] / 2, 'seed_backfill', now() - interval '2 days');
  end loop;
end $seed_users$;

-- ~150 demo deals staggered over the past 48h, 20–70% off
do $seed_deals$
declare
  titles text[] := array[
    'Boneless Chicken Thighs (family pack)','80/20 Ground Beef 2lb','Pork Tenderloin',
    'Atlantic Salmon Fillet','NY Strip Steak (manager special)','Rotisserie Chicken (day-of)',
    'Organic Baby Spinach 10oz','Strawberries 1lb','Avocados 4-pack','Honeycrisp Apples 3lb bag',
    'Salad Kit — Caesar','Greek Yogurt 32oz','Shredded Mozzarella 16oz','Cage-Free Eggs (dozen)',
    'Fancy Cheese Wedge (brie)','Sourdough Boule (bakery)','Blueberry Muffins 4-ct',
    'Bagels 6-ct (day-old)','Croissants 4-pack','Frozen Pizza (rising crust)',
    'Ice Cream Pint (premium)','Frozen Shrimp 1lb (31-40ct)','Pasta Sauce (jar)',
    'Olive Oil 500ml','Ground Coffee 12oz','Jasmine Rice 5lb','Laundry Detergent 96oz',
    'Paper Towels 6 rolls','Trash Bags 45-ct','Sushi Tray (evening markdown)'];
  cats deal_category[] := array[
    'meat','meat','meat','meat','meat','meat',
    'produce','produce','produce','produce','produce',
    'dairy','dairy','dairy','dairy','bakery','bakery','bakery','bakery',
    'frozen','frozen','frozen','pantry','pantry','pantry','pantry',
    'household','household','household','other']::deal_category[];
  notes text[] := array['Yellow sticker rack near the deli','Big pile of these, moving fast',
    'Sell-by tomorrow — freeze it!','End cap by the registers','Manager special, tons left',
    null, null, null];
  v_store record;
  v_user_ids uuid[];
  n integer;
  orig integer;
  disc numeric;
  price integer;
  ts timestamptz;
  is_feed boolean;
begin
  select array_agg(id) into v_user_ids from users where email like '%@demo.grabbit.app';

  for n in 1..150 loop
    select s.id as store_id, c.data_source into v_store
    from stores s join chains c on c.id = s.chain_id
    order by random() limit 1;
    is_feed := v_store.data_source = 'feed';

    orig := (300 + floor(random() * 1700))::integer;      -- $3–$20
    disc := 0.2 + random() * 0.5;                          -- 20–70%
    price := greatest(49, (orig * (1 - disc))::integer);
    ts := now() - (random() * 48 * 60)::integer * interval '1 minute';

    insert into deals (store_id, source, title, category, price_cents, original_price_cents,
                       photo_url, note, aisle, posted_by, posted_at, expires_at, status)
    values (
      v_store.store_id,
      case when is_feed then 'store_data' else 'community' end::deal_source,
      titles[1 + floor(random() * array_length(titles, 1))::integer],
      cats[1 + floor(random() * array_length(cats, 1))::integer],
      price, orig,
      case when is_feed then null
           else 'https://placehold.co/600x400/facc15/0a0a0a?text=DEMO' end,
      case when is_feed then null else notes[1 + floor(random() * 8)::integer] end,
      null,
      case when is_feed then null
           else v_user_ids[1 + floor(random() * array_length(v_user_ids, 1))::integer] end,
      ts, ts + interval '48 hours', 'active');
  end loop;
end $seed_deals$;

-- ~30 coupons (6 per chain)
insert into coupons (chain_id, title, description, value_text, url, starts_at, ends_at)
select c.id, d.title, d.title || ' · ' || c.name, d.value_text,
  case c.id
    when 'walmart' then 'https://www.walmart.com/shop/deals'
    when 'target' then 'https://www.target.com/circle'
    when 'stopshop' then 'https://stopandshop.com/savings'
    when 'starmarket' then 'https://www.starmarket.com/foru/coupons-deals.html'
    else 'https://www.shopmarketbasket.com/weekly-flyer' end,
  now() - interval '1 day',
  now() + (2 + floor(random() * 7)::integer) * interval '1 day'
from chains c
cross join (values
  ('$5 off $50 grocery purchase', '$5 off'),
  ('BOGO 50% — all cereal', 'BOGO 50%'),
  ('20% off fresh produce Fri–Sun', '20% off'),
  ('$2 off any 2 dairy items', '$2 off 2'),
  ('Free bakery item with $25+', 'Freebie'),
  ('10¢/gal fuel points on gift cards', 'Fuel pts')
) as d(title, value_text);
