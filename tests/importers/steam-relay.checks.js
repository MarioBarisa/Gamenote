import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { steamRelay, parseProfile } = require('../../netlify/functions/lib/_steamRelay.js');
const { handler } = require('../../netlify/functions/steam.js');
const steamId = '76561198000000001';
const env = { STEAM_API_KEY: 'server-only-key', VITE_SUPABASE_URL: 'https://auth.example', VITE_SUPABASE_ANON_KEY: 'anon-key' };

function fixture(responses = {}) {
  const calls = [];
  const fetch = async (input, options) => {
    const url = new URL(input);
    calls.push({ url, options });
    if (url.hostname === 'auth.example') return Response.json({ id: 'gamenote-user' });
    assert.equal(url.hostname, 'api.steampowered.com');
    assert.equal(url.searchParams.get('key'), env.STEAM_API_KEY);
    const response = responses[url.pathname];
    if (response instanceof Error) throw response;
    if (response instanceof Response) return response.clone();
    assert.ok(response, `Nedostaje odgovor za ${url.pathname}`);
    return Response.json(response);
  };
  return { calls, fetch, env };
}

test('prihvaća ime iz linka, oba linka profila i SteamID64', () => {
  assert.deepEqual(parseProfile(' gaben '), { vanity: 'gaben' });
  assert.deepEqual(parseProfile('CatWarrior99'), { vanity: 'CatWarrior99' });
  assert.deepEqual(parseProfile('@CatWarrior99'), { vanity: 'CatWarrior99' });
  assert.deepEqual(parseProfile('ime.s.tockom'), { vanity: 'ime.s.tockom' });
  assert.deepEqual(parseProfile('https://steamcommunity.com/id/gaben/?l=english'), { vanity: 'gaben' });
  assert.deepEqual(parseProfile('steamcommunity.com/profiles/' + steamId), { steamId });
  assert.deepEqual(parseProfile(steamId), { steamId });
  for (const input of ['https://evil.example/id/gaben', 'https://steamcommunity.com@evil.example/id/gaben', 'https://steamcommunity.com:8080/id/gaben', 'Ime S Razmakom', 'https://steamcommunity.com/profiles/123']) {
    assert.throws(() => parseProfile(input));
  }
});

test('neispravni i neprijavljeni zahtjevi ne troše Steam pozive', async () => {
  const options = fixture();
  for (const payload of [null, [], { action: 'delete', profile: steamId }, { action: 'achievements', profile: steamId, appId: -1 }]) {
    assert.equal((await steamRelay(payload, 'Bearer token', options)).status, 400);
  }
  assert.equal((await steamRelay({ action: 'library', profile: steamId }, null, options)).status, 401);
  assert.equal(options.calls.length, 0);
  const unauthorized = fixture();
  unauthorized.fetch = async () => new Response('', { status: 401 });
  assert.equal((await steamRelay({ action: 'library', profile: steamId }, 'Bearer expired', unauthorized)).status, 401);
});

test('korisničko ime dohvaća javnu biblioteku bez otkrivanja ključa', async () => {
  const options = fixture({
    '/ISteamUser/ResolveVanityURL/v1/': { response: { success: 1, steamid: steamId } },
    '/ISteamUser/GetPlayerSummaries/v2/': { response: { players: [{ steamid: steamId, personaname: 'Igrač' }] } },
    '/IPlayerService/GetOwnedGames/v1/': { response: { game_count: 1, games: [{ appid: 620, name: 'Portal 2', playtime_forever: 120 }] } },
  });
  const result = await steamRelay({ action: 'library', profile: 'moj-profil' }, 'Bearer token', options);
  assert.equal(result.ok, true);
  assert.equal(result.data.profile.steamId, steamId);
  assert.equal(result.data.games[0].appid, 620);
  assert.ok(!JSON.stringify(result).includes(env.STEAM_API_KEY));
  assert.equal(options.calls[0].options.headers.authorization, 'Bearer token');
  const owned = options.calls.at(-1).url;
  assert.deepEqual(JSON.parse(owned.searchParams.get('input_json')), { steamid: steamId, include_appinfo: true, include_played_free_games: true });
});

