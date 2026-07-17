export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const min = Math.floor(ms / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const d = Math.floor(hr / 24)
  return `${d}d ago`
}

export function endsIn(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= 0) return 'ended'
  const days = Math.ceil(ms / 86400000)
  if (days > 1) return `ends in ${days} days`
  const hrs = Math.ceil(ms / 3600000)
  return `ends in ${hrs}h`
}

export const CATEGORY_LABELS: Record<string, string> = {
  meat: 'Meat',
  produce: 'Produce',
  dairy: 'Dairy',
  bakery: 'Bakery',
  frozen: 'Frozen',
  pantry: 'Pantry',
  household: 'Household',
  other: 'Other',
}

export const CATEGORY_EMOJI: Record<string, string> = {
  meat: '🥩',
  produce: '🥦',
  dairy: '🧀',
  bakery: '🥖',
  frozen: '🧊',
  pantry: '🥫',
  household: '🧻',
  other: '🛒',
}
