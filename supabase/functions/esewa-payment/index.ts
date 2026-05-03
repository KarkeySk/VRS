import { createClient } from 'npm:@supabase/supabase-js@2'

type PrepareBody = {
  action: 'prepare'
  applicationId?: string
  successUrl?: string
  failureUrl?: string
}

type VerifyBody = {
  action: 'verify'
  applicationId?: string
  data?: string
}

type RequestBody = PrepareBody | VerifyBody

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TEST_MERCHANT_CODE = 'EPAYTEST'
const TEST_PAYMENT_URL = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'

function getConfig() {
  return {
    merchantCode: Deno.env.get('ESEWA_MERCHANT_CODE') || TEST_MERCHANT_CODE,
    secretKey: Deno.env.get('ESEWA_SECRET_KEY') || '8gBm/:&EnhH.1/q',
    paymentUrl: Deno.env.get('ESEWA_PAYMENT_URL') || TEST_PAYMENT_URL,
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function normalizeAmount(value: unknown) {
  const amount = Number(value)
  return Number.isFinite(amount) ? Number(amount.toFixed(2)) : NaN
}

async function signMessage(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  const bytes = new Uint8Array(signatureBuffer)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

async function verifyCallbackSignature(payload: Record<string, unknown>, secret: string) {
  const signedFieldNames = String(payload.signed_field_names || '')
  const signature = String(payload.signature || '')
  if (!signedFieldNames || !signature) return false

  const fields = signedFieldNames.split(',').map((f) => f.trim()).filter(Boolean)
  if (!fields.length) return false

  const message = fields.map((field) => `${field}=${String(payload[field] ?? '')}`).join(',')
  const expected = await signMessage(secret, message)
  return expected === signature
}

function decodeBase64Json(data: string) {
  try {
    return JSON.parse(atob(data)) as Record<string, unknown>
  } catch {
    return null
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: 'Missing Supabase server configuration' }, 500)
    }

    const authHeader = req.headers.get('Authorization') || ''
    if (!authHeader.toLowerCase().startsWith('bearer ')) {
      return jsonResponse({ error: 'Missing authorization header' }, 401)
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim()
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }

    const body = await req.json() as RequestBody
    const config = getConfig()

    if (body.action === 'prepare') {
      if (!body.applicationId || !body.successUrl || !body.failureUrl) {
        return jsonResponse({ error: 'applicationId, successUrl and failureUrl are required' }, 400)
      }

      const { data: app, error: appError } = await supabaseAdmin
        .from('booking_applications')
        .select('id, user_id, total_price, status, payment_status')
        .eq('id', body.applicationId)
        .eq('user_id', user.id)
        .single()

      if (appError || !app) return jsonResponse({ error: 'Booking not found' }, 404)
      if (app.status !== 'approved' || app.payment_status === 'completed') {
        return jsonResponse({ error: 'Booking is not ready for payment' }, 400)
      }

      const amount = normalizeAmount(app.total_price)
      if (!Number.isFinite(amount) || amount <= 0) {
        return jsonResponse({ error: 'Invalid booking amount' }, 400)
      }

      const transactionUuid = crypto.randomUUID()
      const totalAmount = amount.toFixed(2)
      const signedFieldNames = 'total_amount,transaction_uuid,product_code'
      const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${config.merchantCode}`
      const signature = await signMessage(config.secretKey, message)

      return jsonResponse({
        paymentUrl: config.paymentUrl,
        payload: {
          amount: totalAmount,
          tax_amount: '0',
          total_amount: totalAmount,
          transaction_uuid: transactionUuid,
          product_code: config.merchantCode,
          product_service_charge: '0',
          product_delivery_charge: '0',
          success_url: body.successUrl,
          failure_url: body.failureUrl,
          signed_field_names: signedFieldNames,
          signature,
        },
      })
    }

    if (body.action === 'verify') {
      if (!body.applicationId || !body.data) {
        return jsonResponse({ error: 'applicationId and data are required' }, 400)
      }

      const decoded = decodeBase64Json(body.data)
      if (!decoded) return jsonResponse({ error: 'Invalid callback payload' }, 400)

      const isValidSignature = await verifyCallbackSignature(decoded, config.secretKey)
      if (!isValidSignature) return jsonResponse({ error: 'Invalid callback signature' }, 400)

      const status = String(decoded.status || '')
      const transactionUuid = String(decoded.transaction_uuid || '')
      const refId = String(decoded.transaction_code || decoded.ref_id || '') || null
      const productCode = String(decoded.product_code || '')
      const paidAmount = normalizeAmount(decoded.total_amount)

      if (!transactionUuid || !Number.isFinite(paidAmount)) {
        return jsonResponse({ error: 'Incomplete callback fields' }, 400)
      }
      if (productCode !== config.merchantCode) {
        return jsonResponse({ error: 'Invalid merchant code' }, 400)
      }

      const { data: app, error: appError } = await supabaseAdmin
        .from('booking_applications')
        .select('id, user_id, total_price, status, payment_status')
        .eq('id', body.applicationId)
        .eq('user_id', user.id)
        .single()

      if (appError || !app) return jsonResponse({ error: 'Booking not found' }, 404)

      const expectedAmount = normalizeAmount(app.total_price)
      if (!Number.isFinite(expectedAmount) || Math.abs(paidAmount - expectedAmount) > 1) {
        return jsonResponse({ error: `Amount mismatch. Expected ${expectedAmount}, got ${paidAmount}` }, 400)
      }

      if (status !== 'COMPLETE') {
        if (app.payment_status === 'pending') {
          await supabaseAdmin
            .from('booking_applications')
            .update({ payment_status: 'failed' })
            .eq('id', body.applicationId)
            .eq('user_id', user.id)
            .eq('payment_status', 'pending')
        }
        return jsonResponse({ status: 'failed', message: 'Payment was not completed' })
      }

      const { data: duplicate } = await supabaseAdmin
        .from('booking_applications')
        .select('id')
        .eq('esewa_transaction_uuid', transactionUuid)
        .neq('id', body.applicationId)
        .limit(1)

      if (duplicate && duplicate.length > 0) {
        return jsonResponse({ error: 'Duplicate transaction ID detected' }, 400)
      }

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('booking_applications')
        .update({
          payment_status: 'completed',
          payment_method: 'esewa',
          esewa_transaction_uuid: transactionUuid,
          esewa_ref_id: refId,
          status: 'confirmed',
        })
        .eq('id', body.applicationId)
        .eq('user_id', user.id)
        .eq('payment_status', 'pending')
        .select('id')
        .maybeSingle()

      if (updateError) return jsonResponse({ error: updateError.message }, 400)
      if (!updated) return jsonResponse({ error: 'Payment already processed or unavailable' }, 409)

      await supabaseAdmin
        .from('notifications')
        .insert([{
          user_id: user.id,
          type: 'payment_success',
          title: 'Payment Successful!',
          message: `Payment of NPR ${expectedAmount.toLocaleString()} confirmed.`,
          application_id: body.applicationId,
        }])

      return jsonResponse({ status: 'success' })
    }

    return jsonResponse({ error: 'Unsupported action' }, 400)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process payment request'
    return jsonResponse({ error: message }, 400)
  }
})
