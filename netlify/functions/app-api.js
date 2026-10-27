const { appApi } = require('./lib/_appApi.js');

exports.handler = async event => {
  const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Metoda nije dopuštena.' }) };
  if (event.isBase64Encoded || Buffer.byteLength(event.body || '') > 4300000) return { statusCode: 413, headers, body: JSON.stringify({ error: 'Zahtjev je prevelik.' }) };
  let payload;
  try { payload = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Neispravan zahtjev.' }) }; }
  const result = await appApi(payload, event.headers?.authorization, { ip: event.headers?.['x-nf-client-connection-ip'] || 'unknown' });
  return { statusCode: result.status, headers, body: JSON.stringify(result.data) };
};
