import { supabase } from '../lib/supabase'

export const vehicleService = {
    /** Fetch all available vehicles */
    getAll: async () => {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .eq('is_available', true)
            .order('created_at', { ascending: false })
        if (error) throw error
        return data
    },

    /** Fetch a single vehicle by id */
    getById: async (id) => {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .eq('id', id)
            .single()
        if (error) throw error
        return data
    },

    /** Filter vehicles by type (car, bike, jeep, etc.) */
    getByType: async (type) => {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .eq('type', type)
            .eq('is_available', true)
        if (error) throw error
        return data
    },

    /** Add a new vehicle (admin) */
    create: async (vehicleData) => {
        const { data, error } = await supabase.from('vehicles').insert([vehicleData]).select()
        if (error) throw error
        return data[0]
    },

    /** Update a vehicle (admin) */
    update: async (id, updates) => {
        const { data, error } = await supabase
            .from('vehicles')
            .update(updates)
            .eq('id', id)
            .select()
        if (error) throw error
        return data[0]
    },

    /** Delete a vehicle (admin) */
    delete: async (id) => {
        const { error } = await supabase.from('vehicles').delete().eq('id', id)
        if (error) throw error
    },
}
