# Setup Instructions for AI Chatbot with Google Gemini

## Step 1: Get Google Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy your API key

## Step 2: Configure Environment Variables

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

## Step 3: Install Dependencies

The chatbot dependencies are already included in package.json. Run in the user folder:
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
