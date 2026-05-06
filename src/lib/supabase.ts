import { createClient } from '@supabase/supabase-js'

export const devBypassAuth =
  import.meta.env.VITE_DEV_BYPASS_AUTH === '1' ||
  import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL ?? 'http://localhost',
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'dev-anon',
)

export const isSupabaseConfigured =
  !devBypassAuth &&
  Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
