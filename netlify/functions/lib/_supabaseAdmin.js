const { createClient } = require('@supabase/supabase-js');

function getSupabaseAdmin() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!url) throw new Error('SUPABASE_URL nije postavljen u .env');
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY nije postavljen u .env');

  return createClient(url, key, { auth: { persistSession: false } });
}

module.exports = { getSupabaseAdmin };
