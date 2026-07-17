import type { ReactNode } from 'react'
import type { DealSource } from '../lib/types'
import { chainById } from '../data/stores'
import { RabbitLogo } from './RabbitLogo'

export function SourceBadge({ source }: { source: DealSource }) {
  const styles: Record<DealSource, { label: string; cls: string }> = {
    store_data: { label: '✓ Store data', cls: 'bg-emerald-500/15 text-emerald-300' },
    community: { label: '📸 Spotted', cls: 'bg-sticker/15 text-sticker' },
    coupon: { label: '🏷️ Coupon', cls: 'bg-sky-500/15 text-sky-300' },
  }
  const s = styles[source]
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${s.cls}`}>{s.label}</span>
  )
}

export function ChainDot({ chainId, size = 8 }: { chainId: string; size?: number }) {
  const chain = chainById(chainId)
  return (
    <span
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, background: chain.color }}
      aria-hidden="true"
    />
  )
}

export function DiscountBadge({ pct }: { pct: number }) {
  return (
    <span className="rounded-md bg-sticker px-1.5 py-0.5 text-xs font-extrabold text-neutral-950">
      −{pct}%
    </span>
  )
}

export function Spinner() {
  return (
    <div className="flex justify-center py-10" role="status" aria-label="Loading">
      <div className="size-7 animate-spin rounded-full border-2 border-edge border-t-sticker" />
    </div>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <RabbitLogo size={56} className="animate-hop opacity-80" />
      <p className="font-semibold text-neutral-200">{title}</p>
      {hint && <p className="max-w-60 text-sm text-neutral-500">{hint}</p>}
    </div>
  )
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sticker ${
        active
          ? 'border-sticker bg-sticker text-neutral-950'
          : 'border-edge bg-card text-neutral-300 hover:border-neutral-500'
      }`}
    >
      {children}
    </button>
  )
}

export function DealPhoto({
  photoUrl,
  photoColor,
  title,
  emoji,
  className,
}: {
  photoUrl: string | null
  photoColor: string | null
  title: string
  emoji: string
  className: string
}) {
  if (photoUrl)
    return <img src={photoUrl} alt={title} loading="lazy" className={`object-cover ${className}`} />
  // demo placeholder: labeled clearly per PRD
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 ${className}`}
      style={{ background: `linear-gradient(135deg, ${photoColor ?? '#333'}, #171717 130%)` }}
    >
      <span className="text-3xl" aria-hidden="true">
        {emoji}
      </span>
      <span className="rounded bg-black/40 px-1.5 text-[9px] font-semibold tracking-widest text-white/70 uppercase">
        Demo
      </span>
    </div>
  )
}
