import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, isDemoMode } from '../lib/api'
import { useApp } from '../state/AppContext'
import { RabbitLogo } from '../components/RabbitLogo'

export function Auth() {
  const navigate = useNavigate()
  const { refreshUser } = useApp()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!/.+@.+\..+/.test(email)) return setError('Enter a valid email')
    if (!/^[a-z0-9_]{3,20}$/i.test(username))
      return setError('Username: 3–20 letters, numbers, underscores')
    setBusy(true)
    try {
      const res = await api.signIn(email.trim(), username.trim())
      if (res.magicLinkSent) {
        setSent(true) // Supabase magic link
      } else {
        await refreshUser()
        navigate(-1)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed')
    } finally {
      setBusy(false)
    }
  }

  if (sent)
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-24 text-center">
        <RabbitLogo size={52} className="animate-hop" />
        <h1 className="text-lg font-bold">Check your email</h1>
        <p className="max-w-64 text-sm text-neutral-400">
          We sent a magic link to <span className="text-neutral-200">{email}</span>. Tap it to
          finish signing in.
        </p>
      </div>
    )

  return (
    <div className="px-6 pt-16 pb-28">
      <div className="mx-auto max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <RabbitLogo size={56} />
          <h1 className="text-xl font-extrabold">Join Grabbit</h1>
          <p className="text-sm text-neutral-400">
            Browse without an account. Sign in to post finds and vote.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username (shown publicly)"
            autoComplete="username"
            className="w-full rounded-xl border border-edge bg-card px-4 py-3 text-sm placeholder-neutral-600 focus:border-sticker focus:outline-none"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email (never shown)"
            autoComplete="email"
            className="w-full rounded-xl border border-edge bg-card px-4 py-3 text-sm placeholder-neutral-600 focus:border-sticker focus:outline-none"
          />
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-sticker py-3 text-sm font-bold text-neutral-950 transition-transform hover:scale-[1.01] disabled:opacity-50"
          >
            {busy ? 'One sec…' : isDemoMode ? 'Create demo account' : 'Email me a magic link'}
          </button>
          {isDemoMode && (
            <p className="text-center text-xs text-neutral-600">
              Demo mode: account lives in this browser only. Connect Supabase for real magic-link
              auth.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
