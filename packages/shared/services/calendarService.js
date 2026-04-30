import { supabase } from '../lib/supabase'

export const calendarService = {
    /**
     * Get all booked date ranges for a given month
     * Queries both bookings and booking_applications tables
     * @param {number} year - e.g. 2026
     * @param {number} month - 0-indexed (0 = January)
     * @returns {Array} Array of { date, vehicleName, status, type }
     */
    getBookedDatesForMonth: async (year, month) => {
        if (!supabase) throw new Error('Supabase is not configured')

        const startOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`
        const endOfMonth = new Date(year, month + 1, 0)
        const endStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(endOfMonth.getDate()).padStart(2, '0')}`

        // Fetch bookings that overlap this month
        const { data: bookings, error: bErr } = await supabase
            .from('bookings')
            .select('start_date, end_date, status, vehicles(name)')
            .lte('start_date', endStr)
            .gte('end_date', startOfMonth)

        if (bErr) throw bErr

        // Fetch confirmed/approved applications that overlap this month
        const { data: apps, error: aErr } = await supabase
            .from('booking_applications')
            .select('start_date, end_date, status, vehicles(name)')
            .in('status', ['approved', 'confirmed'])
            .lte('start_date', endStr)
            .gte('end_date', startOfMonth)

        if (aErr) throw aErr

        const bookedDays = []

        const processEntries = (entries, type) => {
            for (const entry of entries || []) {
                const start = new Date(entry.start_date)
                const end = new Date(entry.end_date)

                // Generate each day in the range that falls within this month
                const cursor = new Date(Math.max(start.getTime(), new Date(year, month, 1).getTime()))
                const limit = new Date(Math.min(end.getTime(), endOfMonth.getTime()))

                while (cursor <= limit) {
                    bookedDays.push({
                        day: cursor.getDate(),
                        vehicleName: entry.vehicles?.name || 'Unknown',
                        status: entry.status,
                        type,
                    })
                    cursor.setDate(cursor.getDate() + 1)
                }
            }
        }

        processEntries(bookings, 'booking')
        processEntries(apps, 'application')

        return bookedDays
    },

    /**
     * Get booked dates for a specific user in a given month
     * @param {string} userId
     * @param {number} year
     * @param {number} month - 0-indexed
     * @returns {Array}
     */
    getUserBookedDates: async (userId, year, month) => {
        if (!supabase) throw new Error('Supabase is not configured')

        const startOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`
        const endOfMonth = new Date(year, month + 1, 0)
        const endStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(endOfMonth.getDate()).padStart(2, '0')}`

        const { data, error } = await supabase
            .from('booking_applications')
            .select('start_date, end_date, status, vehicles(name)')
            .eq('user_id', userId)
            .in('status', ['submitted', 'under-review', 'approved', 'confirmed'])
            .lte('start_date', endStr)
            .gte('end_date', startOfMonth)

        if (error) throw error

        const bookedDays = []
        for (const entry of data || []) {
            const start = new Date(entry.start_date)
            const end = new Date(entry.end_date)
            const cursor = new Date(Math.max(start.getTime(), new Date(year, month, 1).getTime()))
            const limit = new Date(Math.min(end.getTime(), endOfMonth.getTime()))

            while (cursor <= limit) {
                bookedDays.push({
                    day: cursor.getDate(),
                    vehicleName: entry.vehicles?.name || 'Unknown',
                    status: entry.status,
                })
                cursor.setDate(cursor.getDate() + 1)
            }
        }

        return bookedDays
    },
}
