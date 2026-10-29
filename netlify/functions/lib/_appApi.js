const { allowRequest, authenticatedUser } = require('./_requestSafety.js');
const { avatarImage, imageMime } = require('./_avatarImage.js');
const cache = new Map();
const feeds = [
  ['GameSpot', 'https://www.gamespot.com/feeds/mashup/', 'gamespot.com'],
  ['IGN', 'https://www.ign.com/rss/articles/feed?format=xml', 'ign.com'],
  ['Polygon', 'https://www.polygon.com/rss/index.xml', 'polygon.com'],
  ['PC Gamer', 'https://www.pcgamer.com/rss/', 'pcgamer.com'],
  ['VG247', 'https://www.vg247.com/feed', 'vg247.com'],
  ['Rock Paper Shotgun', 'https://www.rockpapershotgun.com/feed', 'rockpapershotgun.com'],
];

async function appApi(payload, authorization, options = {}) {
  const env = options.env || process.env;
  const request = options.fetch || fetch;
  try {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return { status: 400, data: { error: 'Neispravan zahtjev.' } };
    if (!allowRequest(`api:${options.ip || 'unknown'}`, 1200)) return { status: 429, data: { error: 'Previše zahtjeva. Pričekaj minutu.' } };
    if (payload.action === 'avatar-image') {
      const user = await authenticatedUser(authorization, env, request);
      if (!allowRequest(`avatar-image:${user.id}`, 30)) return { status: 429, data: { error: 'Pričekaj prije ponovnog dohvata slike.' } };
      return await avatarImage(payload.url, options.fetchImage);
    }
    if (payload.action === 'avatar') {
      const user = await authenticatedUser(authorization, env, request);
      if (!allowRequest(`avatar:${user.id}`, 5)) return { status: 429, data: { error: 'Pričekaj prije sljedećeg prijenosa.' } };
      const key = env.IMGBB_API_KEY || env.VITE_IMGBB_API_KEY;
      if (!key) return { status: 503, data: { error: 'Prijenos slika nije konfiguriran.' } };
      if (typeof payload.image !== 'string' || payload.image.length > 4200000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(payload.image)) return { status: 400, data: { error: 'Odaberi PNG, JPEG, GIF ili WebP sliku do 3 MB.' } };
      const bytes = Buffer.from(payload.image, 'base64');
      if (!imageMime(bytes) || bytes.length > 3 * 1024 * 1024) return { status: 400, data: { error: 'Odaberi PNG, JPEG, GIF ili WebP sliku do 3 MB.' } };
      const form = new URLSearchParams({ image: payload.image });
      const response = await request(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(key)}`, { method: 'POST', body: form, signal: AbortSignal.timeout(20000) });
      const result = await response.json();
      if (!response.ok || !result.success || !result.data?.url?.startsWith('https://')) return { status: 502, data: { error: 'Usluga trenutačno nije dostupna. Pokušaj ponovno.' } };
      return { status: 200, data: { url: result.data.url } };
    }
    let url;
    if (payload.action === 'games') {
      if (!/^\/games(?:\/(?:match|[\w-]{1,80})(?:\/(?:screenshots|game-series))?)?$/.test(payload.path || '')) return { status: 400, data: { error: 'Nepoznata API putanja.' } };
      url = new URL(`https://api.gamenote.eu/api${payload.path}`);
      const allowed = ['search', 'page', 'page_size', 'dates', 'metacritic', 'ordering', 'title', 'year'];
      for (const [name, value] of Object.entries(payload.params || {})) {
        if (!allowed.includes(name) || typeof value !== 'string' || value.length > 250) return { status: 400, data: { error: 'Neispravni parametri.' } };
        url.searchParams.set(name, value);
      }
      const key = env.GAMES_API_KEY || env.VITE_RAWG_API_KEY;
      if (!key) return { status: 503, data: { error: 'Katalog igara nije konfiguriran.' } };
      url.searchParams.set('key', key);
    } else if (payload.action === 'news' && Number.isInteger(payload.feed) && feeds[payload.feed]) {
      const feed = feeds[payload.feed];
      url = new URL('https://api.rss2json.com/v1/api.json');
      url.searchParams.set('rss_url', feed[1]);
      url.searchParams.set('count', '4');
      const key = env.RSS_API_KEY || env.VITE_RSS_API_KEY;
      if (key) url.searchParams.set('api_key', key);
    } else return { status: 400, data: { error: 'Nepoznata radnja.' } };
    const cacheKey = JSON.stringify(payload);
    const saved = cache.get(cacheKey);
    if (saved?.until > Date.now()) return { status: 200, data: saved.data };
    const response = await request(url, { signal: AbortSignal.timeout(12000), redirect: 'error' });
    if (!response.ok) return { status: response.status === 429 ? 429 : 502, data: { error: 'Dohvat nije uspio. Pokušaj ponovno.' } };
    const data = await response.json();
    if (cache.size >= 200) cache.delete(cache.keys().next().value);
    cache.set(cacheKey, { until: Date.now() + 300000, data });
    return { status: 200, data };
  } catch (error) {
    return { status: error.status || 502, data: { error: error.status ? error.message : 'Usluga trenutačno nije dostupna. Pokušaj ponovno.' } };
  }
}

module.exports = { appApi };
