import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const hasValidSupabaseUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(supabaseUrl || '')
const hasValidSupabaseAnonKey = /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(supabaseAnonKey || '')

if (!supabaseUrl || !supabaseAnonKey || !hasValidSupabaseUrl || !hasValidSupabaseAnonKey) {
    console.warn(
        'Missing or invalid Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).',
        'Create a .env file in the project root with the Project URL and anon public key. Auth features will be disabled.'
    )
}

export const supabase = supabaseUrl && supabaseAnonKey && hasValidSupabaseUrl && hasValidSupabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null
