import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '@bhatbhati/shared/services/authService.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let listener = null

        // Grab initial session
        authService.getSession()
            .then((s) => {
                setSession(s)
                setUser(s?.user ?? null)
            })
            .catch((err) => {
                console.warn('Auth session check failed (Supabase may not be configured):', err.message)
            })
            .finally(() => {
                setLoading(false)
            })

        // Listen for auth changes
        try {
            const result = authService.onAuthStateChange((_event, s) => {
                setSession(s)
                setUser(s?.user ?? null)
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

    const value = {
        user,
        session,
        loading,
        signIn: authService.signIn,
        signUp: authService.signUp,
        signOut: authService.signOut,
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
