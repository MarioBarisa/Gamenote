// Trophy/search relay — Sony blokira direktne browser pozive.
const TARGET_HOST = 'https://m.np.playstation.com';

const ALLOWED = [
  { prefix: '/api/trophy/v1/', methods: ['GET'] },
  { prefix: '/api/search/v1/', methods: ['POST'] }
];

async function psnRelay(pathWithQuery, authHeader, { method = 'GET', body = null } = {}) {
  const rule = ALLOWED.find(r => pathWithQuery && pathWithQuery.startsWith(r.prefix));
  if (!rule) return { ok: false, status: 403, error: 'Nedozvoljeni put.' };
  if (!rule.methods.includes(method)) return { ok: false, status: 405, error: 'Metoda nije dozvoljena.' };
  if (!authHeader || !/^Bearer\s+\S+/i.test(authHeader)) {
    return { ok: false, status: 401, error: 'Nedostaje Authorization header.' };
  }

  try {
    const upstream = await fetch(`${TARGET_HOST}${pathWithQuery}`, {
      method,
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
        ...(body != null ? { 'Content-Type': 'application/json' } : {})
      },
      body: body != null ? body : undefined
    });
    const responseBody = await upstream.text();
    return {
      ok: true,
      status: upstream.status,
      contentType: upstream.headers.get('content-type') || 'application/json; charset=utf-8',
      body: responseBody
    };
  } catch (e) {
    console.error('[psn-relay] Error:', e?.message || e);
    return { ok: false, status: 502, error: e?.message || 'Greška u komunikaciji s PSN-om.' };
  }
}

module.exports = { psnRelay };
