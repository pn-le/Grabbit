import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Trophy } from 'lucide-react'
import type { Deal, LeaderboardEntry } from '../lib/types'
import { api } from '../lib/api'
import { useApp } from '../state/AppContext'
import { BADGES, levelForPoints, levelName, nextLevel } from '../lib/points'
import { STORES } from '../data/stores'
import { formatPrice, timeAgo } from '../lib/format'
import { EmptyState, Spinner } from '../components/shared'
import { RabbitLogo } from '../components/RabbitLogo'

export function Profile() {
  const { user, signOut, favoriteStoreIds } = useApp()
  const [tab, setTab] = useState<'posts' | 'leaderboard'>('posts')
  const [posts, setPosts] = useState<Deal[] | null>(null)
  const [board, setBoard] = useState<LeaderboardEntry[] | null>(null)
  const [period, setPeriod] = useState<'weekly' | 'alltime'>('weekly')
  const [boardStore, setBoardStore] = useState<string | null>(null)

  useEffect(() => {
    if (user) void api.getMyPosts().then(setPosts)
  }, [user])

  useEffect(() => {
    setBoard(null)
    void api.getLeaderboard(boardStore, period).then(setBoard)
  }, [period, boardStore])

  if (!user)
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
        <RabbitLogo size={52} />
        <h1 className="text-lg font-bold">Your warren awaits</h1>
        <p className="max-w-64 text-sm text-neutral-400">
          Sign in to track points, earn badges, and climb the leaderboards.
        </p>
        <Link
          to="/auth"
          className="rounded-xl bg-sticker px-6 py-2.5 text-sm font-bold text-neutral-950"
        >
          Sign in
        </Link>
      </div>
    )

  const level = levelForPoints(user.points)
  const next = nextLevel(user.points)
  const progress = next
    ? ((user.points - level.minPoints) / (next.minPoints - level.minPoints)) * 100
    : 100

  return (
    <div className="px-4 pt-6 pb-28">
      <div className="glass rounded-3xl border border-edge p-5">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-sticker/15 text-2xl">
            🐇
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-extrabold">{user.username}</h1>
            <p className="text-sm font-semibold text-sticker">{level.name}</p>
          </div>
          <button
            onClick={() => void signOut()}
            aria-label="Sign out"
            className="rounded-full border border-edge p-2 text-neutral-400 hover:text-neutral-200"
          >
            <LogOut size={15} />
          </button>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-neutral-400">
            <span>{user.points} pts</span>
            {next && (
              <span>
                {next.minPoints - user.points} to {next.name}
              </span>
            )}
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-edge">
            <div
              className="h-full rounded-full bg-sticker transition-all"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
        {user.badges.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {user.badges.map((b) => (
              <span
                key={b}
                title={BADGES[b]?.desc}
                className="rounded-full bg-card px-2.5 py-1 text-xs text-neutral-300"
              >
                {BADGES[b]?.emoji} {BADGES[b]?.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex gap-2">
        {(['posts', 'leaderboard'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-xl border py-2 text-sm font-semibold transition-colors ${
              tab === t
                ? 'border-sticker bg-sticker/10 text-sticker'
                : 'border-edge text-neutral-400'
            }`}
          >
            {t === 'posts' ? 'My posts' : 'Leaderboard'}
          </button>
        ))}
      </div>

      {tab === 'posts' && (
        <div className="mt-4 space-y-2">
          {posts === null && <Spinner />}
          {posts?.length === 0 && (
            <EmptyState title="No posts yet" hint="Spot a yellow sticker and share it!" />
          )}
          {posts?.map((d) => (
            <Link
              key={d.id}
              to={`/deal/${d.id}`}
              className="glass flex items-center gap-3 rounded-xl border border-edge p-3"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{d.title}</span>
                <span className="text-xs text-neutral-500">
                  {formatPrice(d.priceCents)} · {timeAgo(d.postedAt)} ·{' '}
                  {d.status === 'active' ? `✓${d.confirmedCount} ✗${d.goneCount}` : d.status}
                </span>
              </span>
              <span className="text-xs text-neutral-600">→</span>
            </Link>
          ))}
        </div>
      )}

      {tab === 'leaderboard' && (
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            {(['weekly', 'alltime'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  period === p ? 'border-sticker bg-sticker text-neutral-950' : 'border-edge text-neutral-300'
                }`}
              >
                {p === 'weekly' ? 'This week' : 'All time'}
              </button>
            ))}
            <select
              value={boardStore ?? ''}
              onChange={(e) => setBoardStore(e.target.value || null)}
              className="ml-auto max-w-40 rounded-full border border-edge bg-card px-3 py-1.5 text-xs text-neutral-300 focus:border-sticker focus:outline-none"
              aria-label="Leaderboard store"
            >
              <option value="">All stores</option>
              {STORES.filter((s) => favoriteStoreIds.length === 0 || favoriteStoreIds.includes(s.id)).map(
                (s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ),
              )}
            </select>
          </div>
          {board === null && <Spinner />}
          {board?.map((e) => (
            <div
              key={e.userId}
              className={`glass flex items-center gap-3 rounded-xl border p-3 ${
                e.username === user.username ? 'border-sticker/60' : 'border-edge'
              }`}
            >
              <span
                className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                  e.rank <= 3 ? 'bg-sticker text-neutral-950' : 'bg-card text-neutral-400'
                }`}
              >
                {e.rank}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{e.username}</span>
                <span className="text-xs text-neutral-500">{levelName(e.level)}</span>
              </span>
              <span className="flex items-center gap-1 text-sm font-bold text-sticker">
                <Trophy size={13} /> {e.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
