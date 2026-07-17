import type { Coupon, Deal, DealCategory, DealSource, User } from '../lib/types'
import { CHAINS, STORES, chainById } from './stores'
import { levelForPoints } from '../lib/points'

// Deterministic PRNG so the demo dataset is stable across reloads.
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rnd = mulberry32(20260716)
const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)]
const between = (min: number, max: number) => min + rnd() * (max - min)

// ── Demo users ───────────────────────────────────────────────────
const USER_DEFS: Array<[string, number, string[]]> = [
  ['yellowtag_yara', 2340, ['first_post', 'ten_confirmed', 'store_regular', 'early_bird']],
  ['markdown_mike', 1180, ['first_post', 'ten_confirmed', 'store_regular']],
  ['clearance_queen', 890, ['first_post', 'ten_confirmed', 'early_bird']],
  ['basket_case_ben', 610, ['first_post', 'store_regular']],
  ['thrifty_theresa', 445, ['first_post', 'ten_confirmed']],
  ['dealhopper_dan', 260, ['first_post', 'early_bird']],
  ['savvy_sofia', 175, ['first_post']],
  ['coupon_carl', 120, ['first_post']],
  ['boston_bargains', 65, ['first_post']],
  ['newbie_nina', 20, ['first_post']],
]

export const SEED_USERS: User[] = USER_DEFS.map(([username, points, badges], i) => ({
  id: `demo-user-${i + 1}`,
  username,
  email: `${username}@demo.grabbit.app`,
  points,
  level: levelForPoints(points).level,
  createdAt: new Date(Date.now() - (30 + i * 9) * 86400000).toISOString(),
  badges,
}))

// ── Demo deals ───────────────────────────────────────────────────
interface ItemDef {
  title: string
  cat: DealCategory
  base: [number, number] // typical original price range, dollars
}

const ITEMS: ItemDef[] = [
  { title: 'Boneless Chicken Thighs (family pack)', cat: 'meat', base: [9, 16] },
  { title: '80/20 Ground Beef 2lb', cat: 'meat', base: [8, 13] },
  { title: 'Pork Tenderloin', cat: 'meat', base: [7, 12] },
  { title: 'Atlantic Salmon Fillet', cat: 'meat', base: [10, 17] },
  { title: 'Italian Sausage Links', cat: 'meat', base: [5, 9] },
  { title: 'NY Strip Steak (manager special)', cat: 'meat', base: [12, 22] },
  { title: 'Rotisserie Chicken (day-of)', cat: 'meat', base: [6, 9] },
  { title: 'Organic Baby Spinach 10oz', cat: 'produce', base: [4, 6] },
  { title: 'Strawberries 1lb', cat: 'produce', base: [4, 7] },
  { title: 'Avocados 4-pack', cat: 'produce', base: [4, 6] },
  { title: 'Honeycrisp Apples 3lb bag', cat: 'produce', base: [5, 8] },
  { title: 'Grape Tomatoes (pint)', cat: 'produce', base: [3, 5] },
  { title: 'Cut Fruit Bowl', cat: 'produce', base: [5, 9] },
  { title: 'Salad Kit — Caesar', cat: 'produce', base: [4, 6] },
  { title: 'Greek Yogurt 32oz', cat: 'dairy', base: [5, 7] },
  { title: 'Shredded Mozzarella 16oz', cat: 'dairy', base: [4, 7] },
  { title: 'Half & Half (quart)', cat: 'dairy', base: [3, 5] },
  { title: 'Cage-Free Eggs (dozen)', cat: 'dairy', base: [3, 6] },
  { title: 'Fancy Cheese Wedge (brie)', cat: 'dairy', base: [6, 10] },
  { title: 'Oat Milk 64oz', cat: 'dairy', base: [4, 6] },
  { title: 'Sourdough Boule (bakery)', cat: 'bakery', base: [4, 7] },
  { title: 'Blueberry Muffins 4-ct', cat: 'bakery', base: [4, 6] },
  { title: 'Bagels 6-ct (day-old)', cat: 'bakery', base: [3, 5] },
  { title: 'Chocolate Cake Slice', cat: 'bakery', base: [4, 6] },
  { title: 'Croissants 4-pack', cat: 'bakery', base: [5, 8] },
  { title: 'Frozen Pizza (rising crust)', cat: 'frozen', base: [6, 9] },
  { title: 'Ice Cream Pint (premium)', cat: 'frozen', base: [5, 7] },
  { title: 'Frozen Berries 3lb bag', cat: 'frozen', base: [8, 12] },
  { title: 'Frozen Shrimp 1lb (31-40ct)', cat: 'frozen', base: [8, 14] },
  { title: 'Veggie Burgers 4-ct', cat: 'frozen', base: [5, 8] },
  { title: 'Pasta Sauce (jar)', cat: 'pantry', base: [3, 6] },
  { title: 'Olive Oil 500ml', cat: 'pantry', base: [8, 14] },
  { title: 'Cereal (family size)', cat: 'pantry', base: [5, 8] },
  { title: 'Ground Coffee 12oz', cat: 'pantry', base: [8, 13] },
  { title: 'Granola Bars 12-ct', cat: 'pantry', base: [5, 8] },
  { title: 'Jasmine Rice 5lb', cat: 'pantry', base: [7, 11] },
  { title: 'Peanut Butter 40oz', cat: 'pantry', base: [6, 9] },
  { title: 'Laundry Detergent 96oz', cat: 'household', base: [12, 19] },
  { title: 'Paper Towels 6 rolls', cat: 'household', base: [9, 15] },
  { title: 'Dish Soap (big bottle)', cat: 'household', base: [4, 6] },
  { title: 'Trash Bags 45-ct', cat: 'household', base: [9, 14] },
  { title: 'Seasonal Candy (post-holiday)', cat: 'other', base: [3, 8] },
  { title: 'Flowers Bouquet (day-old)', cat: 'other', base: [8, 15] },
  { title: 'Sushi Tray (evening markdown)', cat: 'other', base: [8, 13] },
]

