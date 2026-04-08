import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import DashboardPage from '@/pages/DashboardPage'
import FleetPage from '@/pages/FleetPage'
import BookingsPage from '@/pages/BookingsPage'
import CompliancePage from '@/pages/CompliancePage'
import OperationsPage from '@/pages/OperationsPage'
import SettingsPage from '@/pages/SettingsPage'
import AddVehiclePage from '@/pages/AddVehiclePage'
import NewBookingPage from '@/pages/NewBookingPage'
import AdminProfilePage from '@/pages/AdminProfilePage'

const PAGE_META = {
  dashboard: { title: 'Booking Management', showNewBtn: true },
  fleet: { title: 'Fleet Overview', showNewBtn: false },
  bookings: { title: 'Bookings', showNewBtn: true },
  compliance: { title: 'Compliance & Logs', showNewBtn: false },
  operations: { title: 'Operations & Logs', subtitle: 'Admin Portal', showNewBtn: false },
  settings: { title: 'Settings', showNewBtn: false },
  'add-vehicle': { title: 'Add New Vehicle', subtitle: 'Registration', showNewBtn: false },
  'new-booking': { title: 'New Booking', subtitle: 'Expedition Reservation', showNewBtn: false },
  'admin-profile': { title: 'Admin Profile', subtitle: 'Account Settings', showNewBtn: false },
}

export default function Dashboard() {
  const [activePage, setActivePage] = useState('dashboard')
  const [topBarMessage, setTopBarMessage] = useState('')
  const meta = PAGE_META[activePage]

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActivePage} />
      case 'fleet':
        return <FleetPage />
      case 'bookings':
        return <BookingsPage onNavigate={setActivePage} />
      case 'compliance':
        return <CompliancePage />
      case 'operations':
        return <OperationsPage />
      case 'settings':
        return <SettingsPage />
      case 'add-vehicle':
        return <AddVehiclePage onNavigate={setActivePage} />
      case 'new-booking':
        return <NewBookingPage onNavigate={setActivePage} />
      case 'admin-profile':
        return <AdminProfilePage onNavigate={setActivePage} />
      default:
        return <DashboardPage />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-dark-deeper text-txt-primary font-sans">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          title={meta.title}
          subtitle={meta.subtitle}
          showNewBooking={meta.showNewBtn}
          onNewBooking={() => setActivePage('new-booking')}
          onShowNotifications={() => setTopBarMessage('Notification center is coming next.')}
          onShowHelp={() => setTopBarMessage('Need help? Use Add Vehicle, New Booking, or Admin Profile to manage operations.')}
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
          {renderPage()}
        </main>
      </div>
    </div>
  )
}
