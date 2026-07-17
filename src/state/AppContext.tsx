import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '../lib/types'
import { DOWNTOWN_BOSTON, getCurrentPosition, type LatLng } from '../lib/geo'
import { api } from '../lib/api'

interface AppState {
  location: LatLng
  locationGranted: boolean
  requestLocation: () => Promise<void>
  favoriteStoreIds: string[]
  setFavoriteStoreIds: (ids: string[]) => void
  onboarded: boolean
  completeOnboarding: () => void
  user: User | null
  refreshUser: () => Promise<void>
  signOut: () => Promise<void>
}

const Ctx = createContext<AppState | null>(null)

const LS_STORES = 'grabbit.favoriteStores'
const LS_ONBOARDED = 'grabbit.onboarded'

export function AppProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LatLng>(DOWNTOWN_BOSTON)
  const [locationGranted, setLocationGranted] = useState(false)
  const [favoriteStoreIds, setFavIds] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem(LS_STORES) ?? '[]'),
  )
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem(LS_ONBOARDED) === '1')
  const [user, setUser] = useState<User | null>(null)

  const requestLocation = useCallback(async () => {
    const pos = await getCurrentPosition()
    if (pos) {
      setLocation(pos)
      setLocationGranted(true)
    }
  }, [])

  const refreshUser = useCallback(async () => {
    setUser(await api.getCurrentUser())
  }, [])

  useEffect(() => {
    void refreshUser()
    if (onboarded) void requestLocation()
  }, [onboarded, refreshUser, requestLocation])

  const value = useMemo<AppState>(
    () => ({
      location,
      locationGranted,
      requestLocation,
      favoriteStoreIds,
      setFavoriteStoreIds: (ids) => {
        setFavIds(ids)
        localStorage.setItem(LS_STORES, JSON.stringify(ids))
      },
      onboarded,
      completeOnboarding: () => {
        setOnboarded(true)
        localStorage.setItem(LS_ONBOARDED, '1')
      },
      user,
      refreshUser,
      signOut: async () => {
        await api.signOut()
        setUser(null)
      },
    }),
    [location, locationGranted, requestLocation, favoriteStoreIds, onboarded, user, refreshUser],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp outside AppProvider')
  return ctx
}
