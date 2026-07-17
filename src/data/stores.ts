import type { Chain, Store } from '../lib/types'

export const CHAINS: Chain[] = [
  { id: 'walmart', name: 'Walmart', slug: 'walmart', dataSource: 'feed', color: '#0071ce' },
  { id: 'target', name: 'Target', slug: 'target', dataSource: 'feed', color: '#cc0000' },
  { id: 'stopshop', name: 'Stop & Shop', slug: 'stop-and-shop', dataSource: 'community', color: '#6f2c91' },
  { id: 'starmarket', name: 'Star Market', slug: 'star-market', dataSource: 'community', color: '#e31837' },
  { id: 'marketbasket', name: 'Market Basket', slug: 'market-basket', dataSource: 'community', color: '#00703c' },
]

export const chainById = (id: string): Chain => CHAINS.find((c) => c.id === id)!

// Real store locations within ~15 miles of downtown Boston, compiled from
// public store locators (seed data — verify addresses before launch).
const s = (
  id: string,
  chainId: string,
  name: string,
  address: string,
  city: string,
  lat: number,
  lng: number,
): Store => ({ id, chainId, name, address, city, state: 'MA', lat, lng })

export const STORES: Store[] = [
  // ── Walmart (feed) ─────────────────────────────────────────────
  s('wm-quincy', 'walmart', 'Walmart Quincy', '301 Falls Blvd', 'Quincy', 42.2705, -71.0244),
  s('wm-saugus', 'walmart', 'Walmart Saugus', '770 Broadway (Rt 1)', 'Saugus', 42.4837, -71.0201),
  s('wm-lynn', 'walmart', 'Walmart Lynn', '780 Lynnway', 'Lynn', 42.4515, -70.9709),
  s('wm-chelmsford', 'walmart', 'Walmart Supercenter Chelmsford', '66 Drum Hill Rd', 'Chelmsford', 42.6236, -71.3800),
  s('wm-walpole', 'walmart', 'Walmart Supercenter Walpole', '550 Providence Hwy', 'Walpole', 42.1573, -71.2438),
  s('wm-danvers', 'walmart', 'Walmart Danvers', '55 Brooksby Village Way', 'Danvers', 42.5519, -70.9497),
  s('wm-framingham', 'walmart', 'Walmart Framingham', '121 Worcester Rd', 'Framingham', 42.2986, -71.3855),
  s('wm-weymouth', 'walmart', 'Walmart Weymouth', '740 Middle St', 'Weymouth', 42.1966, -70.9448),

  // ── Target (feed) ──────────────────────────────────────────────
  s('tg-fenway', 'target', 'Target Boston Fenway', '1341 Boylston St', 'Boston', 42.3444, -71.1005),
  s('tg-southbay', 'target', 'Target Boston South Bay', '7 Allstate Rd', 'Dorchester', 42.3272, -71.0637),
  s('tg-central', 'target', 'Target Boston Central (Downtown)', '1 Summer St', 'Boston', 42.3550, -71.0606),
  s('tg-porter', 'target', 'Target Cambridge Porter Square', '822 Somerville Ave', 'Cambridge', 42.3884, -71.1195),
  s('tg-centralsq', 'target', 'Target Cambridge Central Square', '564 Massachusetts Ave', 'Cambridge', 42.3654, -71.1032),
  s('tg-somerville', 'target', 'Target Somerville', '180 Somerville Ave', 'Somerville', 42.3768, -71.0910),
  s('tg-everett', 'target', 'Target Everett', '1 Mystic View Rd', 'Everett', 42.3963, -71.0684),
  s('tg-watertown', 'target', 'Target Watertown', '550 Arsenal St', 'Watertown', 42.3646, -71.1568),
  s('tg-medford', 'target', 'Target Medford', '471 Salem St', 'Medford', 42.4157, -71.0855),
  s('tg-revere', 'target', 'Target Revere', '36 Furlong Dr', 'Revere', 42.3987, -70.9855),
  s('tg-quincy', 'target', 'Target Quincy', '301 Falls Blvd', 'Quincy', 42.2712, -71.0250),
  s('tg-dedham', 'target', 'Target Dedham', '950 Providence Hwy', 'Dedham', 42.2337, -71.1795),
  s('tg-braintree', 'target', 'Target Braintree', '250 Granite St', 'Braintree', 42.2216, -71.0261),
  s('tg-saugus', 'target', 'Target Saugus', '400 Lynn Fells Pkwy', 'Saugus', 42.4553, -71.0225),
  s('tg-woburn', 'target', 'Target Woburn', '300 Mishawum Rd', 'Woburn', 42.5024, -71.1360),
  s('tg-arsenal', 'target', 'Target Newton (Chestnut Hill)', '200 Boylston St', 'Chestnut Hill', 42.3216, -71.1786),

  // ── Stop & Shop (community) ────────────────────────────────────
  s('ss-southbay', 'stopshop', 'Stop & Shop South Bay', '1100 Massachusetts Ave', 'Dorchester', 42.3253, -71.0646),
  s('ss-brighton', 'stopshop', 'Stop & Shop Brighton', '60 Everett St', 'Allston', 42.3596, -71.1355),
  s('ss-southie', 'stopshop', 'Stop & Shop South Boston', '713 E Broadway', 'South Boston', 42.3352, -71.0357),
  s('ss-hydepark', 'stopshop', 'Stop & Shop Hyde Park', '1025 Truman Pkwy', 'Hyde Park', 42.2452, -71.1096),
  s('ss-jp', 'stopshop', 'Stop & Shop Jamaica Plain', '301 Centre St', 'Jamaica Plain', 42.3226, -71.1064),
  s('ss-grove', 'stopshop', 'Stop & Shop Dorchester (Grove Hall)', '460 Blue Hill Ave', 'Dorchester', 42.3096, -71.0836),
  s('ss-somerville', 'stopshop', 'Stop & Shop Somerville (Twin City)', '779 McGrath Hwy', 'Somerville', 42.3907, -71.0784),
  s('ss-medford', 'stopshop', 'Stop & Shop Medford', '751 Fellsway', 'Medford', 42.4048, -71.0885),
  s('ss-malden', 'stopshop', 'Stop & Shop Malden', '99 Charles St', 'Malden', 42.4256, -71.0620),
  s('ss-watertown', 'stopshop', 'Stop & Shop Watertown', '171 Watertown St', 'Watertown', 42.3653, -71.1690),
  s('ss-quincy-sa', 'stopshop', 'Stop & Shop Quincy (Southern Artery)', '65 Newport Ave', 'Quincy', 42.2668, -71.0206),
  s('ss-quincy-fr', 'stopshop', 'Stop & Shop Quincy (Freeport St)', '495 Southern Artery', 'Quincy', 42.2597, -71.0021),
  s('ss-arlington', 'stopshop', 'Stop & Shop Arlington', '905 Massachusetts Ave', 'Arlington', 42.4187, -71.1650),
  s('ss-newton', 'stopshop', 'Stop & Shop Newton (Needham St)', '171 Needham St', 'Newton', 42.3141, -71.2015),
  s('ss-revere', 'stopshop', 'Stop & Shop Revere', '540 Squire Rd', 'Revere', 42.4183, -71.0027),
  s('ss-everett', 'stopshop', 'Stop & Shop Everett', '1690 Revere Beach Pkwy', 'Everett', 42.4038, -71.0450),
  s('ss-dedham', 'stopshop', 'Stop & Shop Dedham', '160 Providence Hwy', 'Dedham', 42.2465, -71.1728),
  s('ss-braintree', 'stopshop', 'Stop & Shop Braintree', '899 Washington St', 'Braintree', 42.2043, -71.0021),
  s('ss-milton', 'stopshop', 'Stop & Shop Milton', '470 Granite Ave', 'Milton', 42.2620, -71.0851),
  s('ss-waltham', 'stopshop', 'Stop & Shop Waltham', '700 Main St', 'Waltham', 42.3753, -71.2444),

  // ── Star Market (community) ────────────────────────────────────
  s('sm-fenway', 'starmarket', 'Star Market Fenway (Landmark Ctr)', '33 Kilmarnock St', 'Boston', 42.3428, -71.0995),
  s('sm-packards', 'starmarket', "Star Market Allston (Packard's Corner)", '1065 Commonwealth Ave', 'Boston', 42.3524, -71.1252),
  s('sm-southend', 'starmarket', 'Star Market South End', '246 Border St', 'East Boston', 42.3757, -71.0424),
  s('sm-mtauburn', 'starmarket', 'Star Market Cambridge (Mt Auburn)', '699 Mt Auburn St', 'Cambridge', 42.3721, -71.1450),
  s('sm-porter', 'starmarket', 'Star Market Cambridge (Porter Sq)', '49 White St', 'Cambridge', 42.3891, -71.1204),
  s('sm-twincity', 'starmarket', 'Star Market Cambridge (Twin City)', '14 McGrath Hwy', 'Somerville', 42.3830, -71.0790),
  s('sm-chestnuthill', 'starmarket', 'Star Market Chestnut Hill', '33 Austin St', 'Newton', 42.3379, -71.2072),
  s('sm-newtonville', 'starmarket', 'Star Market Newtonville', '30 Washington St', 'Newton', 42.3520, -71.2064),
  s('sm-belmont', 'starmarket', 'Star Market Belmont (Waverley Sq)', '535 Trapelo Rd', 'Belmont', 42.3877, -71.1830),
  s('sm-quincy', 'starmarket', 'Star Market Quincy', '130 Granite St', 'Quincy', 42.2478, -71.0071),

  // ── Market Basket (community) ──────────────────────────────────
  s('mb-somerville', 'marketbasket', 'Market Basket Somerville', '400 Somerville Ave', 'Somerville', 42.3812, -71.1030),
  s('mb-chelsea', 'marketbasket', 'Market Basket Chelsea', '170 Everett Ave', 'Chelsea', 42.3948, -71.0432),
  s('mb-revere', 'marketbasket', 'Market Basket Revere', '160 Squire Rd', 'Revere', 42.4160, -71.0165),
  s('mb-waltham', 'marketbasket', 'Market Basket Waltham', '480 Main St', 'Waltham', 42.3766, -71.2320),
  s('mb-burlington', 'marketbasket', 'Market Basket Burlington', '344 Cambridge St', 'Burlington', 42.5099, -71.1889),
  s('mb-salem', 'marketbasket', 'Market Basket Salem', '227 Highland Ave', 'Salem', 42.5069, -70.9195),
  s('mb-lynn', 'marketbasket', 'Market Basket Lynn', '40 Federal St', 'Lynn', 42.4620, -70.9490),
  s('mb-woburn', 'marketbasket', 'Market Basket Woburn', '340 Washington St', 'Woburn', 42.4938, -71.1360),
  s('mb-reading', 'marketbasket', 'Market Basket Reading', '1342 Main St', 'Reading', 42.5537, -71.1030),
  s('mb-brockton', 'marketbasket', 'Market Basket Brockton (Westgate)', '200 Westgate Dr', 'Brockton', 42.0965, -71.0552),
  s('mb-randolph', 'marketbasket', 'Market Basket Randolph', '1 Memorial Pkwy', 'Randolph', 42.1782, -71.0538),
  s('mb-ashland', 'marketbasket', 'Market Basket Ashland', '300 Eliot St', 'Ashland', 42.2571, -71.4548),
]

export const storeById = (id: string): Store | undefined => STORES.find((st) => st.id === id)
