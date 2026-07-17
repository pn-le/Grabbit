import { NavLink, useNavigate } from 'react-router-dom'
import { Map, Plus, Rabbit, Tag, TicketPercent } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Feed', Icon: Tag },
  { to: '/map', label: 'Map', Icon: Map },
  { to: '/post', label: 'Post', Icon: Plus, isAction: true },
  { to: '/coupons', label: 'Coupons', Icon: TicketPercent },
  { to: '/profile', label: 'Profile', Icon: Rabbit },
]

export function TabBar() {
  const navigate = useNavigate()
  return (
    <nav
      className="glass fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md items-stretch justify-around border-t border-edge pb-[env(safe-area-inset-bottom)]"
      aria-label="Main navigation"
    >
      {tabs.map(({ to, label, Icon, isAction }) =>
        isAction ? (
          <button
            key={to}
            onClick={() => navigate('/post')}
            aria-label="Post a deal"
            className="my-1.5 flex w-14 items-center justify-center self-center rounded-2xl bg-sticker py-2 text-neutral-950 shadow-lg shadow-sticker/20 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Icon size={22} strokeWidth={3} />
          </button>
        ) : (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-2 text-[11px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sticker ${
                isActive ? 'text-sticker' : 'text-neutral-400 hover:text-neutral-200'
              }`
            }
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </NavLink>
        ),
      )}
    </nav>
  )
}
