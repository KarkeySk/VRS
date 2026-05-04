import { supabase } from '../lib/supabase'

export const authService = {
    /** Sign up a new user */
    signUp: async (email, password, metadata = {}) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: metadata },
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

    /** Request password reset email (SCRUM-69: Create reset request endpoint) */
    resetPasswordForEmail: async (email, redirectTo) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectTo,
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
