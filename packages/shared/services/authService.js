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
        if (data.user?.id) {
            await callFunction('send-verification-email', { user_id: data.user.id })
        }
        return data
    },

    /** Sign in existing user */
    signIn: async (email, password) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_verified')
            .eq('id', data.user.id)
            .maybeSingle()

        if (profileError) {
            await supabase.auth.signOut()
            throw profileError
        }

        if (!profile?.is_verified) {
            await supabase.auth.signOut()
            throw new Error('Please verify your email before signing in')
        }

        return data
    },

    /** Sign out current user */
    signOut: async () => {
        if (!supabase) return
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    },

    /** Verify user email with token from verification link */
    verifyEmail: async (token) => {
        if (!token) throw new Error('Verification token is required')
        if (!supabase) throw new Error('Verification service is not configured')

        await callFunction('verify-email', { token })

        return { message: 'Your email has been successfully verified' }
    },

    /** Resend verification email for an existing account */
    resendVerificationEmail: async (email) => {
        if (!email) throw new Error('Email address is required')
        if (!supabase) throw new Error('Verification service is not configured')

        await callFunction('send-verification-email', { email })

        return { message: 'Verification email sent' }
    },

    /** Update current user password */
    updatePassword: async (newPassword) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) throw error
        return data.user
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

async function callFunction(functionName, body) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')

    if (!supabaseUrl) {
        throw new Error('Supabase URL is not configured')
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })
    const payload = await readResponseBody(response)

    if (!response.ok) {
        throw new Error(payload?.error || payload?.message || 'Verification service request failed')
    }

    return payload
}

async function readResponseBody(response) {
    const text = await response.text()

    if (!text) return null

    try {
        return JSON.parse(text)
    } catch {
        return { error: text }
    }
}
