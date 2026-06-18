import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Headset, ShieldCheck } from "lucide-react";
import { supportChatService } from "@bhatbhati/shared/services/supportChatService.js";

/**
 * Live support chat panel (user side). Rendered inside the ChatBot widget's
 * "Support" tab. Talks to a human admin in real time via Supabase Realtime.
 */
export default function SupportChat({ user }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const userId = user?.id;

  const scrollToEnd = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const appendMessage = useCallback((msg) => {
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
  }, []);

  // Load (or create) the conversation and its history
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const conv = await supportChatService.getOrCreateMyConversation(userId);
        if (!active) return;
        setConversation(conv);
        const history = await supportChatService.getMessages(conv.id);
        if (!active) return;
        setMessages(history);
        await supportChatService.markRead(conv.id, "user");
      } catch {
        if (active) setError("Could not load the support chat. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  // Realtime: receive admin replies (and our own messages echoed back)
  useEffect(() => {
    if (!conversation?.id) return undefined;
    const unsubscribe = supportChatService.subscribeMessages(conversation.id, (msg) => {
      appendMessage(msg);
      if (msg.sender_role === "admin") {
        supportChatService.markRead(conversation.id, "user").catch(() => {});
      }
    });
    return unsubscribe;
  }, [conversation?.id, appendMessage]);

  useEffect(() => {
    scrollToEnd();
  }, [messages, loading, scrollToEnd]);

  const handleSend = async (e) => {
    e.preventDefault();
    const body = input.trim();
    if (!body || sending || !conversation) return;
    setSending(true);
    setError("");
    setInput("");
    try {
      const saved = await supportChatService.sendMessage({
        conversationId: conversation.id,
        senderId: userId,
        senderRole: "user",
        body,
      });
      appendMessage(saved);
    } catch {
      setError("Message failed to send. Please try again.");
      setInput(body);
    } finally {
      setSending(false);
    }
  };

  if (!userId) {
    return (
      <div className="support-gate">
        <Headset size={30} />
        <h4>Sign in to chat with us</h4>
        <p>Log in to your account to message our support team and get help with your bookings.</p>
      </div>
    );
  }

  return (
    <>
      <div className="chat-messages support-messages">
        {loading ? (
          <div className="support-state">Loading conversation…</div>
        ) : messages.length === 0 ? (
          <div className="support-empty">
            <ShieldCheck size={28} />
            <h4>Talk to our team</h4>
            <p>
              Ask about availability, bookings, payments — anything. A team member will reply
              here as soon as they can.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`chat-message-wrapper ${m.sender_role === "user" ? "user" : "bot"}`}
            >
              <div
                className={`chat-message ${
                  m.sender_role === "user" ? "user-message" : "bot-message"
                }`}
              >
                {m.sender_role === "admin" && <span className="support-sender">Support</span>}
                <div className="chat-message-text">{m.body}</div>
                <p className="chat-message-time">
                  {new Date(m.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {error && <div className="support-error">{error}</div>}

      <form onSubmit={handleSend} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message our support team…"
          disabled={loading || sending}
          className="chat-input"
        />
        <button
          type="submit"
          disabled={loading || sending || !input.trim()}
          className="chat-send-btn"
        >
          <Send size={18} />
        </button>
      </form>
    </>
  );
}
