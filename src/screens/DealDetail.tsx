import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Flag, MapPin, X } from 'lucide-react'
import type { Deal, ReportReason, VoteKind } from '../lib/types'
import { api } from '../lib/api'
import { useApp } from '../state/AppContext'
import { storeById } from '../data/stores'
import { distanceKm, formatDistance } from '../lib/geo'
import { CATEGORY_EMOJI, CATEGORY_LABELS, endsIn, formatPrice, timeAgo } from '../lib/format'
import { levelName } from '../lib/points'
import { ChainDot, DealPhoto, DiscountBadge, SourceBadge, Spinner } from '../components/shared'

const REPORT_REASONS: Array<{ key: ReportReason; label: string }> = [
  { key: 'wrong_price', label: 'Wrong price' },
  { key: 'not_a_deal', label: 'Not a deal' },
  { key: 'inappropriate_photo', label: 'Inappropriate photo' },
  { key: 'spam', label: 'Spam' },
]

export function DealDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { location, user } = useApp()
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showReport, setShowReport] = useState(false)
  const [reported, setReported] = useState(false)

  useEffect(() => {
    if (!id) return
    api
      .getDeal(id)
      .then(setDeal)
      .finally(() => setLoading(false))
  }, [id])

  async function vote(kind: VoteKind) {
    if (!deal) return
    if (!user) {
      navigate('/auth')
      return
    }
    setVoting(true)
    setError(null)
    try {
      setDeal(await api.vote(deal.id, kind))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Vote failed')
    } finally {
      setVoting(false)
    }
  }

  async function report(reason: ReportReason) {
    if (!deal) return
    await api.report(deal.id, reason)
    setShowReport(false)
    setReported(true)
  }

  if (loading) return <Spinner />
  if (!deal)
    return (
      <div className="p-6 text-center text-neutral-400">
        Deal not found.{' '}
        <Link to="/" className="text-sticker underline">
          Back to feed
        </Link>
      </div>
    )

  const store = storeById(deal.storeId)
  const dist = store ? formatDistance(distanceKm(location, store)) : ''
  const mapsUrl = store
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${store.address}, ${store.city} ${store.state}`)}`
    : '#'

  return (
    <div className="pb-28">
      <div className="relative">
        <DealPhoto
          photoUrl={deal.photoUrl}
          photoColor={deal.photoColor}
          title={deal.title}
          emoji={CATEGORY_EMOJI[deal.category]}
          className="h-64 w-full"
        />
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="glass absolute top-3 left-3 rounded-full p-2 text-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sticker"
        >
          <ArrowLeft size={18} />
        </button>
      </div>

      <div className="space-y-4 px-4 pt-4">
        <div>
          <div className="flex items-center gap-2">
            <SourceBadge source={deal.source} />
            <span className="text-xs text-neutral-500">
              {timeAgo(deal.postedAt)} · {endsIn(deal.expiresAt)}
            </span>
          </div>
          <h1 className="mt-2 text-xl font-bold">{deal.title}</h1>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-sticker">
              {formatPrice(deal.priceCents)}
            </span>
            <span className="text-neutral-500 line-through">
              {formatPrice(deal.originalPriceCents)}
            </span>
            <DiscountBadge pct={deal.discountPct} />
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {CATEGORY_EMOJI[deal.category]} {CATEGORY_LABELS[deal.category]}
            {deal.aisle && ` · ${deal.aisle}`}
          </p>
          {deal.note && <p className="mt-2 text-sm text-neutral-300">“{deal.note}”</p>}
        </div>

        {store && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="glass flex items-center gap-3 rounded-2xl border border-edge p-3 transition-colors hover:border-neutral-500"
          >
            <MapPin size={18} className="shrink-0 text-sticker" />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                <ChainDot chainId={store.chainId} /> {store.name}
              </span>
              <span className="block truncate text-xs text-neutral-500">
                {store.address}, {store.city} · {dist}
              </span>
            </span>
            <span className="text-xs font-medium text-sticker">Directions →</span>
          </a>
        )}

        {deal.source === 'community' ? (
          <div className="glass rounded-2xl border border-edge p-4">
            <p className="text-sm font-semibold">Is it still there?</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                disabled={voting || deal.myVote !== null}
                onClick={() => vote('confirmed')}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sticker disabled:opacity-50 ${
                  deal.myVote === 'confirmed'
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                    : 'border-edge bg-card text-emerald-300 hover:border-emerald-500'
                }`}
              >
                <Check size={16} /> Still there ({deal.confirmedCount})
              </button>
              <button
                disabled={voting || deal.myVote !== null}
                onClick={() => vote('gone')}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sticker disabled:opacity-50 ${
                  deal.myVote === 'gone'
                    ? 'border-rose-400 bg-rose-500/20 text-rose-300'
                    : 'border-edge bg-card text-rose-300 hover:border-rose-500'
                }`}
              >
                <X size={16} /> Gone ({deal.goneCount})
              </button>
            </div>
            {deal.myVote && (
              <p className="mt-2 text-xs text-neutral-500">Thanks — vote recorded (+1 pt).</p>
            )}
            {!user && (
              <p className="mt-2 text-xs text-neutral-500">
                <Link to="/auth" className="text-sticker underline">
                  Sign in
                </Link>{' '}
                to vote.
              </p>
            )}
            {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
          </div>
        ) : (
          <div className="glass flex items-center gap-2 rounded-2xl border border-edge p-4 text-sm text-emerald-300">
            <Check size={16} /> Verified from store data · synced {timeAgo(deal.postedAt)}
          </div>
        )}

        {deal.postedByName && (
          <p className="text-xs text-neutral-500">
            Spotted by <span className="font-semibold text-neutral-300">{deal.postedByName}</span> ·{' '}
            {levelName(deal.postedByLevel)}
          </p>
        )}

        {deal.source === 'community' && (
          <div>
            {reported ? (
              <p className="text-xs text-neutral-500">Report received — thank you.</p>
            ) : showReport ? (
              <div className="flex flex-wrap gap-2">
                {REPORT_REASONS.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => report(r.key)}
                    className="rounded-full border border-edge px-3 py-1.5 text-xs text-neutral-300 hover:border-rose-500 hover:text-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sticker"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => setShowReport(true)}
                className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-rose-400 focus:outline-none"
              >
                <Flag size={12} /> Report this deal
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
