# AI Chatbot Setup

The chatbot runs through a Supabase Edge Function (`chatbot`) that calls Google Gemini server-side. The Gemini key stays on the server.

## One-time setup

1. Get a Gemini API key: https://aistudio.google.com/apikey
2. Install and log in to Supabase CLI:

```bash
npm i -g supabase
supabase login
```

3. Link this repo to your Supabase project:

```bash
supabase link --project-ref <your-project-ref>
```

4. Set the key as a Supabase secret:

```bash
supabase secrets set GEMINI_API_KEY=your_actual_key_here
```

5. Deploy the function:

```bash
supabase functions deploy chatbot --project-ref <your-project-ref>
```

## Frontend env

Set Supabase vars in `user/.env`:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

## Run locally

```bash
npm run dev:user
```

## Update function

Edit `supabase/functions/chatbot/index.ts` and redeploy:

```bash
supabase functions deploy chatbot --project-ref <your-project-ref>
```

Rotate key when needed:

```bash
supabase secrets set GEMINI_API_KEY=new_key_here
```

## Troubleshooting

- `Supabase is not configured`: check `user/.env` and restart dev server.
- `GEMINI_API_KEY is not configured`: set secret again and redeploy.
- `403` invoking function: authenticate user or deploy with `--no-verify-jwt` if anonymous access is required.
- Gemini rate limits: check usage at https://aistudio.google.com/.
