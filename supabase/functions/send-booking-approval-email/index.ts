import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type ApprovalEmailPayload = {
  to?: string
  subject?: string
  bookingId?: string
  dateTime?: string
  message?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const payload = await req.json() as ApprovalEmailPayload
  const { to, subject = 'Booking approved', bookingId, dateTime, message } = payload

  if (!to || !bookingId || !dateTime || !message) {
    return new Response(JSON.stringify({ error: 'Missing required booking email fields' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  const from = Deno.env.get('BOOKING_EMAIL_FROM') || 'Bhatbhate <onboarding@resend.dev>'

  if (!resendApiKey) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY is not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text: [
        message,
        '',
        `Booking ID: ${bookingId}`,
        `Date/time: ${dateTime}`,
      ].join('\n'),
    }),
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    return new Response(JSON.stringify({ error: 'Email provider failed', details: result }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ sent: true, providerId: result.id ?? null }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
