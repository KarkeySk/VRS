<<<<<<< HEAD
# Setup Instructions for AI Chatbot with Google Gemini
=======
# AI Chatbot Setup
>>>>>>> d881cee (refine chatbot)

The chatbot runs entirely through Supabase. The browser calls a Supabase Edge Function (`chatbot`) which talks to Google Gemini server-side. The API key never touches the client.

## One-time Supabase setup

1. **Get a Gemini API key** — https://aistudio.google.com/apikey

<<<<<<< HEAD
The chatbot requires the `VITE_GOOGLE_GEMINI_API_KEY` environment variable to be set.

### Option A: Using .env file in root (Recommended)

Edit the `.env` file in the root VRS folder and add/update:
```
VITE_GOOGLE_GEMINI_API_KEY=your_actual_api_key_here
```

### Option B: Using .env file in AI-chatbot folder

Copy `.env.example` to `.env` in this folder:
```bash
cp .env.example .env
```

Then edit `.env` and add your API key:
```
VITE_GOOGLE_GEMINI_API_KEY=your_actual_api_key_here
```
=======
2. **Install and login to the Supabase CLI**
   ```bash
   npm i -g supabase
   supabase login
   ```

3. **Link the repo to your Supabase project** (run from repo root)
   ```bash
   supabase link --project-ref <your-project-ref>
   ```
   Project ref is the subdomain in your dashboard URL: `https://supabase.com/dashboard/project/<project-ref>`.

4. **Set the Gemini key as a secret**
   ```bash
   supabase secrets set GEMINI_API_KEY=your_actual_key_here
   ```
>>>>>>> d881cee (refine chatbot)

5. **Deploy the Edge Function**
   ```bash
   supabase functions deploy chatbot --project-ref <your-project-ref>
   ```
   The function source lives at `supabase/functions/chatbot/index.ts`.

<<<<<<< HEAD
The chatbot dependencies are already included in package.json. Run in the user folder:
```bash
npm install
=======
## Frontend env

The user app needs Supabase credentials in `user/.env`:
```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
>>>>>>> d881cee (refine chatbot)
```

That's it. `VITE_GOOGLE_GEMINI_API_KEY` is no longer needed and can be removed.

## Run

```bash
npm run dev:user
```

The chat bubble appears bottom-right on every page.

## Updating the function

<<<<<<< HEAD
### Features:
- 💬 Real-time conversation with Google Gemini
- 🔄 Reset chat history anytime
- 📱 Works on all devices
- ⚡ Quick, intelligent responses

## Architecture

- Uses Google Gemini Pro model for AI responses
- Maintains conversation history for context-aware responses
- Lightweight and responsive UI
- No local dependencies required

## Troubleshooting

**"API key not found" error:**
- Make sure your `.env` file has `VITE_GOOGLE_GEMINI_API_KEY` set correctly
- Ensure the API key from Google Gemini is valid and not expired
- Restart the dev server after adding/updating the key
- Check that the .env file is in the correct location (root VRS folder or AI-chatbot folder)

**"Failed to get response" error:**
- Verify your internet connection is working
- Check that the Gemini API key is valid
- Ensure your Google account hasn't exceeded API rate limits
- Check the browser console for more detailed error messages

**Component not showing up:**
- Make sure the ChatBot component is imported in your main App.jsx
- Verify that the chat button appears in the bottom-right corner
- Check the browser console for any JavaScript errors

**Chatbot not appearing:**
- Check browser console for errors
- Verify API key is valid
- Check that Tailwind CSS is loaded

**Slow responses:**
- Gemini API might be rate-limited
- Check your API quota at https://makersuite.google.com/app/dashboard

## API Limits

Google's free tier provides:
- 60 requests per minute
- 1500 requests per day

For higher limits, upgrade your plan on the Google Cloud Console.
=======
Edit `supabase/functions/chatbot/index.ts`, then redeploy:
```bash
supabase functions deploy chatbot --project-ref <your-project-ref>
```

To rotate the key:
```bash
supabase secrets set GEMINI_API_KEY=new_key_here
```

## Troubleshooting

- **"Supabase is not configured"** — `user/.env` is missing `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. Restart `npm run dev` after editing `.env`.
- **"GEMINI_API_KEY is not configured"** — secret wasn't set on the project. Re-run `supabase secrets set ...` and redeploy.
- **403 / auth errors invoking the function** — by default Edge Functions require a logged-in user. The chatbot only renders inside the app for authenticated users, so this is usually fine. To allow anonymous access, redeploy with `--no-verify-jwt`.
- **Rate limits** — Gemini free tier is 1500 req/day, 60 req/min. Check usage at https://aistudio.google.com/.
>>>>>>> d881cee (refine chatbot)
