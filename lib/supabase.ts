import { createClient } from '@supabase/supabase-js'

export function getSupabase() {
  const env = process.env
  const url = env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    env.SUPABASE_PUBLISHABLE_KEY ??
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Faltan SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY')
  }

  return createClient(url, key)
}
