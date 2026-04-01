import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://missing-url.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'missing-anon-key'

// if (!supabaseUrl || !supabaseAnonKey) {
//     throw new Error('Missing Supabase environment variables. Check your .env file.')
// }

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
