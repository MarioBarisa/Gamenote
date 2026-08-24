// Zajednička auth logika (funkcija + dev middleware).
const {
  exchangeNpssoForAccessCode,
  exchangeAccessCodeForAuthTokens,
  exchangeRefreshTokenForAuthTokens
} = require('psn-api');

async function psnExchange(payload = {}) {
  const mode = payload.mode;
  try {
    let auth;
    if (mode === 'npsso') {
      const npsso = String(payload.npsso || '').trim();
      if (npsso.length < 30) return { ok: false, status: 400, error: 'NPSSO token nije ispravnog formata.' };
      const accessCode = await exchangeNpssoForAccessCode(npsso);
      auth = await exchangeAccessCodeForAuthTokens(accessCode);
    } else if (mode === 'refresh') {
      const refreshToken = String(payload.refreshToken || '').trim();
      if (!refreshToken) return { ok: false, status: 400, error: 'Nedostaje refresh token.' };
      auth = await exchangeRefreshTokenForAuthTokens(refreshToken);
    } else {
      return { ok: false, status: 400, error: 'Nepoznat način autentikacije.' };
    }

    if (!auth?.accessToken) {
      return { ok: false, status: 401, error: 'PSN autentikacija nije uspjela. NPSSO je vjerojatno nevaljan ili je istekao.' };
    }

    return {
      ok: true,
      tokens: {
        accessToken: auth.accessToken,
        expiresIn: auth.expiresIn ?? null,
        idToken: auth.idToken ?? null,
        refreshToken: auth.refreshToken ?? null,
        refreshTokenExpiresIn: auth.refreshTokenExpiresIn ?? null
      }
    };
  } catch (e) {
    console.error('[psn-exchange] Error:', e?.message || e);
    const msg = String(e?.message || '');
    const invalid = /NPSSO|access code|refresh|expired|invalid/i.test(msg);
    return {
      ok: false,
      status: invalid ? 401 : 502,
      error: invalid
        ? 'NPSSO / refresh token nije valjan ili je istekao.'
        : (msg || 'Greška u komunikaciji s PSN-om.')
    };
  }
}

module.exports = { psnExchange };
