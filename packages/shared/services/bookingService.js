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

    /** Get all bookings (admin) */
    getAll: async () => {
        const { data, error } = await supabase
            .from('bookings')
            .select('*, vehicles(*), profiles(*)')
            .order('created_at', { ascending: false })
        if (error) throw error
        return data
    },
}
