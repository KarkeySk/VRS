import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '@bhatbhati/shared/services/authService.js'

const AuthContext = createContext(null)

function hasVerifiedEmail(user) {
    return Boolean(user?.email_confirmed_at || user?.confirmed_at)
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    const applySession = (nextSession) => {
        const nextUser = nextSession?.user ?? null
        if (nextUser && !hasVerifiedEmail(nextUser)) {
            setSession(null)
            setUser(null)
            authService.signOut().catch((err) => {
                console.warn('Unverified auth session cleanup failed:', err.message)
            })
            return false
        }

        setSession(nextSession)
        setUser(nextUser)
        return true
    }

    useEffect(() => {
        let listener = null

        // Grab initial session
        authService.getSession()
            .then((s) => applySession(s))
            .catch((err) => {
                console.warn('Auth session check failed (Supabase may not be configured):', err.message)
            })
            .finally(() => {
                setLoading(false)
            })

        // Listen for auth changes
        try {
            const result = authService.onAuthStateChange((_event, s) => {
                applySession(s)
            })
            listener = result?.data?.listener
        } catch (err) {
            console.warn('Auth listener setup failed:', err.message)
        }

        return () => {
            if (listener?.subscription) {
                listener.subscription.unsubscribe()
            }
        }
    }, [])

    const signIn = async (email, password, options = {}) => {
        const data = await authService.signIn(email, password)
        if (options.requireVerifiedEmail && !hasVerifiedEmail(data.user)) {
            await authService.signOut()
            setSession(null)
            setUser(null)
            throw new Error('Please verify your email before signing in')
        }

        applySession(data.session)
        return data
    }

    const signOut = async () => {
        setSession(null)
        setUser(null)
        await authService.signOut()
    }

    const value = {
        user,
        session,
        loading,
        signIn,
        signUp: authService.signUp,
        resendVerificationEmail: authService.resendVerificationEmail,
        signOut,
    }

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

/** Hook to consume auth context */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
