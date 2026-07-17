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
import { PAGE_SIZE, type DealPage, type GrabbitApi, type PostResult } from './api.types'
import { supabase } from './supabase'

// Supabase adapter. Reads go through the `deals_view` (deal + vote counts +
// poster info); writes go through SECURITY DEFINER RPCs that enforce rate
// limits and award points server-side (see supabase/migrations).

function sb() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

interface DealRow {
  id: string
  store_id: string
  source: Deal['source']
  title: string
  category: Deal['category']
  price_cents: number
  original_price_cents: number
  discount_pct: number
  photo_url: string | null
  note: string | null
  aisle: string | null
  posted_by: string | null
  posted_by_name: string | null
  posted_by_level: number | null
  posted_at: string
  expires_at: string
  status: Deal['status']
  confirmed_count: number
  gone_count: number
  my_vote: VoteKind | null
}

function toDeal(r: DealRow): Deal {
  return {
    id: r.id,
    storeId: r.store_id,
    source: r.source,
    title: r.title,
    category: r.category,
    priceCents: r.price_cents,
    originalPriceCents: r.original_price_cents,
    discountPct: r.discount_pct,
    photoUrl: r.photo_url,
    photoColor: null,
    note: r.note,
    aisle: r.aisle,
    postedBy: r.posted_by,
    postedByName: r.posted_by_name,
    postedByLevel: r.posted_by_level ?? 0,
    postedAt: r.posted_at,
    expiresAt: r.expires_at,
    status: r.status,
    confirmedCount: r.confirmed_count,
    goneCount: r.gone_count,
    myVote: r.my_vote,
  }
}

async function fetchProfile(authUserId: string): Promise<User | null> {
  const { data } = await sb()
    .from('users')
    .select('id, username, email, points, level, created_at, badges')
    .eq('id', authUserId)
    .maybeSingle()
  if (!data) return null
  return {
    id: data.id,
    username: data.username,
    email: data.email,
    points: data.points,
    level: data.level,
    createdAt: data.created_at,
    badges: data.badges ?? [],
  }
}

export const supabaseApi: GrabbitApi = {
  async getDeals(filters: DealFilters, userLoc: LatLng): Promise<DealPage> {
    const { data, error } = await sb().rpc('get_deals', {
      p_store_ids: filters.storeIds?.length ? filters.storeIds : null,
      p_categories: filters.categories?.length ? filters.categories : null,
      p_source: filters.source && filters.source !== 'all' ? filters.source : null,
      p_sort: filters.sort,
      p_lat: userLoc.lat,
      p_lng: userLoc.lng,
      p_limit: PAGE_SIZE + 1,
      p_offset: filters.page * PAGE_SIZE,
    })
    if (error) throw error
    const rows = (data ?? []) as DealRow[]
    return { deals: rows.slice(0, PAGE_SIZE).map(toDeal), hasMore: rows.length > PAGE_SIZE }
  },

  async getDeal(id: string): Promise<Deal | null> {
    const { data, error } = await sb().from('deals_view').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? toDeal(data as DealRow) : null
  },

  async vote(dealId: string, kind: VoteKind): Promise<Deal> {
    const { error } = await sb().rpc('vote_on_deal', { p_deal_id: dealId, p_kind: kind })
    if (error) throw error
    const deal = await supabaseApi.getDeal(dealId)
    if (!deal) throw new Error('Deal not found after vote')
    return deal
  },

  async report(dealId: string, reason: ReportReason): Promise<void> {
    const { error } = await sb().rpc('report_deal', { p_deal_id: dealId, p_reason: reason })
    if (error) throw error
  },

  async createDeal(input: NewDealInput): Promise<PostResult> {
    // Upload photo to storage first
    const blob = await (await fetch(input.photoDataUrl)).blob()
    const path = `${crypto.randomUUID()}.jpg`
    const { error: upErr } = await sb().storage.from('deal-photos').upload(path, blob, {
      contentType: 'image/jpeg',
    })
    if (upErr) throw upErr
    const { data: pub } = sb().storage.from('deal-photos').getPublicUrl(path)

    const { data, error } = await sb().rpc('post_deal', {
      p_store_id: input.storeId,
      p_title: input.title,
      p_category: input.category,
      p_price_cents: input.priceCents,
      p_original_price_cents: input.originalPriceCents,
      p_photo_url: pub.publicUrl,
      p_note: input.note ?? null,
      p_aisle: input.aisle ?? null,
      p_lat: input.postedFrom?.lat ?? null,
      p_lng: input.postedFrom?.lng ?? null,
    })
    if (error) throw error
    const result = data as { deal_id: string; points_earned: number; new_badges: string[] }
    const deal = await supabaseApi.getDeal(result.deal_id)
    if (!deal) throw new Error('Deal not found after post')
    return { deal, pointsEarned: result.points_earned, newBadges: result.new_badges ?? [] }
  },

  async findDuplicates(storeId: string, category: string, priceCents: number): Promise<Deal[]> {
    const { data, error } = await sb()
      .from('deals_view')
      .select('*')
      .eq('store_id', storeId)
      .eq('category', category)
      .eq('source', 'community')
      .eq('status', 'active')
      .gte('posted_at', new Date(Date.now() - 6 * 3600000).toISOString())
      .gte('price_cents', Math.round(priceCents * 0.85))
      .lte('price_cents', Math.round(priceCents * 1.15))
    if (error) throw error
    return ((data ?? []) as DealRow[]).map(toDeal)
  },

  async getCoupons(): Promise<Coupon[]> {
    const { data, error } = await sb()
      .from('coupons')
      .select('*')
      .gte('ends_at', new Date().toISOString())
      .order('ends_at')
    if (error) throw error
    return (data ?? []).map((c) => ({
      id: c.id,
      chainId: c.chain_id,
      title: c.title,
      description: c.description,
      valueText: c.value_text,
      url: c.url,
      startsAt: c.starts_at,
      endsAt: c.ends_at,
    }))
  },

  async getCurrentUser(): Promise<User | null> {
    const { data } = await sb().auth.getUser()
    if (!data.user) return null
    return fetchProfile(data.user.id)
  },

  async signIn(email: string, username: string) {
    const { error } = await sb().auth.signInWithOtp({
      email,
      options: { data: { username }, emailRedirectTo: window.location.origin },
    })
    if (error) throw error
    return { user: null, magicLinkSent: true } // FR: magic-link auth
  },

  async signOut() {
    await sb().auth.signOut()
  },

  async getMyPosts(): Promise<Deal[]> {
    const { data: auth } = await sb().auth.getUser()
    if (!auth.user) return []
    const { data, error } = await sb()
      .from('deals_view')
      .select('*')
      .eq('posted_by', auth.user.id)
      .order('posted_at', { ascending: false })
    if (error) throw error
    return ((data ?? []) as DealRow[]).map(toDeal)
  },

  async getLeaderboard(
    storeId: string | null,
    period: 'weekly' | 'alltime',
  ): Promise<LeaderboardEntry[]> {
    const { data, error } = await sb().rpc('get_leaderboard', {
      p_store_id: storeId,
      p_period: period,
    })
    if (error) throw error
    return (data ?? []).map(
      (r: { user_id: string; username: string; level: number; points: number }, i: number) => ({
        userId: r.user_id,
        username: r.username,
        level: r.level,
        points: r.points,
        rank: i + 1,
      }),
    )
  },
}
