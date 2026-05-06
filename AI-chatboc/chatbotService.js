import { GoogleGenerativeAI } from "@google/generative-ai";


//  CONFIGURATION
//  Change ACTIVE_PROVIDER to swap between providers:
//    "gemini"   → Google Gemini API (free tier)
//    "local"    → Offline keyword-based bot (always works)
//    "supabase" → Supabase Edge Function (add later)

let ACTIVE_PROVIDER = "gemini"; // Will auto-fallback to "local" if Gemini fails

// Conversation state
let conversationHistory = [];
let chatSession = null;
let geminiAvailable = true; // Track if Gemini is reachable
let failureCount = 0;
const MAX_FAILURES_BEFORE_FALLBACK = 3;

// ─────────────────────────────────────────────────────────────
//  SYSTEM PROMPT — defines the AI's personality & scope
// ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the friendly AI assistant for Bhatbhate — a vehicle rental company based in Nepal.

Your personality:
- Warm, conversational, and helpful — like talking to a knowledgeable friend
- You use natural language, not robotic bullet points for every answer
- You can chat casually but stay professional when discussing business details
- Use emojis sparingly and naturally (not every sentence)

What you help with:
- Booking vehicles and explaining the rental process
- Answering questions about rental terms, pricing, and policies
- Providing information about available vehicles (motorcycles, scooters, cars, SUVs, jeeps, vans)
- Recommending vehicles based on terrain (mountain, highway, urban, terai)
- Payment methods (eSewa, Khalti, Bank Transfer, Cash)
- Document requirements (license, ID, deposit)
- Cancellation and refund policies
- General customer support

Important details:
- Operating hours: 7 AM – 8 PM daily
- Pricing starts from NPR 800/day for scooters up to NPR 5,000+/day for SUVs
- Free cancellation up to 24 hours before pickup
- Support email: support@bhatbhate.com

Rules:
- Have a real conversation. Don't just dump lists unless specifically asked for them.
- If someone says "hi" or makes small talk, respond naturally — don't immediately pitch services.
- If you genuinely don't know something specific, say so honestly and suggest contacting support.
- Keep responses concise but helpful — aim for 2-4 sentences for casual questions, more detail only when asked.`;

// ─────────────────────────────────────────────────────────────
//  GEMINI PROVIDER
// ─────────────────────────────────────────────────────────────
const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
const MODEL = "gemini-2.0-flash";

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Retry helpers
const MAX_RETRIES = 2;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const initGeminiSession = () => {
  if (!genAI) return;
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: SYSTEM_PROMPT,
    });
    chatSession = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });
  } catch (err) {
    console.warn("Failed to init Gemini session:", err.message);
    chatSession = null;
  }
};

const sendGeminiMessage = async (userMessage) => {
  if (!genAI || !GEMINI_API_KEY) {
    throw new Error("NO_API_KEY");
  }

  if (!chatSession) {
    initGeminiSession();
  }
  if (!chatSession) {
    throw new Error("SESSION_INIT_FAILED");
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Gemini] Attempt ${attempt}/${MAX_RETRIES}...`);
      const result = await chatSession.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text().trim();

      // Success — reset failure counter
      failureCount = 0;
      geminiAvailable = true;
      return text;
    } catch (err) {
      const msg = err.message || "";
      const isRateLimit =
        msg.includes("429") ||
        msg.includes("Too Many Requests") ||
        msg.includes("quota") ||
        msg.includes("RESOURCE_EXHAUSTED");

      if (isRateLimit && attempt < MAX_RETRIES) {
        // Try to parse the retry delay from the error
        let delayMs = 3000 * attempt;
        const match = msg.match(/retry\s+in\s+([\d.]+)s/i);
        if (match) {
          delayMs = Math.min(Math.ceil(parseFloat(match[1]) * 1000), 15000);
        }
        console.log(`[Gemini] Rate limited. Waiting ${delayMs / 1000}s...`);
        initGeminiSession();
        await sleep(delayMs);
        continue;
      }

      // All retries failed
      throw err;
    }
  }
};

