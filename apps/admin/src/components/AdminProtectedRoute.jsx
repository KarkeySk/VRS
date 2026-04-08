import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { authService } from '@bhatbhati/shared/services/authService.js'

export default function AdminProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [isAllowed, setIsAllowed] = useState(false)

  useEffect(() => {
    let mounted = true
    const check = async () => {
      try {
        const session = await authService.getSession()
        const userId = session?.user?.id
        if (!userId) {
          if (mounted) setIsAllowed(false)
          return
        }
        const admin = await authService.isAdmin(userId)
        if (mounted) setIsAllowed(Boolean(admin))
      } catch {
        if (mounted) setIsAllowed(false)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    check()
    return () => { mounted = false }
  }, [])

  if (loading) {
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
