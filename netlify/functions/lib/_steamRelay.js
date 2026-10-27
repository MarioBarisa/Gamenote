const { allowRequest } = require('./_requestSafety.js');
const cachedResponses = new Map();

function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

function parseProfile(value) {
  if (typeof value !== 'string' || value.length > 256) fail(400, 'Unesi Steam korisničko ime ili link profila.');
  let input = value.trim();
  if (/^(https?:\/\/|www\.|steamcommunity\.)/i.test(input)) {
    let url;
    try {
      url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    } catch {
      fail(400, 'Steam link profila nije ispravan.');
    }
    const path = url.pathname.match(/^\/(id|profiles)\/([^/]+)\/?$/);
    if (!['steamcommunity.com', 'www.steamcommunity.com'].includes(url.hostname) || !path || url.username || url.password || url.port) {
      fail(400, 'Koristi link sa steamcommunity.com/id/ ili /profiles/.');
    }
    input = path[2];
    if (path[1] === 'profiles' && !/^7656119\d{10}$/.test(input)) fail(400, 'SteamID64 nije ispravan.');
  }
  if (/^7656119\d{10}$/.test(input)) return { steamId: input };
  if (input.startsWith('@')) input = input.slice(1);
  if (!/^[\p{L}\p{N}_.-]{1,64}$/u.test(input)) fail(400, 'Unesi samo ime iza /id/ iz Steam linka ili cijeli link profila. Ime za prijavu i prikazni nadimak mogu biti drukčiji.');
  return { vanity: input };
}

async function steamRelay(payload, authorization, options = {}) {
  const env = options.env || process.env;
  const request = options.fetch || fetch;
  try {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) fail(400, 'Neispravan zahtjev.');
    if (!['library', 'achievements'].includes(payload.action)) fail(400, 'Nepoznata Steam radnja.');
    const profile = parseProfile(payload.profile);
    if (payload.action === 'achievements' && (!Number.isInteger(payload.appId) || payload.appId < 1 || payload.appId > 4294967295)) {
      fail(400, 'Neispravan Steam AppID.');
    }
    if (!/^Bearer [A-Za-z0-9._-]+$/.test(authorization || '')) fail(401, 'Prijavi se za Steam uvoz.');
    if (!env.STEAM_API_KEY || !env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
      fail(503, 'Steam uvoz trenutačno nije dostupan. Pokušaj kasnije.');
    }

    // Zajednički ključ koristi samo prijavljeni korisnik.
    const auth = await request(`${env.VITE_SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`, {
      headers: { authorization, apikey: env.VITE_SUPABASE_ANON_KEY },
      signal: AbortSignal.timeout(10000),
    });
    if (auth.status === 401 || auth.status === 403) fail(401, 'Sesija je istekla. Prijavi se ponovno.');
    if (!auth.ok) fail(503, 'Provjera prijave nije dostupna. Pokušaj ponovno.');
    const user = await auth.json();
    if (!user?.id) fail(401, 'Prijavi se za Steam uvoz.');
    if (!allowRequest(`steam:${user.id}`, 600)) fail(429, 'Previše Steam zahtjeva. Pričekaj minutu.');

    async function steam(path, params) {
      const url = new URL(`https://api.steampowered.com/${path}/`);
      url.searchParams.set('key', env.STEAM_API_KEY);
      for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
      const cacheKey = JSON.stringify([path, params]);
      const cached = cachedResponses.get(cacheKey);
      if (!options.fetch && cached?.until > Date.now()) return cached.data;
      const response = await request(url, { signal: AbortSignal.timeout(12000) });
      if (response.status === 429) fail(429, 'Steam je privremeno ograničio zahtjeve. Pričekaj i pokušaj ponovno.');
      if (response.status === 401 || response.status === 403) fail(503, 'Steam uvoz trenutačno nije dostupan. Pokušaj kasnije.');
      if (payload.action === 'achievements' && response.status === 400) return null;
      if (!response.ok) fail(502, 'Steam nije dostupan. Pokušaj ponovno.');
      const data = await response.json();
      if (!options.fetch) {
        if (cachedResponses.size >= 1000) cachedResponses.delete(cachedResponses.keys().next().value);
        cachedResponses.set(cacheKey, { until: Date.now() + 20000, data });
      }
      return data;
    }

    let steamId = profile.steamId;
    if (!steamId) {
      const data = await steam('ISteamUser/ResolveVanityURL/v1', { vanityurl: profile.vanity });
      steamId = data?.response?.steamid;
      if (data?.response?.success !== 1 || !/^7656119\d{10}$/.test(steamId || '')) {
        fail(404, 'Javno Steam ime nije pronađeno. Otvori svoj Steam profil i kopiraj link ili ime iza /id/. Ime za prijavu i prikazni nadimak mogu biti drukčiji.');
      }
    }

    if (payload.action === 'achievements') {
      const data = await steam('ISteamUserStats/GetPlayerAchievements/v1', { steamid: steamId, appid: payload.appId });
      const stats = data?.playerstats;
      if (!stats?.success || !Array.isArray(stats.achievements)) return { ok: true, data: { achievements: null } };
      let earned = 0;
      for (const achievement of stats.achievements) {
        if (achievement.achieved === 1) earned++;
      }
      return { ok: true, data: { achievements: { earned, total: stats.achievements.length } } };
    }

    const summary = await steam('ISteamUser/GetPlayerSummaries/v2', { steamids: steamId });
    const player = summary?.response?.players?.[0];
    if (!player || player.steamid !== steamId) fail(404, 'Steam profil nije pronađen.');
    const owned = await steam('IPlayerService/GetOwnedGames/v1', {
      input_json: JSON.stringify({ steamid: steamId, include_appinfo: true, include_played_free_games: true }),
    });
    const library = owned?.response;
    if (!Number.isInteger(library?.game_count)) {
      fail(403, 'Detalji igara nisu javni. Na Steamu otvori Uredi profil → Postavke privatnosti i postavi profil i detalje igara na Javno.');
    }
    if (library.game_count > 0 && !Array.isArray(library.games)) fail(502, 'Steam nije vratio biblioteku. Pokušaj ponovno.');
    return {
      ok: true,
      data: {
        profile: { steamId, name: player.personaname || steamId, avatarUrl: player.avatarfull || null },
        games: library.games || [],
      },
    };
  } catch (error) {
    // Greške nikada ne otkrivaju serverski ključ.
    return { ok: false, status: error.status || 502, error: error.status ? error.message : 'Dohvat sa Steama nije uspio. Pokušaj ponovno.' };
  }
}

module.exports = { steamRelay, parseProfile };