// ─────────────────────────────────────────────────────────────
//  LOCAL FALLBACK PROVIDER (always works, no API needed)
// ─────────────────────────────────────────────────────────────
const LOCAL_KNOWLEDGE_BASE = {
  // Greetings
  greetings: {
    patterns: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "namaste", "howdy", "greetings"],
    responses: [
      "Hello! 👋 Welcome to Bhatbhate Vehicle Rentals! How can I help you today?",
      "Hi there! 🚗 I'm your Bhatbhate rental assistant. What would you like to know?",
      "Namaste! 🙏 Welcome to Bhatbhate. I'm here to help with your vehicle rental needs!",
    ],
  },

  // Booking related
  booking: {
    patterns: ["book", "reserve", "rent", "rental", "booking", "reservation", "hire"],
    responses: [
      "Great choice! 🚗 To book a vehicle with Bhatbhate:\n\n1️⃣ Browse our vehicles by terrain type\n2️⃣ Select the vehicle you like\n3️⃣ Choose your rental dates\n4️⃣ Fill out the booking form\n5️⃣ Complete payment\n\nWould you like me to help you find a vehicle for a specific terrain?",
      "I'd love to help you book! 📋 You can start by selecting your terrain type (Mountain, Highway, Urban, etc.) and we'll show you the best vehicles for your journey. Need help choosing?",
    ],
  },

  // Vehicle types
  vehicles: {
    patterns: ["vehicle", "car", "bike", "motorcycle", "scooter", "suv", "jeep", "van", "bus", "types", "available", "fleet"],
    responses: [
      "🚙 Bhatbhate offers a great selection of vehicles!\n\n• 🏍️ Motorcycles & Scooters — for city rides\n• 🚗 Sedans & Hatchbacks — for highway trips\n• 🚙 SUVs & Jeeps — for mountain terrain\n• 🚐 Vans & Buses — for group travel\n\nYou can browse all vehicles by heading to the Vehicles page, or select a terrain type to see recommended options!",
      "We have everything from scooters to SUVs! 🛵🚙 Use the Terrain Select feature on our site to find the perfect match for your route. What terrain will you be driving on?",
    ],
  },

  // Pricing
  pricing: {
    patterns: ["price", "cost", "rate", "charge", "fee", "expensive", "cheap", "affordable", "how much", "pricing", "budget"],
    responses: [
      "💰 Our pricing depends on the vehicle type and rental duration:\n\n• Scooters: Starting from NPR 800/day\n• Motorcycles: Starting from NPR 1,500/day\n• Cars/Sedans: Starting from NPR 3,500/day\n• SUVs/Jeeps: Starting from NPR 5,000/day\n\nLonger rentals get better rates! Check the vehicle detail page for exact pricing. 📊",
      "Pricing varies by vehicle and duration. You can see the exact cost on each vehicle's detail page. We also offer discounts for longer rental periods! 🎉",
    ],
  },

  // Payment
  payment: {
    patterns: ["pay", "payment", "esewa", "khalti", "bank", "transfer", "money", "deposit"],
    responses: [
      "💳 We accept multiple payment methods:\n\n• eSewa\n• Khalti\n• Bank Transfer\n• Cash on pickup\n\nPayment is processed securely through our platform. A deposit may be required for certain vehicles.",
      "You can pay through eSewa, Khalti, or Bank Transfer! 💰 Payment is handled securely during the booking confirmation step.",
    ],
  },

  // Documents / Requirements
  documents: {
    patterns: ["document", "license", "id", "requirement", "need", "passport", "citizenship", "proof", "verification"],
    responses: [
      "📄 To rent a vehicle, you'll need:\n\n• Valid driving license (matching vehicle category)\n• Government-issued ID (citizenship/passport)\n• Contact information\n• Security deposit (refundable)\n\nMake sure your license covers the vehicle type you want to rent!",
    ],
  },

  // Terrain
  terrain: {
    patterns: ["terrain", "mountain", "highway", "urban", "city", "road", "off-road", "hill", "kathmandu", "pokhara", "terai"],
    responses: [
      "🏔️ We recommend vehicles based on terrain:\n\n• 🏙️ Urban/City → Scooters, Hatchbacks\n• 🛣️ Highway → Sedans, Motorcycles\n• ⛰️ Mountain/Hill → SUVs, Jeeps\n• 🌾 Terai/Plains → Any vehicle type\n\nUse our Terrain Select feature to get personalized recommendations!",
      "Great question! Different terrains need different vehicles. Head to our Terrain Select page and pick your destination — we'll show you the best options! 🗺️",
    ],
  },

  // Cancel / Refund
  cancel: {
    patterns: ["cancel", "refund", "return", "cancellation", "money back"],
    responses: [
      "🔄 Cancellation Policy:\n\n• Free cancellation up to 24 hours before pickup\n• 50% refund for cancellation within 24 hours\n• No refund for no-shows\n\nTo cancel a booking, go to your Bookings page and select the booking you want to cancel. For urgent issues, please contact our support team.",
    ],
  },

  // Support / Contact
  support: {
    patterns: ["support", "help", "contact", "phone", "email", "call", "reach", "complaint", "issue", "problem"],
    responses: [
      "📞 Need to reach us? Here's how:\n\n• 📧 Email: support@bhatbhate.com\n• 📱 Phone: +977-01-XXXXXXX\n• 💬 This chatbot (I'm always here!)\n• 📍 Visit: Check our office locations\n\nFor account-specific issues, please log in and visit your Profile page.",
    ],
  },

  // Hours / Timing
  hours: {
    patterns: ["hour", "time", "open", "close", "timing", "when", "schedule", "pickup", "drop"],
    responses: [
      "⏰ Operating Hours:\n\n• Office: 7:00 AM – 8:00 PM (daily)\n• Pickup/Drop-off: Flexible timing available\n• Customer Support: 24/7 via chatbot\n\nYou can arrange specific pickup and drop-off times during the booking process!",
    ],
  },

  // Thanks
  thanks: {
    patterns: ["thank", "thanks", "appreciate", "grateful", "awesome", "great", "perfect", "wonderful"],
    responses: [
      "You're welcome! 😊 Happy to help. Is there anything else you'd like to know about Bhatbhate?",
      "Glad I could help! 🎉 Feel free to ask if you have any other questions. Enjoy your ride! 🚗",
      "My pleasure! 😄 Don't hesitate to come back if you need anything else!",
    ],
  },

  // Goodbye
  goodbye: {
    patterns: ["bye", "goodbye", "see you", "later", "done", "exit", "quit"],
    responses: [
      "Goodbye! 👋 Thanks for visiting Bhatbhate. Have a great journey! 🚗💨",
      "See you later! 😊 Safe travels and don't forget — Bhatbhate is here whenever you need a ride!",
    ],
  },
};

