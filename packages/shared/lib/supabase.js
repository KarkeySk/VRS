import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
const hasValidSupabaseUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(supabaseUrl || '')
const hasValidSupabaseAnonKey = /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(supabaseAnonKey || '')
    || /^sb_publishable_[A-Za-z0-9_-]+$/.test(supabaseAnonKey || '')

if (!supabaseUrl || !supabaseAnonKey || !hasValidSupabaseUrl || !hasValidSupabaseAnonKey) {
    console.warn(
        'Missing or invalid Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).',
        'Create a .env file in the project root with the Project URL and anon public or publishable key. Auth features will be disabled.'
    )
}

const authLockQueues = new Map()

async function localAuthLock(name, _acquireTimeout, fn) {
    const previous = authLockQueues.get(name) || Promise.resolve()
    let releaseCurrent
    const current = new Promise((resolve) => {
        releaseCurrent = resolve
    })
    const queued = previous.catch(() => null).then(() => current)
    authLockQueues.set(name, queued)

    await previous.catch(() => null)
    try {
        return await fn()
    } finally {
        releaseCurrent()
        if (authLockQueues.get(name) === queued) {
            authLockQueues.delete(name)
        }
    }
}

export const supabase = supabaseUrl && supabaseAnonKey && hasValidSupabaseUrl && hasValidSupabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            lock: localAuthLock,
        },
    })
    : null
