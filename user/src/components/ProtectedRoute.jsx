import { useAuth } from '../context/AuthContext'
import { Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { authService } from '@bhatbhati/shared/services/authService.js'

/**
 * Protect routes that require authentication.
 * Validates session expiration and role-based access.
 * Redirects unauthenticated users to /auth/login.
 */
export function ProtectedRoute() {
    const { user, session, loading } = useAuth()
    const [isAllowed, setIsAllowed] = useState(false)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        let mounted = true
        const checkAccess = async () => {
            if (!user || !session) {
                if (mounted) {
                    setIsAllowed(false)
                    setChecking(false)
                }
                return
            }

            // Validate session expiration
            const expiresAt = session.expires_at ? session.expires_at * 1000 : 0
            if (expiresAt > 0 && Date.now() > expiresAt) {
                try {
                    await authService.signOut()
                } catch {
                    // sign-out failure is non-fatal; redirect handles cleanup
                }
                if (mounted) {
                    setIsAllowed(false)
                    setChecking(false)
                }
                return
            }

            try {
                // Role-based access: Prevent admins from accessing the user portal
                const isAdmin = await authService.isAdmin(user.id)
                if (mounted) setIsAllowed(!isAdmin)
            } catch {
                if (mounted) setIsAllowed(false)
            } finally {
                if (mounted) setChecking(false)
            }
        }

        if (!loading) {
            checkAccess()
        }

        return () => { mounted = false }
    }, [user, session, loading])

    if (loading || checking) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(0,0,0,0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    if (!user || !isAllowed) {
        return <Navigate to="/auth/login" replace />
    }

    return <Outlet />
}
