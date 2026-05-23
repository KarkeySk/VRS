import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, MessageCircle, X, RotateCcw, Wifi, WifiOff, MapPin, Navigation, ArrowUpDown, ChevronRight, ChevronLeft, Search } from "lucide-react";
import {
  sendChatMessage,
  initializeChatSession,
  clearChatHistory,
  getProviderStatus,
  injectFleetData,
  resetProviderState,
} from "./chatbotService";
import { NEPAL_LOCATIONS } from "./nepalLocations";
import { vehicleService } from "@bhatbhati/shared/services/vehicleService.js";
import { UI_CONFIG, SERVICE_CONFIG } from "../config/index.js";
import "./ChatBot.css";

let nextMessageId = 1;

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: nextMessageId++,
      text: UI_CONFIG.CHATBOT.GREETING,
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Location picker state
  const [activePicker, setActivePicker] = useState(null); // 'from' | 'to' | null
  const [pickerProvince, setPickerProvince] = useState(null);
  const [pickerDistrict, setPickerDistrict] = useState(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const pickerRef = useRef(null);
  // Lazy-initialize so the badge reflects the real status on the very first render
  const [providerInfo, setProviderInfo] = useState(() => getProviderStatus());
  const [activePicker, setActivePicker] = useState(null);
  const [pickerProvince, setPickerProvince] = useState(null);
  const [pickerDistrict, setPickerDistrict] = useState(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const pickerRef = useRef(null);

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

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setActivePicker(null);
        setPickerProvince(null);
        setPickerDistrict(null);
        setPickerSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openPicker = (field) => {
    setActivePicker(field);
    setPickerProvince(null);
    setPickerDistrict(null);
    setPickerSearch("");
  };

  const closePicker = () => {
    setActivePicker(null);
    setPickerProvince(null);
    setPickerDistrict(null);
    setPickerSearch("");
  };

  const selectPlace = (place, district, province) => {
    const value = `${place}, ${district}`;
    if (activePicker === "from") setFromLocation(value);
    else setToLocation(value);
    closePicker();
  };

  // Filtered search results across all provinces/districts/places
  const searchResults = (() => {
    if (!pickerSearch.trim()) return [];
    const q = pickerSearch.toLowerCase();
    const results = [];
    for (const [prov, districts] of Object.entries(NEPAL_LOCATIONS)) {
      for (const [dist, places] of Object.entries(districts)) {
        if (dist.toLowerCase().includes(q)) {
          results.push({ type: "district", label: `${dist}, ${prov}`, province: prov, district: dist });
        }
        for (const place of places) {
          if (place.toLowerCase().includes(q)) {
            results.push({ type: "place", label: `${place}, ${dist}`, place, district: dist, province: prov });
          }
        }
      }
    }
    return results.slice(0, SERVICE_CONFIG.SEARCH.RESULTS_LIMIT);
  })();

  const provinces = Object.keys(NEPAL_LOCATIONS);
  const districts = pickerProvince ? Object.keys(NEPAL_LOCATIONS[pickerProvince]) : [];
  const places = pickerProvince && pickerDistrict ? NEPAL_LOCATIONS[pickerProvince][pickerDistrict] : [];

  const handleSwapLocations = () => {
    setFromLocation(toLocation);
    setToLocation(fromLocation);
  };

  const handleRouteSearch = async (e) => {
    e.preventDefault();
    if (!fromLocation.trim() || !toLocation.trim()) return;

    const routeQuery = `I want to travel from ${fromLocation.trim()} to ${toLocation.trim()}. What vehicle from your fleet do you recommend for this route, and what are the road conditions?`;

    const userMessage = {
      id: nextMessageId++,
      text: `From: ${fromLocation.trim()}  →  To: ${toLocation.trim()}`,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setFromLocation("");
    setToLocation("");
    setIsLoading(true);

    try {
      const aiResponse = await sendChatMessage(routeQuery);
      setMessages((prev) => [
        ...prev,
        { id: nextMessageId++, text: aiResponse, sender: "bot", timestamp: new Date() },
      ]);
      setProviderInfo(getProviderStatus());
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: nextMessageId++,
          text: error?.message || "Sorry, I encountered an error. Please try again.",
          sender: "bot",
          timestamp: new Date(),
          isError: true,
        },
      ]);
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
        text: UI_CONFIG.CHATBOT.RESET_GREETING,
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

          {/* Location Route Inputs */}
          <div className="chat-route-form" ref={pickerRef}>
            <div className="chat-route-inputs">
              {/* FROM */}
              <div className="chat-route-field">
                <MapPin size={14} className="route-icon from-icon" />
                <input
                  type="text"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  onFocus={() => openPicker("from")}
                  placeholder="From — province, district or village"
                  disabled={isLoading}
                  className="chat-route-input"
                />
              </div>
              <button
                type="button"
                onClick={handleSwapLocations}
                className="chat-swap-btn"
                title="Swap locations"
              >
                <ArrowUpDown size={13} />
              </button>
              {/* TO */}
              <div className="chat-route-field">
                <Navigation size={14} className="route-icon to-icon" />
                <input
                  type="text"
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  onFocus={() => openPicker("to")}
                  placeholder="To — province, district or village"
                  disabled={isLoading}
                  className="chat-route-input"
                />
              </div>
            </div>

            {/* Hierarchical Picker Dropdown */}
            {activePicker && (
              <div className="loc-picker">
                {/* Search bar */}
                <div className="loc-search-row">
                  <Search size={13} className="loc-search-icon" />
                  <input
                    autoFocus
                    className="loc-search-input"
                    placeholder={UI_CONFIG.CHATBOT.SEARCH_PLACEHOLDER}
                    value={pickerSearch}
                    onChange={(e) => {
                      setPickerSearch(e.target.value);
                      setPickerProvince(null);
                      setPickerDistrict(null);
                    }}
                  />
                  {pickerSearch && (
                    <button className="loc-clear-btn" onClick={() => setPickerSearch("")}>
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Breadcrumb */}
                {!pickerSearch && (
                  <div className="loc-breadcrumb">
                    <button
                      className={`loc-crumb ${!pickerProvince ? "active" : ""}`}
                      onClick={() => { setPickerProvince(null); setPickerDistrict(null); }}
                    >
                      Nepal
                    </button>
                    {pickerProvince && (
                      <>
                        <ChevronRight size={11} className="loc-crumb-sep" />
                        <button
                          className={`loc-crumb ${!pickerDistrict ? "active" : ""}`}
                          onClick={() => setPickerDistrict(null)}
                        >
                          {pickerProvince.replace(" Province", "")}
                        </button>
                      </>
                    )}
                    {pickerDistrict && (
                      <>
                        <ChevronRight size={11} className="loc-crumb-sep" />
                        <span className="loc-crumb active">{pickerDistrict}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Search results */}
                {pickerSearch ? (
                  <div className="loc-list">
                    {searchResults.length === 0 && (
                      <div className="loc-empty">No places found</div>
                    )}
                    {searchResults.map((r, i) => (
                      <button
                        key={i}
                        className="loc-item"
                        onClick={() =>
                          r.type === "place"
                            ? selectPlace(r.place, r.district, r.province)
                            : (() => { setPickerProvince(r.province); setPickerDistrict(r.district); setPickerSearch(""); })()
                        }
                      >
                        <MapPin size={11} className="loc-item-icon" />
                        <span className="loc-item-label">{r.label}</span>
                        {r.type === "district" && <ChevronRight size={11} className="loc-item-arrow" />}
                      </button>
                    ))}
                  </div>
                ) : !pickerProvince ? (
                  /* Province list */
                  <div className="loc-list">
                    {provinces.map((prov) => (
                      <button
                        key={prov}
                        className="loc-item"
                        onClick={() => setPickerProvince(prov)}
                      >
                        <MapPin size={11} className="loc-item-icon" />
                        <span className="loc-item-label">{prov}</span>
                        <ChevronRight size={11} className="loc-item-arrow" />
                      </button>
                    ))}
                  </div>
                ) : !pickerDistrict ? (
                  /* District list */
                  <div className="loc-list">
                    {districts.map((dist) => (
                      <button
                        key={dist}
                        className="loc-item"
                        onClick={() => setPickerDistrict(dist)}
                      >
                        <MapPin size={11} className="loc-item-icon" />
                        <span className="loc-item-label">{dist}</span>
                        <ChevronRight size={11} className="loc-item-arrow" />
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Places list */
                  <div className="loc-list">
                    {places.map((place) => (
                      <button
                        key={place}
                        className="loc-item place"
                        onClick={() => selectPlace(place, pickerDistrict, pickerProvince)}
                      >
                        <MapPin size={11} className="loc-item-icon place" />
                        <span className="loc-item-label">{place}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleRouteSearch}>
              <button
                type="submit"
                disabled={isLoading || !fromLocation.trim() || !toLocation.trim()}
                className="chat-route-btn"
              >
                Find Vehicle
              </button>
            </form>
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="chat-input-form">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={UI_CONFIG.CHATBOT.DEFAULT_MESSAGE}
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
