import type {
  Coupon,
  Deal,
  DealFilters,
  LeaderboardEntry,
  NewDealInput,
  ReportReason,
  User,
  VoteKind,
} from './types'
import type { LatLng } from './geo'

export const PAGE_SIZE = 20

export interface DealPage {
  deals: Deal[]
  hasMore: boolean
}

export interface PostResult {
  deal: Deal
  pointsEarned: number
  newBadges: string[]
}

/**
 * The one deal-read/write contract (PRD §7). Both the demo adapter and the
 * Supabase adapter implement it; nothing in the UI changes when real
 * store-data feeds arrive.
 */
export interface GrabbitApi {
  getDeals(filters: DealFilters, userLoc: LatLng): Promise<DealPage>
  getDeal(id: string): Promise<Deal | null>
  vote(dealId: string, kind: VoteKind): Promise<Deal>
  report(dealId: string, reason: ReportReason): Promise<void>
  createDeal(input: NewDealInput): Promise<PostResult>
  findDuplicates(storeId: string, category: string, priceCents: number): Promise<Deal[]>
  getCoupons(): Promise<Coupon[]>
  getCurrentUser(): Promise<User | null>
  signIn(email: string, username: string): Promise<{ user: User | null; magicLinkSent: boolean }>
  signOut(): Promise<void>
  getMyPosts(): Promise<Deal[]>
  getLeaderboard(storeId: string | null, period: 'weekly' | 'alltime'): Promise<LeaderboardEntry[]>
}
