// Stateless: NPSSO/refresh → tokeni. Ništa se ne sprema.
const { psnExchange } = require('./lib/_psnExchange.js');

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  if ((event.headers?.['content-length'] || 0) > 8192) return json(400, { error: 'Zahtjev prevelik.' });

  let payload;
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch {
    return json(400, { error: 'Neispravan zahtjev.' });
  }
  if (!payload || typeof payload !== 'object') return json(400, { error: 'Neispravan zahtjev.' });

  const result = await psnExchange(payload);
  return json(result.ok ? 200 : result.status, result.ok ? result.tokens : { error: result.error });
};
