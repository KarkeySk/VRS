import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import AdminLogin from './pages/auth/AdminLogin'
import AdminShell from './pages/AdminShell'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import FleetIntroOverlay from './components/FleetIntroOverlay'
import DashboardPage from './pages/DashboardPage'
import FleetPage from './pages/FleetPage'
import BookingsPage from './pages/BookingsPage'
import CompliancePage from './pages/CompliancePage'
import OperationsPage from './pages/OperationsPage'
import MessagesPage from './pages/MessagesPage'
import SettingsPage from './pages/SettingsPage'
import AddVehiclePage from './pages/AddVehiclePage'
import NewBookingPage from './pages/NewBookingPage'
import AdminProfilePage from './pages/AdminProfilePage'

// Wrapper that injects a URL-based onNavigate prop into pages that need it.
function AdminPage({ component: Component }) {
  const navigate = useNavigate()
  const onNavigate = useCallback(
    (id) => navigate(id === 'dashboard' ? '/dashboard' : `/dashboard/${id}`),
    [navigate]
  )
  return <Component onNavigate={onNavigate} />
}

function App() {
  const [showIntro, setShowIntro] = useState(false)

  useEffect(() => {
    const seen = sessionStorage.getItem('admin_fleet_intro_seen')
    if (seen) return
    sessionStorage.setItem('admin_fleet_intro_seen', '1')
    setShowIntro(true)
  }, [])

  return (
    <>
      {showIntro && <FleetIntroOverlay onDone={() => setShowIntro(false)} />}
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route
            path="/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminShell />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminPage component={DashboardPage} />} />
            <Route path="fleet" element={<FleetPage />} />
            <Route path="bookings" element={<AdminPage component={BookingsPage} />} />
            <Route path="compliance" element={<CompliancePage />} />
            <Route path="operations" element={<OperationsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="add-vehicle" element={<AdminPage component={AddVehiclePage} />} />
            <Route path="new-booking" element={<AdminPage component={NewBookingPage} />} />
            <Route path="admin-profile" element={<AdminPage component={AdminProfilePage} />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
