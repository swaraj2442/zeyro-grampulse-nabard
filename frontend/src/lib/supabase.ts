import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Use environment variables for production, fallback for local dev
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-project.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key'

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
