// Store conversation history for context
let conversationHistory = [];

const SYSTEM_PROMPT = `You are a helpful assistant for a vehicle rental company called Bhatbhate. 
You help customers with:
- Booking vehicles
- Answering questions about rental terms
- Providing information about available vehicles
- Assisting with payments and reservations
- General customer support

Be friendly, professional, and always try to help the customer. If you don't know something specific about the company, suggest they contact customer support.`;

const OLLAMA_API = "http://localhost:11434/api/generate";
const MODEL = "mistral"; // Using mistral (already installed)

/**
 * Initialize a new chat session
 */
export const initializeChatSession = () => {
  conversationHistory = [];
};

/**
 * Send a message to Ollama and get a response
 * @param {string} userMessage - The user's message
 * @returns {Promise<string>} - The AI response
 */
export const sendChatMessage = async (userMessage) => {
  try {
    console.log("Sending request to Ollama API...");

    // Build full context from conversation history
    let context = SYSTEM_PROMPT + "\n\n";
    
    if (conversationHistory.length > 0) {
      context += "Conversation history:\n";
      conversationHistory.forEach((msg) => {
        context += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.text}\n`;
      });
      context += "\n";
    }

    const fullPrompt = context + `User: ${userMessage}\nAssistant:`;

    const response = await fetch(OLLAMA_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        prompt: fullPrompt,
        stream: false,
        temperature: 0.5,
        num_predict: 150,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.response.trim();

    console.log("Got response:", assistantMessage);

    // Store in conversation history
    conversationHistory.push({ role: "user", text: userMessage });
    conversationHistory.push({ role: "assistant", text: assistantMessage });

    // Keep only last 10 message pairs for context
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }

    return assistantMessage;
  } catch (error) {
    console.error("Chatbot error:", error);
    
    // Helpful error messages
    if (error.message.includes("Failed to fetch") || error.message.includes("localhost")) {
      throw new Error(
        "⚠️ Ollama is not running! Please:\n1. Download Ollama from https://ollama.ai\n2. Install and run it\n3. In terminal, run: ollama pull mistral\n4. Keep Ollama running while using the chat"
      );
    }
    
    throw new Error(`Failed to get response: ${error.message}`);
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
