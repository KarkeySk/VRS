import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://missing-url.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'missing-anon-key'

// if (!supabaseUrl || !supabaseAnonKey) {
//     throw new Error('Missing Supabase environment variables. Check your .env file.')
// }
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        'Missing Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).',
        'Create a .env file in the project root. Auth features will be disabled.'
    )
}

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

