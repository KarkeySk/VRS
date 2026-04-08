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
