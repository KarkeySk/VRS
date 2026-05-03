import nodemailer from 'npm:nodemailer@6.9.16'

type BookingPayload = {
  id: string
  start_date: string
  end_date: string
  total_price?: number | string | null
}

type UserPayload = {
  name: string
  email: string
}

type VehiclePayload = {
  name: string
  type?: string
  subtitle?: string
}

type RequestPayload = {
  booking?: BookingPayload
  user?: UserPayload
  vehicle?: VehiclePayload
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatPrice(value: number | string | null | undefined) {
  const price = Number(value || 0)
  return `NPR ${price.toLocaleString()}`
}

function requiredEnv(name: string) {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`${name} is not configured`)
  return value
}

function buildEmail({ booking, user, vehicle }: Required<RequestPayload>) {
  const bookingId = escapeHtml(booking.id)
  const userName = escapeHtml(user.name)
  const vehicleName = escapeHtml(vehicle.name)
  const vehicleDetails = [vehicle.type, vehicle.subtitle].filter(Boolean).join(' - ')
  const escapedVehicleDetails = escapeHtml(vehicleDetails || 'Vehicle rental')
  const dates = `${escapeHtml(booking.start_date)} to ${escapeHtml(booking.end_date)}`
  const price = escapeHtml(formatPrice(booking.total_price))

  return {
    subject: `Booking confirmed: ${vehicle.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
        <h2 style="color: #111827;">Your booking is confirmed</h2>
        <p>Hello ${userName},</p>
        <p>Your vehicle booking has been approved and confirmed.</p>
        <table style="border-collapse: collapse; margin-top: 16px;">
          <tr><td style="padding: 6px 12px 6px 0;"><strong>Booking ID</strong></td><td>${bookingId}</td></tr>
          <tr><td style="padding: 6px 12px 6px 0;"><strong>Vehicle</strong></td><td>${vehicleName}</td></tr>
          <tr><td style="padding: 6px 12px 6px 0;"><strong>Vehicle details</strong></td><td>${escapedVehicleDetails}</td></tr>
          <tr><td style="padding: 6px 12px 6px 0;"><strong>Booking dates</strong></td><td>${dates}</td></tr>
          <tr><td style="padding: 6px 12px 6px 0;"><strong>Total price</strong></td><td>${price}</td></tr>
        </table>
        <p style="margin-top: 18px;">Thank you for booking with Bhatbhati. Our team will be ready for your trip.</p>
      </div>
    `,
    text: [
      `Hello ${user.name},`,
      '',
      'Your vehicle booking has been approved and confirmed.',
      `Booking ID: ${booking.id}`,
      `Vehicle: ${vehicle.name}`,
      `Vehicle details: ${vehicleDetails || 'Vehicle rental'}`,
      `Booking dates: ${booking.start_date} to ${booking.end_date}`,
      `Total price: ${formatPrice(booking.total_price)}`,
      '',
      'Thank you for booking with Bhatbhati.',
    ].join('\n'),
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const smtpHost = requiredEnv('SMTP_HOST')
    const smtpPort = Number(requiredEnv('SMTP_PORT'))
    const smtpUser = requiredEnv('SMTP_USER')
    const smtpPass = requiredEnv('SMTP_PASS')
    const smtpAdminEmail = Deno.env.get('SMTP_ADMIN_EMAIL') || smtpUser
    const smtpSenderName = Deno.env.get('SMTP_SENDER_NAME') || 'BHATBHATIFY'

    const { booking, user, vehicle } = await req.json() as RequestPayload

    if (!booking?.id || !booking.start_date || !booking.end_date) {
      throw new Error('Booking ID and dates are required')
    }

    if (!user?.name || !user.email) {
      throw new Error('User name and email are required')
    }

    if (!vehicle?.name) {
      throw new Error('Vehicle name is required')
    }

    const email = buildEmail({ booking, user, vehicle })

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    const result = await transporter.sendMail({
      from: `"${smtpSenderName}" <${smtpAdminEmail}>`,
      to: user.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    })

    return new Response(JSON.stringify({ status: 'sent', id: result.messageId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send booking approval email'
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
