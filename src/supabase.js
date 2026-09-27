import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseApiKey = import.meta.env.VITE_SUPABASE_API_KEY || 'placeholder-key'

export const supabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_API_KEY
)

if (!supabaseConfigured) {
  console.warn(
    'Supabase environment variables are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_API_KEY in Netlify to enable database access.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseApiKey)
