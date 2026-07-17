import type { DealCategory, DealSource, SortKey } from '../lib/types'
import { CHAINS, STORES } from '../data/stores'
import { CATEGORY_EMOJI, CATEGORY_LABELS } from '../lib/format'
import { Chip } from './shared'

export interface FeedFilterState {
  storeIds: string[]
  categories: DealCategory[]
  source: DealSource | 'all'
  sort: SortKey
}

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: 'newest', label: 'Newest' },
  { key: 'nearest', label: 'Nearest' },
  { key: 'discount', label: 'Biggest discount' },
]

const SOURCES: Array<{ key: DealSource | 'all'; label: string }> = [
  { key: 'all', label: 'All sources' },
  { key: 'store_data', label: '✓ Store data' },
  { key: 'community', label: '📸 Spotted' },
]

export function FilterBar({
  state,
  onChange,
  favoriteStoreIds,
}: {
  state: FeedFilterState
  onChange: (next: FeedFilterState) => void
  favoriteStoreIds: string[]
}) {
  const toggle = <T,>(list: T[], item: T): T[] =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item]

  // Show favorite stores first as individual chips, chains as bulk toggles.
  const favStores = STORES.filter((s) => favoriteStoreIds.includes(s.id))

  return (
    <div className="glass sticky top-0 z-30 -mx-4 space-y-2 border-b border-edge px-4 py-2.5">
      <div className="scrollbar-none flex gap-2 overflow-x-auto">
        {SORTS.map((s) => (
          <Chip key={s.key} active={state.sort === s.key} onClick={() => onChange({ ...state, sort: s.key })}>
            {s.label}
          </Chip>
        ))}
        <span className="my-auto h-4 w-px shrink-0 bg-edge" />
        {SOURCES.map((s) => (
          <Chip
            key={s.key}
            active={state.source === s.key}
            onClick={() => onChange({ ...state, source: s.key })}
          >
            {s.label}
          </Chip>
        ))}
      </div>
      <div className="scrollbar-none flex gap-2 overflow-x-auto">
        {favStores.map((s) => (
          <Chip
            key={s.id}
            active={state.storeIds.includes(s.id)}
            onClick={() => onChange({ ...state, storeIds: toggle(state.storeIds, s.id) })}
          >
            {s.name.replace(/^(Walmart|Target|Stop & Shop|Star Market|Market Basket)\s*/, '') ||
              s.name}
          </Chip>
        ))}
        {favStores.length === 0 &&
          CHAINS.map((c) => {
            const chainStoreIds = STORES.filter((s) => s.chainId === c.id).map((s) => s.id)
            const active = chainStoreIds.every((id) => state.storeIds.includes(id))
            return (
              <Chip
                key={c.id}
                active={active}
                onClick={() =>
                  onChange({
                    ...state,
                    storeIds: active
                      ? state.storeIds.filter((id) => !chainStoreIds.includes(id))
                      : [...new Set([...state.storeIds, ...chainStoreIds])],
                  })
                }
              >
                {c.name}
              </Chip>
            )
          })}
      </div>
      <div className="scrollbar-none flex gap-2 overflow-x-auto">
        {(Object.keys(CATEGORY_LABELS) as DealCategory[]).map((cat) => (
          <Chip
            key={cat}
            active={state.categories.includes(cat)}
            onClick={() => onChange({ ...state, categories: toggle(state.categories, cat) })}
          >
            {CATEGORY_EMOJI[cat]} {CATEGORY_LABELS[cat]}
          </Chip>
        ))}
      </div>
    </div>
  )
}
