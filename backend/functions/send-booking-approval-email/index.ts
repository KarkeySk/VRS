import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import nodemailer from 'npm:nodemailer@6.9.16'

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

function buildEmailContent({ bookingId, dateTime, message, subject }: Required<Pick<ApprovalEmailPayload, 'bookingId' | 'dateTime' | 'message' | 'subject'>>) {
  const text = [
    'Hello,',
    '',
    message,
    '',
    `Booking ID: ${bookingId}`,
    `Date/time: ${dateTime}`,
    '',
    'Thank you for booking with Bhatbhate.',
  ].join('\n')

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="color: #d3742f; margin-bottom: 8px;">${subject}</h2>
      <p>Hello,</p>
      <p>${message}</p>
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; margin: 18px 0;">
        <p style="margin: 0 0 8px;"><strong>Booking ID:</strong> ${bookingId}</p>
        <p style="margin: 0;"><strong>Date/time:</strong> ${dateTime}</p>
      </div>
      <p>Thank you for booking with Bhatbhate.</p>
    </div>
  `

  return { text, html }
}

async function sendWithSmtp({
  to,
  subject,
  bookingId,
  dateTime,
  message,
}: Required<ApprovalEmailPayload>) {
  const smtpUser = Deno.env.get('SMTP_USER') || Deno.env.get('GMAIL_SMTP_USER')
  const smtpPassword = Deno.env.get('SMTP_PASSWORD') || Deno.env.get('GMAIL_SMTP_PASSWORD')

  if (!smtpUser || !smtpPassword) return null

  const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com'
  const smtpPort = Number(Deno.env.get('SMTP_PORT') || '587')
  const from = Deno.env.get('BOOKING_EMAIL_FROM') || `Bhatbhate <${smtpUser}>`
  const { text, html } = buildEmailContent({ bookingId, dateTime, message, subject })

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  })

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  })

  return { provider: 'smtp', providerId: info.messageId ?? null }
}

async function sendWithResend({
  to,
  subject,
  bookingId,
  dateTime,
  message,
}: Required<ApprovalEmailPayload>) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  if (!resendApiKey) return null

  const from = Deno.env.get('BOOKING_EMAIL_FROM') || 'Bhatbhate <onboarding@resend.dev>'
  const { text, html } = buildEmailContent({ bookingId, dateTime, message, subject })

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
      text,
      html,
    }),
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(JSON.stringify({ error: 'Email provider failed', details: result }))
  }

  return { provider: 'resend', providerId: result.id ?? null }
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

  try {
    const smtpResult = await sendWithSmtp({
      to,
      subject,
      bookingId,
      dateTime,
      message,
    })
    const result = smtpResult || await sendWithResend({
      to,
      subject,
      bookingId,
      dateTime,
      message,
    })

    if (!result) {
      return new Response(JSON.stringify({
        error: 'Email provider is not configured',
        details: 'Set SMTP_USER and SMTP_PASSWORD for Gmail SMTP, or set RESEND_API_KEY.',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ sent: true, ...result }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Email provider failed'
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
