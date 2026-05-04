# Bhatbhati AI Chatbot

A Google Gemini-powered chatbot for the Bhatbhati vehicle rental platform.

## Features

- 🤖 AI-powered responses using Google Gemini
- 💬 Real-time conversation with message history
- 🎨 Beautiful, responsive UI with Tailwind CSS
- ⚡ Lightweight and performant
- 📱 Mobile-friendly design
- 🔄 Chat reset functionality

## Installation

1. Install the dependency in your user app:

```bash
npm install @google/generative-ai
```

2. Add your Google Gemini API key to your `.env` file:

```
VITE_GOOGLE_GEMINI_API_KEY=your_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

## Usage

Import and use the ChatBot component in your React app:

```jsx
import ChatBot from "@bhatbhati/ai-chatbot/ChatBot";

function App() {
  return (
    <div>
      {/* Your app content */}
      <ChatBot />
    </div>
  );
}
```

## File Structure

- `ChatBot.jsx` - Main React component
- `ChatBot.css` - Styling and animations
- `chatbotService.js` - Gemini API integration and conversation management
- `package.json` - Dependencies

## Environment Variables

Required:
- `VITE_GOOGLE_GEMINI_API_KEY` - Your Google Gemini API key

## Architecture

The chatbot uses:
- Google's Generative AI (Gemini Pro) for intelligent responses
- React hooks for state management
- Tailwind CSS for styling
- Lucide React for icons
