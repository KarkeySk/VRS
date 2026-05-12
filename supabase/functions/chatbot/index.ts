type ChatMessage = {
  role: 'user' | 'assistant'
  text: string
}

type RequestPayload = {
  message?: string
  history?: ChatMessage[]
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are a helpful assistant for a vehicle rental company called Bhatbhati.
You help customers with:
- Booking vehicles
- Answering questions about rental terms
- Providing information about available vehicles
- Assisting with payments and reservations
- General customer support

Be friendly, professional, and concise. If you don't know something specific about the company, suggest the user contact customer support.`

const GEMINI_MODEL = 'gemini-1.5-flash-latest'
const MAX_HISTORY = 20

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured')

    const { message, history = [] } = (await req.json()) as RequestPayload

    if (!message || typeof message !== 'string' || !message.trim()) {
      throw new Error('Message is required')
    }

    const trimmedHistory = history.slice(-MAX_HISTORY).filter(
      (m) => m && typeof m.text === 'string' && (m.role === 'user' || m.role === 'assistant')
    )

    const contents = [
      ...trimmedHistory.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ]

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { role: 'system', parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 300,
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      const detail = data?.error?.message || 'Gemini request failed'
      throw new Error(detail)
    }

    const reply = data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text || '')
      .join('')
      .trim()

    if (!reply) throw new Error('Empty response from Gemini')

    return jsonResponse({ reply })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Chatbot request failed'
    return jsonResponse({ error: message }, 400)
  }
})
