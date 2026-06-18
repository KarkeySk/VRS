import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutGrid,
  FileText,
  CalendarDays,
  CheckCircle,
  Settings as SettingsIcon,
  Cog,
  MessageSquare,
  User,
} from 'lucide-react'
import { supportChatService } from '@bhatbhati/shared/services/supportChatService.js'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
  { id: 'fleet',     label: 'Fleet',     icon: FileText,   path: '/dashboard/fleet' },
  { id: 'bookings',  label: 'Bookings',  icon: CalendarDays, path: '/dashboard/bookings' },
  { id: 'compliance', label: 'Checks',   icon: CheckCircle, path: '/dashboard/compliance' },
  { id: 'operations', label: 'Operations', icon: Cog,       path: '/dashboard/operations' },
  { id: 'messages',  label: 'Messages',  icon: MessageSquare, path: '/dashboard/messages' },
  { id: 'settings',  label: 'Settings',  icon: SettingsIcon, path: '/dashboard/settings' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [unread, setUnread] = useState(0)

  // Live badge: total messages awaiting an admin reply
  useEffect(() => {
    let active = true
    const refresh = () =>
      supportChatService.getAdminUnreadTotal()
        .then((n) => { if (active) setUnread(n) })
        .catch(() => {})
    refresh()
    const unsub = supportChatService.subscribeConversations(refresh)
    return () => { active = false; unsub() }
  }, [])

  const isActive = (item) =>
    item.id === 'dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(`/dashboard/${item.id}`)

  return (
    <aside className="w-[207px] bg-dark-deeper border-r border-dark-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 py-6 border-b border-dark-border">
        <p className="text-[13px] text-txt-secondary uppercase tracking-wider font-semibold m-0">
          Bhatbhate
        </p>
        <p className="text-base font-bold text-txt-primary mt-1 m-0 tracking-wide">
          HIMALAYAN FLEET
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item)
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.path)}
              className={`nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                active
                  ? 'nav-active bg-brand-orange text-dark font-semibold'
                  : 'text-txt-secondary'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.id === 'messages' && unread > 0 && (
                <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  active ? 'bg-dark text-brand-orange' : 'bg-brand-orange text-dark'
                }`}>
                  {unread}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-dark-border">
        <button
          onClick={() => navigate('/dashboard/add-vehicle')}
          className="btn-action w-full py-3 text-[13px] mb-4"
        >
          + Add New Vehicle
        </button>
        <div
          onClick={() => navigate('/dashboard/admin-profile')}
          className="flex items-center gap-3 px-2 cursor-pointer rounded-lg py-2 hover:bg-[rgba(255,143,63,0.1)] transition-all duration-200"
        >
          <div className="w-8 h-8 rounded-md bg-brand-orange flex items-center justify-center font-bold text-xs text-dark">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold m-0">Chakuu</p>
            <p className="text-xs text-txt-secondary m-0">Fleet Director</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
