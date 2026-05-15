export default async (request, context) => {
  const url = new URL(request.url)
  const userAgent = request.headers.get('user-agent') || ''
  
  // Only intercept crawler bots
  const isCrawler = /facebookexternalhit|Twitterbot|WhatsApp|TelegramBot|Discordbot|LinkedInBot|Slackbot/i.test(userAgent)
  if (!isCrawler) return context.next()
  
  const apiId = url.searchParams.get('id')
  if (!apiId) return context.next()
  
  // Use RAWG API key from environment variable VITE_RAWG_API_KEY
  const RAWG_KEY = Deno.env.get('VITE_RAWG_API_KEY')
  let gameName = 'Gamenote'
  let gameImage = 'https://gamenote.netlify.app/apple-touch-icon.png' // fallback
  let gameDesc = 'Pogledaj ovu igru na Gamenote!'
  
  try {
    const res = await fetch(`https://api.rawg.io/api/games/${apiId}?key=${RAWG_KEY}`)
    const data = await res.json()
    if (data.name) gameName = data.name
    if (data.background_image) gameImage = data.background_image
    if (data.description_raw) gameDesc = data.description_raw.slice(0, 150) + '...'
  } catch (e) {}
  
  const response = await context.next()
  const html = await response.text()
  
  const ogTags = `
    <meta property="og:title" content="${gameName} | Gamenote" />
    <meta property="og:description" content="${gameDesc}" />
    <meta property="og:image" content="${gameImage}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url.toString()}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${gameName} | Gamenote" />
    <meta name="twitter:image" content="${gameImage}" />
  `
  
  const modifiedHtml = html.replace('</head>', `${ogTags}</head>`)
  return new Response(modifiedHtml, {
    headers: { 'content-type': 'text/html' }
  })
}

export const config = { path: '/shared' }
