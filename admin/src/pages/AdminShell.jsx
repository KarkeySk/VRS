import { useState } from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import ErrorBoundary from '@/components/ErrorBoundary'

const PAGE_META = {
  dashboard:     { title: 'Fleet Command', subtitle: 'Bikes • Cars • Jeeps' },
  fleet:         { title: 'Fleet' },
  bookings:      { title: 'Bookings' },
  compliance:    { title: 'Checks & Logs' },
  operations:    { title: 'Operations & Logs', subtitle: 'Admin' },
  messages:      { title: 'Messages', subtitle: 'Live support' },
  settings:      { title: 'Settings' },
  'add-vehicle': { title: 'Add Vehicle', subtitle: 'Form' },
  'new-booking': { title: 'New Booking', subtitle: 'Booking Form' },
  'admin-profile': { title: 'Profile', subtitle: 'Account' },
}

export default function AdminShell() {
  const location = useLocation()
  const [topBarMessage, setTopBarMessage] = useState('')

  // Derive active page key from the URL segment after /dashboard
  const segment = location.pathname.replace(/^\/dashboard\/?/, '') || 'dashboard'
  const meta = PAGE_META[segment] || PAGE_META.dashboard

  return (
    <div className="flex h-screen overflow-hidden bg-dark-deeper text-txt-primary font-sans">
      <Sidebar activePage={segment} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          title={meta.title}
          subtitle={meta.subtitle}
          onShowNotifications={() => setTopBarMessage('Notifications will be added soon.')}
          onShowHelp={() => setTopBarMessage('Need help? Open Add Vehicle, New Booking, or Profile.')}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {topBarMessage && (
            <div className="mb-4 rounded-md border border-brand-orange/30 bg-brand-orange/10 px-3 py-2 text-xs text-brand-orange flex items-center justify-between gap-3">
              <span>{topBarMessage}</span>
              <button
                type="button"
                className="bg-transparent border-none text-brand-orange cursor-pointer text-xs font-semibold"
                onClick={() => setTopBarMessage('')}
              >
                Dismiss
              </button>
            </div>
          )}
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
