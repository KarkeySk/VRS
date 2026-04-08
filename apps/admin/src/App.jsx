import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLogin from './pages/auth/AdminLogin'
import Dashboard from './pages/dashboard/Dashboard'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import FleetIntroOverlay from './components/FleetIntroOverlay'

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
            element={(
              <AdminProtectedRoute>
                <Dashboard />
              </AdminProtectedRoute>
            )}
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