test('privatnu biblioteku razlikuje od prazne biblioteke', async () => {
  const summary = { response: { players: [{ steamid: steamId }] } };
  for (const [response, expected] of [[{}, 403], [{ game_count: 0 }, 200], [{ game_count: 1 }, 502]]) {
    const options = fixture({ '/ISteamUser/GetPlayerSummaries/v2/': summary, '/IPlayerService/GetOwnedGames/v1/': { response } });
    const result = await steamRelay({ action: 'library', profile: steamId }, 'Bearer token', options);
    assert.equal(result.ok ? 200 : result.status, expected);
    if (expected === 200) assert.deepEqual(result.data.games, []);
  }
});

test('nepostojeće ime objašnjava razliku prikaznog imena', async () => {
  const options = fixture({ '/ISteamUser/ResolveVanityURL/v1/': { response: { success: 42 } } });
  const result = await steamRelay({ action: 'library', profile: 'nepostoji' }, 'Bearer token', options);
  assert.equal(result.status, 404);
  assert.match(result.error, /Ime za prijavu/);
});

test('postignuća uključuju zaključana i otključana', async () => {
  const options = fixture({ '/ISteamUserStats/GetPlayerAchievements/v1/': { playerstats: { success: true, achievements: [{ achieved: 1 }, { achieved: 0 }, { achieved: 1 }] } } });
  const result = await steamRelay({ action: 'achievements', profile: steamId, appId: 620 }, 'Bearer token', options);
  assert.deepEqual(result.data.achievements, { earned: 2, total: 3 });
});

test('nedostupna postignuća nemaju lažnu nulu', async () => {
  for (const response of [{ playerstats: { success: false } }, new Response('', { status: 400 })]) {
    const options = fixture({ '/ISteamUserStats/GetPlayerAchievements/v1/': response });
    const result = await steamRelay({ action: 'achievements', profile: steamId, appId: 620 }, 'Bearer token', options);
    assert.deepEqual(result.data, { achievements: null });
  }
});

test('ograničenja, istek i greške ne otkrivaju serverski ključ', async () => {
  for (const response of [new Response('', { status: 429 }), new Error('fetch failed ' + env.STEAM_API_KEY)]) {
    const options = fixture({ '/ISteamUser/GetPlayerSummaries/v2/': response });
    const result = await steamRelay({ action: 'library', profile: steamId }, 'Bearer token', options);
    assert.equal(result.ok, false);
    assert.ok(!JSON.stringify(result).includes(env.STEAM_API_KEY));
  }
  const options = fixture();
  options.env = {};
  assert.equal((await steamRelay({ action: 'library', profile: steamId }, 'Bearer token', options)).status, 503);
});

test('Netlify funkcija odbija GET, prevelike i neispravne zahtjeve', async () => {
  assert.equal((await handler({ httpMethod: 'GET' })).statusCode, 405);
  assert.equal((await handler({ httpMethod: 'POST', body: 'x'.repeat(4097) })).statusCode, 413);
  assert.equal((await handler({ httpMethod: 'POST', body: '{' })).statusCode, 400);
  const response = await handler({ httpMethod: 'POST', body: JSON.stringify({ action: 'library', profile: steamId }) });
  assert.equal(response.statusCode, 401);
  assert.equal(response.headers['cache-control'], 'no-store');
});

test('Netlify funkcija vraća biblioteku kroz zajednički servis', async (t) => {
  const previous = {};
  for (const key of Object.keys(env)) {
    previous[key] = process.env[key];
    process.env[key] = env[key];
  }
  t.after(() => {
    for (const key of Object.keys(env)) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  });
  const options = fixture({
    '/ISteamUser/GetPlayerSummaries/v2/': { response: { players: [{ steamid: steamId, personaname: 'Igrač' }] } },
    '/IPlayerService/GetOwnedGames/v1/': { response: { game_count: 0 } },
  });
  t.mock.method(globalThis, 'fetch', options.fetch);
  const response = await handler({
    httpMethod: 'POST',
    headers: { authorization: 'Bearer token' },
    body: JSON.stringify({ action: 'library', profile: steamId }),
  });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.body), { profile: { steamId, name: 'Igrač', avatarUrl: null }, games: [] });
  assert.equal(options.calls.length, 3);
  assert.equal(response.headers['cache-control'], 'no-store');
  assert.ok(!response.body.includes(env.STEAM_API_KEY));
});