const NOTES = [
  'Yellow sticker rack near the deli',
  'Big pile of these, moving fast',
  'Sell-by tomorrow — freeze it!',
  'End cap by the registers',
  'Manager special, tons left',
  'Only a few left when I was there',
  'Back corner clearance shelf',
  null,
  null,
  null,
]

const AISLES = ['A1', 'A4', 'B2', 'B7', 'C3', 'Deli', 'Bakery', 'Meat wall', 'Endcap 12', null, null]

const PHOTO_COLORS = ['#7c3aed', '#0e7490', '#b45309', '#be123c', '#15803d', '#4338ca', '#a16207']

function seedDeal(i: number): Deal {
  const store = pick(STORES)
  const chain = chainById(store.chainId)
  const source: DealSource = chain.dataSource === 'feed' ? 'store_data' : 'community'
  const item = pick(ITEMS)
  const originalPriceCents = Math.round(between(item.base[0], item.base[1]) * 100)
  const discount = between(0.2, 0.7)
  const priceCents = Math.max(49, Math.round((originalPriceCents * (1 - discount)) / 10) * 10 - 1)
  const minutesAgo = Math.floor(between(2, 48 * 60))
  const postedAt = new Date(Date.now() - minutesAgo * 60000)
  const poster = source === 'community' ? pick(SEED_USERS) : null
  const confirmed = source === 'community' ? Math.floor(between(0, 6)) : 0
  const gone = source === 'community' && rnd() < 0.25 ? Math.floor(between(0, 2)) : 0

  return {
    id: `demo-deal-${i}`,
    storeId: store.id,
    source,
    title: item.title,
    category: item.cat,
    priceCents,
    originalPriceCents,
    discountPct: Math.round((1 - priceCents / originalPriceCents) * 100),
    photoUrl: null,
    photoColor: pick(PHOTO_COLORS),
    note: source === 'community' ? pick(NOTES) : null,
    aisle: source === 'community' ? pick(AISLES) : null,
    postedBy: poster?.id ?? null,
    postedByName: poster?.username ?? null,
    postedByLevel: poster?.level ?? 0,
    postedAt: postedAt.toISOString(),
    expiresAt: new Date(postedAt.getTime() + 48 * 3600000).toISOString(),
    status: 'active',
    confirmedCount: confirmed,
    goneCount: gone,
    myVote: null,
  }
}

export const SEED_DEALS: Deal[] = Array.from({ length: 150 }, (_, i) => seedDeal(i))

// ── Demo coupons ─────────────────────────────────────────────────
const COUPON_URLS: Record<string, string> = {
  walmart: 'https://www.walmart.com/shop/deals',
  target: 'https://www.target.com/circle',
  stopshop: 'https://stopandshop.com/savings',
  starmarket: 'https://www.starmarket.com/foru/coupons-deals.html',
  marketbasket: 'https://www.shopmarketbasket.com/weekly-flyer',
}

const COUPON_DEFS: Array<[string, string, string]> = [
  ['$5 off $50 grocery purchase', 'Digital coupon, clip in app', '$5 off'],
  ['BOGO 50% — all cereal', 'Weekly ad highlight', 'BOGO 50%'],
  ['20% off fresh produce Fri–Sun', 'Weekend flash deal', '20% off'],
  ['$2 off any 2 dairy items', 'Digital coupon', '$2 off 2'],
  ['Free bakery item with $25+', 'Loyalty members only', 'Freebie'],
  ['10¢/gal fuel points on gift cards', 'This week only', 'Fuel pts'],
]

export const SEED_COUPONS: Coupon[] = CHAINS.flatMap((chain, ci) =>
  COUPON_DEFS.map(([title, description, valueText], di) => {
    const startedDaysAgo = Math.floor(between(0, 4))
    return {
      id: `demo-coupon-${ci}-${di}`,
      chainId: chain.id,
      title,
      description: `${description} · ${chain.name}`,
      valueText,
      url: COUPON_URLS[chain.id],
      startsAt: new Date(Date.now() - startedDaysAgo * 86400000).toISOString(),
      endsAt: new Date(Date.now() + Math.floor(between(2, 9)) * 86400000).toISOString(),
    }
  }),
)
