// Stateless: prosljeđuje trophy GET + search POST. Ništa se ne sprema.
const { psnRelay } = require('./lib/_psnRelay.js');

const MOUNT = '/.netlify/functions/psn-relay';

function json(statusCode, body, contentType) {
  return {
    statusCode,
    headers: { 'content-type': contentType || 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    body
  };
}

function extractPathWithQuery(event) {
  if (event.rawUrl) {
    try {
      const u = new URL(event.rawUrl);
      const p = u.pathname.startsWith(MOUNT) ? u.pathname.slice(MOUNT.length) : u.pathname;
      return p + u.search;
    } catch { /* fallthrough */ }
  }
  let p = event.path || '';
  if (p.startsWith(MOUNT)) p = p.slice(MOUNT.length);
  const q = event.rawQuery
    ?? (event.queryStringParameters ? new URLSearchParams(event.queryStringParameters).toString() : '');
  return q ? `${p}?${q}` : p;
}

exports.handler = async (event) => {
  const method = event.httpMethod;
  if (method !== 'GET' && method !== 'POST') return json(405, JSON.stringify({ error: 'Method not allowed' }));

  const headers = event.headers || {};
  const authHeader = headers.authorization ?? headers.Authorization;

  const result = await psnRelay(extractPathWithQuery(event), authHeader, {
    method,
    body: method === 'POST' ? (event.body ?? null) : null
  });
  return json(
    result.status,
    result.ok ? result.body : JSON.stringify({ error: result.error }),
    result.ok ? result.contentType : undefined
  );
};
