export type DealSource = 'store_data' | 'community' | 'coupon'
export type DealCategory =
  | 'meat'
  | 'produce'
  | 'dairy'
  | 'bakery'
  | 'frozen'
  | 'pantry'
  | 'household'
  | 'other'
export type DealStatus = 'active' | 'expired' | 'hidden'
export type VoteKind = 'confirmed' | 'gone'
export type SortKey = 'newest' | 'nearest' | 'discount'
export type ReportReason = 'wrong_price' | 'not_a_deal' | 'inappropriate_photo' | 'spam'

export interface Chain {
  id: string
  name: string
  slug: string
  dataSource: 'feed' | 'community'
  color: string
}

export interface Store {
  id: string
  chainId: string
  name: string
  address: string
  lat: number
  lng: number
  city: string
  state: string
}

export interface Deal {
  id: string
  storeId: string
  source: DealSource
  title: string
  category: DealCategory
  priceCents: number
  originalPriceCents: number
  discountPct: number
  photoUrl: string | null
  photoColor: string | null
  note: string | null
  aisle: string | null
  postedBy: string | null
  postedByName: string | null
  postedByLevel: number
  postedAt: string
  expiresAt: string
  status: DealStatus
  confirmedCount: number
  goneCount: number
  myVote: VoteKind | null
}

export interface Coupon {
  id: string
  chainId: string
  title: string
  description: string
  valueText: string
  url: string
  startsAt: string
  endsAt: string
}

export interface User {
  id: string
  username: string
  email: string
  points: number
  level: number
  createdAt: string
  badges: string[]
}

export interface LeaderboardEntry {
  userId: string
  username: string
  level: number
  points: number
  rank: number
}

export interface DealFilters {
  storeIds?: string[]
  categories?: DealCategory[]
  source?: DealSource | 'all'
  sort: SortKey
  page: number
}

export interface NewDealInput {
  storeId: string
  title: string
  category: DealCategory
  priceCents: number
  originalPriceCents: number
  photoDataUrl: string
  note?: string
  aisle?: string
  postedFrom?: { lat: number; lng: number }
}

export interface DuplicateCandidate {
  deal: Deal
  storeName: string
}
