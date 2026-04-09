import { supabase } from '../lib/supabase'
import { profileService } from './profileService'

export const inquiryService = {
    create: async (inquiryData) => {
        await profileService.ensureExists(inquiryData.user_id)

        const { data, error } = await supabase
            .from('inquiries')
            .insert([inquiryData])
            .select()
        if (error) throw error
        return data[0]
    },

    getMyInquiries: async (userId) => {
        const { data, error } = await supabase
            .from('inquiries')
            .select('*, vehicles(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
        if (error) throw error
        return data
    },

    getById: async (id) => {
        const { data, error } = await supabase
            .from('inquiries')
            .select('*, vehicles(*)')
            .eq('id', id)
            .single()
        if (error) throw error
        return data
    },

    getAll: async () => {
        const { data, error } = await supabase
            .from('inquiries')
            .select('*, vehicles(*), profiles(*)')
            .order('created_at', { ascending: false })
        if (error) throw error
        return data
    },

    updateStatus: async (id, status) => {
        const { data, error } = await supabase
            .from('inquiries')
            .update({ status })
            .eq('id', id)
            .select()
        if (error) throw error
        return data[0]
    },
}
