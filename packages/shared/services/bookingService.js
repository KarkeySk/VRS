import { supabase } from '../lib/supabase'

export const bookingService = {
    /** Create a new booking */
    create: async (bookingData) => {
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
            .select('id, status')
            .eq('user_id', userId)
            .eq('vehicle_id', vehicleId)
            .eq('start_date', startDate)
            .eq('end_date', endDate)
            .limit(1)
            .maybeSingle()
        if (error) throw error
        return data
    },
}
