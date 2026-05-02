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

    if (error) throw error
    return data
}
