import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Camera, ChevronLeft, PartyPopper } from 'lucide-react'
import type { Deal, DealCategory, DuplicateCandidate } from '../lib/types'
import { api } from '../lib/api'
import { useApp } from '../state/AppContext'
import { STORES, storeById } from '../data/stores'
import { compressImage } from '../lib/image'
import { distanceKm, formatDistance } from '../lib/geo'
import { CATEGORY_EMOJI, CATEGORY_LABELS, formatPrice } from '../lib/format'
import { BADGES } from '../lib/points'
import { RabbitLogo } from '../components/RabbitLogo'

type Step = 'photo' | 'details' | 'store' | 'done'

export function PostFlow() {
  const navigate = useNavigate()
  const { user, location, locationGranted, favoriteStoreIds, refreshUser } = useApp()

  const [step, setStep] = useState<Step>('photo')
  const [photo, setPhoto] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [category, setCategory] = useState<DealCategory | null>(null)
  const [note, setNote] = useState('')
  const [storeId, setStoreId] = useState<string | null>(null)
  const [storeSearch, setStoreSearch] = useState('')
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ pointsEarned: number; newBadges: string[] } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // FR-6: nearest store within 300m auto-selected (favorites preferred)
  useEffect(() => {
    if (storeId || !locationGranted) return
    const candidates = favoriteStoreIds.length
      ? STORES.filter((s) => favoriteStoreIds.includes(s.id))
      : STORES
    const nearest = [...candidates].sort(
      (a, b) => distanceKm(location, a) - distanceKm(location, b),
    )[0]
    if (nearest && distanceKm(location, nearest) <= 0.3) setStoreId(nearest.id)
  }, [location, locationGranted, favoriteStoreIds, storeId])

  const sortedStores = useMemo(() => {
    const q = storeSearch.toLowerCase()
    return [...STORES]
      .filter((s) => !q || `${s.name} ${s.city}`.toLowerCase().includes(q))
      .sort((a, b) => distanceKm(location, a) - distanceKm(location, b))
      .slice(0, 12)
  }, [location, storeSearch])

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
        <RabbitLogo size={52} />
        <h1 className="text-lg font-bold">Sign in to post finds</h1>
        <p className="text-sm text-neutral-400">
          Posting and voting need an account so the community can trust what it sees.
        </p>
        <Link
          to="/auth"
          className="rounded-xl bg-sticker px-6 py-2.5 text-sm font-bold text-neutral-950"
        >
          Sign in
        </Link>
      </div>
    )
  }

  async function onFile(f: File | undefined) {
    if (!f) return
    setError(null)
    try {
      setPhoto(await compressImage(f)) // FR-5: ≤500KB
      setStep('details')
    } catch {
      setError('Could not read that photo — try another one.')
    }
  }

  async function toStoreStep() {
    if (!title.trim() || !category || !price || !originalPrice) {
      setError('Fill in item, prices, and category')
      return
    }
    if (Math.round(parseFloat(price) * 100) >= Math.round(parseFloat(originalPrice) * 100)) {
      setError('Deal price should be below the original price')
      return
    }
    setError(null)
    setStep('store')
  }

  async function checkDuplicatesAndSubmit() {
    if (!storeId || !category) {
      setError('Pick a store')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const priceCents = Math.round(parseFloat(price) * 100)
      // FR-7: duplicate nudge
      if (duplicates.length === 0) {
        const dupes = await api.findDuplicates(storeId, category, priceCents)
        if (dupes.length > 0) {
          setDuplicates(
            dupes.map((deal) => ({ deal, storeName: storeById(deal.storeId)?.name ?? '' })),
          )
          setSubmitting(false)
          return
        }
      }
      await submit()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  async function submit() {
    setSubmitting(true)
    try {
      const res = await api.createDeal({
        storeId: storeId!,
        title: title.trim(),
        category: category!,
        priceCents: Math.round(parseFloat(price) * 100),
        originalPriceCents: Math.round(parseFloat(originalPrice) * 100),
        photoDataUrl: photo!,
        note: note.trim() || undefined,
        postedFrom: locationGranted ? location : undefined,
      })
      await refreshUser()
      setResult({ pointsEarned: res.pointsEarned, newBadges: res.newBadges })
      setStep('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Post failed')
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmExisting(deal: Deal) {
    try {
      await api.vote(deal.id, 'confirmed') // FR-7: confirming grants the vote point
      await refreshUser()
      navigate(`/deal/${deal.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not confirm')
    }
  }

  const stepIndex = { photo: 1, details: 2, store: 3, done: 3 }[step]

  return (
    <div className="px-4 pt-4 pb-28">
      <header className="mb-4 flex items-center gap-3">
        {step !== 'photo' && step !== 'done' && (
          <button
            onClick={() => setStep(step === 'store' ? 'details' : 'photo')}
            aria-label="Back"
            className="rounded-full border border-edge p-1.5 text-neutral-300"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        <h1 className="text-lg font-bold">Spot a deal</h1>
        <span className="ml-auto text-xs text-neutral-500">Step {stepIndex}/3</span>
      </header>

      {step === 'photo' && (
        <div className="space-y-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="glass flex h-72 w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-edge text-neutral-400 transition-colors hover:border-sticker hover:text-sticker focus:outline-none focus-visible:ring-2 focus-visible:ring-sticker"
          >
            <Camera size={40} />
            <span className="text-sm font-semibold">Snap the yellow sticker</span>
            <span className="text-xs text-neutral-600">Tap to open camera or upload</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </div>
      )}

      {step === 'details' && photo && (
        <div className="space-y-4">
          <img src={photo} alt="Your deal photo" className="h-44 w-full rounded-2xl object-cover" />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What is it? e.g. Chicken thighs family pack"
            maxLength={80}
            className="w-full rounded-xl border border-edge bg-card px-4 py-3 text-sm placeholder-neutral-600 focus:border-sticker focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs text-neutral-500">Sticker price</span>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="2.99"
                className="w-full rounded-xl border border-edge bg-card px-4 py-3 text-sm placeholder-neutral-600 focus:border-sticker focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-neutral-500">Original price</span>
              <input
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="7.99"
                className="w-full rounded-xl border border-edge bg-card px-4 py-3 text-sm placeholder-neutral-600 focus:border-sticker focus:outline-none"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORY_LABELS) as DealCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sticker ${
                  category === cat
                    ? 'border-sticker bg-sticker text-neutral-950'
                    : 'border-edge bg-card text-neutral-300'
                }`}
              >
                {CATEGORY_EMOJI[cat]} {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Aisle / note (optional)"
            maxLength={100}
            className="w-full rounded-xl border border-edge bg-card px-4 py-3 text-sm placeholder-neutral-600 focus:border-sticker focus:outline-none"
          />
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <button
            onClick={toStoreStep}
            className="w-full rounded-xl bg-sticker py-3 text-sm font-bold text-neutral-950 transition-transform hover:scale-[1.01]"
          >
            Next: confirm store
          </button>
        </div>
      )}

      {step === 'store' && (
        <div className="space-y-3">
          {duplicates.length > 0 ? (
            <div className="glass space-y-3 rounded-2xl border border-sticker/40 p-4">
              <p className="text-sm font-bold">Is this the same deal?</p>
              <p className="text-xs text-neutral-400">
                Someone spotted something similar here in the last 6 hours. Confirming their post
                earns you a point and keeps the feed tidy.
              </p>
              {duplicates.map(({ deal }) => (
                <div key={deal.id} className="flex items-center gap-3 rounded-xl bg-card p-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{deal.title}</span>
                    <span className="text-xs text-neutral-500">
                      {formatPrice(deal.priceCents)} · by {deal.postedByName}
                    </span>
                  </span>
                  <button
                    onClick={() => confirmExisting(deal)}
                    className="shrink-0 rounded-lg bg-sticker px-3 py-1.5 text-xs font-bold text-neutral-950"
                  >
                    Same deal ✓
                  </button>
                </div>
              ))}
              <button
                onClick={submit}
                disabled={submitting}
                className="w-full rounded-xl border border-edge py-2.5 text-sm font-semibold text-neutral-300 disabled:opacity-50"
              >
                No, mine is different — post it
              </button>
            </div>
          ) : (
            <>
              <input
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
                placeholder="Search stores…"
                className="w-full rounded-xl border border-edge bg-card px-4 py-3 text-sm placeholder-neutral-600 focus:border-sticker focus:outline-none"
              />
              <div className="space-y-2">
                {sortedStores.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStoreId(s.id)}
                    className={`flex w-full items-center gap-2 rounded-xl border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sticker ${
                      storeId === s.id ? 'border-sticker bg-sticker/10' : 'border-edge bg-card'
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{s.name}</span>
                      <span className="text-xs text-neutral-500">
                        {s.city} · {formatDistance(distanceKm(location, s))}
                      </span>
                    </span>
                    {storeId === s.id && <span className="text-sticker">✓</span>}
                  </button>
                ))}
              </div>
              {error && <p className="text-xs text-rose-400">{error}</p>}
              <button
                onClick={checkDuplicatesAndSubmit}
                disabled={submitting || !storeId}
                className="w-full rounded-xl bg-sticker py-3 text-sm font-bold text-neutral-950 disabled:opacity-50"
              >
                {submitting ? 'Posting…' : 'Post deal'}
              </button>
            </>
          )}
        </div>
      )}

      {step === 'done' && result && (
        <div className="animate-pop-in flex flex-col items-center gap-4 py-16 text-center">
          <RabbitLogo size={64} className="animate-hop" />
          <h2 className="flex items-center gap-2 text-xl font-extrabold">
            <PartyPopper size={20} className="text-sticker" /> +{result.pointsEarned} points!
          </h2>
          <p className="text-sm text-neutral-400">Your find is live. Fellow shoppers thank you.</p>
          {result.newBadges.length > 0 && (
            <div className="space-y-1">
              {result.newBadges.map((b) => (
                <p key={b} className="text-sm font-semibold text-sticker">
                  {BADGES[b]?.emoji} New badge: {BADGES[b]?.name}
                </p>
              ))}
            </div>
          )}
          <button
            onClick={() => navigate('/')}
            className="rounded-xl bg-sticker px-6 py-2.5 text-sm font-bold text-neutral-950"
          >
            Back to feed
          </button>
        </div>
      )}
    </div>
  )
}
