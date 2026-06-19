import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, FileClock, MessageSquare, Inbox } from 'lucide-react'
import { applicationService } from '@bhatbhati/shared/services/applicationService.js'
import { supportChatService } from '@bhatbhati/shared/services/supportChatService.js'

/*
  Admin notification bell.
  Surfaces real, actionable items derived from existing data:
    - booking applications awaiting review (status: submitted / under-review)
    - support conversations with unread messages from users
  Clicking an item routes the admin to the relevant page.
*/
export default function NotificationBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [pendingApps, setPendingApps] = useState([])
  const [unreadMessages, setUnreadMessages] = useState(0)
  const wrapRef = useRef(null)

  const refresh = async () => {
    try {
      const [apps, unread] = await Promise.all([
        applicationService.getAll().catch(() => []),
        supportChatService.getAdminUnreadTotal().catch(() => 0),
      ])
      setPendingApps((apps || []).filter((a) => a.status === 'submitted' || a.status === 'under-review'))
      setUnreadMessages(unread || 0)
    } catch {
      // Leave the last known state on transient failures.
    }
  }

  useEffect(() => {
    refresh()
    // Live-refresh when support conversations change.
    const unsub = supportChatService.subscribeConversations(refresh)
    return () => { if (typeof unsub === 'function') unsub() }
  }, [])

  // Close the dropdown on outside click.
  useEffect(() => {
    if (!open) return
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const total = pendingApps.length + (unreadMessages > 0 ? 1 : 0)

  const go = (path) => {
    setOpen(false)
    navigate(path)
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); if (!open) refresh() }}
        className="w-9 h-9 border-none bg-transparent text-txt-secondary cursor-pointer rounded-md transition-all duration-200 hover:bg-dark-hover hover:text-txt-primary flex items-center justify-center relative"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {total > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-brand-orange text-dark text-[10px] font-bold flex items-center justify-center">
            {total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-dark border border-dark-border rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-dark-border">
            <p className="text-sm font-semibold m-0">Notifications</p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {unreadMessages > 0 && (
              <button
                type="button"
                onClick={() => go('/dashboard/messages')}
                className="w-full flex items-center gap-3 px-4 py-3 text-left bg-transparent border-none border-b border-dark-border cursor-pointer hover:bg-dark-hover transition-colors"
              >
                <span className="w-8 h-8 rounded-lg bg-brand-orange/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-brand-orange" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm text-txt-primary font-medium">
                    {unreadMessages} unread support {unreadMessages === 1 ? 'message' : 'messages'}
                  </span>
                  <span className="block text-xs text-txt-secondary">Open Messages to reply</span>
                </span>
              </button>
            )}

            {pendingApps.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => go('/dashboard/bookings')}
                className="w-full flex items-center gap-3 px-4 py-3 text-left bg-transparent border-none border-b border-dark-border cursor-pointer hover:bg-dark-hover transition-colors"
              >
                <span className="w-8 h-8 rounded-lg bg-brand-city/20 flex items-center justify-center shrink-0">
                  <FileClock className="w-4 h-4 text-brand-city" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm text-txt-primary font-medium">
                    Booking awaiting review
                  </span>
                  <span className="block text-xs text-txt-secondary">
                    {app.profiles?.full_name || 'Customer'} · {app.vehicles?.name || 'Vehicle'}
                  </span>
                </span>
              </button>
            ))}

            {total === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                <Inbox className="w-8 h-8 text-txt-muted" />
                <p className="text-sm text-txt-secondary m-0">You're all caught up.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
