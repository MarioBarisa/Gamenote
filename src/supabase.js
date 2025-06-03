import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tahwsgrngcoskvumjenw.supabase.co'
const supabaseAnonKey = 'MY_ANON_KEY' // stavi svoji anon key ovdje

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
