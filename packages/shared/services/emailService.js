import { supabase } from '../lib/supabase'

function parseNotes(notes) {
    if (!notes || typeof notes !== 'string') return {}
    try {
        return JSON.parse(notes)
    } catch {
        return {}
    }
}

function formatDateTime({ startDate, endDate, dateTime }) {
    if (dateTime) return dateTime
    if (startDate && endDate) return `${startDate} to ${endDate}`
    return startDate || endDate || new Date().toISOString()
}

async function edgeFunctionErrorMessage(error) {
    const fallback = error?.message || 'Failed to send booking approval email'
    const response = error?.context

    if (!response?.clone) return fallback

    try {
        const body = await response.clone().json()
        return body?.error || body?.message || fallback
    } catch {
        try {
            const text = await response.clone().text()
            return text || fallback
        } catch {
            return fallback
        }
    }
}

function buildBookingApprovalMessage({ userEmail, bookingId, startDate, endDate, dateTime, subject, message }) {
    if (!userEmail) throw new Error('Booking approval email requires a user email')
    if (!bookingId) throw new Error('Booking approval email requires a booking id')

    return {
        to: userEmail,
        subject: subject || 'Booking confirmed',
        bookingId,
        dateTime: formatDateTime({ startDate, endDate, dateTime }),
        message: message || 'Your booking has been confirmed.',
    }
}

async function invokeBookingEmail(payload) {
    if (!supabase) throw new Error('Supabase is not configured')

    const { data, error } = await supabase.functions.invoke('send-booking-approval-email', {
        body: payload,
    })

    if (error) throw new Error(await edgeFunctionErrorMessage(error))
    if (data?.error) throw new Error(data.error)
    return data
}

export async function sendBookingApprovalEmail(booking, user = null) {
    if (!booking?.id) throw new Error('Booking is required')

    const notes = parseNotes(booking.notes)
    const notesCustomer = notes.customer || {}
    const profile = user || booking.profiles || {}
    const customerEmail = profile.email || notesCustomer.email
    const vehicleName = booking.vehicles?.name || 'your selected vehicle'

    const payload = buildBookingApprovalMessage({
        userEmail: customerEmail,
        bookingId: booking.id,
        startDate: booking.start_date,
        endDate: booking.end_date,
        subject: 'Booking confirmed',
        message: `Your booking for ${vehicleName} has been confirmed.`,
    })

    return invokeBookingEmail(payload)
}

export function shouldSendApprovalEmail({ currentStatus, nextStatus, booking }) {
    return (
        nextStatus === 'approved'
        && currentStatus !== 'approved'
        && booking?.email_sent === false
    )
}

export async function sendApprovalEmailOnce(booking) {
    if (!booking?.id || booking.email_sent === true) {
        return { status: 'skipped' }
    }

    await sendBookingApprovalEmail(booking)
    const recorded = await recordApprovalEmailSent(booking.id)
    return recorded ? { status: 'sent' } : { status: 'skipped' }
}

export async function getBookingEmailDetails(bookingId) {
    if (!supabase) throw new Error('Supabase is not configured')

    const { data, error } = await supabase
        .from('bookings')
        .select('*, vehicles(*), profiles(*)')
        .eq('id', bookingId)
        .single()
    if (error) throw error
    return data
}

export async function recordApprovalEmailSent(bookingId) {
    if (!supabase) throw new Error('Supabase is not configured')

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
}

export const emailService = {
    buildBookingApprovalMessage,

    sendBookingApprovalEmail: async (details) => {
        const payload = buildBookingApprovalMessage(details)
        return invokeBookingEmail(payload)
    },

    sendBookingConfirmationEmail: async (details) => {
        return emailService.sendBookingApprovalEmail({
            ...details,
            subject: details.subject || 'Booking confirmed',
            message: details.message || 'Your booking has been confirmed.',
        })
    },
}
