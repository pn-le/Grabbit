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

insert into stores (id, chain_id, name, address, lat, lng, city, state) values
  ('wm-quincy', 'walmart', 'Walmart Quincy', '301 Falls Blvd', 42.2705, -71.0244, 'Quincy', 'MA'),
  ('wm-saugus', 'walmart', 'Walmart Saugus', '770 Broadway (Rt 1)', 42.4837, -71.0201, 'Saugus', 'MA'),
  ('wm-lynn', 'walmart', 'Walmart Lynn', '780 Lynnway', 42.4515, -70.9709, 'Lynn', 'MA'),
  ('wm-chelmsford', 'walmart', 'Walmart Supercenter Chelmsford', '66 Drum Hill Rd', 42.6236, -71.3800, 'Chelmsford', 'MA'),
  ('wm-walpole', 'walmart', 'Walmart Supercenter Walpole', '550 Providence Hwy', 42.1573, -71.2438, 'Walpole', 'MA'),
  ('wm-danvers', 'walmart', 'Walmart Danvers', '55 Brooksby Village Way', 42.5519, -70.9497, 'Danvers', 'MA'),
  ('wm-framingham', 'walmart', 'Walmart Framingham', '121 Worcester Rd', 42.2986, -71.3855, 'Framingham', 'MA'),
  ('wm-weymouth', 'walmart', 'Walmart Weymouth', '740 Middle St', 42.1966, -70.9448, 'Weymouth', 'MA'),
  ('tg-fenway', 'target', 'Target Boston Fenway', '1341 Boylston St', 42.3444, -71.1005, 'Boston', 'MA'),
  ('tg-southbay', 'target', 'Target Boston South Bay', '7 Allstate Rd', 42.3272, -71.0637, 'Dorchester', 'MA'),
  ('tg-central', 'target', 'Target Boston Central (Downtown)', '1 Summer St', 42.3550, -71.0606, 'Boston', 'MA'),
  ('tg-porter', 'target', 'Target Cambridge Porter Square', '822 Somerville Ave', 42.3884, -71.1195, 'Cambridge', 'MA'),
  ('tg-centralsq', 'target', 'Target Cambridge Central Square', '564 Massachusetts Ave', 42.3654, -71.1032, 'Cambridge', 'MA'),
  ('tg-somerville', 'target', 'Target Somerville', '180 Somerville Ave', 42.3768, -71.0910, 'Somerville', 'MA'),
  ('tg-everett', 'target', 'Target Everett', '1 Mystic View Rd', 42.3963, -71.0684, 'Everett', 'MA'),
  ('tg-watertown', 'target', 'Target Watertown', '550 Arsenal St', 42.3646, -71.1568, 'Watertown', 'MA'),
  ('tg-medford', 'target', 'Target Medford', '471 Salem St', 42.4157, -71.0855, 'Medford', 'MA'),
  ('tg-revere', 'target', 'Target Revere', '36 Furlong Dr', 42.3987, -70.9855, 'Revere', 'MA'),
  ('tg-quincy', 'target', 'Target Quincy', '301 Falls Blvd', 42.2712, -71.0250, 'Quincy', 'MA'),
  ('tg-dedham', 'target', 'Target Dedham', '950 Providence Hwy', 42.2337, -71.1795, 'Dedham', 'MA'),
  ('tg-braintree', 'target', 'Target Braintree', '250 Granite St', 42.2216, -71.0261, 'Braintree', 'MA'),
  ('tg-saugus', 'target', 'Target Saugus', '400 Lynn Fells Pkwy', 42.4553, -71.0225, 'Saugus', 'MA'),
  ('tg-woburn', 'target', 'Target Woburn', '300 Mishawum Rd', 42.5024, -71.1360, 'Woburn', 'MA'),
  ('tg-arsenal', 'target', 'Target Newton (Chestnut Hill)', '200 Boylston St', 42.3216, -71.1786, 'Chestnut Hill', 'MA'),
  ('ss-southbay', 'stopshop', 'Stop & Shop South Bay', '1100 Massachusetts Ave', 42.3253, -71.0646, 'Dorchester', 'MA'),
  ('ss-brighton', 'stopshop', 'Stop & Shop Brighton', '60 Everett St', 42.3596, -71.1355, 'Allston', 'MA'),
  ('ss-southie', 'stopshop', 'Stop & Shop South Boston', '713 E Broadway', 42.3352, -71.0357, 'South Boston', 'MA'),
  ('ss-hydepark', 'stopshop', 'Stop & Shop Hyde Park', '1025 Truman Pkwy', 42.2452, -71.1096, 'Hyde Park', 'MA'),
  ('ss-jp', 'stopshop', 'Stop & Shop Jamaica Plain', '301 Centre St', 42.3226, -71.1064, 'Jamaica Plain', 'MA'),
  ('ss-grove', 'stopshop', 'Stop & Shop Dorchester (Grove Hall)', '460 Blue Hill Ave', 42.3096, -71.0836, 'Dorchester', 'MA'),
  ('ss-somerville', 'stopshop', 'Stop & Shop Somerville (Twin City)', '779 McGrath Hwy', 42.3907, -71.0784, 'Somerville', 'MA'),
  ('ss-medford', 'stopshop', 'Stop & Shop Medford', '751 Fellsway', 42.4048, -71.0885, 'Medford', 'MA'),
  ('ss-malden', 'stopshop', 'Stop & Shop Malden', '99 Charles St', 42.4256, -71.0620, 'Malden', 'MA'),
  ('ss-watertown', 'stopshop', 'Stop & Shop Watertown', '171 Watertown St', 42.3653, -71.1690, 'Watertown', 'MA'),
  ('ss-quincy-sa', 'stopshop', 'Stop & Shop Quincy (Southern Artery)', '65 Newport Ave', 42.2668, -71.0206, 'Quincy', 'MA'),
  ('ss-quincy-fr', 'stopshop', 'Stop & Shop Quincy (Freeport St)', '495 Southern Artery', 42.2597, -71.0021, 'Quincy', 'MA'),
  ('ss-arlington', 'stopshop', 'Stop & Shop Arlington', '905 Massachusetts Ave', 42.4187, -71.1650, 'Arlington', 'MA'),
  ('ss-newton', 'stopshop', 'Stop & Shop Newton (Needham St)', '171 Needham St', 42.3141, -71.2015, 'Newton', 'MA'),
  ('ss-revere', 'stopshop', 'Stop & Shop Revere', '540 Squire Rd', 42.4183, -71.0027, 'Revere', 'MA'),
  ('ss-everett', 'stopshop', 'Stop & Shop Everett', '1690 Revere Beach Pkwy', 42.4038, -71.0450, 'Everett', 'MA'),
  ('ss-dedham', 'stopshop', 'Stop & Shop Dedham', '160 Providence Hwy', 42.2465, -71.1728, 'Dedham', 'MA'),
  ('ss-braintree', 'stopshop', 'Stop & Shop Braintree', '899 Washington St', 42.2043, -71.0021, 'Braintree', 'MA'),
  ('ss-milton', 'stopshop', 'Stop & Shop Milton', '470 Granite Ave', 42.2620, -71.0851, 'Milton', 'MA'),
  ('ss-waltham', 'stopshop', 'Stop & Shop Waltham', '700 Main St', 42.3753, -71.2444, 'Waltham', 'MA'),
  ('sm-fenway', 'starmarket', 'Star Market Fenway (Landmark Ctr)', '33 Kilmarnock St', 42.3428, -71.0995, 'Boston', 'MA'),
  ('sm-southend', 'starmarket', 'Star Market South End', '246 Border St', 42.3757, -71.0424, 'East Boston', 'MA'),
  ('sm-mtauburn', 'starmarket', 'Star Market Cambridge (Mt Auburn)', '699 Mt Auburn St', 42.3721, -71.1450, 'Cambridge', 'MA'),
  ('sm-porter', 'starmarket', 'Star Market Cambridge (Porter Sq)', '49 White St', 42.3891, -71.1204, 'Cambridge', 'MA'),
  ('sm-twincity', 'starmarket', 'Star Market Cambridge (Twin City)', '14 McGrath Hwy', 42.3830, -71.0790, 'Somerville', 'MA'),
  ('sm-chestnuthill', 'starmarket', 'Star Market Chestnut Hill', '33 Austin St', 42.3379, -71.2072, 'Newton', 'MA'),
  ('sm-newtonville', 'starmarket', 'Star Market Newtonville', '30 Washington St', 42.3520, -71.2064, 'Newton', 'MA'),
  ('sm-belmont', 'starmarket', 'Star Market Belmont (Waverley Sq)', '535 Trapelo Rd', 42.3877, -71.1830, 'Belmont', 'MA'),
  ('sm-quincy', 'starmarket', 'Star Market Quincy', '130 Granite St', 42.2478, -71.0071, 'Quincy', 'MA'),
  ('mb-somerville', 'marketbasket', 'Market Basket Somerville', '400 Somerville Ave', 42.3812, -71.1030, 'Somerville', 'MA'),
  ('mb-chelsea', 'marketbasket', 'Market Basket Chelsea', '170 Everett Ave', 42.3948, -71.0432, 'Chelsea', 'MA'),
  ('mb-revere', 'marketbasket', 'Market Basket Revere', '160 Squire Rd', 42.4160, -71.0165, 'Revere', 'MA'),
  ('mb-waltham', 'marketbasket', 'Market Basket Waltham', '480 Main St', 42.3766, -71.2320, 'Waltham', 'MA'),
  ('mb-burlington', 'marketbasket', 'Market Basket Burlington', '344 Cambridge St', 42.5099, -71.1889, 'Burlington', 'MA'),
  ('mb-salem', 'marketbasket', 'Market Basket Salem', '227 Highland Ave', 42.5069, -70.9195, 'Salem', 'MA'),
  ('mb-lynn', 'marketbasket', 'Market Basket Lynn', '40 Federal St', 42.4620, -70.9490, 'Lynn', 'MA'),
  ('mb-woburn', 'marketbasket', 'Market Basket Woburn', '340 Washington St', 42.4938, -71.1360, 'Woburn', 'MA'),
  ('mb-reading', 'marketbasket', 'Market Basket Reading', '1342 Main St', 42.5537, -71.1030, 'Reading', 'MA'),
  ('mb-brockton', 'marketbasket', 'Market Basket Brockton (Westgate)', '200 Westgate Dr', 42.0965, -71.0552, 'Brockton', 'MA'),
  ('mb-randolph', 'marketbasket', 'Market Basket Randolph', '1 Memorial Pkwy', 42.1782, -71.0538, 'Randolph', 'MA'),
  ('mb-ashland', 'marketbasket', 'Market Basket Ashland', '300 Eliot St', 42.2571, -71.4548, 'Ashland', 'MA')
on conflict (id) do nothing;


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
