const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export default async (request, context) => {
  const url = new URL(request.url)
  const userAgent = request.headers.get('user-agent') || ''
  
  // Katalog dohvaćaju samo preglednici poveznica.
  const isCrawler = /facebookexternalhit|Twitterbot|WhatsApp|TelegramBot|Discordbot|LinkedInBot|Slackbot/i.test(userAgent)

  
  const apiId = url.searchParams.get('id')
  if (!apiId || !/^[\w-]{1,80}$/.test(apiId)) return context.next()
  
  // Stari naziv ključa ostaje podržan.
  const RAWG_KEY = Deno.env.get('GAMES_API_KEY') || Deno.env.get('VITE_RAWG_API_KEY')
  let gameName = 'Gamenote'
  let gameImage = 'https://gamenote.eu/social-preview.png'
  let gameDesc = 'Pogledaj ovu igru na Gamenote!'
  
  if (isCrawler) {
    try {
      const res = await fetch(`https://api.gamenote.eu/api/games/${encodeURIComponent(apiId)}?key=${encodeURIComponent(RAWG_KEY || '')}`, { signal: AbortSignal.timeout(5000) })
      if (!res.ok) throw new Error();
      const data = await res.json()
      if (data.name) gameName = data.name
      if (data.background_image) gameImage = data.background_image
      if (data.description_raw) gameDesc = data.description_raw.slice(0, 150) + '...'
    } catch (e) {}
  }
  
  const response = await context.next()
  if (!response.headers.get('content-type')?.includes('text/html')) return response
  const html = await response.text()
  
  const canonical = `https://gamenote.eu/shared?id=${encodeURIComponent(apiId)}`
  const ogTags = `
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta name="description" content="${escapeHtml(gameDesc)}" />
    <title>${escapeHtml(gameName)}</title>
    <meta property="og:title" content="${escapeHtml(gameName)} | Gamenote" />
    <meta property="og:description" content="${escapeHtml(gameDesc)}" />
    <meta property="og:image" content="${escapeHtml(gameImage)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:description" content="${escapeHtml(gameDesc)}" />
    <meta name="twitter:title" content="${escapeHtml(gameName)} | Gamenote" />
    <meta name="twitter:image" content="${escapeHtml(gameImage)}" />
  `
  
  const modifiedHtml = html
    .replace(/<title>[^<]*<\/title>/gi, '')
    .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi, '')
    .replace(/<meta\b[^>]*(?:property=["']og:[^"']+["']|name=["'](?:twitter:[^"']+|description)["'])[^>]*>/gi, '')
    .replace('</head>', `${ogTags}</head>`)
  const headers = new Headers(response.headers)
  headers.delete('content-length')
  headers.delete('content-encoding')
  headers.delete('etag')
  return new Response(modifiedHtml, { status: response.status, statusText: response.statusText, headers })
}

export const config = { path: '/shared' }
