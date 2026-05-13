import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { authService } from '@bhatbhati/shared/services/authService.js'

const AuthContext = createContext(null)

function needsMfaChallenge(assurance) {
    return assurance?.nextLevel === 'aal2' && assurance.nextLevel !== assurance.currentLevel
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [mfaRequired, setMfaRequired] = useState(false)
    const [loading, setLoading] = useState(true)

    const applySession = useCallback((s) => {
        setSession(s)
        setUser(s?.user ?? null)
    }, [])

    const refreshAuthState = useCallback(async () => {
        const validatedSession = await authService.getValidatedSession()
        if (!validatedSession) {
            setMfaRequired(false)
            applySession(null)
            return null
        }

        try {
            const assurance = await authService.getAuthenticatorAssuranceLevel()
            setMfaRequired(needsMfaChallenge(assurance))
        } catch {
            setMfaRequired(false)
        }

        applySession(validatedSession)
        return validatedSession
    }, [applySession])

    useEffect(() => {
        let mounted = true
        let subscription = null

        authService.getValidatedSession()
            .then(async (validatedSession) => {
                if (!mounted) return

                if (!validatedSession) {
                    setMfaRequired(false)
                    applySession(null)
                    return
                }

                try {
                    const assurance = await authService.getAuthenticatorAssuranceLevel()
                    if (mounted) setMfaRequired(needsMfaChallenge(assurance))
                } catch {
                    if (mounted) setMfaRequired(false)
                }

                if (mounted) applySession(validatedSession)
            })
            .catch((err) => {
                console.warn('Auth session check failed (Supabase may not be configured):', err.message)
                if (mounted) {
                    setMfaRequired(false)
                    applySession(null)
                }
            })
            .finally(() => {
                if (mounted) setLoading(false)
            })

        try {
            const result = authService.onAuthStateChange(async (_event, s) => {
                if (!mounted) return
                if (!s) {
                    setMfaRequired(false)
                    applySession(null)
                    return
                }

                try {
                    await refreshAuthState()
                } catch (err) {
                    console.warn('Auth session validation failed:', err.message)
                    if (mounted) applySession(null)
                }
            })
            subscription = result?.data?.subscription || result?.data?.listener?.subscription
        } catch (err) {
            console.warn('Auth listener setup failed:', err.message)
        }

        return () => {
            mounted = false
            subscription?.unsubscribe()
        }
    }, [applySession, refreshAuthState])

    const value = {
        user,
        session,
        loading,
        mfaRequired,
        refreshAuthState,
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
