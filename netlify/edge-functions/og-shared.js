const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export default async (request, context) => {
  const url = new URL(request.url)
  const userAgent = request.headers.get('user-agent') || ''
  
  // Only intercept crawler bots
  const isCrawler = /facebookexternalhit|Twitterbot|WhatsApp|TelegramBot|Discordbot|LinkedInBot|Slackbot/i.test(userAgent)
  if (!isCrawler) return context.next()
  
  const apiId = url.searchParams.get('id')
  if (!apiId || !/^[\w-]{1,80}$/.test(apiId)) return context.next()
  
  // Use RAWG API key from environment variable VITE_RAWG_API_KEY
  const RAWG_KEY = Deno.env.get('GAMES_API_KEY') || Deno.env.get('VITE_RAWG_API_KEY')
  let gameName = 'Gamenote'
  let gameImage = 'https://gamenote.netlify.app/apple-touch-icon.png' // fallback
  let gameDesc = 'Pogledaj ovu igru na Gamenote!'
  
  try {
    const res = await fetch(`https://api.gamenote.eu/api/games/${encodeURIComponent(apiId)}?key=${encodeURIComponent(RAWG_KEY || '')}`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error();
    const data = await res.json()
    if (data.name) gameName = data.name
    if (data.background_image) gameImage = data.background_image
    if (data.description_raw) gameDesc = data.description_raw.slice(0, 150) + '...'
  } catch (e) {}
  
  const response = await context.next()
  if (!response.headers.get('content-type')?.includes('text/html')) return response
  const html = await response.text()
  
  const ogTags = `
    <meta property="og:title" content="${escapeHtml(gameName)} | Gamenote" />
    <meta property="og:description" content="${escapeHtml(gameDesc)}" />
    <meta property="og:image" content="${escapeHtml(gameImage)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeHtml(url.toString())}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(gameName)} | Gamenote" />
    <meta name="twitter:image" content="${escapeHtml(gameImage)}" />
  `
  
  const modifiedHtml = html.replace('</head>', `${ogTags}</head>`)
  const headers = new Headers(response.headers)
  headers.delete('content-length')
  headers.delete('content-encoding')
  headers.delete('etag')
  return new Response(modifiedHtml, { status: response.status, statusText: response.statusText, headers })
}

export const config = { path: '/shared' }
