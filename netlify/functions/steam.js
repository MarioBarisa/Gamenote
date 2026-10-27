const { steamRelay } = require('./lib/_steamRelay.js');

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Metoda nije dopuštena.' });
  if (event.isBase64Encoded || Buffer.byteLength(event.body || '') > 4096) return json(413, { error: 'Zahtjev je prevelik.' });
  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Neispravan zahtjev.' });
  }
  const authorization = event.headers?.authorization || event.headers?.Authorization;
  const result = await steamRelay(payload, authorization);
  return json(result.ok ? 200 : result.status, result.ok ? result.data : { error: result.error });
};
