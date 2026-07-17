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
import { distanceKm } from './geo'
import { PAGE_SIZE, type DealPage, type GrabbitApi, type PostResult } from './api.types'
import { SEED_COUPONS, SEED_DEALS, SEED_USERS } from '../data/seed'
import { storeById } from '../data/stores'
import { POINTS, levelForPoints } from './points'

// Demo adapter: full app behavior against the bundled seed dataset, with
// user-generated state (account, posts, votes) persisted in localStorage.

const LS = {
  user: 'grabbit.demo.user',
  votes: 'grabbit.demo.votes', // Record<dealId, VoteKind>
  posts: 'grabbit.demo.posts', // Deal[]
  reports: 'grabbit.demo.reports', // Record<dealId, ReportReason[]>
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

function getUser(): User | null {
  return read<User | null>(LS.user, null)
}
function getVotes(): Record<string, VoteKind> {
  return read(LS.votes, {})
}
function getMyDeals(): Deal[] {
  return read<Deal[]>(LS.posts, [])
}

function allDeals(): Deal[] {
  const votes = getVotes()
  return [...getMyDeals(), ...SEED_DEALS].map((d) => ({ ...d, myVote: votes[d.id] ?? null }))
}

/** FR-2: community deals leave the default feed after 48h or net-gone ≥ 3. */
function isLive(d: Deal): boolean {
  if (d.status !== 'active') return false
  if (new Date(d.expiresAt).getTime() < Date.now()) return false
  if (d.source === 'community' && d.goneCount - d.confirmedCount >= 3) return false
  return true
}

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export const demoApi: GrabbitApi = {
  async getDeals(filters: DealFilters, userLoc: LatLng): Promise<DealPage> {
    let deals = allDeals().filter(isLive)

    if (filters.storeIds?.length) deals = deals.filter((d) => filters.storeIds!.includes(d.storeId))
    if (filters.categories?.length)
      deals = deals.filter((d) => filters.categories!.includes(d.category))
    if (filters.source && filters.source !== 'all')
      deals = deals.filter((d) => d.source === filters.source)

    const dist = (d: Deal) => {
      const s = storeById(d.storeId)
      return s ? distanceKm(userLoc, s) : Infinity
    }
    if (filters.sort === 'newest')
      deals.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
    else if (filters.sort === 'nearest') deals.sort((a, b) => dist(a) - dist(b))
    else deals.sort((a, b) => b.discountPct - a.discountPct)

    const start = filters.page * PAGE_SIZE
    return delay({
      deals: deals.slice(start, start + PAGE_SIZE),
      hasMore: deals.length > start + PAGE_SIZE,
    })
  },

  async getDeal(id: string): Promise<Deal | null> {
    return delay(allDeals().find((d) => d.id === id) ?? null)
  },

  async vote(dealId: string, kind: VoteKind): Promise<Deal> {
    const user = getUser()
    if (!user) throw new Error('Sign in to vote')
    const votes = getVotes()
    if (votes[dealId]) throw new Error('You already voted on this deal') // FR-8
    const deal = allDeals().find((d) => d.id === dealId)
    if (!deal) throw new Error('Deal not found')
    if (deal.source !== 'community') throw new Error('Store-data deals are verified, not voted')

    votes[dealId] = kind
    write(LS.votes, votes)

    const mine = getMyDeals()
    const mineIdx = mine.findIndex((d) => d.id === dealId)
    const updated: Deal = {
      ...deal,
      confirmedCount: deal.confirmedCount + (kind === 'confirmed' ? 1 : 0),
      goneCount: deal.goneCount + (kind === 'gone' ? 1 : 0),
      myVote: kind,
    }
    if (mineIdx >= 0) {
      mine[mineIdx] = updated
      write(LS.posts, mine)
    } else {
      // seed deals: persist the count bump alongside the vote
      const seed = SEED_DEALS.find((d) => d.id === dealId)
      if (seed) {
        seed.confirmedCount = updated.confirmedCount
        seed.goneCount = updated.goneCount
      }
    }

    user.points += POINTS.vote
    user.level = levelForPoints(user.points).level
    write(LS.user, user)
    return updated
  },

  async report(dealId: string, reason: ReportReason): Promise<void> {
    const reports = read<Record<string, ReportReason[]>>(LS.reports, {})
    reports[dealId] = [...(reports[dealId] ?? []), reason]
    write(LS.reports, reports)
    // FR-9: 3 reports auto-hide
    if (reports[dealId].length >= 3) {
      const mine = getMyDeals()
      const idx = mine.findIndex((d) => d.id === dealId)
      if (idx >= 0) {
        mine[idx] = { ...mine[idx], status: 'hidden' }
        write(LS.posts, mine)
      } else {
        const seed = SEED_DEALS.find((d) => d.id === dealId)
        if (seed) seed.status = 'hidden'
      }
    }
    return delay(undefined)
  },

  async createDeal(input: NewDealInput): Promise<PostResult> {
    const user = getUser()
    if (!user) throw new Error('Sign in to post')

    const mine = getMyDeals()
    const today = new Date().toDateString()
    const postedToday = mine.filter((d) => new Date(d.postedAt).toDateString() === today).length
    if (postedToday >= 20) throw new Error('Daily post limit reached (20/day)') // FR-8
    const accountAgeHrs = (Date.now() - new Date(user.createdAt).getTime()) / 3600000
    if (accountAgeHrs < 24 && mine.length >= 3)
      throw new Error('New accounts are limited to 3 posts in the first 24h') // FR-10

    const store = storeById(input.storeId)
    if (!store) throw new Error('Unknown store')

    // FR-6: at-store bonus only within 1km
    const atStore =
      input.postedFrom != null && distanceKm(input.postedFrom, store) <= 1

    const now = new Date()
    const deal: Deal = {
      id: `local-${now.getTime()}`,
      storeId: input.storeId,
      source: 'community',
      title: input.title,
      category: input.category,
      priceCents: input.priceCents,
      originalPriceCents: input.originalPriceCents,
      discountPct: Math.round((1 - input.priceCents / input.originalPriceCents) * 100),
      photoUrl: input.photoDataUrl,
      photoColor: null,
      note: input.note ?? null,
      aisle: input.aisle ?? null,
      postedBy: user.id,
      postedByName: user.username,
      postedByLevel: user.level,
      postedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 48 * 3600000).toISOString(),
      status: 'active',
      confirmedCount: 0,
      goneCount: 0,
      myVote: null,
    }
    write(LS.posts, [deal, ...mine])

    let pointsEarned = POINTS.post + (atStore ? POINTS.atStoreBonus : 0)
    const newBadges: string[] = []
    if (!user.badges.includes('first_post')) newBadges.push('first_post')
    if (now.getHours() < 8 && !user.badges.includes('early_bird')) newBadges.push('early_bird')
    const postsAtStore = [deal, ...mine].filter((d) => d.storeId === input.storeId).length
    if (postsAtStore >= 10 && !user.badges.includes('store_regular')) newBadges.push('store_regular')

    user.points += pointsEarned
    user.level = levelForPoints(user.points).level
    user.badges = [...user.badges, ...newBadges]
    write(LS.user, user)

    return delay({ deal, pointsEarned, newBadges })
  },

  async findDuplicates(storeId: string, category: string, priceCents: number): Promise<Deal[]> {
    // FR-7: same store + category + similar price (±15%), < 6h old
    const cutoff = Date.now() - 6 * 3600000
    return delay(
      allDeals().filter(
        (d) =>
          isLive(d) &&
          d.source === 'community' &&
          d.storeId === storeId &&
          d.category === category &&
          new Date(d.postedAt).getTime() > cutoff &&
          Math.abs(d.priceCents - priceCents) / priceCents <= 0.15,
      ),
    )
  },

  async getCoupons(): Promise<Coupon[]> {
    return delay(SEED_COUPONS.filter((c) => new Date(c.endsAt).getTime() > Date.now()))
  },

  async getCurrentUser(): Promise<User | null> {
    return getUser()
  },

  async signIn(email: string, username: string) {
    const user: User = {
      id: `local-user-${Date.now()}`,
      username,
      email,
      points: 0,
      level: 1,
      createdAt: new Date().toISOString(),
      badges: [],
    }
    write(LS.user, user)
    return { user, magicLinkSent: false }
  },

  async signOut() {
    localStorage.removeItem(LS.user)
  },

  async getMyPosts(): Promise<Deal[]> {
    return getMyDeals()
  },

  async getLeaderboard(
    storeId: string | null,
    period: 'weekly' | 'alltime',
  ): Promise<LeaderboardEntry[]> {
    const me = getUser()
    // Demo approximation: weekly board shows a shuffled fraction of all-time points.
    const factor = period === 'weekly' ? 0.18 : 1
    const entries = [...SEED_USERS, ...(me && me.points > 0 ? [me] : [])]
      .map((u) => ({
        userId: u.id,
        username: u.username,
        level: u.level,
        points: Math.round(u.points * (u.id.startsWith('local') ? 1 : factor)),
      }))
      .filter((e) => e.points > 0)
      .sort((a, b) => b.points - a.points)
      .slice(0, 10)
      .map((e, i) => ({ ...e, rank: i + 1 }))
    void storeId // per-store boards use real data in Supabase mode
    return delay(entries)
  },
}
