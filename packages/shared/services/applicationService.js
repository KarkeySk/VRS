/**
 * applicationService — operates on the `booking_applications` table (user-facing workflow).
 *
 * WORKFLOW CONTEXT:
 *   User journey:  inquiry → booking_application → (admin approval) → payment → confirmed
 *   This service handles every step of that journey for users.
 *
 * Do NOT confuse with bookingService which manages the separate `bookings` table
 * used by the admin panel for confirmed/active trips.
 */
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

    /**
     * Edit a booking application's details. Only permitted while the booking is
     * still 'submitted' or 'under-review' and has not been paid — the status/
     * payment filters are applied in the query so the DB rejects edits on
     * approved, confirmed, cancelled, or paid bookings even if the UI is bypassed.
     */
    update: async (id, fields) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase
            .from('booking_applications')
            .update(fields)
            .eq('id', id)
            .in('status', ['submitted', 'under-review'])
            .neq('payment_status', 'completed')
            .select('*, vehicles(*), inquiries(*)')
        if (error) throw error
        if (!data || data.length === 0) {
            throw new Error('This booking can no longer be edited.')
        }
        return data[0]
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
