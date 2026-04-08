import { supabase } from '../lib/supabase'

export const vehicleService = {
    /** Fetch all available vehicles */
    getAll: async () => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .eq('is_available', true)
            .order('created_at', { ascending: false })
        if (error) throw error
        return data
    },

    /** Fetch all vehicles (admin inventory) */
    getAllForAdmin: async () => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .order('created_at', { ascending: false })
        if (error) throw error
        return data
    },

    /** Fetch a single vehicle by id */
    getById: async (id) => {
        if (!supabase) throw new Error('Supabase is not configured')
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
        if (!supabase) throw new Error('Supabase is not configured')
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
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase.from('vehicles').insert([vehicleData]).select()
        if (error) throw error
        return data[0]
    },

    /** Update a vehicle (admin) */
    update: async (id, updates) => {
        if (!supabase) throw new Error('Supabase is not configured')
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
        if (!supabase) throw new Error('Supabase is not configured')
        const { error } = await supabase.from('vehicles').delete().eq('id', id)
        if (error) throw error
    },

    /** Upload vehicle image to Supabase Storage and return public URL */
    uploadImage: async (file, folder = 'general') => {
        if (!supabase) throw new Error('Supabase is not configured')
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
            .from('vehicle-images')
            .upload(path, file, { upsert: true })
        if (uploadError) throw uploadError
        const { data } = supabase.storage.from('vehicle-images').getPublicUrl(path)
        return data.publicUrl
    },
}
