import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { normalizeUsername, usernameError } from '../../src/constants/libraryShare.js';
import preview from '../../netlify/edge-functions/og-library.js';
const require = createRequire(import.meta.url);
const { libraryCard } = require('../../netlify/functions/lib/_libraryCard.js');
const env = { VITE_SUPABASE_URL: 'https://fixture.test', VITE_SUPABASE_ANON_KEY: 'fixture' };

test('username normalizacija i rezervirane putanje', () => {
  assert.equal(normalizeUsername(' Player-A '), 'player-a');
  for (const value of ['stats', 'library', 'profile', 'bad.name', 'ab', '-player', 'a'.repeat(31)]) assert.ok(usernameError(value));
  for (const value of ['player-a', 'player_123', '123']) assert.equal(usernameError(value), '');
});

test('PNG provjerava dijeljenje prije i nakon renderiranja', async () => {
  let calls = 0;
  let renders = 0;
  const options = { env, fetch: async () => { calls++; return Response.json(null); }, render: async () => { renders++; } };
  assert.equal((await libraryCard('POST', 'player-a', options)).status, 405);
  assert.equal((await libraryCard('GET', '../player', options)).status, 404);
  assert.equal((await libraryCard('GET', 'player-a', options)).status, 404);
  assert.equal(renders, 0);
  calls = 0;
  options.fetch = async () => Response.json(++calls === 1 ? { name: 'Igrač' } : null);
  options.render = async () => '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600"><rect width="960" height="600" fill="#ffffff"/></svg>';
  assert.equal((await libraryCard('GET', 'player-a', options)).status, 404);
  assert.equal(calls, 2);
  options.fetch = async () => Response.json({ name: 'Igrač', username: 'player-a', card: { hours: 10 } });
  const metadata = await libraryCard('GET', 'player-a', { ...options, metadata: true });
  assert.deepEqual(JSON.parse(metadata.body), { name: 'Igrač', username: 'player-a' });
  const result = await libraryCard('GET', 'player-a', options);
  assert.equal(result.status, 200);
  assert.equal(result.headers['cache-control'], 'no-store');
  const png = Buffer.from(result.body, 'base64');
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 750);
});

test('OG prikaz ne mijenja aplikacijske rute i skriva deaktiviranu zbirku', async () => {
  const originalFetch = globalThis.fetch;
  const originalDeno = globalThis.Deno;
  globalThis.Deno = { env: { get: key => env[key] } };
  const next = async () => new Response('<html lang="hr"><head><title>Staro</title><meta property="og:image" content="old"></head></html>', { headers: { 'content-type': 'text/html' } });
  let calls = 0;
  globalThis.fetch = async () => { calls++; return Response.json({ name: "<Igrač> $& $$ $` $'" }); };
  try {
    await preview(new Request('https://gamenote.eu/library'), { next });
    assert.equal(calls, 0);
    const result = await preview(new Request('https://gamenote.eu/player-a'), { next });
    const html = await result.text();
    assert.ok(html.includes('&lt;Igrač&gt; $&amp; $$ $` $&#39;'));
    assert.match(html, /library-card\?username=player-a/);
    assert.equal((html.match(/property="og:image"/g) || []).length, 1);
    assert.equal(result.headers.get('cache-control'), 'no-store');
    globalThis.fetch = async () => Response.json(null);
    const disabled = await preview(new Request('https://gamenote.eu/player-a'), { next });
    assert.equal(disabled.status, 404);
    assert.doesNotMatch(await disabled.text(), /library-card|&lt;Igrač&gt;/);
    globalThis.fetch = async () => new Response(null, { status: 500 });
    const unavailable = await preview(new Request('https://gamenote.eu/player-a'), { next });
    assert.equal(unavailable.status, 503);
    assert.doesNotMatch(await unavailable.text(), /library-card|&lt;Igrač&gt;/);
  } finally { globalThis.fetch = originalFetch; globalThis.Deno = originalDeno; }
});

test('serijal bira susjedne igre i čuva prazna stanja', async () => {
  const { getSeriesNavigation, catalogGameDetails } = await import('../../src/services/gameSeries.js');
  const series = [{ id: 3, name: 'Treća', released: '2022-01-01' }, { id: '2', name: 'Trenutačna', released: '2021-01-01' }, { id: 1, name: 'Prva', released: '2020-01-01' }, { id: 1, name: 'Duplikat', released: '2019-01-01' }];
  const middle = getSeriesNavigation({ game_api_id: 2, release_date: '2021-01-01', series_games: JSON.stringify(series) });
  assert.equal(middle.previous.id, 1);
  assert.equal(middle.next.id, 3);
  assert.equal(middle.others.length, 2);
  assert.equal(getSeriesNavigation({ game_api_id: 1, release_date: '2020-01-01', series_games: series }).previous, null);
  assert.equal(getSeriesNavigation({ game_api_id: 3, release_date: '2022-01-01', series_games: series }).next, null);
  assert.equal(getSeriesNavigation({ series_games: '{broken' }).hasData, false);
  assert.equal(getSeriesNavigation({ game_api_id: 2, series_games: series }).previous, null);
  assert.equal(getSeriesNavigation({ game_api_id: 2, series_games: [series[1]] }).others.length, 0);
  const catalog = catalogGameDetails({ id: 3, name: 'Treća', released: '2022-01-01' });
  assert.equal(catalog.title, 'Treća');
  assert.equal(catalog.game_api_id, '3');
  for (const key of ['user_id', 'notes', 'play_time', 'rating', 'status']) assert.equal(catalog[key], undefined);
});

test('profilna slika prihvaća web poveznice bez pristupnih podataka', async () => {
  const { normalizeAvatarUrl } = await import('../../src/services/profileAvatar.js');
  assert.equal(normalizeAvatarUrl(' https://images.example.test/avatar.png '), 'https://images.example.test/avatar.png');
  assert.equal(normalizeAvatarUrl('http://images.example.test/avatar.jpg'), 'http://images.example.test/avatar.jpg');
  for (const value of ['', 'not-a-url', 'javascript:alert(1)', 'file:///private/avatar.png', 'data:image/png;base64,AAAA', 'https://secret:password@image.test/a.jpg', 'https://image.test/' + 'a'.repeat(2048)]) assert.throws(() => normalizeAvatarUrl(value));
});
