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
  dashboard: { title: 'Booking Management', search: 'Search...', showNewBtn: true },
  fleet: { title: 'Fleet Overview', search: 'Search fleet...', showNewBtn: false },
  bookings: { title: 'Bookings', search: 'Search bookings...', showNewBtn: true },
  compliance: { title: 'Compliance & Logs', search: 'Search records...', showNewBtn: false },
  operations: { title: 'Operations & Logs', subtitle: 'Admin Portal', search: 'Search fleet logs...', showNewBtn: false },
  settings: { title: 'Settings', search: 'Search settings...', showNewBtn: false },
  'add-vehicle': { title: 'Add New Vehicle', subtitle: 'Registration', search: 'Search vehicles...', showNewBtn: false },
  'new-booking': { title: 'New Booking', subtitle: 'Expedition Reservation', search: 'Search vehicles...', showNewBtn: false },
  'admin-profile': { title: 'Admin Profile', subtitle: 'Account Settings', search: 'Search settings...', showNewBtn: false },
}

export default function Dashboard() {
  const [activePage, setActivePage] = useState('dashboard')
  const meta = PAGE_META[activePage]

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />
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
          searchPlaceholder={meta.search}
          showNewBooking={meta.showNewBtn}
          onNewBooking={() => setActivePage('new-booking')}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}
