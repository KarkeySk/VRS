import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLogin from './pages/auth/AdminLogin'
import Dashboard from './pages/dashboard/Dashboard'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import FleetIntroOverlay from './components/FleetIntroOverlay'

/*
  App notes:
  - Owns the router for admin pages.
  - Shows a one-time intro overlay.
  - Protects dashboard behind auth.
  - Redirects unknown routes to login.
  - Keeps state minimal.
  - No data fetching here.
  - Uses sessionStorage for intro flag.
  - Layout lives in Dashboard shell.
  - Easy to extend with more routes.
  - Pure client-side routing.
*/

function App() {
  // Toggle for the short intro overlay.
  const [showIntro, setShowIntro] = useState(false)

  // App-level side effects are kept minimal.

  useEffect(() => {
    // Show the intro overlay once per browser session.
    const seen = sessionStorage.getItem('admin_fleet_intro_seen')
    // Skip if it already ran in this session.
    if (seen) return
    // Write the marker before showing the overlay.
    sessionStorage.setItem('admin_fleet_intro_seen', '1')
    // Trigger the overlay animation.
    setShowIntro(true)
  }, [])

  return (
    <>
      {/* Intro overlay is optional and short-lived. */}
      {showIntro && <FleetIntroOverlay onDone={() => setShowIntro(false)} />}
      {/* Router wrapper for admin routes. */}
      <BrowserRouter>
        <Routes>
          {/* Public login route. */}
          <Route path="/login" element={<AdminLogin />} />
          {/* Protected dashboard route. */}
          <Route
            path="/dashboard"
            element={(
              <AdminProtectedRoute>
                <Dashboard />
              </AdminProtectedRoute>
            )}
          />
          {/* Catch-all redirect back to login. */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
