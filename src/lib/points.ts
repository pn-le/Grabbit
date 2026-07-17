export const POINTS = {
  post: 10,
  confirmedBonus: 5,
  vote: 1,
  atStoreBonus: 2,
} as const

export interface LevelDef {
  level: number
  name: string
  minPoints: number
}

export const LEVELS: LevelDef[] = [
  { level: 1, name: 'Deal Scout', minPoints: 0 },
  { level: 2, name: 'Bargain Hunter', minPoints: 100 },
  { level: 3, name: 'Markdown Master', minPoints: 500 },
  { level: 4, name: 'Clearance Legend', minPoints: 2000 },
]

export function levelForPoints(points: number): LevelDef {
  let cur = LEVELS[0]
  for (const l of LEVELS) if (points >= l.minPoints) cur = l
  return cur
}

export function levelName(level: number): string {
  return LEVELS.find((l) => l.level === level)?.name ?? 'Deal Scout'
}

export function nextLevel(points: number): LevelDef | null {
  return LEVELS.find((l) => l.minPoints > points) ?? null
}

export const BADGES: Record<string, { name: string; emoji: string; desc: string }> = {
  first_post: { name: 'First Post', emoji: '🐇', desc: 'Posted your first find' },
  ten_confirmed: { name: '10 Confirmed Finds', emoji: '✅', desc: '10 posts confirmed by others' },
  store_regular: { name: 'Store Regular', emoji: '🏪', desc: '10 posts at one store' },
  early_bird: { name: 'Early Bird', emoji: '🌅', desc: 'Posted before 8am' },
}
