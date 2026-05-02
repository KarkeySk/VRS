import { supabase } from '../lib/supabase'
import { profileService } from './profileService'

export const bookingService = {
    /** Create a new booking */
    create: async (bookingData) => {
        await profileService.ensureExists(bookingData.user_id)

        const { data, error } = await supabase.from('bookings').insert([bookingData]).select()
        if (error) throw error
        return data[0]
    },

    /** Get bookings for the current user */
    getMyBookings: async (userId) => {
        const { data, error } = await supabase
            .from('bookings')
            .select('*, vehicles(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
        if (error) throw error
        return data
    },

    /** Get a single booking by id */
    getById: async (id) => {
        const { data, error } = await supabase
            .from('bookings')
            .select('*, vehicles(*)')
            .eq('id', id)
            .single()
        if (error) throw error
        return data
    },

    /** Get a single booking with customer and vehicle details */
    getByIdWithDetails: async (id) => {
        const { data, error } = await supabase
            .from('bookings')
            .select('*, vehicles(*), profiles(*)')
            .eq('id', id)
            .single()
        if (error) throw error
        return data
    },

    /** Cancel a booking */
    cancel: async (id) => {
        const { data, error } = await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', id)
            .select()
        if (error) throw error
        return data[0]
    },

    /** Update booking fields (admin) */
    update: async (id, updates) => {
        const { data, error } = await supabase
            .from('bookings')
            .update(updates)
            .eq('id', id)
            .select()
            .single()
        if (error) throw error
        return data
    },

    /** Delete booking (admin) */
    delete: async (id) => {
        const { error } = await supabase
            .from('bookings')
            .delete()
            .eq('id', id)
        if (error) throw error
    },

    /** Get all bookings (admin) */
    getAll: async () => {
        const { data, error } = await supabase
            .from('bookings')
            .select('*, vehicles(*), profiles(*)')
            .order('created_at', { ascending: false })
        if (error) throw error
        return data
    },

    /** Find an existing booking for the same user/vehicle/date range */
    findMatchingTrip: async ({ userId, vehicleId, startDate, endDate }) => {
        const { data, error } = await supabase
            .from('bookings')
            .select('*, vehicles(*), profiles(*)')
            .eq('user_id', userId)
            .eq('vehicle_id', vehicleId)
            .eq('start_date', startDate)
            .eq('end_date', endDate)
            .limit(1)
            .maybeSingle()
        if (error) throw error
        return data
    },

    /** Determine whether an approval transition should trigger an email */
    shouldSendApprovalEmail: ({ currentStatus, nextStatus, booking }) => (
        currentStatus !== 'approved'
        && nextStatus === 'approved'
        && booking?.email_sent === false
    ),

    /** Mark a successful approval email send and write an audit log */
    recordApprovalEmailSent: async (bookingId) => {
        const { data, error } = await supabase
            .from('bookings')
            .update({ email_sent: true })
            .eq('id', bookingId)
            .eq('email_sent', false)
            .select()
            .maybeSingle()
        if (error) throw error

        if (!data) return null

        const { error: logError } = await supabase
            .from('email_logs')
            .insert([{ booking_id: bookingId, status: 'sent' }])
        if (logError) throw logError

        return data
    },
}
