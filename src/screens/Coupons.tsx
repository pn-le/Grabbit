import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import type { Coupon } from '../lib/types'
import { api } from '../lib/api'
import { CHAINS } from '../data/stores'
import { endsIn } from '../lib/format'
import { ChainDot, EmptyState, Spinner } from '../components/shared'

export function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null)

  useEffect(() => {
    void api.getCoupons().then(setCoupons)
  }, [])

  if (coupons === null) return <Spinner />

  return (
    <div className="px-4 pt-6 pb-28">
      <h1 className="text-xl font-extrabold tracking-tight">
        Coupons & weekly ads<span className="text-sticker">.</span>
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Current digital coupons and ad highlights, by chain. Links open the chain's own coupon
        page.
      </p>

      {coupons.length === 0 && <EmptyState title="No live coupons right now" />}

      <div className="mt-5 space-y-6">
        {CHAINS.map((chain) => {
          const chainCoupons = coupons.filter((c) => c.chainId === chain.id)
          if (chainCoupons.length === 0) return null
          return (
            <section key={chain.id}>
              <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-200">
                <ChainDot chainId={chain.id} size={10} /> {chain.name}
              </h2>
              <div className="mt-2 space-y-2">
                {chainCoupons.map((c) => (
                  <a
                    key={c.id}
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="glass flex items-center gap-3 rounded-xl border border-edge p-3 transition-colors hover:border-neutral-500"
                  >
                    <span className="shrink-0 rounded-lg bg-sticker/15 px-2 py-1 text-xs font-extrabold text-sticker">
                      {c.valueText}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{c.title}</span>
                      <span className="text-xs text-neutral-500">
                        {c.description} · {endsIn(c.endsAt)}
                      </span>
                    </span>
                    <ExternalLink size={14} className="shrink-0 text-neutral-600" />
                  </a>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
