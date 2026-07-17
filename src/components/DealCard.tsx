import { Link } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import type { Deal } from '../lib/types'
import { storeById } from '../data/stores'
import { distanceKm, formatDistance, type LatLng } from '../lib/geo'
import { CATEGORY_EMOJI, formatPrice, timeAgo } from '../lib/format'
import { ChainDot, DealPhoto, DiscountBadge, SourceBadge } from './shared'

export function DealCard({ deal, userLoc }: { deal: Deal; userLoc: LatLng }) {
  const store = storeById(deal.storeId)
  const dist = store ? formatDistance(distanceKm(userLoc, store)) : ''

  return (
    <Link
      to={`/deal/${deal.id}`}
      className="glass block overflow-hidden rounded-2xl border border-edge transition-colors hover:border-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sticker"
    >
      <div className="flex gap-3 p-3">
        <DealPhoto
          photoUrl={deal.photoUrl}
          photoColor={deal.photoColor}
          title={deal.title}
          emoji={CATEGORY_EMOJI[deal.category]}
          className="size-24 shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-semibold text-neutral-100">{deal.title}</p>
            <DiscountBadge pct={deal.discountPct} />
          </div>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-sticker">
              {formatPrice(deal.priceCents)}
            </span>
            <span className="text-xs text-neutral-500 line-through">
              {formatPrice(deal.originalPriceCents)}
            </span>
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-400">
            {store && <ChainDot chainId={store.chainId} />}
            <span className="truncate">{store?.name}</span>
            <span className="shrink-0 text-neutral-600">· {dist}</span>
          </p>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-neutral-500">
            <SourceBadge source={deal.source} />
            <span>{timeAgo(deal.postedAt)}</span>
            {deal.source === 'community' && (
              <span className="ml-auto flex items-center gap-1.5">
                <span className="flex items-center gap-0.5 text-emerald-400">
                  <Check size={11} /> {deal.confirmedCount}
                </span>
                <span className="flex items-center gap-0.5 text-rose-400">
                  <X size={11} /> {deal.goneCount}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
