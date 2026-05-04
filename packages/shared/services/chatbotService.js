import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_GEMINI_API_KEY);

// Store conversation history for context
let conversationHistory = [];

/**
 * Initialize a new chat session
 */
export const initializeChatSession = () => {
  conversationHistory = [];
};

/**
 * Send a message to Gemini and get a response
 * @param {string} userMessage - The user's message
 * @returns {Promise<string>} - The AI response
 */
export const sendChatMessage = async (userMessage) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Build the conversation context
    let fullPrompt = userMessage;

    if (conversationHistory.length > 0) {
      fullPrompt = `Previous conversation context:\n${conversationHistory
        .map((msg) => `${msg.role}: ${msg.text}`)
        .join("\n")}\n\nNew message: ${userMessage}`;
    }

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const assistantMessage = response.text();

    // Store in conversation history
    conversationHistory.push({ role: "user", text: userMessage });
    conversationHistory.push({ role: "assistant", text: assistantMessage });

    // Keep only last 10 messages for context (to manage token usage)
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }

    return assistantMessage;
  } catch (error) {
    console.error("Chatbot error:", error);
    throw new Error("Failed to get response from AI. Please try again.");
  }
};

/**
 * Clear chat history
 */
export const clearChatHistory = () => {
  conversationHistory = [];
};

/**
 * Get conversation history
 */
export const getConversationHistory = () => {
  return conversationHistory;
};
