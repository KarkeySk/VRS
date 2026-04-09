import { supabase } from '../lib/supabase'

export const profileService = {
    /** Get a user's profile by user id */
    getById: async (userId) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
        if (error) throw error
        return data
    },

    /** Update user profile */
    update: async (userId, updates) => {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
        if (error) throw error
        return data[0]
    },

    /** Ensure a profile row exists for a given auth user id */
    ensureExists: async (userId, defaults = {}) => {
        if (!userId) throw new Error('Missing user id for profile check')

        const { data: existing, error: readError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .maybeSingle()
        if (readError) throw readError
        if (existing) return existing

        const payload = { id: userId, ...defaults }
        const { data, error } = await supabase
            .from('profiles')
            .insert([payload])
            .select()
            .single()
        if (error) throw error
        return data
    },

    /** Upload profile avatar to Supabase Storage */
    uploadAvatar: async (userId, file) => {
        const ext = file?.name?.split('.').pop()?.toLowerCase() || 'jpg'
        const safeExt = ext.replace(/[^a-z0-9]/g, '') || 'jpg'
        // Keep object under "<userId>/..." so storage RLS can match auth.uid().
        const path = `${userId}/avatar.${safeExt}`
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(path, file, { upsert: true })
        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        return data.publicUrl
    },
}
