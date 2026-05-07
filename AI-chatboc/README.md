# Bhatbhati AI Chatbot

Floating chat assistant for the Bhatbhati vehicle rental platform. Runs through a Supabase Edge Function so the LLM provider key stays server-side.

## Architecture

```
Browser (ChatBot.jsx)
  → supabase.functions.invoke('chatbot')
  → Edge Function (supabase/functions/chatbot/index.ts)
  → Google Gemini API
```

The frontend never sees the Gemini key. It's a Supabase secret (`GEMINI_API_KEY`).

## Setup

See `SETUP.md` for the full Supabase deploy steps. TL;DR:

1. `supabase secrets set GEMINI_API_KEY=...`
2. `supabase functions deploy chatbot --project-ref <ref>`
3. Make sure `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are set in `user/.env`.

## Files

- `ChatBot.jsx` — React component (floating bubble + window)
- `ChatBot.css` — styling
- `chatbotService.js` — calls the `chatbot` Edge Function and tracks conversation history client-side

## Usage

Already mounted in `user/src/App.jsx`. To embed elsewhere:

```jsx
import ChatBot from '../../AI-chatboc/ChatBot.jsx'
```
