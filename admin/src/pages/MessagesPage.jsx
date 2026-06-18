import { useEffect, useRef, useState, useCallback } from 'react'
import { MessageSquare, Send, User } from 'lucide-react'
import { authService } from '@bhatbhati/shared/services/authService.js'
import { supportChatService } from '@bhatbhati/shared/services/supportChatService.js'

const timeShort = (iso) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

const dayLabel = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Today'
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function MessagesPage() {
  const [adminId, setAdminId] = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loadingList, setLoadingList] = useState(true)
  const [loadingThread, setLoadingThread] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef(null)

  const active = conversations.find((c) => c.id === activeId) || null
  const nameOf = (c) => c?.profiles?.full_name || 'Guest user'

  // Current admin id (sender of replies)
  useEffect(() => {
    authService.getUser().then((u) => setAdminId(u?.id ?? null)).catch(() => {})
  }, [])

  const loadList = useCallback(async () => {
    try {
      const list = await supportChatService.listConversations()
      setConversations(list)
    } catch {
      setError('Failed to load conversations.')
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => { loadList() }, [loadList])

  // Realtime: refresh the inbox whenever any conversation changes
  useEffect(() => supportChatService.subscribeConversations(loadList), [loadList])

  // Load the selected thread + mark it read
  useEffect(() => {
    if (!activeId) { setMessages([]); return undefined }
    let on = true
    setLoadingThread(true)
    ;(async () => {
      try {
        const msgs = await supportChatService.getMessages(activeId)
        if (!on) return
        setMessages(msgs)
        await supportChatService.markRead(activeId, 'admin')
        setConversations((prev) =>
          prev.map((c) => (c.id === activeId ? { ...c, admin_unread: 0 } : c)))
      } catch {
        if (on) setError('Failed to load messages.')
      } finally {
        if (on) setLoadingThread(false)
      }
    })()
    return () => { on = false }
  }, [activeId])

  // Realtime messages for the open thread
  useEffect(() => {
    if (!activeId) return undefined
    return supportChatService.subscribeMessages(activeId, (m) => {
      setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]))
      if (m.sender_role === 'user') {
        supportChatService.markRead(activeId, 'admin').catch(() => {})
      }
    })
  }, [activeId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loadingThread])

  const send = async (e) => {
    e.preventDefault()
    const body = input.trim()
    if (!body || sending || !active || !adminId) return
    setSending(true)
    setError('')
    setInput('')
    try {
      const saved = await supportChatService.sendMessage({
        conversationId: active.id,
        senderId: adminId,
        senderRole: 'admin',
        body,
      })
      setMessages((prev) => (prev.some((x) => x.id === saved.id) ? prev : [...prev, saved]))
    } catch {
      setError('Failed to send the reply.')
      setInput(body)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-150px)] min-h-[420px]">
      {/* Inbox list */}
      <aside className="w-[300px] shrink-0 flex flex-col rounded-xl border border-dark-border bg-dark-card overflow-hidden">
        <div className="px-4 py-3 border-b border-dark-border flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-orange" />
          <h2 className="text-sm font-bold m-0">Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <p className="text-xs text-txt-secondary p-4 m-0">Loading…</p>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-txt-secondary p-4 m-0">No conversations yet.</p>
          ) : (
            conversations.map((c) => {
              const isActive = c.id === activeId
              const unread = c.admin_unread || 0
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  className={`w-full text-left px-4 py-3 border-b border-dark-border/60 transition-colors duration-150 ${
                    isActive ? 'bg-brand-orange/15' : 'hover:bg-dark-border/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-dark-border flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-txt-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold truncate">{nameOf(c)}</span>
                        <span className="text-[10px] text-txt-secondary shrink-0">
                          {dayLabel(c.last_message_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-txt-secondary truncate">
                          {c.last_message || 'No messages yet'}
                        </span>
                        {unread > 0 && (
                          <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-orange text-dark text-[10px] font-bold flex items-center justify-center">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </aside>

      {/* Thread */}
      <section className="flex-1 flex flex-col rounded-xl border border-dark-border bg-dark-card overflow-hidden">
        {!active ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-txt-secondary gap-2 p-6">
            <MessageSquare className="w-8 h-8 text-brand-orange" />
            <p className="text-sm m-0">Select a conversation to reply.</p>
          </div>
        ) : (
          <>
            <div className="px-5 py-3 border-b border-dark-border flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-dark-border flex items-center justify-center">
                <User className="w-4 h-4 text-txt-secondary" />
              </div>
              <div>
                <p className="text-sm font-bold m-0">{nameOf(active)}</p>
                <p className="text-[11px] text-txt-secondary m-0">Live support chat</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {loadingThread ? (
                <p className="text-xs text-txt-secondary m-0">Loading messages…</p>
              ) : messages.length === 0 ? (
                <p className="text-xs text-txt-secondary m-0">No messages yet. Say hello 👋</p>
              ) : (
                messages.map((m) => {
                  const mine = m.sender_role === 'admin'
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[72%] rounded-2xl px-3.5 py-2 ${
                          mine
                            ? 'bg-brand-orange text-dark rounded-br-sm'
                            : 'bg-dark-border text-txt-primary rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm m-0 whitespace-pre-wrap break-words">{m.body}</p>
                        <p
                          className={`text-[10px] mt-1 m-0 ${
                            mine ? 'text-dark/70' : 'text-txt-secondary'
                          }`}
                        >
                          {timeShort(m.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={endRef} />
            </div>

            {error && (
              <div className="mx-5 mb-2 text-xs text-status-red bg-status-red/10 border border-status-red/25 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <form onSubmit={send} className="p-3 border-t border-dark-border flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your reply…"
                disabled={sending}
                className="flex-1 bg-dark-deeper border border-dark-border rounded-lg px-3 py-2 text-sm text-txt-primary outline-none focus:border-brand-orange"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="bg-brand-orange text-dark rounded-lg w-10 h-10 flex items-center justify-center disabled:opacity-50"
                aria-label="Send reply"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
