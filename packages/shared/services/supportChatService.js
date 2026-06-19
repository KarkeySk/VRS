import { supabase } from '../lib/supabase'

// Supabase caches Realtime channels by name, so two components subscribing with
// the same name (e.g. the Sidebar badge and the Messages page both watching the
// inbox) receive the *same* already-subscribed channel — and calling `.on()` on it
// throws "cannot add postgres_changes callbacks ... after subscribe()". A unique
// suffix per subscription guarantees each caller gets its own channel instance.
let channelSeq = 0
const uniqueChannelName = (base) => `${base}:${Date.now()}:${channelSeq++}`

/**
 * Live support chat between users and admins.
 * Each user has exactly one conversation; admins reply from the dashboard.
 * Backed by the `conversations` and `support_messages` tables (migration 014).
 */
export const supportChatService = {
    /**
     * Fetch the current user's conversation, creating it on first use.
     * @param {string} userId
     */
    getOrCreateMyConversation: async (userId) => {
        if (!supabase) throw new Error('Supabase is not configured')

        const { data: existing, error: selErr } = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle()
        if (selErr) throw selErr
        if (existing) return existing

        const { data, error } = await supabase
            .from('conversations')
            .insert([{ user_id: userId }])
            .select()
            .single()

        // Another tab/device may have created it first (unique violation) — re-read.
        if (error) {
            if (error.code === '23505') {
                const { data: again, error: againErr } = await supabase
                    .from('conversations')
                    .select('*')
                    .eq('user_id', userId)
                    .single()
                if (againErr) throw againErr
                return again
            }
            throw error
        }
        return data
    },

    /**
     * Admin: list every conversation (newest activity first) with the user's name.
     */
    listConversations: async () => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase
            .from('conversations')
            .select('*, profiles!conversations_user_id_fkey(full_name, avatar_url)')
            .order('last_message_at', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false })
        if (error) throw error
        return data || []
    },

    /**
     * Total messages awaiting an admin reply (for the sidebar badge).
     */
    getAdminUnreadTotal: async () => {
        if (!supabase) return 0
        const { data, error } = await supabase
            .from('conversations')
            .select('admin_unread')
        if (error) throw error
        return (data || []).reduce((sum, c) => sum + (c.admin_unread || 0), 0)
    },

    /**
     * All messages in a conversation, oldest first.
     * @param {string} conversationId
     */
    getMessages: async (conversationId) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase
            .from('support_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })
        if (error) throw error
        return data || []
    },

    /**
     * Post a message into a conversation.
     * @param {{conversationId: string, senderId: string, senderRole: 'user'|'admin', body: string}} params
     */
    sendMessage: async ({ conversationId, senderId, senderRole, body }) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { data, error } = await supabase
            .from('support_messages')
            .insert([{
                conversation_id: conversationId,
                sender_id: senderId,
                sender_role: senderRole,
                body: body.trim(),
            }])
            .select()
            .single()
        if (error) throw error
        return data
    },

    /**
     * Reset the unread counter for one side of a conversation.
     * @param {string} conversationId
     * @param {'user'|'admin'} role  Which side is reading.
     */
    markRead: async (conversationId, role) => {
        if (!supabase) return
        const patch = role === 'admin' ? { admin_unread: 0 } : { user_unread: 0 }
        const { error } = await supabase
            .from('conversations')
            .update(patch)
            .eq('id', conversationId)
        if (error) throw error
    },

    /**
     * Subscribe to new messages in a single conversation.
     * @param {string} conversationId
     * @param {(message: object) => void} onNew
     * @returns {Function} unsubscribe
     */
    subscribeMessages: (conversationId, onNew) => {
        if (!supabase) return () => {}
        const channel = supabase
            .channel(uniqueChannelName(`support_messages:${conversationId}`))
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'support_messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => onNew(payload.new)
            )
            .subscribe()
        return () => supabase.removeChannel(channel)
    },

    /**
     * Admin: subscribe to any conversation change (new/updated) to refresh the inbox.
     * @param {() => void} onChange
     * @returns {Function} unsubscribe
     */
    subscribeConversations: (onChange) => {
        if (!supabase) return () => {}
        const channel = supabase
            .channel(uniqueChannelName('conversations:inbox'))
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'conversations' },
                () => onChange()
            )
            .subscribe()
        return () => supabase.removeChannel(channel)
    },
}
