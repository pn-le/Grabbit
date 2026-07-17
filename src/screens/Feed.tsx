import { useCallback, useEffect, useRef, useState } from 'react'
import type { Deal } from '../lib/types'
import { api, isDemoMode } from '../lib/api'
import { useApp } from '../state/AppContext'
import { DealCard } from '../components/DealCard'
import { FilterBar, type FeedFilterState } from '../components/FilterBar'
import { EmptyState, Spinner } from '../components/shared'
import { RabbitLogo } from '../components/RabbitLogo'

export function Feed() {
  const { location, favoriteStoreIds } = useApp()
  const [filters, setFilters] = useState<FeedFilterState>({
    storeIds: favoriteStoreIds,
    categories: [],
    source: 'all',
    sort: 'newest',
  })
  const [deals, setDeals] = useState<Deal[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const load = useCallback(
    async (nextPage: number, append: boolean) => {
      setLoading(true)
      try {
        const res = await api.getDeals(
          {
            storeIds: filters.storeIds,
            categories: filters.categories,
            source: filters.source,
            sort: filters.sort,
            page: nextPage,
          },
          location,
        )
        setDeals((prev) => (append ? [...prev, ...res.deals] : res.deals))
        setHasMore(res.hasMore)
        setPage(nextPage)
      } finally {
        setLoading(false)
      }
    },
    [filters, location],
  )

  useEffect(() => {
    void load(0, false)
  }, [load])

  // FR-1: infinite scroll, 20 per page
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) void load(page + 1, true)
      },
      { rootMargin: '400px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, loading, page, load])

  return (
    <div className="px-4 pb-28">
      <header className="flex items-center gap-2 py-3">
        <RabbitLogo size={30} />
        <h1 className="text-xl font-extrabold tracking-tight">
          Grabbit<span className="text-sticker">.</span>
        </h1>
        {isDemoMode && (
          <span className="ml-auto rounded-full border border-edge px-2 py-0.5 text-[10px] tracking-wide text-neutral-500 uppercase">
            Demo data
          </span>
        )}
      </header>

      <FilterBar state={filters} onChange={setFilters} favoriteStoreIds={favoriteStoreIds} />

      <div className="mt-3 space-y-3">
        {deals.map((d) => (
          <DealCard key={d.id} deal={d} userLoc={location} />
        ))}
      </div>

      {loading && deals.length === 0 && <Spinner />}
      {!loading && deals.length === 0 && (
        <EmptyState
          title="No deals match those filters"
          hint="Try widening your stores or categories — or be the first to spot one!"
        />
      )}
      {loading && deals.length > 0 && <Spinner />}
      <div ref={sentinelRef} />
    </div>
  )
}
