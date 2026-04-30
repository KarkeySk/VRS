export async function resendVerificationEmail(email) {
  if (!email) throw new Error('Email address is required');

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');

  if (!supabaseUrl) {
    throw new Error('Supabase URL is not configured');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/send-verification-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  const payload = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || 'Failed to resend verification email');
  }

  return payload;
}

async function readResponseBody(response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}
