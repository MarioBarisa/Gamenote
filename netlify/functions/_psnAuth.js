const { getSupabaseAdmin } = require('./_supabaseAdmin.js');

async function readTokenRow(supabase) {
  const { data, error } = await supabase
    .from('psn_service_tokens').select('*').eq('singleton', true).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

async function upsertTokenRow(supabase, patch) {
  const { error } = await supabase
    .from('psn_service_tokens')
    .upsert({ singleton: true, ...patch }, { onConflict: 'singleton' });
  if (error) throw error;
}

function computeExpiryIso(seconds) {
  return new Date(Date.now() + (Number(seconds) || 0) * 1000 - 30_000).toISOString();
}

async function getAuthorization() {
  const {
    exchangeNpssoForAccessCode,
    exchangeAccessCodeForAuthTokens,
    exchangeRefreshTokenForAuthTokens
  } = await import('psn-api');

  const supabase = getSupabaseAdmin();
  const row = await readTokenRow(supabase);

  if (row?.access_token && row?.access_token_expires_at) {
    if (new Date(row.access_token_expires_at).getTime() > Date.now()) {
      return { accessToken: row.access_token };
    }
  }

  if (row?.refresh_token) {
    const auth = await exchangeRefreshTokenForAuthTokens(row.refresh_token);
    await upsertTokenRow(supabase, {
      access_token: auth.accessToken,
      access_token_expires_at: computeExpiryIso(auth.expiresIn),
      updated_at: new Date().toISOString()
    });
    return { accessToken: auth.accessToken };
  }

  const npsso = process.env.PSN_NPSSO;
  if (!npsso) throw new Error('Missing PSN_NPSSO env var.');
  const accessCode = await exchangeNpssoForAccessCode(npsso);
  const auth = await exchangeAccessCodeForAuthTokens(accessCode);
  await upsertTokenRow(supabase, {
    access_token: auth.accessToken,
    access_token_expires_at: computeExpiryIso(auth.expiresIn),
    refresh_token: auth.refreshToken,
    updated_at: new Date().toISOString()
  });
  return { accessToken: auth.accessToken };
}

module.exports = { getAuthorization };
