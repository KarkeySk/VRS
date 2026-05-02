import { supabase } from '../lib/supabase'

function profileName(profile = {}) {
    if (profile.full_name) return profile.full_name
    return [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim()
}

function parseNotes(notes) {
    if (!notes || typeof notes !== 'string') return {}
    try {
        return JSON.parse(notes)
    } catch {
        return {}
    }
}

async function edgeFunctionErrorMessage(error) {
    const fallback = error?.message || 'Failed to send booking approval email'
    const response = error?.context

    if (!response?.clone) return fallback

    const clone = response.clone()
    try {
        const body = await clone.json()
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

export async function sendBookingApprovalEmail(booking, user = null) {
    if (!supabase) throw new Error('Supabase is not configured')
    if (!booking?.id) throw new Error('Booking is required')

    const notes = parseNotes(booking.notes)
    const notesCustomer = notes.customer || {}
    const profile = user || booking.profiles || {}
    const customerName = profileName(profile) || notesCustomer.fullName || notesCustomer.name || 'Customer'
    const customerEmail = profile.email || notesCustomer.email

    if (!customerEmail) {
        throw new Error('Customer email is required to send booking approval email')
    }

    const { data, error } = await supabase.functions.invoke('send-booking-approval-email', {
        body: {
            booking: {
                id: booking.id,
                start_date: booking.start_date,
                end_date: booking.end_date,
                total_price: booking.total_price,
            },
            user: {
                name: customerName,
                email: customerEmail,
            },
            vehicle: {
                name: booking.vehicles?.name || 'Vehicle',
                type: booking.vehicles?.type || '',
                subtitle: booking.vehicles?.subtitle || '',
            },
        },
    })

    if (error) throw new Error(await edgeFunctionErrorMessage(error))
    if (data?.error) throw new Error(data.error)
    return data
}

export function shouldSendApprovalEmail({ currentStatus, nextStatus, booking }) {
    return (
        nextStatus === 'approved'
        && booking?.email_sent === false
    )
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
