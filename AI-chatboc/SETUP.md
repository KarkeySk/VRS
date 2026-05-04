# Setup Instructions for AI Chatbot

## Step 1: Get Google Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy your API key

## Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env` in the user folder:
   ```bash
   cp .env.example .env
   ```

2. Add your API key to `.env`:
   ```
   VITE_GOOGLE_GEMINI_API_KEY=your_actual_api_key_here
   ```

## Step 3: Install Dependencies

Run in the user folder:
```bash
npm install
```

This will install the `@google/generative-ai` package.

## Step 4: Start Development Server

```bash
npm run dev
```

## Usage

The chatbot will appear as a floating button in the bottom-right corner of every page. Click it to start chatting!

### Features:
- 💬 Real-time conversation
- 🔄 Reset chat history anytime
- 📱 Works on all devices
- ⚡ Quick responses

## Troubleshooting

**"API key not found" error:**
- Make sure your `.env` file has `VITE_GOOGLE_GEMINI_API_KEY` set correctly
- Restart the dev server after adding the key

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
