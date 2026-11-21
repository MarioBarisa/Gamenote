import { createClient } from '@supabase/supabase-js'
import { handleRecoveryEvent } from './services/recoveryState'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) throw new Error('Missing VITE_SUPABASE_URL env var.')
if (!supabaseAnonKey) throw new Error('Missing VITE_SUPABASE_ANON_KEY env var.')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
supabase.auth.onAuthStateChange(handleRecoveryEvent)

let passwordCheckClient;

export function createPasswordCheckClient() {
  passwordCheckClient ||= createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: 'gamenote.auth.password-check',
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return passwordCheckClient;
}
