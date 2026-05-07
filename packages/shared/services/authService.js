import { supabase } from '../lib/supabase'

const trimTrailingSlash = (value) => value?.trim().replace(/\/+$/, '')

const getEmailRedirectTo = () => {
    const explicitRedirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL?.trim()
    if (explicitRedirectUrl) return explicitRedirectUrl

    const configuredAppUrl = trimTrailingSlash(
        import.meta.env.VITE_USER_APP_URL ||
        import.meta.env.VITE_APP_URL ||
        import.meta.env.VITE_PUBLIC_SITE_URL
    )
    if (configuredAppUrl) return `${configuredAppUrl}/auth/verify`

    if (typeof window !== 'undefined' && window.location?.origin) {
        return `${window.location.origin}/auth/verify`
    }
    return undefined
}

const isEmailVerified = (user) => Boolean(user?.email_confirmed_at || user?.confirmed_at)

export const authService = {
    /** Sign up a new user */
    signUp: async (email, password, metadata = {}) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
                emailRedirectTo: getEmailRedirectTo(),
            },
        })
        if (error) throw error
        if (data?.session && !isEmailVerified(data.user)) {
            await supabase.auth.signOut()
            return { ...data, session: null }
        }
        return data
    },

    /** Sign in existing user */
    signIn: async (email, password) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        if (!isEmailVerified(data.user)) {
            await supabase.auth.signOut()
            throw new Error('Email verification is required before signing in.')
        }
        return data
    },

    /** Sign out current user */
    signOut: async () => {
        if (!supabase) return
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    },

    /** Request password reset email (SCRUM-69: Create reset request endpoint) */
    resetPasswordForEmail: async (email) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const redirectUrl = typeof window !== 'undefined'
            ? `${window.location.origin}/auth/update-password`
            : undefined
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl,
        })
        if (error) throw error
        return data
    },

    /** Update current user password (SCRUM-72: Reset password API) */
    updatePassword: async (newPassword) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) throw error
        return data.user
    },

    /** Complete a Supabase email callback that includes a code query param */
    exchangeCodeForSession: async (code) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) throw error
        return data
    },

    /** Complete a Supabase email callback that includes access tokens in the URL hash */
    setSession: async (accessToken, refreshToken) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        })
        if (error) throw error
        return data
    },

    /** Verify a custom Supabase email template link using token_hash */
    verifyEmailOtp: async (tokenHash, type = 'email') => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type,
        })
        if (error) throw error
        return data
    },

    /** Send another signup confirmation email */
    resendConfirmation: async (email) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase.auth.resend({
            type: 'signup',
            email,
            options: {
                emailRedirectTo: getEmailRedirectTo(),
            },
        })
        if (error) throw error
        return data
    },

    /** Verify OTP for password recovery (SCRUM-70: Generate/verify token) */
    verifyOtp: async (email, token) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'recovery',
        })
        if (error) throw error
        return data
    },

    /** 2FA / MFA Methods */
    enrollMfa: async () => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
        if (error) throw error
        return data
    },

    challengeAndVerifyMfa: async (factorId, code) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase.auth.mfa.challengeAndVerify({
            factorId,
            code,
        })
        if (error) throw error
        return data
    },

    unenrollMfa: async (factorId) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase.auth.mfa.unenroll({ factorId })
        if (error) throw error
        return data
    },

    listMfaFactors: async () => {
        if (!supabase) return null
        const { data, error } = await supabase.auth.mfa.listFactors()
        if (error) throw error
        return data
    },

    getMfaLevel: async () => {
        if (!supabase) return null
        const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
        if (error) throw error
        return data
    },

    /** Get current session */
    getSession: async () => {
        if (!supabase) return null
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        if (data.session?.user && !isEmailVerified(data.session.user)) {
            await supabase.auth.signOut()
            return null
        }
        return data.session
    },

    /** Get current user */
    getUser: async () => {
        if (!supabase) return null
        const { data, error } = await supabase.auth.getUser()
        if (error) throw error
        return data.user
    },

    /** Listen to auth state changes */
    onAuthStateChange: (callback) => {
        if (!supabase) return { data: { listener: { subscription: { unsubscribe: () => { } } } } }
        return supabase.auth.onAuthStateChange(callback)
    },

    /** Check if a user has admin role */
    isAdmin: async (userId) => {
        if (!supabase) return false
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single()
        if (error) return false
        return data?.role === 'admin'
    },
}
