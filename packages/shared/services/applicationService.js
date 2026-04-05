import { supabase } from '../lib/supabase'

export const applicationService = {
    create: async (applicationData) => {
        const { data, error } = await supabase
            .from('booking_applications')
            .insert([applicationData])
            .select()
        if (error) throw error
        return data[0]
    },

    getMyApplications: async (userId) => {
        const { data, error } = await supabase
            .from('booking_applications')
            .select('*, vehicles(*), inquiries(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
        if (error) throw error
        return data
    },

    getById: async (id) => {
        const { data, error } = await supabase
            .from('booking_applications')
            .select('*, vehicles(*), inquiries(*), profiles(*)')
            .eq('id', id)
            .single()
        if (error) throw error
        return data
    },

    getAll: async () => {
        const { data, error } = await supabase
            .from('booking_applications')
            .select('*, vehicles(*), inquiries(*), profiles(*)')
            .order('created_at', { ascending: false })
        if (error) throw error
        return data
    },

    cancel: async (id) => {
        const { data, error } = await supabase
            .from('booking_applications')
            .update({ status: 'cancelled' })
            .eq('id', id)
            .select()
        if (error) throw error
        return data[0]
    },

    uploadDocument: async (userId, file, docType) => {
        const ext = file.name.split('.').pop()
        const path = `${userId}/${docType}-${Date.now()}.${ext}`
        const { error } = await supabase.storage
            .from('documents')
            .upload(path, file, { upsert: true })
        if (error) throw error
        const { data } = supabase.storage.from('documents').getPublicUrl(path)
        return data.publicUrl
    },
}
