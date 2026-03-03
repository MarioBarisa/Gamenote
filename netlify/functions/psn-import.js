const { getAuthorization } = require('./_psnAuth.js');
const { makeUniversalSearch, getUserPlayedGames, getUserTitles } = require('psn-api');

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    body: JSON.stringify(body)
  };
}

function normalizeTitle(s) {
  return String(s || '').toLowerCase()
    .replace(/[™®©]/g, '').replace(/[:\-–—_]/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseISODurationToHours(iso) {
  if (!iso) return null;
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return null;
  return Math.round((Number(m[1] || 0) + Number(m[2] || 0) / 60 + Number(m[3] || 0) / 3600) * 10) / 10;
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

    const payload = event.body ? JSON.parse(event.body) : {};
    const psnUsername = String(payload.psnUsername || '').trim();
    if (!psnUsername) return json(400, { error: 'Missing psnUsername' });

    const authorization = await getAuthorization();

    const search = await makeUniversalSearch(authorization, psnUsername, 'SocialAllAccounts');
    const accountId = search?.domainResponses?.[0]?.results?.[0]?.socialMetadata?.accountId;
    if (!accountId) return json(404, { error: `Korisnik "${psnUsername}" nije pronađen ili je profil privatan.` });

    const [playedResp, titlesResp] = await Promise.all([
      getUserPlayedGames(authorization, accountId, { limit: 200, categories: 'ps4_game,ps5_native_game' }),
      getUserTitles(authorization, accountId, { limit: 200 })
    ]);

    const trophyMap = new Map();
    for (const t of (titlesResp?.trophyTitles || [])) {
      const key = normalizeTitle(t?.trophyTitleName);
      if (key && !trophyMap.has(key)) trophyMap.set(key, t);
    }

    const games = (playedResp?.titles || []).map(g => {
      const name = g?.localizedName || g?.name;
      const t = trophyMap.get(normalizeTitle(name));
      const earned = t?.earnedTrophies
        ? Object.values(t.earnedTrophies).reduce((a, b) => a + Number(b), 0) : null;
      const total = t?.definedTrophies
        ? Object.values(t.definedTrophies).reduce((a, b) => a + Number(b), 0) : null;
      return {
        psnTitleId: g?.titleId || null,
        name: name || 'Unknown',
        platformCategory: g?.category || 'unknown',
        hoursPlayed: parseISODurationToHours(g?.playDuration),
        imageUrl: g?.localizedImageUrl || g?.imageUrl || null,
        firstPlayed: g?.firstPlayedDateTime || null,
        lastPlayed: g?.lastPlayedDateTime || null,
        trophiesEarned: earned,
        trophiesTotal: total,
        trophyPercent: typeof t?.progress === 'number'
          ? Math.round(t.progress)
          : (earned != null && total > 0 ? Math.round(earned / total * 100) : null)
      };
    });

    games.sort((a, b) => new Date(b.lastPlayed || 0) - new Date(a.lastPlayed || 0));
    return json(200, { psnUsername, count: games.length, games });
    } catch (e) {
    console.error('[psn-import] Error:', e?.message, e?.stack);
    return json(500, { error: e?.message || 'Server error' });
  }

};
