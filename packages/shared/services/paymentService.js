import { supabase } from '../lib/supabase'

export const paymentService = {
    /**
     * Check if an eSewa transaction UUID has already been used
     * Prevents fraud via transaction reuse
     * @param {string} transactionUuid - eSewa transaction UUID
     * @param {string} excludeApplicationId - Current application ID to exclude
     * @returns {boolean} true if duplicate found
     */
    checkDuplicate: async (transactionUuid, excludeApplicationId) => {
        if (!supabase) throw new Error('Supabase is not configured')

        const { data, error } = await supabase
            .from('booking_applications')
            .select('id')
            .eq('esewa_transaction_uuid', transactionUuid)
            .neq('id', excludeApplicationId)
            .limit(1)

        if (error) throw error
        return data && data.length > 0
    },

    /**
     * Mark a booking application as paid via eSewa
     * Uses conditional update to prevent race conditions
     * @param {string} applicationId - Booking application ID
     * @param {string} transactionUuid - eSewa transaction UUID
     * @param {string} refId - eSewa reference ID (optional)
     * @returns {Object} Updated application data
     */
    markPaid: async (applicationId, transactionUuid, refId = null) => {
        if (!supabase) throw new Error('Supabase is not configured')

        // Check for duplicate transaction UUID (fraud prevention)
        const isDuplicate = await paymentService.checkDuplicate(transactionUuid, applicationId)
        if (isDuplicate) {
            throw new Error('FRAUD: This transaction UUID has already been used for another payment')
        }

        // Atomic update: only update if payment is still pending
        const { data, error } = await supabase
            .from('booking_applications')
            .update({
                payment_status: 'completed',
                payment_method: 'esewa',
                esewa_transaction_uuid: transactionUuid,
                esewa_ref_id: refId,
                status: 'confirmed',
            })
            .eq('id', applicationId)
            .eq('payment_status', 'pending')
            .select()

        if (error) throw error
        if (!data || data.length === 0) {
            throw new Error('Payment was already processed or application not found')
        }
        return data[0]
    },

    /**
     * Mark a payment as failed
     * @param {string} applicationId - Booking application ID
     */
    markFailed: async (applicationId) => {
        if (!supabase) throw new Error('Supabase is not configured')

        const { error } = await supabase
            .from('booking_applications')
            .update({ payment_status: 'failed' })
            .eq('id', applicationId)

        if (error) throw error
    },

    /**
     * Get payment status for an application
     * @param {string} applicationId - Booking application ID
     * @returns {Object} Payment details
     */
    getPaymentStatus: async (applicationId) => {
        if (!supabase) throw new Error('Supabase is not configured')

        const { data, error } = await supabase
            .from('booking_applications')
            .select('payment_status, payment_method, esewa_transaction_uuid, total_price, status')
            .eq('id', applicationId)
            .single()

        if (error) throw error
        return data
    },
}
