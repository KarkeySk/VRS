import { supabase } from '../lib/supabase'

const formatDateTime = ({ startDate, endDate, dateTime }) => {
    if (dateTime) return dateTime
    if (startDate && endDate) return `${startDate} to ${endDate}`
    return startDate || endDate || new Date().toISOString()
}

export const emailService = {
    buildBookingApprovalMessage: ({ userEmail, bookingId, startDate, endDate, dateTime, message }) => {
        if (!userEmail) throw new Error('Booking approval email requires a user email')
        if (!bookingId) throw new Error('Booking approval email requires a booking id')

        return {
            to: userEmail,
            subject: 'Booking approved',
            bookingId,
            dateTime: formatDateTime({ startDate, endDate, dateTime }),
            message: message || 'Your booking has been approved.',
        }
    },

    sendBookingApprovalEmail: async (details) => {
        if (!supabase) throw new Error('Supabase is not configured')

        const payload = emailService.buildBookingApprovalMessage(details)
        const { data, error } = await supabase.functions.invoke('send-booking-approval-email', {
            body: payload,
        })

        if (error) throw error
        return data
    },
}
