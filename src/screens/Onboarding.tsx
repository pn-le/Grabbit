import { useMemo, useState } from 'react'
import { MapPin } from 'lucide-react'
import { useApp } from '../state/AppContext'
import { STORES } from '../data/stores'
import { distanceKm, formatDistance } from '../lib/geo'
import { ChainDot } from '../components/shared'
import { RabbitLogo } from '../components/RabbitLogo'

const MAX_FAVORITES = 5

export function Onboarding() {
  const { location, requestLocation, locationGranted, setFavoriteStoreIds, completeOnboarding } =
    useApp()
  const [step, setStep] = useState<'welcome' | 'stores'>('welcome')
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')

  const sorted = useMemo(() => {
    const q = search.toLowerCase()
    return [...STORES]
      .filter((s) => !q || `${s.name} ${s.city}`.toLowerCase().includes(q))
      .sort((a, b) => distanceKm(location, a) - distanceKm(location, b))
  }, [location, search])

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < MAX_FAVORITES
          ? [...prev, id]
          : prev,
    )
  }

  function finish() {
    setFavoriteStoreIds(selected)
    completeOnboarding()
  }

  if (step === 'welcome')
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-8 text-center">
        <RabbitLogo size={88} className="animate-hop" />
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Grabbit<span className="text-sticker">.</span>
          </h1>
          <p className="mt-3 max-w-70 text-sm leading-relaxed text-neutral-400">
            Every yellow-sticker markdown at the grocery stores near you — pulled from store
            systems where possible, spotted by fellow shoppers everywhere else.
          </p>
          <p className="mt-2 text-sm font-semibold text-sticker">See it, grab it.</p>
        </div>
        <div className="w-full max-w-xs space-y-3">
          <button
            onClick={async () => {
              await requestLocation()
              setStep('stores')
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-sticker py-3 text-sm font-bold text-neutral-950 transition-transform hover:scale-[1.02]"
          >
            <MapPin size={16} /> Use my location
          </button>
          <button
            onClick={() => setStep('stores')}
            className="w-full rounded-xl border border-edge py-3 text-sm font-semibold text-neutral-300 hover:border-neutral-500"
          >
            Skip — use downtown Boston
          </button>
        </div>
      </div>
    )

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-8 pb-4">
      <h1 className="text-xl font-extrabold">Pick your stores</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Up to {MAX_FAVORITES}. {locationGranted ? 'Sorted by distance from you.' : 'Sorted from downtown Boston.'}
      </p>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search stores…"
        className="mt-3 w-full rounded-xl border border-edge bg-card px-4 py-3 text-sm placeholder-neutral-600 focus:border-sticker focus:outline-none"
      />
      <div className="mt-3 flex-1 space-y-2 overflow-y-auto">
        {sorted.map((s) => {
          const active = selected.includes(s.id)
          return (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sticker ${
                active ? 'border-sticker bg-sticker/10' : 'border-edge bg-card'
              }`}
            >
              <ChainDot chainId={s.chainId} size={10} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{s.name}</span>
                <span className="text-xs text-neutral-500">
                  {s.city} · {formatDistance(distanceKm(location, s))}
                </span>
              </span>
              {active && <span className="text-sticker">✓</span>}
            </button>
          )
        })}
      </div>
      <div className="glass sticky bottom-0 -mx-4 border-t border-edge px-4 py-3">
        <button
          onClick={finish}
          className="w-full rounded-xl bg-sticker py-3 text-sm font-bold text-neutral-950 disabled:opacity-40"
        >
          {selected.length > 0 ? `Start with ${selected.length} store${selected.length > 1 ? 's' : ''}` : 'Skip for now'}
        </button>
      </div>
    </div>
  )
}
