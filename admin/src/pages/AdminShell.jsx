import { useState } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'

const PAGE_META = {
  dashboard:     { title: 'Fleet Command', subtitle: 'Bikes • Cars • Jeeps', showNewBtn: true },
  fleet:         { title: 'Fleet', showNewBtn: false },
  bookings:      { title: 'Bookings', showNewBtn: true },
  compliance:    { title: 'Checks & Logs', showNewBtn: false },
  operations:    { title: 'Operations & Logs', subtitle: 'Admin', showNewBtn: false },
  messages:      { title: 'Messages', subtitle: 'Live support', showNewBtn: false },
  settings:      { title: 'Settings', showNewBtn: false },
  'add-vehicle': { title: 'Add Vehicle', subtitle: 'Form', showNewBtn: false },
  'new-booking': { title: 'New Booking', subtitle: 'Booking Form', showNewBtn: false },
  'admin-profile': { title: 'Profile', subtitle: 'Account', showNewBtn: false },
}

export default function AdminShell() {
  const navigate = useNavigate()
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
          showNewBooking={meta.showNewBtn}
          onNewBooking={() => navigate('/dashboard/new-booking')}
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
          <Outlet />
        </main>
      </div>
    </div>
  )
}
