import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { authService } from '@bhatbhati/shared/services/authService.js'

/*
  AdminProtectedRoute notes:
  - Blocks non-admin users.
  - Uses authService to verify roles.
  - Shows a loading screen during checks.
  - Fails closed on errors.
  - Redirects to /login when unauthorized.
  - Avoids state updates after unmount.
  - Designed for client-side routing.
  - Keeps UI simple during checks.
  - Expects authService to be configured.
  - Wraps any admin-only child tree.
*/

export default function AdminProtectedRoute({ children }) {
  // Track the async guard state.
  const [loading, setLoading] = useState(true)
  // Track if the user has admin access.
  const [isAllowed, setIsAllowed] = useState(false)

  useEffect(() => {
    // Guard admin-only routes and avoid setState after unmount.
    let mounted = true
    const check = async () => {
      try {
        // Verify a valid session first.
        const session = await authService.getSession()
        const userId = session?.user?.id
        if (!userId) {
          if (mounted) setIsAllowed(false)
          return
        }
        // Ask the backend whether the user is an admin.
        const admin = await authService.isAdmin(userId)
        if (mounted) setIsAllowed(Boolean(admin))
      } catch {
        // Fail closed if any checks error out.
        if (mounted) setIsAllowed(false)
      } finally {
        // Finish the loading state when done.
        if (mounted) setLoading(false)
      }
    }
    check()
    return () => { mounted = false }
  }, [])

  if (loading) {
    // Simple blocking screen while checks are in flight.
    // This avoids showing the app before auth is verified.
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        background: '#0a0a0a',
      }}>
        Checking admin login...
      </div>
    )
  }

  return isAllowed ? children : <Navigate to="/login" replace />
}
