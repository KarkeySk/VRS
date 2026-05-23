import CryptoJS from 'crypto-js'

/**
 * eSewa payment configuration
 * Uses environment variables with fallback to test credentials
 */

const ESEWA_TEST_MERCHANT_CODE = 'EPAYTEST'
const ESEWA_TEST_SECRET_KEY = '8gBm/:&EnhH.1/q'
const ESEWA_TEST_PAYMENT_URL = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'

export function getEsewaConfig() {
    if (import.meta.env.PROD && !import.meta.env.VITE_ESEWA_SECRET_KEY) {
        throw new Error('VITE_ESEWA_SECRET_KEY is required in production. Set it in your environment variables.')
    }
    return {
        merchantCode: import.meta.env.VITE_ESEWA_MERCHANT_CODE || ESEWA_TEST_MERCHANT_CODE,
        secretKey: import.meta.env.VITE_ESEWA_SECRET_KEY || ESEWA_TEST_SECRET_KEY,
        paymentUrl: import.meta.env.VITE_ESEWA_PAYMENT_URL || ESEWA_TEST_PAYMENT_URL,
    }
}

/**
 * Generate HMAC-SHA256 signature for eSewa payment
 * @param {string} secretKey - eSewa merchant secret key
 * @param {string} message - Concatenated fields to sign
 * @returns {string} Base64-encoded signature
 */
export function generateEsewaSignature(secretKey, message) {
    const hash = CryptoJS.HmacSHA256(message, secretKey)
    return CryptoJS.enc.Base64.stringify(hash)
}

/**
 * Build the complete eSewa payment form payload
 * @param {Object} params
 * @param {number} params.amount - Payment amount in NPR
 * @param {string} params.transactionUuid - Unique transaction identifier
 * @param {string} params.successUrl - URL to redirect on success
 * @param {string} params.failureUrl - URL to redirect on failure
 * @returns {Object} Complete payload for eSewa form submission
 */
export function buildEsewaPayload({ amount, transactionUuid, successUrl, failureUrl }) {
    const config = getEsewaConfig()

    const payload = {
        amount: String(amount),
        tax_amount: '0',
        total_amount: String(amount),
        transaction_uuid: transactionUuid,
        product_code: config.merchantCode,
        product_service_charge: '0',
        product_delivery_charge: '0',
        success_url: successUrl,
        failure_url: failureUrl,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
    }

    // Build signature string from signed fields
    const signatureString = `total_amount=${payload.total_amount},transaction_uuid=${payload.transaction_uuid},product_code=${payload.product_code}`
    const signature = generateEsewaSignature(config.secretKey, signatureString)

    return {
        ...payload,
        signature,
    }
}

/**
 * Decode eSewa's base64-encoded callback data
 * @param {string} base64Data - The 'data' query parameter from eSewa callback
 * @returns {Object|null} Decoded payment response or null if invalid
 */
export function decodeEsewaResponse(base64Data) {
    try {
        const decoded = atob(base64Data)
        return JSON.parse(decoded)
    } catch {
        console.error('Failed to decode eSewa response')
        return null
    }
}

/**
 * Generate a unique transaction UUID for eSewa
 * @returns {string} Unique transaction identifier
 */
export function generateTransactionUuid() {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 10)
    return `${timestamp}-${random}`
}
