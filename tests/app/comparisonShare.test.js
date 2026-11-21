import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { comparisonNames, comparisonPath, comparisonFromPath } from '../../src/services/comparisonLink.js';
import { pageMetadata, metadataHtml } from '../../src/services/seo.js';
import edge from '../../netlify/edge-functions/og-comparison.js';
const require = createRequire(import.meta.url);
const { libraryCard } = require('../../netlify/functions/lib/_libraryCard.js');
const env = { VITE_SUPABASE_URL: 'https://fixture.test', VITE_SUPABASE_ANON_KEY: 'fixture' };

test('javna usporedba normalizira dva različita javna usernamea', () => {
  assert.deepEqual(comparisonNames(' Player-A ', 'PLAYER_B'), { left: 'player-a', right: 'player_b' });
  assert.equal(comparisonPath('Player-A', 'Player-B'), '/compare/player-a/player-b');
  for (const values of [['same', 'same'], ['bad/name', 'valid-user'], ['valid-user', 'profile']]) assert.equal(comparisonNames(...values), null);
  assert.equal(comparisonFromPath('/compare/player-a/player-b/').right, 'player-b');
  assert.equal(comparisonFromPath('/compare/player-a/player-b/extra'), null);
  const metadata = pageMetadata('/compare/Player-A/Player-B');
  assert.equal(metadata.title, 'Gamenote: player-a vs player-b');
  assert.equal(metadata.canonical, 'https://gamenote.eu/compare/player-a/player-b');
  assert.match(metadataHtml(metadata), /library-card\?username=player-a&amp;compare=player-b/);
});

test('preview usporedbe čita samo javne headere i provjerava oba scopea', async () => {
  let reads = 0, renders = 0, hidden = false;
  const options = {
    env, compare: 'player-b',
    fetch: async (url, init) => {
      assert.equal(url, 'https://fixture.test/rest/v1/rpc/get_public_library');
      const input = JSON.parse(init.body);
      assert.equal(input.p_section, 'header'); reads++;
      return Response.json(hidden && input.p_username === 'player-b' ? null : { username: input.p_username, share_scope: 'library', notes: 'ne prikazuj', email: 'privatno' });
    },
    renderComparison: async (left, right) => {
      renders++; assert.equal(left, 'player-a'); assert.equal(right, 'player-b');
      return '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#101326"/></svg>';
    },
  };
  const metadata = await libraryCard('GET', 'player-a', { ...options, metadata: true });
  assert.deepEqual(JSON.parse(metadata.body), { left: 'player-a', right: 'player-b' });
  assert.equal(reads, 2); assert.equal(renders, 0);
  const png = await libraryCard('GET', 'player-a', options);
  assert.equal(png.status, 200); assert.equal(png.headers['cache-control'], 'no-store');
  const bytes = Buffer.from(png.body, 'base64');
  assert.equal(bytes.readUInt32BE(16), 1200); assert.equal(bytes.readUInt32BE(20), 630);
  hidden = true;
  assert.equal((await libraryCard('GET', 'player-a', options)).status, 404);
  assert.equal((await libraryCard('GET', 'player-a', { ...options, compare: 'player-a' })).status, 404);
  assert.equal((await libraryCard('GET', 'player-a', { ...options, compare: 'bad/name' })).status, 404);
});

test('opoziv bilo kojeg Gamenotea tijekom renderiranja skriva preview', async () => {
  let hidden = false;
  const options = {
    env, compare: 'player-b',
    fetch: async (url, init) => { const { p_username } = JSON.parse(init.body); return Response.json({ username: p_username, share_scope: hidden && p_username === 'player-a' ? 'none' : 'all' }); },
    renderComparison: async () => { hidden = true; return '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"/>'; }
  };
  assert.equal((await libraryCard('GET', 'player-a', options)).status, 404);
});

test('Edge daje ispravan naslov i jednu OG sliku, a privatnu usporedbu skriva', async () => {
  const original = globalThis.fetch;
  const next = async () => new Response('<html lang="hr"><head><title>Staro</title><meta property="og:image" content="old"></head></html>', { headers: { 'content-type': 'text/html' } });
  try {
    globalThis.fetch = async url => { assert.match(String(url), /format=metadata/); return Response.json({ left: 'player-a', right: 'player-b' }); };
    const result = await edge(new Request('https://gamenote.eu/compare/player-a/player-b'), { next });
    const html = await result.text();
    assert.equal(result.status, 200); assert.equal(result.headers.get('cache-control'), 'no-store');
    assert.match(html, /<title>Gamenote: player-a vs player-b<\/title>/);
    assert.match(html, /Usporedi Gamenote zbirke @player-a i @player-b\./);
    assert.equal((html.match(/property="og:image"/g) || []).length, 1);
    assert.match(html, /library-card\?username=player-a&amp;compare=player-b/);
    globalThis.fetch = async () => new Response(null, { status: 404 });
    const hidden = await edge(new Request('https://gamenote.eu/compare/player-a/player-b'), { next });
    assert.equal(hidden.status, 404); assert.doesNotMatch(await hidden.text(), /library-card|<title>Gamenote: player-a/);
    globalThis.fetch = async () => new Response(null, { status: 500 });
    assert.equal((await edge(new Request('https://gamenote.eu/compare/player-a/player-b'), { next })).status, 503);
  } finally { globalThis.fetch = original; }
});
