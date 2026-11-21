import { comparisonFromPath, comparisonMetadata } from '../../src/services/comparisonLink.js';
import { metadataHtml, previewImage } from '../../src/services/metadataHtml.js';
import hr from '../../src/i18n/locales/hr.json' with { type: 'json' };

export default async (request, context) => {
  const url = new URL(request.url);
  const names = comparisonFromPath(url.pathname);
  if (!names) return context.next();
  let available = false, failed = false;
  try {
    const endpoint = new URL('/.netlify/functions/library-card', url.origin);
    endpoint.searchParams.set('username', names.left);
    endpoint.searchParams.set('compare', names.right);
    endpoint.searchParams.set('format', 'metadata');
    const result = await fetch(endpoint, { signal: AbortSignal.timeout(6000) });
    if (result.ok) { const data = await result.json(); available = data.left === names.left && data.right === names.right; }
    else if (result.status !== 404) failed = true;
  } catch { failed = true; }
  const response = await context.next();
  if (!response.headers.get('content-type')?.includes('text/html')) return response;
  const description = hr.seo.comparisonDescription.replaceAll("{'@'}", '@')
    .replace('{0}', names.left).replace('{1}', names.right);
  const metadata = comparisonMetadata(names, description);
  if (!available) {
    metadata.title = 'Usporedba nije dostupna | Gamenote';
    metadata.description = 'Oba Gamenotea moraju biti javno podijeljena.';
    metadata.image = previewImage;
  }
  const tags = metadataHtml(metadata);
  const body = (await response.text()).replace(/<title>[^<]*<\/title>/gi, '')
    .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi, '')
    .replace(/<meta\b[^>]*(?:property=["']og:[^"']+["']|name=["'](?:twitter:[^"']+|description|robots)["'])[^>]*>/gi, '')
    .replace('</head>', () => tags + '</head>');
  const headers = new Headers(response.headers);
  for (const key of ['content-length', 'content-encoding', 'etag']) headers.delete(key);
  headers.set('cache-control', 'no-store');
  return new Response(body, { status: failed ? 503 : available ? response.status : 404, headers });
};
