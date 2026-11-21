import { usernameErrorKey } from '../../src/constants/libraryUsername.js';
import { metadataHtml, previewImage, siteUrl } from '../../src/services/metadataHtml.js';

export default async (request, context) => {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/([a-zA-Z0-9][a-zA-Z0-9_-]{2,29})\/?$/);
  if (!match) return context.next();
  const username = match[1].toLowerCase();
  if (usernameErrorKey(username)) return context.next();
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
  const title = header ? `Gamenote · ${header.name}` : 'Zbirka nije dostupna | Gamenote';
  const description = header ? `Pogledaj zbirku @${username} na Gamenoteu.` : 'Ova zbirka trenutačno nije dostupna.';
  const canonical = `${siteUrl}/${username}`;
  const image = header ? `${siteUrl}/.netlify/functions/library-card?username=${username}` : previewImage;
  const tags = metadataHtml({ title, description, canonical, image, robots: 'noindex, follow' });
  const body = html.replace(/<title>[^<]*<\/title>/gi, '')
    .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi, '')
    .replace(/<meta\b[^>]*(?:property=["']og:[^"']+["']|name=["'](?:twitter:[^"']+|description|robots)["'])[^>]*>/gi, '')
    .replace('</head>', () => `${tags}</head>`);
  const headers = new Headers(response.headers);
  for (const key of ['content-length', 'content-encoding', 'etag']) headers.delete(key);
  headers.set('cache-control', 'no-store');
  return new Response(body, { status: failed ? 503 : header ? response.status : 404, headers });
};
