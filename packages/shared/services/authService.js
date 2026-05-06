import { supabase } from '../lib/supabase'

const getEmailRedirectTo = () => {
    if (typeof window !== 'undefined' && window.location?.origin) {
        return `${window.location.origin}/auth/verify`
    }
    return undefined
}

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
        return data
    },

    /** Sign in existing user */
    signIn: async (email, password) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return data
    },

    /** Sign out current user */
    signOut: async () => {
        if (!supabase) return
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    },

    /** Update current user password */
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

    /** Get current session */
    getSession: async () => {
        if (!supabase) return null
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
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
        if (!supabase) return { data: { listener: { subscription: { unsubscribe: () => {} } } } }
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
