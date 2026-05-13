import { useAuth } from '../context/AuthContext'
import { Navigate, Outlet } from 'react-router-dom'

/**
 * Protect routes that require authentication.
 * Redirects unauthenticated users to /auth/login.
 */
export function ProtectedRoute() {
    const { user, loading, mfaRequired } = useAuth()
    if (loading) return null // or a loading spinner
    if (user && mfaRequired) return <Navigate to="/auth/login?mfa=required" replace />
    return user ? <Outlet /> : <Navigate to="/auth/login" replace />
}
