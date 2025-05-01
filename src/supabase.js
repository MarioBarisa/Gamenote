import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tahwsgrngcoskvumjenw.supabase.co'
const supabaseAnonKey = 'ANON KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
