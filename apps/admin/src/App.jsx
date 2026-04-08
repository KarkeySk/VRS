import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLogin from './pages/auth/AdminLogin'
import Dashboard from './pages/dashboard/Dashboard'
import AdminProtectedRoute from './components/AdminProtectedRoute'

function App() {
  return (
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
  )
}

export default App
