import { supabase } from '../lib/supabase'

export const authService = {
    /** Sign up a new user */
    signUp: async (email, password, metadata = {}) => {
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
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return data
    },

    /** Sign out current user */
    signOut: async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    },

    /** Get current session */
    getSession: async () => {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        return data.session
    },

    /** Get current user */
    getUser: async () => {
        const { data, error } = await supabase.auth.getUser()
        if (error) throw error
        return data.user
    },

    /** Listen to auth state changes */
    onAuthStateChange: (callback) => {
        return supabase.auth.onAuthStateChange(callback)
    },
}
