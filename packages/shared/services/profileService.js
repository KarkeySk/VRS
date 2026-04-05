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

    /** Upload profile avatar to Supabase Storage */
    uploadAvatar: async (userId, file) => {
        const path = `avatars/${userId}`
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(path, file, { upsert: true })
        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        return data.publicUrl
    },
}
