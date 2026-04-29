import { supabase } from '../lib/supabase'

export const notificationService = {
    /**
     * Get all notifications for a user
     * @param {string} userId
     * @returns {Array} Notifications sorted by newest first
     */
    getAll: async (userId) => {
        if (!supabase) throw new Error('Supabase is not configured')

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20)

        if (error) throw error
        return data || []
    },

    /**
     * Get unread notification count
     * @param {string} userId
     * @returns {number} Count of unread notifications
     */
    getUnreadCount: async (userId) => {
        if (!supabase) throw new Error('Supabase is not configured')

        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false)

        if (error) throw error
        return count || 0
    },

    /**
     * Mark a notification as read
     * @param {string} notificationId
     */
    markAsRead: async (notificationId) => {
        if (!supabase) throw new Error('Supabase is not configured')

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId)

        if (error) throw error
    },

    /**
     * Mark all notifications as read for a user
     * @param {string} userId
     */
    markAllAsRead: async (userId) => {
        if (!supabase) throw new Error('Supabase is not configured')

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false)

        if (error) throw error
    },

    /**
     * Create a notification
     * @param {Object} params
     * @param {string} params.userId - Target user ID
     * @param {string} params.type - Notification type
     * @param {string} params.title - Notification title
     * @param {string} params.message - Notification message
     * @param {string} [params.applicationId] - Related application ID
     */
    create: async ({ userId, type, title, message, applicationId = null }) => {
        if (!supabase) throw new Error('Supabase is not configured')

        const { data, error } = await supabase
            .from('notifications')
            .insert([{
                user_id: userId,
                type,
                title,
                message,
                application_id: applicationId,
            }])
            .select()

        if (error) throw error
        return data?.[0]
    },

    /**
     * Subscribe to new notifications via Supabase Realtime
     * @param {string} userId - User ID to watch
     * @param {Function} onNew - Callback when new notification arrives
     * @returns {Function} Unsubscribe function
     */
    subscribe: (userId, onNew) => {
        if (!supabase) return () => {}

        const channel = supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    onNew(payload.new)
                }
            )
            .subscribe()

        // Return unsubscribe function
        return () => {
            supabase.removeChannel(channel)
        }
    },
}