// Default fallback when no pattern matches
const DEFAULT_RESPONSES = [
  "I appreciate your question! While I may not have the specific answer right now, I can help you with booking vehicles, pricing, payment options, or terrain recommendations. What would you like to know? 😊",
  "That's a great question! For detailed information about that, I'd recommend checking our website or contacting our support team. In the meantime, I can help with vehicle bookings, pricing, or rental requirements!",
  "I'm not sure about that specific topic, but I'm great with vehicle rentals! 🚗 I can help you with:\n\n• Finding the right vehicle\n• Booking process\n• Pricing information\n• Payment methods\n\nWhat would you like to explore?",
];

/**
 * Match user message to a knowledge base category
 */
const findBestMatch = (message) => {
  const lower = message.toLowerCase().trim();
  let bestCategory = null;
  let bestScore = 0;

  for (const [category, data] of Object.entries(LOCAL_KNOWLEDGE_BASE)) {
    let score = 0;
    for (const pattern of data.patterns) {
      if (lower.includes(pattern)) {
        // Longer pattern matches get higher scores
        score += pattern.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
};

/**
 * Pick a random response from an array
 */
const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Local chatbot response
 */
const sendLocalMessage = (userMessage) => {
  const category = findBestMatch(userMessage);

  if (category) {
    return randomPick(LOCAL_KNOWLEDGE_BASE[category].responses);
  }

  return randomPick(DEFAULT_RESPONSES);
};


//  SUPABASE PROVIDER (placeholder for future integration)
//  To activate: set ACTIVE_PROVIDER = "supabase"
//  and implement the function below

// const SUPABASE_CHAT_URL = import.meta.env.VITE_SUPABASE_URL + "/functions/v1/chat";
// const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
//
// const sendSupabaseMessage = async (userMessage) => {
//   const res = await fetch(SUPABASE_CHAT_URL, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
//     },
//     body: JSON.stringify({
//       message: userMessage,
//       history: conversationHistory.slice(-10),
//     }),
//   });
//   if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
//   const data = await res.json();
//   return data.reply;
// };


//  PUBLIC API (used by ChatBot.jsx)


/**
 * Initialize a new chat session
 */
export const initializeChatSession = () => {
  conversationHistory = [];
  failureCount = 0;
  geminiAvailable = true;

  if (ACTIVE_PROVIDER === "gemini" && genAI) {
    initGeminiSession();
  }
};

/**
 * Send a message and get a response.
 * Auto-falls back to local bot if Gemini is unavailable.
 */
export const sendChatMessage = async (userMessage) => {
  let assistantMessage = "";
  let usedProvider = ACTIVE_PROVIDER;

  // ── Try Gemini first (if configured) ──
  if (
    (ACTIVE_PROVIDER === "gemini" || ACTIVE_PROVIDER === "supabase") &&
    genAI &&
    GEMINI_API_KEY &&
    geminiAvailable
  ) {
    try {
      assistantMessage = await sendGeminiMessage(userMessage);
      usedProvider = "gemini";
    } catch (err) {
      const msg = err.message || "";
      console.warn("[Chatbot] Gemini failed:", msg);

      failureCount++;

      // If repeated failures, disable Gemini for this session
      if (failureCount >= MAX_FAILURES_BEFORE_FALLBACK) {
        geminiAvailable = false;
        console.warn(
          `[Chatbot] Gemini disabled after ${failureCount} failures. Using local fallback.`
        );
      }

      // Fall through to local
      assistantMessage = "";
    }
  }

  // ── Supabase provider (future) ──
  // if (!assistantMessage && ACTIVE_PROVIDER === "supabase") {
  //   try {
  //     assistantMessage = await sendSupabaseMessage(userMessage);
  //     usedProvider = "supabase";
  //   } catch (err) {
  //     console.warn("[Chatbot] Supabase failed:", err.message);
  //   }
  // }

  // ── Local fallback (always works) ──
  if (!assistantMessage) {
    assistantMessage = sendLocalMessage(userMessage);
    usedProvider = "local";
  }

  console.log(`[Chatbot] Response via [${usedProvider}]:`, assistantMessage.substring(0, 80) + "...");

  // Store in conversation history
  conversationHistory.push({ role: "user", text: userMessage });
  conversationHistory.push({ role: "assistant", text: assistantMessage });

  // Keep only last 10 message pairs for context
  if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(-20);
  }

  return assistantMessage;
};

/**
 * Clear chat history and reset provider state
 */
export const clearChatHistory = () => {
  conversationHistory = [];
  failureCount = 0;
  geminiAvailable = true;
  if (genAI) {
    initGeminiSession();
  }
};

/**
 * Get conversation history
 */
export const getConversationHistory = () => {
  return conversationHistory;
};

/**
 * Get current active provider info (useful for debugging / UI indicator)
 */
export const getProviderStatus = () => {
  return {
    configured: ACTIVE_PROVIDER,
    geminiAvailable: !!(genAI && GEMINI_API_KEY && geminiAvailable),
    fallbackActive: !geminiAvailable || !genAI,
    failureCount,
  };
};
