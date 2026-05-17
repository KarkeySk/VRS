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
                const provider = s?.user?.app_metadata?.provider
                const isVerified = s?.user
                    ? (provider && provider !== 'email') || Boolean(s.user.email_confirmed_at || s.user.confirmed_at)
                    : false
                setSession(isVerified ? s : null)
                setUser(isVerified ? s?.user ?? null : null)
            })
            listener = result?.data?.subscription ?? result?.data?.listener
        } catch (err) {
            console.warn('Auth listener setup failed:', err.message)
        }

        return () => {
            listener?.unsubscribe?.()
            listener?.subscription?.unsubscribe?.()
        }
    }, [])

    const value = {
        user,
        session,
        loading,
        signIn: (...args) => authService.signIn(...args),
        signUp: (...args) => authService.signUp(...args),
        signInWithGoogle: (...args) => authService.signInWithGoogle(...args),
        resendConfirmation: (...args) => authService.resendConfirmation(...args),
        signOut: (...args) => authService.signOut(...args),
        resetPasswordForEmail: (...args) => authService.resetPasswordForEmail(...args),
        updatePassword: (...args) => authService.updatePassword(...args),
        verifyOtp: (...args) => authService.verifyOtp(...args),
        enrollMfa: (...args) => authService.enrollMfa(...args),
        challengeAndVerifyMfa: (...args) => authService.challengeAndVerifyMfa(...args),
        unenrollMfa: (...args) => authService.unenrollMfa(...args),
        listMfaFactors: (...args) => authService.listMfaFactors(...args),
        getMfaLevel: (...args) => authService.getMfaLevel(...args),
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** Hook to consume auth context */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
