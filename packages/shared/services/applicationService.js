import { supabase } from '../lib/supabase'
import { profileService } from './profileService'

export const applicationService = {
    create: async (applicationData) => {
        if (!supabase) throw new Error('Supabase is not configured')
        await profileService.ensureExists(applicationData.user_id)

        const { data, error } = await supabase
            .from('booking_applications')
            .insert([applicationData])
            .select()
        if (error) throw error
        return data[0]
    },

    getMyApplications: async (userId) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase
            .from('booking_applications')
            .select('*, vehicles(*), inquiries(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
        if (error) throw error
        return data
    },

    getById: async (id) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase
            .from('booking_applications')
            .select('*, vehicles(*), inquiries(*), profiles(*)')
            .eq('id', id)
            .single()
        if (error) throw error
        return data
    },

    getAll: async () => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase
            .from('booking_applications')
            .select('*, vehicles(*), inquiries(*), profiles(*)')
            .order('created_at', { ascending: false })
        if (error) throw error
        return data
    },

    cancel: async (id) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase
            .from('booking_applications')
            .update({ status: 'cancelled' })
            .eq('id', id)
            .select()
        if (error) throw error
        return data[0]
    },

    uploadDocument: async (userId, file, docType) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const ext = file.name.split('.').pop()
        const path = `${userId}/${docType}-${Date.now()}.${ext}`
        const { error } = await supabase.storage
            .from('documents')
            .upload(path, file, { upsert: true })
        if (error) throw error
        return path
    },

    updateStatus: async (id, status, adminNotes = null) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase
            .from('booking_applications')
            .update({ status, admin_notes: adminNotes })
            .eq('id', id)
            .select()
            .single()
        if (error) throw error
        return data
    },

    /** Generate temporary signed URL for private document bucket */
    getDocumentUrl: async (path, expiresIn = 3600) => {
        if (!supabase) throw new Error('Supabase is not configured')
        if (!path) return null

        const normalizedPath = path.includes('/storage/v1/object/')
            ? path.split('/documents/')[1] ?? ''
            : path
        if (!normalizedPath) return null

        const { data, error } = await supabase.storage
            .from('documents')
            .createSignedUrl(normalizedPath, expiresIn)
        if (error) throw error
        return data?.signedUrl ?? null
    },
}
