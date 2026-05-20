import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, MessageCircle, X, RotateCcw, Wifi, WifiOff } from "lucide-react";
import {
  sendChatMessage,
  initializeChatSession,
  clearChatHistory,
  getProviderStatus,
  injectFleetData,
  resetProviderState,
} from "./chatbotService";
import { vehicleService } from "@bhatbhati/shared/services/vehicleService.js";
import "./ChatBot.css";

let nextMessageId = 1;

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: nextMessageId++,
      text: "Hello!👋 I'm your Bhatbhate assistant. Ask me anything — about vehicles, bookings, pricing, or just say hi!",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Lazy-initialize so the badge reflects the real status on the very first render
  const [providerInfo, setProviderInfo] = useState(() => getProviderStatus());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize chat session and inject live fleet data
  useEffect(() => {
    initializeChatSession();
    setProviderInfo(getProviderStatus());

    // Fetch all available vehicles and inject into Gemini's system prompt
    vehicleService.getAll()
      .then((vehicles) => {
        if (vehicles?.length) {
          injectFleetData(vehicles);
          setProviderInfo(getProviderStatus());
        }
      })
      .catch((err) => console.warn("[ChatBot] Could not load fleet for AI context:", err?.message));
  }, []);

  // When the chat window opens, reset any previous failure state so Gemini
  // gets another chance — module-level failures persist otherwise
  useEffect(() => {
    if (isOpen) {
      resetProviderState();
      setProviderInfo(getProviderStatus());
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: nextMessageId++,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      // Get AI response (auto-falls back to local if Gemini fails)
      const aiResponse = await sendChatMessage(messageText);

      const botMessage = {
        id: nextMessageId++,
        text: aiResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      // Update provider status after each message
      setProviderInfo(getProviderStatus());
    } catch (error) {
      // This should rarely happen now since we have local fallback
      const errorMessage = {
        id: nextMessageId++,
        text: error?.message || "Sorry, I encountered an error. Please try again.",
        sender: "bot",
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = useCallback(() => {
    clearChatHistory();
    initializeChatSession();
    setProviderInfo(getProviderStatus());
    nextMessageId = 1;
    setMessages([
      {
        id: nextMessageId++,
        text: "Hello! 👋 I'm your Bhatbhate assistant. Ask me anything — about vehicles, bookings, pricing, or just say hi!",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  }, []);

  /**
   * Render message text with basic formatting support.
   * Handles newlines, **bold**, and *italic* from Gemini responses.
   */
  const renderMessageText = (text) => {
    // Split by double newlines for paragraphs, then by single newlines
    const parts = text.split(/\n/).map((line, i) => {
      // Bold: **text**
      let formatted = line.replace(
        /\*\*(.+?)\*\*/g,
        '<strong>$1</strong>'
      );
      // Italic: *text* (but not inside bold)
      formatted = formatted.replace(
        /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g,
        '<em>$1</em>'
      );
      // Bullet points: lines starting with - or •
      if (/^\s*[-•]\s+/.test(formatted)) {
        formatted = formatted.replace(/^\s*[-•]\s+/, '');
        return (
          <div key={i} className="chat-bullet-line">
            <span className="chat-bullet">•</span>
            <span dangerouslySetInnerHTML={{ __html: formatted }} />
          </div>
        );
      }
      // Numbered list: lines starting with 1. 2. etc
      const numMatch = formatted.match(/^\s*(\d+)[.)]\s+(.*)/);
      if (numMatch) {
        return (
          <div key={i} className="chat-bullet-line">
            <span className="chat-bullet">{numMatch[1]}.</span>
            <span dangerouslySetInnerHTML={{ __html: numMatch[2] }} />
          </div>
        );
      }

      if (line.trim() === '') {
        return <div key={i} className="chat-line-break" />;
      }

      return (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: formatted }} />
          {i < text.split(/\n/).length - 1 && <br />}
        </span>
      );
    });

    return <div className="chat-message-content">{parts}</div>;
  };

  const isOnlineProvider = providerInfo && providerInfo.geminiAvailable;

  return (
    <>
      {/* Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chat-bubble-btn"
          title="Chat with Bhatbhate AI"
          aria-label="Open chat assistant"
        >
          <MessageCircle size={24} />
          <span className="chat-bubble-dot"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window" role="dialog" aria-label="Chat assistant">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-content">
              <h3 className="chat-header-title">Bhatbhate AI</h3>
              <p className="chat-header-subtitle">
                {isOnlineProvider ? (
                  <span className="provider-badge online">
                    <Wifi size={11} /> Gemini AI
                  </span>
                ) : (
                  <span className="provider-badge offline">
                    <WifiOff size={11} /> Offline Mode
                  </span>
                )}
                {" • Ask me anything"}
              </p>
            </div>
            <div className="chat-header-actions">
              <button
                onClick={handleReset}
                className="chat-action-btn"
                title="New conversation"
                aria-label="Reset chat"
              >
                <RotateCcw size={18} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="chat-action-btn"
                title="Close chat"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message-wrapper ${message.sender === "user" ? "user" : "bot"}`}
              >
                <div
                  className={`chat-message ${
                    message.sender === "user"
                      ? "user-message"
                      : message.isError
                      ? "error-message"
                      : "bot-message"
                  }`}
                >
                  <div className="chat-message-text">
                    {message.sender === "bot"
                      ? renderMessageText(message.text)
                      : message.text}
                  </div>
                  <p className="chat-message-time">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message-wrapper bot">
                <div className="chat-message bot-message loading">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="chat-input-form"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="chat-input"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="chat-send-btn"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;
//chakuu
