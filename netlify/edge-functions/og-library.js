import { usernameError } from '../../src/constants/libraryShare.js';
import { escapeHtml } from '../../src/services/seo.js';

export default async (request, context) => {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/([a-zA-Z0-9][a-zA-Z0-9_-]{2,29})\/?$/);
  if (!match) return context.next();
  const username = match[1].toLowerCase();
  if (usernameError(username)) return context.next();
  let header = null;
  let failed = false;
  try {
    const endpoint = new URL('/.netlify/functions/library-card', url.origin);
    endpoint.searchParams.set('username', username);
    endpoint.searchParams.set('format', 'metadata');
    const result = await fetch(endpoint, { signal: AbortSignal.timeout(5000) });
    if (result.status === 404) header = null;
    else if (result.ok) header = await result.json();
    else failed = true;
  } catch { failed = true; }
  const response = await context.next();
  if (!response.headers.get('content-type')?.includes('text/html')) return response;
  const html = await response.text();
  const title = header ? `Zbirka: ${header.name} | Gamenote` : 'Zbirka nije dostupna | Gamenote';
  const description = header ? `Pogledaj zbirku @${username} na Gamenoteu.` : 'Ova zbirka trenutačno nije dostupna.';
  const canonical = `https://gamenote.eu/${username}`;
  const image = header ? `https://gamenote.eu/.netlify/functions/library-card?username=${username}` : 'https://gamenote.eu/social-preview.png';
  const tags = `<title>${escapeHtml(title)}</title>
    <link rel="canonical" href="${canonical}">
    <meta name="robots" content="noindex, follow">
    <meta name="description" content="${escapeHtml(description)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:image" content="${image}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${image}">`;
  const body = html.replace(/<title>[^<]*<\/title>/gi, '')
    .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi, '')
    .replace(/<meta\b[^>]*(?:property=["']og:[^"']+["']|name=["'](?:twitter:[^"']+|description|robots)["'])[^>]*>/gi, '')
    .replace('</head>', () => `${tags}</head>`);
  const headers = new Headers(response.headers);
  for (const key of ['content-length', 'content-encoding', 'etag']) headers.delete(key);
  headers.set('cache-control', 'no-store');
  return new Response(body, { status: failed ? 503 : header ? response.status : 404, headers });
};
